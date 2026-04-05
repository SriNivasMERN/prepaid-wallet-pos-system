/**
 * Module: Member Validation
 * File: member.validation.js
 * Purpose: Validates member creation and update payloads for the Members module.
 */

const { RECORD_STATUS } = require("../../constants/appConstants");

const MOBILE_NUMBER_PATTERN = /^\d{10,15}$/;

/**
 * Normalizes the common member fields used by create and update flows.
 */
const normalizeMemberValues = (payload = {}) => {
  return {
    fullName:
      typeof payload.fullName === "string" ? payload.fullName.trim() : undefined,
    mobileNumber:
      typeof payload.mobileNumber === "string"
        ? payload.mobileNumber.trim()
        : undefined,
    referenceDetails:
      typeof payload.referenceDetails === "string"
        ? payload.referenceDetails.trim()
        : undefined,
    status:
      typeof payload.status === "string" ? payload.status.trim() : undefined
  };
};

/**
 * Validates the submitted member creation fields.
 */
const validateCreateMemberPayload = (payload = {}) => {
  const errors = [];
  const values = normalizeMemberValues(payload);

  if (!values.fullName) {
    errors.push({ field: "fullName", message: "Full name is required." });
  }

  if (values.fullName && values.fullName.length < 2) {
    errors.push({
      field: "fullName",
      message: "Full name must be at least 2 characters."
    });
  }

  if (!values.mobileNumber) {
    errors.push({ field: "mobileNumber", message: "Mobile number is required." });
  }

  if (values.mobileNumber && !MOBILE_NUMBER_PATTERN.test(values.mobileNumber)) {
    errors.push({
      field: "mobileNumber",
      message: "Mobile number must contain 10 to 15 digits."
    });
  }

  if (!values.status) {
    errors.push({ field: "status", message: "Status is required." });
  }

  if (values.status && !Object.values(RECORD_STATUS).includes(values.status)) {
    errors.push({ field: "status", message: "Status is not valid." });
  }

  return {
    errors,
    values: {
      fullName: values.fullName,
      mobileNumber: values.mobileNumber,
      referenceDetails: values.referenceDetails || "",
      status: values.status
    }
  };
};

/**
 * Validates the submitted member update fields.
 */
const validateUpdateMemberPayload = (payload = {}) => {
  const errors = [];
  const values = normalizeMemberValues(payload);
  const hasRecognizedField =
    values.fullName !== undefined ||
    values.mobileNumber !== undefined ||
    values.referenceDetails !== undefined ||
    values.status !== undefined;

  if (!hasRecognizedField) {
    errors.push({
      field: "payload",
      message: "Provide at least one valid member field to update."
    });
  }

  if (values.fullName !== undefined) {
    if (!values.fullName) {
      errors.push({ field: "fullName", message: "Full name is required." });
    } else if (values.fullName.length < 2) {
      errors.push({
        field: "fullName",
        message: "Full name must be at least 2 characters."
      });
    }
  }

  if (values.mobileNumber !== undefined) {
    if (!values.mobileNumber) {
      errors.push({ field: "mobileNumber", message: "Mobile number is required." });
    } else if (!MOBILE_NUMBER_PATTERN.test(values.mobileNumber)) {
      errors.push({
        field: "mobileNumber",
        message: "Mobile number must contain 10 to 15 digits."
      });
    }
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
      ...(values.fullName !== undefined ? { fullName: values.fullName } : {}),
      ...(values.mobileNumber !== undefined
        ? { mobileNumber: values.mobileNumber }
        : {}),
      ...(values.referenceDetails !== undefined
        ? { referenceDetails: values.referenceDetails }
        : {}),
      ...(values.status !== undefined ? { status: values.status } : {})
    }
  };
};

module.exports = {
  MOBILE_NUMBER_PATTERN,
  validateCreateMemberPayload,
  validateUpdateMemberPayload
};
