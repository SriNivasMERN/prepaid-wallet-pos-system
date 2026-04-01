/**
 * Module: Runtime Configuration
 * File: validateRuntimeConfig.js
 * Purpose: Validates required runtime settings before the server starts.
 */

const { JWT_SECRET } = require("../constants/appConstants");

/**
 * Ensures required auth configuration exists before startup.
 */
const validateRuntimeConfig = () => {
  if (!JWT_SECRET) {
    throw new Error(
      "JWT runtime configuration is missing. Add JWT_SECRET in server/.env."
    );
  }
};

module.exports = {
  validateRuntimeConfig
};
