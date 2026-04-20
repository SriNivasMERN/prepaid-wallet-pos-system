/**
 * Module: Stock Validation
 * File: stock.validation.js
 * Purpose: Validates stock movement payloads before stock state is changed.
 */

const { STOCK_MOVEMENT_TYPES } = require("./stock.model");

/**
 * Normalizes stock movement payload values.
 */
const normalizeStockMovementValues = (payload = {}) => ({
  productId: typeof payload.productId === "string" ? payload.productId.trim() : undefined,
  quantityChange:
    payload.quantityChange === "" ||
    payload.quantityChange === null ||
    payload.quantityChange === undefined
      ? undefined
      : Number(payload.quantityChange),
  movementType:
    typeof payload.movementType === "string" ? payload.movementType.trim() : undefined,
  notes: typeof payload.notes === "string" ? payload.notes.trim() : ""
});

/**
 * Validates create-stock-movement payload values.
 */
const validateCreateStockMovementPayload = (payload = {}) => {
  const errors = [];
  const values = normalizeStockMovementValues(payload);

  if (!values.productId) {
    errors.push({ field: "productId", message: "Product is required." });
  }

  if (!Number.isFinite(values.quantityChange)) {
    errors.push({
      field: "quantityChange",
      message: "Quantity change is required."
    });
  } else if (values.quantityChange === 0) {
    errors.push({
      field: "quantityChange",
      message: "Quantity change must not be zero."
    });
  }

  if (!values.movementType) {
    errors.push({
      field: "movementType",
      message: "Movement type is required."
    });
  } else if (!STOCK_MOVEMENT_TYPES.includes(values.movementType)) {
    errors.push({
      field: "movementType",
      message: "Movement type is not valid."
    });
  } else if (
    values.movementType === "Opening" &&
    Number.isFinite(values.quantityChange) &&
    values.quantityChange <= 0
  ) {
    errors.push({
      field: "quantityChange",
      message: "Opening quantity must be greater than zero."
    });
  }

  return {
    errors,
    values
  };
};

module.exports = {
  validateCreateStockMovementPayload
};
