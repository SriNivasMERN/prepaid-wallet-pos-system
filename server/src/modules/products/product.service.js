/**
 * Module: Product Service
 * File: product.service.js
 * Purpose: Handles product creation and product listing for the Products module.
 */

const { Product } = require("./product.model");
const { validateCreateProductPayload } = require("./product.validation");

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
  getProductList
};
