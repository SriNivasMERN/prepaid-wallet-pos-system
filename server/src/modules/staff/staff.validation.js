/**
 * Module: Staff Validation
 * File: staff.validation.js
 * Purpose: Validates staff creation and update payloads for admin-managed staff accounts.
 */

const { RECORD_STATUS, STAFF_ROLES } = require("../../constants/appConstants");

const CREATABLE_STAFF_ROLES = [STAFF_ROLES.ADMIN, STAFF_ROLES.CASHIER];

/**
 * Normalizes editable staff payload values.
 */
const normalizeStaffValues = (payload = {}) => ({
  fullName: typeof payload.fullName === "string" ? payload.fullName.trim() : undefined,
  username:
    typeof payload.username === "string" ? payload.username.trim().toLowerCase() : undefined,
  password: payload.password || "",
  role: typeof payload.role === "string" ? payload.role.trim() : undefined,
  status:
    typeof payload.status === "string" ? payload.status.trim() : undefined
});

/**
 * Validates the submitted staff creation fields.
 */
const validateCreateStaffPayload = (payload = {}) => {
  const errors = [];
  const values = normalizeStaffValues(payload);
  const status = values.status || RECORD_STATUS.ACTIVE;

  if (!values.fullName) {
    errors.push({ field: "fullName", message: "Full name is required." });
  }

  if (!values.username) {
    errors.push({ field: "username", message: "Username is required." });
  }

  if (values.username && values.username.length < 3) {
    errors.push({ field: "username", message: "Username must be at least 3 characters." });
  }

  if (!values.password) {
    errors.push({ field: "password", message: "Password is required." });
  }

  if (values.password && values.password.length < 8) {
    errors.push({ field: "password", message: "Password must be at least 8 characters." });
  }

  if (!values.role) {
    errors.push({ field: "role", message: "Role is required." });
  }

  if (values.role && !CREATABLE_STAFF_ROLES.includes(values.role)) {
    errors.push({
      field: "role",
      message: "Only Admin and Cashier accounts can be created from staff management."
    });
  }

  if (!Object.values(RECORD_STATUS).includes(status)) {
    errors.push({ field: "status", message: "Status is not valid." });
  }

  return {
    errors,
    values: {
      fullName: values.fullName,
      username: values.username,
      password: values.password,
      role: values.role,
      status
    }
  };
};

/**
 * Validates editable staff fields for controlled updates.
 */
const validateUpdateStaffPayload = (payload = {}) => {
  const errors = [];
  const values = normalizeStaffValues(payload);

  if (!values.fullName) {
    errors.push({ field: "fullName", message: "Full name is required." });
  }

  if (!values.username) {
    errors.push({ field: "username", message: "Username is required." });
  } else if (values.username.length < 3) {
    errors.push({ field: "username", message: "Username must be at least 3 characters." });
  }

  if (!values.role) {
    errors.push({ field: "role", message: "Role is required." });
  } else if (!CREATABLE_STAFF_ROLES.includes(values.role)) {
    errors.push({
      field: "role",
      message: "Only Admin and Cashier roles can be managed from staff settings."
    });
  }

  if (!values.status) {
    errors.push({ field: "status", message: "Status is required." });
  } else if (!Object.values(RECORD_STATUS).includes(values.status)) {
    errors.push({ field: "status", message: "Status is not valid." });
  }

  return {
    errors,
    values: {
      fullName: values.fullName,
      username: values.username,
      role: values.role,
      status: values.status
    }
  };
};

module.exports = {
  CREATABLE_STAFF_ROLES,
  validateCreateStaffPayload,
  validateUpdateStaffPayload
};
