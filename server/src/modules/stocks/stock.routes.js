/**
 * Module: Stock Routes
 * File: stock.routes.js
 * Purpose: Exposes Stocks module routes for stock list visibility and stock movement creation.
 */

const express = require("express");

const { STAFF_ROLES } = require("../../constants/appConstants");
const { requireAuth, requireRoles } = require("../../middlewares/authMiddleware");
const {
  createStockMovementHandler,
  getStockListHandler
} = require("./stock.controller");

const stocksRouter = express.Router();

stocksRouter.use(requireAuth);
stocksRouter.use(requireRoles(STAFF_ROLES.SUPER_ADMIN, STAFF_ROLES.ADMIN));

/**
 * Returns the stock list.
 */
stocksRouter.get("/", getStockListHandler);

/**
 * Creates a stock movement entry.
 */
stocksRouter.post("/movements", createStockMovementHandler);

module.exports = {
  stocksRouter
};
