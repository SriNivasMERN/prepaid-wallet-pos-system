/**
 * Module: Recharge Routes
 * File: recharge.routes.js
 * Purpose: Exposes Recharges module routes for wallet credit creation, listing, and detail lookup.
 */

const express = require("express");

const { STAFF_ROLES } = require("../../constants/appConstants");
const { requireAuth, requireRoles } = require("../../middlewares/authMiddleware");
const {
  createRechargeHandler,
  getRechargeByIdHandler,
  getRechargeListHandler
} = require("./recharge.controller");

const rechargesRouter = express.Router();

rechargesRouter.use(requireAuth);
rechargesRouter.use(
  requireRoles(
    STAFF_ROLES.SUPER_ADMIN,
    STAFF_ROLES.ADMIN,
    STAFF_ROLES.CASHIER
  )
);

/**
 * Returns the recharge list.
 */
rechargesRouter.get("/", getRechargeListHandler);

/**
 * Creates a new recharge.
 */
rechargesRouter.post("/", createRechargeHandler);

/**
 * Returns one recharge profile.
 */
rechargesRouter.get("/:rechargeId", getRechargeByIdHandler);

module.exports = {
  rechargesRouter
};
