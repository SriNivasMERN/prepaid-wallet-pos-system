/**
 * Module: Stock Service
 * File: stock.service.js
 * Purpose: Handles stock state visibility and stock movement creation for the Stocks module.
 */

const mongoose = require("mongoose");

const { RECORD_STATUS } = require("../../constants/appConstants");
const { parsePaginationWindow } = require("../../utils/pagination");
const { createSearchPattern } = require("../../utils/search");
const { Product } = require("../products/product.model");
const {
  Stock,
  STOCK_ALERT_THRESHOLD
} = require("./stock.model");
const { StockMovement } = require("./stockMovement.model");
const { validateCreateStockMovementPayload } = require("./stock.validation");

/**
 * Creates a standard validation error.
 */
const createValidationError = (errors, topMessage) => {
  const error = new Error(topMessage);
  error.statusCode = 400;
  error.errors = errors;
  return error;
};

/**
 * Creates a standard conflict error.
 */
const createConflictError = (field, message, topMessage) => {
  const error = new Error(topMessage);
  error.statusCode = 409;
  error.errors = [
    {
      field,
      message
    }
  ];
  return error;
};

/**
 * Creates a standard not-found error.
 */
const createNotFoundError = (field, message, topMessage) => {
  const error = new Error(topMessage);
  error.statusCode = 404;
  error.errors = [
    {
      field,
      message
    }
  ];
  return error;
};

/**
 * Validates MongoDB ids used by stock APIs.
 */
const ensureValidObjectId = (value, fieldName, topMessage) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw createNotFoundError(fieldName, `${fieldName} record was not found.`, topMessage);
  }
};

/**
 * Derives the visible stock status from the current quantity.
 */
const getStockStatus = (currentQuantity) => {
  if (currentQuantity < 0) {
    return "Negative Stock";
  }

  if (currentQuantity === 0) {
    return "Out of Stock";
  }

  if (currentQuantity <= STOCK_ALERT_THRESHOLD) {
    return "Low Stock";
  }

  return "Available";
};

/**
 * Shapes one stock row for API responses.
 */
const toStockResponse = ({ product, stock, latestMovement }) => {
  const currentQuantity = Number(stock?.currentQuantity || 0);
  const lastChange = latestMovement
    ? latestMovement.quantityChange
    : Number(stock?.lastQuantityChange || 0);
  const movementType = latestMovement?.movementType || stock?.lastMovementType || null;
  const movementNotes = latestMovement?.notes || "";
  const movementAt =
    latestMovement?.createdAt || stock?.lastMovementAt || stock?.updatedAt || null;

  return {
    id: stock?._id || product._id,
    currentQuantity,
    stockStatus: getStockStatus(currentQuantity),
    lastChange,
    movementType,
    notes: movementNotes,
    updatedAt: stock?.updatedAt || product.updatedAt,
    updatedBy: stock?.updatedBy
      ? {
          id: stock.updatedBy._id,
          fullName: stock.updatedBy.fullName,
          username: stock.updatedBy.username,
          role: stock.updatedBy.role
        }
      : null,
    lastMovementAt: movementAt,
    product: {
      id: product._id,
      productName: product.productName,
      productCode: product.productCode,
      sellingPrice: product.sellingPrice,
      unit: product.unit,
      status: product.status
    }
  };
};

/**
 * Loads one stock document by product id with audit fields.
 */
const getStockByProductId = async (productId) => {
  return Stock.findOne({
    productId,
    isDeleted: false
  })
    .populate("updatedBy", "fullName username role")
    .populate("createdBy", "fullName username role");
};

/**
 * Loads the latest stock movement for one product.
 */
const getLatestStockMovementByProductId = async (productId) => {
  return StockMovement.findOne({
    productId,
    isDeleted: false
  }).sort({ createdAt: -1 });
};

/**
 * Creates a stock movement and updates current stock state.
 */
