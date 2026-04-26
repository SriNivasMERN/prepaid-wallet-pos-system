/**
 * Module: Staff Routes
 * File: staff.routes.js
 * Purpose: Exposes staff management routes for the dashboard module.
 */

const express = require("express");

const { STAFF_ROLES } = require("../../constants/appConstants");
const { requireAuth, requireRoles } = require("../../middlewares/authMiddleware");
const {
  createStaffHandler,
  getStaffListHandler,
  resetStaffPasswordHandler,
  updateStaffHandler
} = require("./staff.controller");

const staffRouter = express.Router();

staffRouter.use(requireAuth);
staffRouter.use(requireRoles(STAFF_ROLES.SUPER_ADMIN, STAFF_ROLES.ADMIN));

/**
 * Returns the staff list for management view.
 */
staffRouter.get("/", getStaffListHandler);

/**
 * Creates an allowed staff account for the current role.
 */
staffRouter.post("/", createStaffHandler);

/**
 * Updates an allowed staff account for the current role.
 */
staffRouter.patch("/:staffId", updateStaffHandler);
staffRouter.patch("/:staffId/reset-password", resetStaffPasswordHandler);

module.exports = {
  staffRouter
};
