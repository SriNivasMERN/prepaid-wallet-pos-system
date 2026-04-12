/**
 * Module: Debit Validation
 * File: debit.validation.js
 * Purpose: Validates debit creation payloads for the Debits module.
 */

/**
 * Normalizes debit payload values.
 */
const normalizeDebitValues = (payload = {}) => ({
  walletId: typeof payload.walletId === "string" ? payload.walletId.trim() : undefined,
  amount:
    payload.amount === "" || payload.amount === null || payload.amount === undefined
      ? undefined
      : Number(payload.amount),
  reason: typeof payload.reason === "string" ? payload.reason.trim() : undefined,
  notes: typeof payload.notes === "string" ? payload.notes.trim() : ""
});

/**
 * Validates debit creation payload.
 */
const validateCreateDebitPayload = (payload = {}) => {
  const errors = [];
  const values = normalizeDebitValues(payload);

  if (!values.walletId) {
    errors.push({ field: "walletId", message: "Wallet is required." });
  }

  if (!Number.isFinite(values.amount)) {
    errors.push({ field: "amount", message: "Amount is required." });
  } else if (values.amount <= 0) {
    errors.push({ field: "amount", message: "Amount must be greater than zero." });
  }

  if (!values.reason) {
    errors.push({ field: "reason", message: "Reason is required." });
  } else if (values.reason.length > 120) {
    errors.push({ field: "reason", message: "Reason must be 120 characters or less." });
  }

  if (values.notes.length > 300) {
    errors.push({ field: "notes", message: "Notes must be 300 characters or less." });
  }

  return {
    errors,
    values: {
      walletId: values.walletId,
      amount: values.amount,
      reason: values.reason,
      notes: values.notes
    }
  };
};

module.exports = {
  validateCreateDebitPayload
};
