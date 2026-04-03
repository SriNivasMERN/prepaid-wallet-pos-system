/**
 * Module: Staff Validation
 * File: staff.validation.js
 * Purpose: Validates staff creation payloads for admin-managed staff accounts.
 */

const { RECORD_STATUS, STAFF_ROLES } = require("../../constants/appConstants");

const CREATABLE_STAFF_ROLES = [STAFF_ROLES.ADMIN, STAFF_ROLES.CASHIER];

/**
 * Validates the submitted staff creation fields.
 */
const validateCreateStaffPayload = (payload = {}) => {
  const errors = [];
  const fullName = payload.fullName?.trim();
  const username = payload.username?.trim().toLowerCase();
  const password = payload.password || "";
  const role = payload.role?.trim();
  const status = payload.status?.trim() || RECORD_STATUS.ACTIVE;

  if (!fullName) {
    errors.push({ field: "fullName", message: "Full name is required." });
  }

  if (!username) {
    errors.push({ field: "username", message: "Username is required." });
  }

  if (username && username.length < 3) {
    errors.push({ field: "username", message: "Username must be at least 3 characters." });
  }

  if (!password) {
    errors.push({ field: "password", message: "Password is required." });
  }

  if (password && password.length < 8) {
    errors.push({ field: "password", message: "Password must be at least 8 characters." });
  }

  if (!role) {
    errors.push({ field: "role", message: "Role is required." });
  }

  if (role && !CREATABLE_STAFF_ROLES.includes(role)) {
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
      fullName,
      username,
      password,
      role,
      status
    }
  };
};

module.exports = {
  CREATABLE_STAFF_ROLES,
  validateCreateStaffPayload
};
