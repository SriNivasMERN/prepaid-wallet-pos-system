/**
 * Module: Frontend Constants
 * File: appConstants.js
 * Purpose: Stores reusable client-side constants for navigation and UI data.
 */

export const APP_NAME = "Prepaid Wallet POS System";
export const API_BASE_URL = "http://localhost:5000/api/v1";

export const STAFF_ROLES = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  CASHIER: "Cashier"
};

export const APP_MODULES = [
  "Staff",
  "Members",
  "Cards",
  "Wallets",
  "Recharges",
  "Products",
  "Billing",
  "Transactions",
  "Stock",
  "Reports"
];

export const DASHBOARD_METRICS = [
  { label: "Total Members", value: "1,248" },
  { label: "Active Cards", value: "1,204" },
  { label: "Today Recharges", value: "186" },
  { label: "Stock Alerts", value: "09" }
];
