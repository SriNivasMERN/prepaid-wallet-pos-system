/**
 * Module: Report Controller
 * File: report.controller.js
 * Purpose: Handles report summary responses for the Reports module.
 */

const { buildApiResponse } = require("../../utils/apiResponse");
const { getReport } = require("./report.service");

/**
 * Returns one derived report response.
 */
const getReportHandler = async (request, response, next) => {
  try {
    const data = await getReport(request.query);

    response.status(200).json(
      buildApiResponse({
        message: "Report fetched successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReportHandler
};
