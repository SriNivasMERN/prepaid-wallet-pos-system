/**
 * Module: Staff Controller
 * File: staff.controller.js
 * Purpose: Handles staff creation, update, and staff list responses.
 */

const { buildApiResponse } = require("../../utils/apiResponse");
const { createStaff, getStaffList, resetStaffPassword, updateStaff } = require("./staff.service");

/**
 * Returns the visible staff list for the management module.
 */
const getStaffListHandler = async (request, response, next) => {
  try {
    const data = await getStaffList(request.query, request.auth);

    response.status(200).json(
      buildApiResponse({
        message: "Staff list fetched successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Creates a new staff account from the management module.
 */
const createStaffHandler = async (request, response, next) => {
  try {
    const data = await createStaff(request.body, request.auth);

    response.status(201).json(
      buildApiResponse({
        message: "Staff account created successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Updates one staff account from the management module.
 */
const updateStaffHandler = async (request, response, next) => {
  try {
    const data = await updateStaff(request.params.staffId, request.body, request.auth);

    response.status(200).json(
      buildApiResponse({
        message: "Staff account updated successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Resets one staff account password from the management module.
 */
const resetStaffPasswordHandler = async (request, response, next) => {
  try {
    const data = await resetStaffPassword(request.params.staffId, request.body, request.auth);

    response.status(200).json(
      buildApiResponse({
        message: "Staff password reset successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStaffListHandler,
  createStaffHandler,
  updateStaffHandler,
  resetStaffPasswordHandler
};
