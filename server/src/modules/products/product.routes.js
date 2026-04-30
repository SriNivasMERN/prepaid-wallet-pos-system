/**
 * Module: Product Routes
 * File: product.routes.js
 * Purpose: Exposes Products module routes for product master listing, creation, and safe lifecycle updates.
 */

const express = require("express");

const { STAFF_ROLES } = require("../../constants/appConstants");
const { requireAuth, requireRoles } = require("../../middlewares/authMiddleware");
const {
  createProductHandler,
  getProductListHandler,
  getNextProductCodeHandler,
  updateProductHandler,
  updateProductStatusHandler
} = require("./product.controller");

const productsRouter = express.Router();

productsRouter.use(requireAuth);
productsRouter.use(requireRoles(STAFF_ROLES.SUPER_ADMIN, STAFF_ROLES.ADMIN));

/**
 * Returns the product master list.
 */
productsRouter.get("/", getProductListHandler);

/**
 * Returns the next generated product code preview.
 */
productsRouter.get("/next-code", getNextProductCodeHandler);

/**
 * Creates a new product master record.
 */
productsRouter.post("/", createProductHandler);

/**
 * Updates one product master record.
 */
productsRouter.patch("/:productId", updateProductHandler);

/**
 * Updates one product status.
 */
productsRouter.patch("/:productId/status", updateProductStatusHandler);

module.exports = {
  productsRouter
};
