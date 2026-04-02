/**
 * Module: Access Control Constants
 * File: accessControl.js
 * Purpose: Stores role-based module and permission access rules for backend authorization.
 */

const { STAFF_ROLES } = require("./appConstants");

const MODULES = [
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

const STAFF_MODULE_ACCESS = {
  [STAFF_ROLES.SUPER_ADMIN]: MODULES,
  [STAFF_ROLES.ADMIN]: [
    "Members",
    "Cards",
    "Wallets",
    "Recharges",
    "Products",
    "Billing",
    "Transactions",
    "Stock",
    "Reports"
  ],
  [STAFF_ROLES.CASHIER]: [
    "Members",
    "Cards",
    "Wallets",
    "Recharges",
    "Billing",
    "Transactions"
  ]
};

const STAFF_PERMISSION_ACCESS = {
  [STAFF_ROLES.SUPER_ADMIN]: [
    "manage_staff",
    "manage_members",
    "manage_cards",
    "manage_wallets",
    "process_recharges",
    "manage_products",
    "process_billing",
    "view_transactions",
    "manage_stock",
    "view_reports"
  ],
  [STAFF_ROLES.ADMIN]: [
    "manage_members",
    "manage_cards",
    "manage_wallets",
    "process_recharges",
    "manage_products",
    "process_billing",
    "view_transactions",
    "manage_stock",
    "view_reports"
  ],
  [STAFF_ROLES.CASHIER]: [
    "manage_members",
    "manage_cards",
    "manage_wallets",
    "process_recharges",
    "process_billing",
    "view_transactions"
  ]
};

/**
 * Returns the modules a role can access.
 */
const getAllowedModulesForRole = (role) => {
  return STAFF_MODULE_ACCESS[role] || [];
};

/**
 * Returns the permissions a role can use.
 */
const getAllowedPermissionsForRole = (role) => {
  return STAFF_PERMISSION_ACCESS[role] || [];
};

/**
 * Builds the access profile returned with authenticated staff data.
 */
const buildAccessProfile = (role) => {
  return {
    allowedModules: getAllowedModulesForRole(role),
    allowedPermissions: getAllowedPermissionsForRole(role)
  };
};

module.exports = {
  MODULES,
  STAFF_MODULE_ACCESS,
  STAFF_PERMISSION_ACCESS,
  getAllowedModulesForRole,
  getAllowedPermissionsForRole,
  buildAccessProfile
};
