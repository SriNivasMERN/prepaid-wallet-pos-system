/**
 * Module: Auth Validation
 * File: auth.validation.js
 * Purpose: Validates first-time setup and login payloads.
 */

/**
 * Validates the submitted first-time setup fields.
 */
const validateSetupPayload = (payload = {}) => {
  const errors = [];
  const fullName = payload.fullName?.trim();
  const username = payload.username?.trim().toLowerCase();
  const password = payload.password || "";
  const confirmPassword = payload.confirmPassword || "";

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

  if (!confirmPassword) {
    errors.push({ field: "confirmPassword", message: "Confirm password is required." });
  }

  if (password && confirmPassword && password !== confirmPassword) {
    errors.push({ field: "confirmPassword", message: "Passwords do not match." });
  }

  return {
    errors,
    values: {
      fullName,
      username,
      password
    }
  };
};

/**
 * Validates the submitted login fields.
 */
const validateLoginPayload = (payload = {}) => {
  const errors = [];
  const username = payload.username?.trim().toLowerCase();
  const password = payload.password || "";

  if (!username) {
    errors.push({ field: "username", message: "Username is required." });
  }

  if (!password) {
    errors.push({ field: "password", message: "Password is required." });
  }

  return {
    errors,
    values: {
      username,
      password
    }
  };
};

module.exports = {
  validateSetupPayload,
  validateLoginPayload
};