const createStockMovement = async (payload, currentAuth) => {
  const { errors, values } = validateCreateStockMovementPayload(payload);

  if (errors.length > 0) {
    throw createValidationError(errors, "Stock movement validation failed.");
  }

  ensureValidObjectId(values.productId, "productId", "Product was not found.");

  const product = await Product.findOne({
    _id: values.productId,
    isDeleted: false
  });

  if (!product) {
    throw createNotFoundError("productId", "Product record was not found.", "Product was not found.");
  }

  if (product.status !== RECORD_STATUS.ACTIVE) {
    throw createConflictError(
      "productId",
      "Only an active product can receive stock movement.",
      "Stock movement is not allowed."
    );
  }

  let stock = await Stock.findOne({
    productId: product._id,
    isDeleted: false
  });

  const hasOpeningMovement = await StockMovement.exists({
    productId: product._id,
    movementType: "Opening",
    isDeleted: false
  });

  if (values.movementType === "Opening" && hasOpeningMovement) {
    throw createConflictError(
      "movementType",
      "Opening stock can only be recorded once per product.",
      "Stock movement is not allowed."
    );
  }

  if (!stock) {
    stock = await Stock.create({
      productId: product._id,
      currentQuantity: 0,
      createdBy: currentAuth.staffId,
      updatedBy: currentAuth.staffId
    });
  }

  const quantityBefore = Number(stock.currentQuantity || 0);
  const quantityAfter = quantityBefore + values.quantityChange;

  const movement = await StockMovement.create({
    stockId: stock._id,
    productId: product._id,
    quantityBefore,
    quantityChange: values.quantityChange,
    quantityAfter,
    movementType: values.movementType,
    notes: values.notes,
    createdBy: currentAuth.staffId,
    updatedBy: currentAuth.staffId
  });

  stock.currentQuantity = quantityAfter;
  stock.lastQuantityChange = values.quantityChange;
  stock.lastMovementType = values.movementType;
  stock.lastMovementAt = movement.createdAt;
  stock.updatedBy = currentAuth.staffId;
  await stock.save();

  const hydratedStock = await getStockByProductId(product._id);
  const latestMovement = await getLatestStockMovementByProductId(product._id);

  return toStockResponse({
    product,
    stock: hydratedStock,
    latestMovement
  });
};

/**
 * Returns the stock list with optional search, stock status, and movement type filters.
 */
const getStockList = async (query = {}) => {
  const searchValue = typeof query.search === "string" ? query.search.trim() : "";
  const stockStatusValue =
    typeof query.stockStatus === "string" ? query.stockStatus.trim() : "";
  const movementTypeValue =
    typeof query.movementType === "string" ? query.movementType.trim() : "";

  const productQuery = {
    isDeleted: false
  };

  if (searchValue) {
    const searchPattern = createSearchPattern(searchValue);
    productQuery.$or = [
      { productName: searchPattern },
      { productCode: searchPattern }
    ];
  }

  const paginationWindow = parsePaginationWindow(query);
  let productQueryBuilder = Product.find(productQuery).sort({ productName: 1 });

  if (paginationWindow) {
    productQueryBuilder = productQueryBuilder.skip(paginationWindow.skip).limit(paginationWindow.limit);
  }

  const products = await productQueryBuilder.lean();

  const productIds = products.map((product) => product._id);
  if (productIds.length === 0) {
    return [];
  }

  const stocks = await Stock.find({
    productId: { $in: productIds },
    isDeleted: false
  })
    .populate("updatedBy", "fullName username role")
    .populate("createdBy", "fullName username role")
    .lean();

  const stockMap = new Map(
    stocks.map((stock) => [String(stock.productId), stock])
  );

  const latestMovements = await StockMovement.aggregate([
    {
      $match: {
        productId: { $in: productIds },
        isDeleted: false
      }
    },
    {
      $sort: {
        createdAt: -1
      }
    },
    {
      $group: {
        _id: "$productId",
        movementType: { $first: "$movementType" },
        quantityChange: { $first: "$quantityChange" },
        notes: { $first: "$notes" },
        createdAt: { $first: "$createdAt" }
      }
    }
  ]);

  const latestMovementMap = new Map(
    latestMovements.map((movement) => [String(movement._id), movement])
  );

  const rows = products.map((product) =>
    toStockResponse({
      product,
      stock: stockMap.get(String(product._id)),
      latestMovement: latestMovementMap.get(String(product._id)) || null
    })
  );

  return rows.filter((row) => {
    if (stockStatusValue && row.stockStatus !== stockStatusValue) {
      return false;
    }

    if (movementTypeValue && row.movementType !== movementTypeValue) {
      return false;
    }

    return true;
  });
};

module.exports = {
  createStockMovement,
  getStockList
};
