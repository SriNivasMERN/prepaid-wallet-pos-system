/**
 * Module: Wallet Routes
 * File: wallet.routes.js
 * Purpose: Exposes Wallets module routes for wallet creation, listing, detail lookup, and updates.
 */

const express = require("express");

const { STAFF_ROLES } = require("../../constants/appConstants");
const { requireAuth, requireRoles } = require("../../middlewares/authMiddleware");
const {
  createWalletHandler,
  getWalletByIdHandler,
  getWalletListHandler,
  updateWalletHandler
} = require("./wallet.controller");

const walletsRouter = express.Router();

walletsRouter.use(requireAuth);
walletsRouter.use(
  requireRoles(
    STAFF_ROLES.SUPER_ADMIN,
    STAFF_ROLES.ADMIN,
    STAFF_ROLES.CASHIER
  )
);

/**
 * Returns the wallet list.
 */
walletsRouter.get("/", getWalletListHandler);

/**
 * Creates a new wallet.
 */
walletsRouter.post("/", createWalletHandler);

/**
 * Returns a single wallet profile.
 */
walletsRouter.get("/:walletId", getWalletByIdHandler);

/**
 * Updates a wallet record.
 */
walletsRouter.patch("/:walletId", updateWalletHandler);

module.exports = {
  walletsRouter
};
