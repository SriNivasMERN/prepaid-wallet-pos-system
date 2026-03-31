/**
 * Module: Error Middleware
 * File: errorHandler.js
 * Purpose: Converts server errors into a consistent API response structure.
 */

const { buildApiResponse } = require("../utils/apiResponse");

/**
 * Handles unexpected application errors in one place.
 */
const errorHandler = (error, request, response, next) => {
  const statusCode = error.statusCode || 500;
  const message =
    error.message || "An unexpected server error occurred.";

  response.status(statusCode).json(
    buildApiResponse({
      success: false,
      message,
      errors: error.errors || [
        {
          field: "server",
          message
        }
      ]
    })
  );
};

module.exports = {
  errorHandler
};