/**
 * Module: Auth Middleware
 * File: authMiddleware.js
 * Purpose: Verifies JWT tokens before allowing protected route access.
 */

const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../constants/appConstants");
const { buildApiResponse } = require("../utils/apiResponse");

/**
 * Reads and validates the bearer token from the request headers.
 */
const requireAuth = (request, response, next) => {
  const authorizationHeader = request.headers.authorization || "";
  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return response.status(401).json(
      buildApiResponse({
        success: false,
        message: "Authentication is required.",
        errors: [
          {
            field: "authorization",
            message: "Provide a valid bearer token."
          }
        ]
      })
    );
  }

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET);
    request.auth = decodedToken;
    next();
  } catch (error) {
    return response.status(401).json(
      buildApiResponse({
        success: false,
        message: "Session is not valid.",
        errors: [
          {
            field: "authorization",
            message: "Login again to continue."
          }
        ]
      })
    );
  }
};

module.exports = {
  requireAuth
};