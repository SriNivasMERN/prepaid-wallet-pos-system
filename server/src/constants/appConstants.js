/**
 * Module: Application Constants
 * File: appConstants.js
 * Purpose: Stores backend-wide constants used across the server foundation.
 */

const APP_NAME = "Prepaid Wallet POS System";
const API_PREFIX = "/api/v1";
const SERVER_PORT = Number(process.env.PORT || 5000);
const CLIENT_ORIGIN_FALLBACK = process.env.CLIENT_URL || "*";
const REQUEST_BODY_LIMIT = "1mb";

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
  STAFF_ROLES,
  RECORD_STATUS
};