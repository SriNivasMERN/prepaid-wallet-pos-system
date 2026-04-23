/**
 * Module: Report Routes
 * File: report.routes.js
 * Purpose: Exposes Reports module routes for derived operational reporting.
 */

const express = require("express");

const { STAFF_ROLES } = require("../../constants/appConstants");
const { requireAuth, requireRoles } = require("../../middlewares/authMiddleware");
const { getReportHandler } = require("./report.controller");

const reportsRouter = express.Router();

reportsRouter.use(requireAuth);
reportsRouter.use(
  requireRoles(
    STAFF_ROLES.SUPER_ADMIN,
    STAFF_ROLES.ADMIN
  )
);

/**
 * Returns one derived report response by report type.
 */
reportsRouter.get("/", getReportHandler);

module.exports = {
  reportsRouter
};
