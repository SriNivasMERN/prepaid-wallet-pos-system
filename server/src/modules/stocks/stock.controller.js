/**
 * Module: Stock Controller
 * File: stock.controller.js
 * Purpose: Handles stock list and stock movement responses for the Stocks module.
 */

const { buildApiResponse } = require("../../utils/apiResponse");
const { createStockMovement, getStockList } = require("./stock.service");

/**
 * Returns the stock list for the Stocks module.
 */
const getStockListHandler = async (request, response, next) => {
  try {
    const data = await getStockList(request.query);

    response.status(200).json(
      buildApiResponse({
        message: "Stock list fetched successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Creates a stock movement entry and updates stock state.
 */
const createStockMovementHandler = async (request, response, next) => {
  try {
    const data = await createStockMovement(request.body, request.auth);

    response.status(201).json(
      buildApiResponse({
        message: "Stock movement saved successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStockListHandler,
  createStockMovementHandler
};
