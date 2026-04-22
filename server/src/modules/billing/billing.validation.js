/**
 * Module: Billing Validation
 * File: billing.validation.js
 * Purpose: Validates bill creation payloads before the billing workflow runs.
 */

/**
 * Normalizes bill-item payload values.
 */
const normalizeBillItem = (item = {}) => ({
  productId: typeof item.productId === "string" ? item.productId.trim() : undefined,
  quantity:
    item.quantity === "" || item.quantity === null || item.quantity === undefined
      ? undefined
      : Number(item.quantity)
});

/**
 * Normalizes bill payload values.
 */
const normalizeCreateBillingValues = (payload = {}) => ({
  cardNumber: typeof payload.cardNumber === "string" ? payload.cardNumber.trim() : undefined,
  items: Array.isArray(payload.items) ? payload.items.map(normalizeBillItem) : [],
  notes: typeof payload.notes === "string" ? payload.notes.trim() : ""
});

/**
 * Validates create-bill payload values.
 */
const validateCreateBillingPayload = (payload = {}) => {
  const errors = [];
  const values = normalizeCreateBillingValues(payload);

  if (!values.cardNumber) {
    errors.push({ field: "cardNumber", message: "Card number is required." });
  }

  if (!Array.isArray(values.items) || values.items.length === 0) {
    errors.push({ field: "items", message: "At least one bill item is required." });
  } else {
    values.items.forEach((item, index) => {
      if (!item.productId) {
        errors.push({
          field: `items[${index}].productId`,
          message: "Product is required."
        });
      }

      if (!Number.isFinite(item.quantity)) {
        errors.push({
          field: `items[${index}].quantity`,
          message: "Quantity is required."
        });
      } else if (item.quantity <= 0) {
        errors.push({
          field: `items[${index}].quantity`,
          message: "Quantity must be greater than zero."
        });
      } else if (!Number.isInteger(item.quantity)) {
        errors.push({
          field: `items[${index}].quantity`,
          message: "Quantity must be a whole number."
        });
      }
    });
  }

  return {
    errors,
    values
  };
};

module.exports = {
  validateCreateBillingPayload
};
