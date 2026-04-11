/**
 * Module: Transaction Controller
 * File: transaction.controller.js
 * Purpose: Handles transaction ledger list responses for the Transactions module.
 */

const { buildApiResponse } = require("../../utils/apiResponse");
const { getTransactionList } = require("./transaction.service");

/**
 * Returns the derived transaction ledger.
 */
const getTransactionListHandler = async (request, response, next) => {
  try {
    const data = await getTransactionList(request.query);

    response.status(200).json(
      buildApiResponse({
        message: "Transaction list fetched successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactionListHandler
};
