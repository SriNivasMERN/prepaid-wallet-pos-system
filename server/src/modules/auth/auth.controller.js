/**
 * Module: Auth Controller
 * File: auth.controller.js
 * Purpose: Returns setup status, handles first-time setup, and manages login.
 */

const { buildApiResponse } = require("../../utils/apiResponse");
const {
  changeCurrentStaffPassword,
  createInitialSuperAdmin,
  getCurrentStaff,
  getSetupStatus,
  loginStaff,
  updateCurrentStaffProfile
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

/**
 * Updates the authenticated staff member's own profile.
 */
const updateCurrentStaffProfileHandler = async (request, response, next) => {
  try {
    const data = await updateCurrentStaffProfile(request.auth.staffId, request.body);

    response.status(200).json(
      buildApiResponse({
        message: "Account profile updated successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Changes the authenticated staff member's own password.
 */
const changeCurrentStaffPasswordHandler = async (request, response, next) => {
  try {
    const data = await changeCurrentStaffPassword(request.auth.staffId, request.body);

    response.status(200).json(
      buildApiResponse({
        message: "Password updated successfully.",
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
  getCurrentStaffHandler,
  updateCurrentStaffProfileHandler,
  changeCurrentStaffPasswordHandler
};
