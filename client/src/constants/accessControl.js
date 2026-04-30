/**
 * Module: Frontend Access Control
 * File: accessControl.js
 * Purpose: Stores role-based module and permission access rules for the client.
 */

import { APP_MODULES, STAFF_ROLES } from "./appConstants";

export const MODULE_ACCESS_BY_ROLE = {
  [STAFF_ROLES.SUPER_ADMIN]: APP_MODULES,
  [STAFF_ROLES.ADMIN]: APP_MODULES,
  [STAFF_ROLES.CASHIER]: [
    "Members",
    "Cards",
    "Wallets",
    "Recharges",
    "Debits",
    "Billing",
    "Transactions"
  ]
};

export const PERMISSION_ACCESS_BY_ROLE = {
  [STAFF_ROLES.SUPER_ADMIN]: [
    "manage_staff",
    "manage_members",
    "manage_cards",
    "manage_wallets",
    "process_recharges",
    "process_debits",
    "manage_products",
    "process_billing",
    "view_transactions",
    "manage_stock",
    "view_reports"
  ],
  [STAFF_ROLES.ADMIN]: [
    "manage_staff",
    "manage_members",
    "manage_cards",
    "manage_wallets",
    "process_recharges",
    "process_debits",
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
    "process_debits",
    "process_billing",
    "view_transactions"
  ]
};

export function getAllowedModulesForRole(role) {
  return MODULE_ACCESS_BY_ROLE[role] || [];
}

export function getAllowedPermissionsForRole(role) {
  return PERMISSION_ACCESS_BY_ROLE[role] || [];
}

export function hasRecognizedRole(role) {
  return getAllowedModulesForRole(role).length > 0;
}
