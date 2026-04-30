/**
 * Module: Auth Routes
 * File: auth.routes.js
 * Purpose: Exposes authentication-related routes needed for setup and login.
 */

const express = require("express");

const { requireAuth } = require("../../middlewares/authMiddleware");
const {
  changeCurrentStaffPasswordHandler,
  getCurrentStaffHandler,
  getSetupStatusHandler,
  loginHandler,
  logoutHandler,
  setupSuperAdminHandler,
  updateCurrentStaffProfileHandler
} = require("./auth.controller");

const authRouter = express.Router();

/**
 * Returns whether first-time setup is still available.
 */
authRouter.get("/setup-status", getSetupStatusHandler);

/**
 * Creates the first and only Super Admin account.
 */
authRouter.post("/setup", setupSuperAdminHandler);

/**
 * Verifies staff login credentials.
 */
authRouter.post("/login", loginHandler);
authRouter.post("/logout", requireAuth, logoutHandler);

/**
 * Returns the current authenticated staff profile.
 */
authRouter.get("/me", requireAuth, getCurrentStaffHandler);
authRouter.patch("/me/profile", requireAuth, updateCurrentStaffProfileHandler);
authRouter.patch("/me/password", requireAuth, changeCurrentStaffPasswordHandler);

module.exports = {
  authRouter
};
