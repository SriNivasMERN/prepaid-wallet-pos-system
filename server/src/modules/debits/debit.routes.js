/**
 * Module: Debit Routes
 * File: debit.routes.js
 * Purpose: Exposes Debits module routes for manual wallet deduction creation, listing, and detail lookup.
 */

const express = require("express");

const { STAFF_ROLES } = require("../../constants/appConstants");
const { requireAuth, requireRoles } = require("../../middlewares/authMiddleware");
const {
  createDebitHandler,
  getDebitByIdHandler,
  getDebitListHandler
} = require("./debit.controller");

const debitsRouter = express.Router();

debitsRouter.use(requireAuth);
debitsRouter.use(
  requireRoles(
    STAFF_ROLES.SUPER_ADMIN,
    STAFF_ROLES.ADMIN,
    STAFF_ROLES.CASHIER
  )
);

/**
 * Returns the debit list.
 */
debitsRouter.get("/", getDebitListHandler);

/**
 * Creates a new debit entry.
 */
debitsRouter.post("/", createDebitHandler);

/**
 * Returns one debit profile.
 */
debitsRouter.get("/:debitId", getDebitByIdHandler);

module.exports = {
  debitsRouter
};
