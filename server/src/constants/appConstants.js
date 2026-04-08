/**
 * Module: Application Constants
 * File: appConstants.js
 * Purpose: Stores backend-wide constants used across the server foundation.
 */

const APP_NAME = "Prepaid Wallet POS System";
const API_PREFIX = "/api/v1";
const SERVER_PORT = Number(process.env.PORT || 5000);
const CLIENT_ORIGIN_FALLBACK = process.env.CLIENT_URL || "http://localhost:5173";
const REQUEST_BODY_LIMIT = "1mb";
const DATABASE_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/prepaid-wallet-pos-system";
const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_EXPIRES_IN = "8h";

const STAFF_ROLES = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  CASHIER: "Cashier"
};

const RECORD_STATUS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive"
};

module.exports = {
  APP_NAME,
  API_PREFIX,
  SERVER_PORT,
  CLIENT_ORIGIN_FALLBACK,
  REQUEST_BODY_LIMIT,
  DATABASE_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  STAFF_ROLES,
  RECORD_STATUS
};
