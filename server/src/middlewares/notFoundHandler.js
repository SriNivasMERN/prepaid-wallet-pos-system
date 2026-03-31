/**
 * Module: Not Found Middleware
 * File: notFoundHandler.js
 * Purpose: Returns a consistent response when no route matches the request.
 */

const { buildApiResponse } = require("../utils/apiResponse");

/**
 * Handles unmatched routes with a standard 404 response.
 */
const notFoundHandler = (request, response) => {
  response.status(404).json(
    buildApiResponse({
      success: false,
      message: "Requested resource was not found.",
      errors: [
        {
          field: "route",
          message: `${request.method} ${request.originalUrl} is not available.`
        }
      ]
    })
  );
};

module.exports = {
  notFoundHandler
};