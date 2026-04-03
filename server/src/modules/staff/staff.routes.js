/**
 * Module: Staff Routes
 * File: staff.routes.js
 * Purpose: Exposes staff management routes for the dashboard module.
 */

const express = require("express");

const { STAFF_ROLES } = require("../../constants/appConstants");
const { requireAuth, requireRoles } = require("../../middlewares/authMiddleware");
const { createStaffHandler, getStaffListHandler } = require("./staff.controller");

const staffRouter = express.Router();

staffRouter.use(requireAuth);
staffRouter.use(requireRoles(STAFF_ROLES.SUPER_ADMIN));

/**
 * Returns the staff list for management view.
 */
staffRouter.get("/", getStaffListHandler);

/**
 * Creates an Admin or Cashier account.
 */
staffRouter.post("/", createStaffHandler);

module.exports = {
  staffRouter
};
