/**
 * Module: API Response Utility
 * File: apiResponse.js
 * Purpose: Builds the standard API response format for backend endpoints.
 */

/**
 * Creates a predictable response body for all API handlers.
 */
const buildApiResponse = ({
  success = true,
  message = "Request completed successfully.",
  data = null,
  meta = null,
  errors = null
} = {}) => {
  return {
    success,
    message,
    data,
    meta,
    errors
  };
};

module.exports = {
  buildApiResponse
};