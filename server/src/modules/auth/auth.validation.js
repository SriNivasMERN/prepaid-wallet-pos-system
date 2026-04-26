/**
 * Module: Auth Validation
 * File: auth.validation.js
 * Purpose: Validates first-time setup, login, and authenticated self-service account payloads.
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

/**
 * Validates the submitted self-profile update fields.
 */
const validateProfileUpdatePayload = (payload = {}) => {
  const errors = [];
  const fullName = payload.fullName?.trim();
  const username = payload.username?.trim().toLowerCase();

  if (!fullName) {
    errors.push({ field: "fullName", message: "Full name is required." });
  } else if (fullName.length < 2) {
    errors.push({ field: "fullName", message: "Full name must be at least 2 characters." });
  }

  if (!username) {
    errors.push({ field: "username", message: "Username is required." });
  } else if (username.length < 3) {
    errors.push({ field: "username", message: "Username must be at least 3 characters." });
  }

  return {
    errors,
    values: {
      fullName,
      username
    }
  };
};

/**
 * Validates the submitted password-change fields.
 */
const validatePasswordChangePayload = (payload = {}) => {
  const errors = [];
  const currentPassword = payload.currentPassword || "";
  const newPassword = payload.newPassword || "";
  const confirmPassword = payload.confirmPassword || "";

  if (!currentPassword) {
    errors.push({ field: "currentPassword", message: "Current password is required." });
  }

  if (!newPassword) {
    errors.push({ field: "newPassword", message: "New password is required." });
  } else if (newPassword.length < 8) {
    errors.push({ field: "newPassword", message: "New password must be at least 8 characters." });
  }

  if (!confirmPassword) {
    errors.push({ field: "confirmPassword", message: "Confirm password is required." });
  } else if (newPassword && confirmPassword && newPassword !== confirmPassword) {
    errors.push({ field: "confirmPassword", message: "Passwords do not match." });
  }

  if (currentPassword && newPassword && currentPassword === newPassword) {
    errors.push({
      field: "newPassword",
      message: "New password must be different from the current password."
    });
  }

  return {
    errors,
    values: {
      currentPassword,
      newPassword
    }
  };
};

module.exports = {
  validateSetupPayload,
  validateLoginPayload,
  validateProfileUpdatePayload,
  validatePasswordChangePayload
};
