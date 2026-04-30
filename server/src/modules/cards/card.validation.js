/**
 * Module: Card Validation
 * File: card.validation.js
 * Purpose: Validates card assignment and replacement payloads.
 */

const { RECORD_STATUS } = require("../../constants/appConstants");

/**
 * Normalizes the shared card fields used by create and replace flows.
 */
const normalizeCardValues = (payload = {}) => {
  return {
    cardNumber:
      typeof payload.cardNumber === "string"
        ? payload.cardNumber.trim().toUpperCase()
        : "",
    memberId:
      typeof payload.memberId === "string" ? payload.memberId.trim() : undefined,
    activatedAt:
      typeof payload.activatedAt === "string" ? payload.activatedAt.trim() : undefined,
    expiresAt:
      typeof payload.expiresAt === "string" ? payload.expiresAt.trim() : undefined
  };
};

/**
 * Validates card assignment payload.
 */
const validateAssignCardPayload = (payload = {}) => {
  const errors = [];
  const values = normalizeCardValues(payload);

  if (!values.memberId) {
    errors.push({ field: "memberId", message: "Member is required." });
  }

  if (!values.activatedAt) {
    errors.push({ field: "activatedAt", message: "Activated date is required." });
  }

  if (!values.expiresAt) {
    errors.push({ field: "expiresAt", message: "Expiry date is required." });
  }

  const activatedDate = values.activatedAt ? new Date(values.activatedAt) : null;
  const expiryDate = values.expiresAt ? new Date(values.expiresAt) : null;

  if (values.activatedAt && Number.isNaN(activatedDate?.getTime())) {
    errors.push({ field: "activatedAt", message: "Activated date is not valid." });
  }

  if (values.expiresAt && Number.isNaN(expiryDate?.getTime())) {
    errors.push({ field: "expiresAt", message: "Expiry date is not valid." });
  }

  if (
    activatedDate &&
    expiryDate &&
    !Number.isNaN(activatedDate.getTime()) &&
    !Number.isNaN(expiryDate.getTime()) &&
    expiryDate <= activatedDate
  ) {
    errors.push({
      field: "expiresAt",
      message: "Expiry date must be later than activated date."
    });
  }

  return {
    errors,
    values: {
      cardNumber: values.cardNumber,
      memberId: values.memberId,
      status: RECORD_STATUS.ACTIVE,
      activatedAt: activatedDate,
      expiresAt: expiryDate
    }
  };
};

/**
 * Validates card replacement payload.
 */
const validateReplaceCardPayload = (payload = {}) => {
  const errors = [];
  const values = normalizeCardValues(payload);

  if (!values.activatedAt) {
    errors.push({ field: "activatedAt", message: "Activated date is required." });
  }

  if (!values.expiresAt) {
    errors.push({ field: "expiresAt", message: "Expiry date is required." });
  }

  const activatedDate = values.activatedAt ? new Date(values.activatedAt) : null;
  const expiryDate = values.expiresAt ? new Date(values.expiresAt) : null;

  if (values.activatedAt && Number.isNaN(activatedDate?.getTime())) {
    errors.push({ field: "activatedAt", message: "Activated date is not valid." });
  }

  if (values.expiresAt && Number.isNaN(expiryDate?.getTime())) {
    errors.push({ field: "expiresAt", message: "Expiry date is not valid." });
  }

  if (
    activatedDate &&
    expiryDate &&
    !Number.isNaN(activatedDate.getTime()) &&
    !Number.isNaN(expiryDate.getTime()) &&
    expiryDate <= activatedDate
  ) {
    errors.push({
      field: "expiresAt",
      message: "Expiry date must be later than activated date."
    });
  }

  return {
    errors,
    values: {
      cardNumber: values.cardNumber,
      activatedAt: activatedDate,
      expiresAt: expiryDate,
      status: RECORD_STATUS.ACTIVE
    }
  };
};

module.exports = {
  validateAssignCardPayload,
  validateReplaceCardPayload
};
