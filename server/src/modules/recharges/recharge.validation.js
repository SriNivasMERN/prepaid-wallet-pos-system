/**
 * Module: Recharge Validation
 * File: recharge.validation.js
 * Purpose: Validates recharge creation payloads for the Recharges module.
 */

const PAYMENT_MODES = ["Cash", "UPI", "Card"];

/**
 * Normalizes recharge payload values.
 */
const normalizeRechargeValues = (payload = {}) => ({
  walletId: typeof payload.walletId === "string" ? payload.walletId.trim() : undefined,
  amount:
    payload.amount === "" || payload.amount === null || payload.amount === undefined
      ? undefined
      : Number(payload.amount),
  paymentMode:
    typeof payload.paymentMode === "string" ? payload.paymentMode.trim() : undefined,
  notes: typeof payload.notes === "string" ? payload.notes.trim() : ""
});

/**
 * Validates recharge creation payload.
 */
const validateCreateRechargePayload = (payload = {}) => {
  const errors = [];
  const values = normalizeRechargeValues(payload);

  if (!values.walletId) {
    errors.push({ field: "walletId", message: "Wallet is required." });
  }

  if (!Number.isFinite(values.amount)) {
    errors.push({ field: "amount", message: "Amount is required." });
  } else if (values.amount <= 0) {
    errors.push({ field: "amount", message: "Amount must be greater than zero." });
  }

  if (!values.paymentMode) {
    errors.push({ field: "paymentMode", message: "Payment mode is required." });
  } else if (!PAYMENT_MODES.includes(values.paymentMode)) {
    errors.push({ field: "paymentMode", message: "Payment mode is not valid." });
  }

  if (values.notes.length > 300) {
    errors.push({ field: "notes", message: "Notes must be 300 characters or less." });
  }

  return {
    errors,
    values: {
      walletId: values.walletId,
      amount: values.amount,
      paymentMode: values.paymentMode,
      notes: values.notes
    }
  };
};

module.exports = {
  PAYMENT_MODES,
  validateCreateRechargePayload
};
