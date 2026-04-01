/**
 * Module: Auth Middleware
 * File: authMiddleware.js
 * Purpose: Verifies JWT tokens and active staff status before allowing protected route access.
 */

const jwt = require("jsonwebtoken");

const { JWT_SECRET, RECORD_STATUS } = require("../constants/appConstants");
const { Staff } = require("../modules/staff/staff.model");
const { buildApiResponse } = require("../utils/apiResponse");

/**
 * Reads and validates the bearer token from the request headers.
 */
const requireAuth = async (request, response, next) => {
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
    const staff = await Staff.findOne({
      _id: decodedToken.staffId,
      isDeleted: false
    }).select("_id role username status fullName");

    if (!staff || staff.status !== RECORD_STATUS.ACTIVE) {
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

    request.auth = {
      staffId: staff._id,
      role: staff.role,
      username: staff.username,
      fullName: staff.fullName,
      status: staff.status
    };
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