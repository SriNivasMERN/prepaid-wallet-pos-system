/**
 * Module: Product Service
 * File: product.service.js
 * Purpose: Handles product creation, update, status change, and listing for the Products module.
 */

const mongoose = require("mongoose");

const { RECORD_STATUS } = require("../../constants/appConstants");
const { Product } = require("./product.model");
const {
  validateCreateProductPayload,
  validateUpdateProductPayload
} = require("./product.validation");

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
 * Validates MongoDB ids used by product APIs.
 */
const ensureValidObjectId = (value, fieldName, topMessage) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw createNotFoundError(fieldName, `${fieldName} record was not found.`, topMessage);
  }
};

/**
 * Shapes a product document for API responses.
 */
const toProductResponse = (product) => ({
  id: product._id,
  productName: product.productName,
  productCode: product.productCode,
  sellingPrice: product.sellingPrice,
  unit: product.unit,
  status: product.status,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
  createdBy: product.createdBy
    ? {
        id: product.createdBy._id,
        fullName: product.createdBy.fullName,
        username: product.createdBy.username,
        role: product.createdBy.role
      }
    : null,
  updatedBy: product.updatedBy
    ? {
        id: product.updatedBy._id,
        fullName: product.updatedBy.fullName,
        username: product.updatedBy.username,
        role: product.updatedBy.role
      }
    : null
});

/**
 * Loads one product with related staff details.
 */
const getProductDocumentById = async (productId) => {
  ensureValidObjectId(productId, "productId", "Product was not found.");

  const product = await Product.findOne({
    _id: productId,
    isDeleted: false
  })
    .populate("createdBy", "fullName username role")
    .populate("updatedBy", "fullName username role");

  if (!product) {
    throw createNotFoundError("productId", "Product record was not found.", "Product was not found.");
  }

  return product;
};

/**
 * Loads one product document with staff details.
 */
const hydrateProductById = async (productId) => {
  return Product.findOne({
    _id: productId,
    isDeleted: false
  })
    .populate("createdBy", "fullName username role")
    .populate("updatedBy", "fullName username role");
};

/**
 * Creates a new product master record.
 */
const createProduct = async (payload, currentAuth) => {
  const { errors, values } = validateCreateProductPayload(payload);

  if (errors.length > 0) {
    throw createValidationError(errors, "Product validation failed.");
  }

  const existingProduct = await Product.exists({
    productCode: values.productCode,
    isDeleted: false
  });

  if (existingProduct) {
    throw createConflictError(
      "productCode",
      "Choose a different product code.",
      "Product code is already in use."
    );
  }

  try {
    const createdProduct = await Product.create({
      ...values,
      createdBy: currentAuth.staffId,
      updatedBy: currentAuth.staffId
    });

    const hydratedProduct = await Product.findById(createdProduct._id)
      .populate("createdBy", "fullName username role")
      .populate("updatedBy", "fullName username role");

    return toProductResponse(hydratedProduct);
  } catch (error) {
    if (error?.code === 11000 && error.keyPattern?.productCode) {
      throw createConflictError(
        "productCode",
        "Choose a different product code.",
        "Product code is already in use."
      );
    }

    throw error;
  }
};

/**
 * Updates one product master record.
 */
const updateProduct = async (productId, payload, currentAuth) => {
  const { errors, values } = validateUpdateProductPayload(payload);

  if (errors.length > 0) {
    throw createValidationError(errors, "Product validation failed.");
  }

  const product = await getProductDocumentById(productId);

  if (values.productCode !== product.productCode) {
    const existingProduct = await Product.exists({
      _id: { $ne: product._id },
      productCode: values.productCode,
      isDeleted: false
    });

    if (existingProduct) {
      throw createConflictError(
        "productCode",
        "Choose a different product code.",
        "Product code is already in use."
      );
    }
  }

  product.productName = values.productName;
  product.productCode = values.productCode;
  product.sellingPrice = values.sellingPrice;
  product.unit = values.unit;
  product.status = values.status;
  product.updatedBy = currentAuth.staffId;
  try {
    await product.save();
  } catch (error) {
    if (error?.code === 11000 && error.keyPattern?.productCode) {
      throw createConflictError(
        "productCode",
        "Choose a different product code.",
        "Product code is already in use."
      );
    }

    throw error;
  }

  const hydratedProduct = await hydrateProductById(product._id);

  return toProductResponse(hydratedProduct);
};

/**
 * Updates the product status only.
 */
const updateProductStatus = async (productId, status, currentAuth) => {
  if (!Object.values(RECORD_STATUS).includes(status)) {
    throw createValidationError(
      [
        {
          field: "status",
          message: "Status is not valid."
        }
      ],
      "Product validation failed."
    );
  }

  const product = await getProductDocumentById(productId);

  product.status = status;
  product.updatedBy = currentAuth.staffId;
  await product.save();

  const hydratedProduct = await hydrateProductById(product._id);

  return toProductResponse(hydratedProduct);
};

/**
 * Returns the product list with optional search, unit, and status filters.
 */
const getProductList = async (query = {}) => {
  const databaseQuery = {
    isDeleted: false
  };

  const searchValue = typeof query.search === "string" ? query.search.trim() : "";
  const statusValue = typeof query.status === "string" ? query.status.trim() : "";
  const unitValue = typeof query.unit === "string" ? query.unit.trim() : "";

  if (statusValue) {
    databaseQuery.status = statusValue;
  }

  if (unitValue) {
    databaseQuery.unit = unitValue;
  }

  if (searchValue) {
    const searchPattern = new RegExp(searchValue, "i");
    databaseQuery.$or = [
      { productName: searchPattern },
      { productCode: searchPattern }
    ];
  }

  const products = await Product.find(databaseQuery)
    .populate("createdBy", "fullName username role")
    .populate("updatedBy", "fullName username role")
    .sort({ createdAt: -1 });

  return products.map(toProductResponse);
};

module.exports = {
  createProduct,
  getProductList,
  updateProduct,
  updateProductStatus
};
