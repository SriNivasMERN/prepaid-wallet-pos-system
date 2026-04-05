/**
 * Module: Member Routes
 * File: member.routes.js
 * Purpose: Exposes Members module routes for member management operations.
 */

const express = require("express");

const { STAFF_ROLES } = require("../../constants/appConstants");
const { requireAuth, requireRoles } = require("../../middlewares/authMiddleware");
const {
  createMemberHandler,
  getMemberByIdHandler,
  getMemberListHandler,
  updateMemberHandler
} = require("./member.controller");

const membersRouter = express.Router();

membersRouter.use(requireAuth);
membersRouter.use(
  requireRoles(
    STAFF_ROLES.SUPER_ADMIN,
    STAFF_ROLES.ADMIN,
    STAFF_ROLES.CASHIER
  )
);

/**
 * Returns the member list.
 */
membersRouter.get("/", getMemberListHandler);

/**
 * Creates a new member record.
 */
membersRouter.post("/", createMemberHandler);

/**
 * Returns a single member profile.
 */
membersRouter.get("/:memberId", getMemberByIdHandler);

/**
 * Updates a member record.
 */
membersRouter.patch("/:memberId", updateMemberHandler);

module.exports = {
  membersRouter
};
