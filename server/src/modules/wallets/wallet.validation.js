/**
 * Module: Wallet Validation
 * File: wallet.validation.js
 * Purpose: Validates wallet creation and update payloads for the Wallets module.
 */

const { RECORD_STATUS } = require("../../constants/appConstants");

/**
 * Normalizes wallet payload values.
 */
const normalizeWalletValues = (payload = {}) => ({
  memberId: typeof payload.memberId === "string" ? payload.memberId.trim() : undefined,
  status: typeof payload.status === "string" ? payload.status.trim() : undefined
});

/**
 * Validates wallet creation payload.
 */
const validateCreateWalletPayload = (payload = {}) => {
  const errors = [];
  const values = normalizeWalletValues(payload);
  const status = values.status || RECORD_STATUS.ACTIVE;

  if (!values.memberId) {
    errors.push({ field: "memberId", message: "Member is required." });
  }

  if (status && !Object.values(RECORD_STATUS).includes(status)) {
    errors.push({ field: "status", message: "Status is not valid." });
  }

  return {
    errors,
    values: {
      memberId: values.memberId,
      status
    }
  };
};

/**
 * Validates wallet update payload.
 */
const validateUpdateWalletPayload = (payload = {}) => {
  const errors = [];
  const values = normalizeWalletValues(payload);

  if (values.status === undefined) {
    errors.push({
      field: "payload",
      message: "Provide at least one valid wallet field to update."
    });
  }

  if (
    values.status !== undefined &&
    !Object.values(RECORD_STATUS).includes(values.status)
  ) {
    errors.push({ field: "status", message: "Status is not valid." });
  }

  return {
    errors,
    values: {
      ...(values.status !== undefined ? { status: values.status } : {})
    }
  };
};

module.exports = {
  validateCreateWalletPayload,
  validateUpdateWalletPayload
};
