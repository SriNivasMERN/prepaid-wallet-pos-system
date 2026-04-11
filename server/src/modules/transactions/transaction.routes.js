/**
 * Module: Transaction Routes
 * File: transaction.routes.js
 * Purpose: Exposes Transactions module routes for transaction ledger visibility.
 */

const express = require("express");

const { STAFF_ROLES } = require("../../constants/appConstants");
const { requireAuth, requireRoles } = require("../../middlewares/authMiddleware");
const { getTransactionListHandler } = require("./transaction.controller");

const transactionsRouter = express.Router();

transactionsRouter.use(requireAuth);
transactionsRouter.use(
  requireRoles(
    STAFF_ROLES.SUPER_ADMIN,
    STAFF_ROLES.ADMIN,
    STAFF_ROLES.CASHIER
  )
);

/**
 * Returns the transaction ledger.
 */
transactionsRouter.get("/", getTransactionListHandler);

module.exports = {
  transactionsRouter
};
