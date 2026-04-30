/**
 * Module: Card Routes
 * File: card.routes.js
 * Purpose: Exposes Cards module routes for assignment, replacement, list, detail, and operational readiness operations.
 */

const express = require("express");

const { STAFF_ROLES } = require("../../constants/appConstants");
const { requireAuth, requireRoles } = require("../../middlewares/authMiddleware");
const {
  assignCardHandler,
  getCardByIdHandler,
  getCardListHandler,
  getNextCardNumberHandler,
  getCardOperationalProfileHandler,
  replaceCardHandler
} = require("./card.controller");

const cardsRouter = express.Router();

cardsRouter.use(requireAuth);
cardsRouter.use(
  requireRoles(
    STAFF_ROLES.SUPER_ADMIN,
    STAFF_ROLES.ADMIN,
    STAFF_ROLES.CASHIER
  )
);

/**
 * Returns the card list.
 */
cardsRouter.get("/", getCardListHandler);

/**
 * Returns the next generated card number preview.
 */
cardsRouter.get("/next-number", getNextCardNumberHandler);

/**
 * Assigns a new card.
 */
cardsRouter.post("/", assignCardHandler);

/**
 * Returns the operational readiness profile for one card.
 */
cardsRouter.get("/:cardId/operational-profile", getCardOperationalProfileHandler);

/**
 * Returns a single card profile.
 */
cardsRouter.get("/:cardId", getCardByIdHandler);

/**
 * Replaces an active card.
 */
cardsRouter.patch("/:cardId/replace", replaceCardHandler);

module.exports = {
  cardsRouter
};
