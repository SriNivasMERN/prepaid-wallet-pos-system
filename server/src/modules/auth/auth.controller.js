/**
 * Module: Auth Controller
 * File: auth.controller.js
 * Purpose: Returns setup status, handles first-time setup, and manages login.
 */

const { buildApiResponse } = require("../../utils/apiResponse");
const {
  createInitialSuperAdmin,
  getCurrentStaff,
  getSetupStatus,
  loginStaff
} = require("./auth.service");

/**
 * Sends the current first-time setup status to the client.
 */
const getSetupStatusHandler = async (request, response, next) => {
  try {
    const data = await getSetupStatus();

    response.status(200).json(
      buildApiResponse({
        message: "Setup status fetched successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Creates the initial Super Admin account during the one-time setup flow.
 */
const setupSuperAdminHandler = async (request, response, next) => {
  try {
    const data = await createInitialSuperAdmin(request.body);

    response.status(201).json(
      buildApiResponse({
        message: "Super Admin account created successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Verifies credentials and returns a login session.
 */
const loginHandler = async (request, response, next) => {
  try {
    const data = await loginStaff(request.body);

    response.status(200).json(
      buildApiResponse({
        message: "Login completed successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Returns the current authenticated staff profile.
 */
const getCurrentStaffHandler = async (request, response, next) => {
  try {
    const data = await getCurrentStaff(request.auth.staffId);

    response.status(200).json(
      buildApiResponse({
        message: "Staff profile fetched successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSetupStatusHandler,
  setupSuperAdminHandler,
  loginHandler,
  getCurrentStaffHandler
};