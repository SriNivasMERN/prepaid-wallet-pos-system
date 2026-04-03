/**
 * Module: Staff Controller
 * File: staff.controller.js
 * Purpose: Handles staff creation and staff list responses.
 */

const { buildApiResponse } = require("../../utils/apiResponse");
const { createStaff, getStaffList } = require("./staff.service");

/**
 * Returns the visible staff list for the management module.
 */
const getStaffListHandler = async (request, response, next) => {
  try {
    const data = await getStaffList(request.auth);

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

module.exports = {
  getStaffListHandler,
  createStaffHandler
};
