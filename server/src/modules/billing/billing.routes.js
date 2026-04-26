/**
 * Module: Billing Routes
 * File: billing.routes.js
 * Purpose: Exposes Billing module routes for bill creation, list visibility, and bill detail lookup.
 */

const express = require("express");

const { STAFF_ROLES } = require("../../constants/appConstants");
const { requireAuth, requireRoles } = require("../../middlewares/authMiddleware");
const {
  createBillHandler,
  getBillingPrecheckHandler,
  getBillByIdHandler,
  getBillListHandler
} = require("./billing.controller");

const billingRouter = express.Router();

billingRouter.use(requireAuth);
billingRouter.use(
  requireRoles(
    STAFF_ROLES.SUPER_ADMIN,
    STAFF_ROLES.ADMIN,
    STAFF_ROLES.CASHIER
  )
);

/**
 * Returns the bill list.
 */
billingRouter.get("/", getBillListHandler);
billingRouter.get("/precheck", getBillingPrecheckHandler);

/**
 * Returns one bill by id.
 */
billingRouter.get("/:billId", getBillByIdHandler);

/**
 * Creates a new bill.
 */
billingRouter.post("/", createBillHandler);

module.exports = {
  billingRouter
};
