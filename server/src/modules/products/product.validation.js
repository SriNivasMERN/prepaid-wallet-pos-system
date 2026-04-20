/**
 * Module: Product Validation
 * File: product.validation.js
 * Purpose: Validates product creation payloads and product list filters.
 */

const { RECORD_STATUS } = require("../../constants/appConstants");
const { PRODUCT_UNITS } = require("./product.model");

/**
 * Normalizes product payload values used by the create flow.
 */
const normalizeProductValues = (payload = {}) => ({
  productName:
    typeof payload.productName === "string" ? payload.productName.trim() : undefined,
  productCode:
    typeof payload.productCode === "string"
      ? payload.productCode.trim().toUpperCase()
      : undefined,
  sellingPrice:
    payload.sellingPrice === "" ||
    payload.sellingPrice === null ||
    payload.sellingPrice === undefined
      ? undefined
      : Number(payload.sellingPrice),
  unit: typeof payload.unit === "string" ? payload.unit.trim() : undefined,
  status: typeof payload.status === "string" ? payload.status.trim() : undefined
});

/**
 * Validates create-product payload values.
 */
const validateCreateProductPayload = (payload = {}) => {
  const errors = [];
  const values = normalizeProductValues(payload);
  const status = values.status || RECORD_STATUS.ACTIVE;

  if (!values.productName) {
    errors.push({ field: "productName", message: "Product name is required." });
  } else if (values.productName.length < 2) {
    errors.push({
      field: "productName",
      message: "Product name must be at least 2 characters."
    });
  }

  if (!values.productCode) {
    errors.push({ field: "productCode", message: "Product code is required." });
  }

  if (!Number.isFinite(values.sellingPrice)) {
    errors.push({ field: "sellingPrice", message: "Selling price is required." });
  } else if (values.sellingPrice <= 0) {
    errors.push({
      field: "sellingPrice",
      message: "Selling price must be greater than zero."
    });
  }

  if (!values.unit) {
    errors.push({ field: "unit", message: "Unit is required." });
  } else if (!PRODUCT_UNITS.includes(values.unit)) {
    errors.push({ field: "unit", message: "Unit is not valid." });
  }

  if (!Object.values(RECORD_STATUS).includes(status)) {
    errors.push({ field: "status", message: "Status is not valid." });
  }

  return {
    errors,
    values: {
      productName: values.productName,
      productCode: values.productCode,
      sellingPrice: values.sellingPrice,
      unit: values.unit,
      status
    }
  };
};

module.exports = {
  validateCreateProductPayload
};
