/**
 * Module: Debit Controller
 * File: debit.controller.js
 * Purpose: Handles debit create, list, and detail responses for the Debits module.
 */

const { buildApiResponse } = require("../../utils/apiResponse");
const {
  createDebit,
  getDebitById,
  getDebitList
} = require("./debit.service");

/**
 * Returns the debit list.
 */
const getDebitListHandler = async (request, response, next) => {
  try {
    const data = await getDebitList(request.query);

    response.status(200).json(
      buildApiResponse({
        message: "Debit list fetched successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Returns one debit profile.
 */
const getDebitByIdHandler = async (request, response, next) => {
  try {
    const data = await getDebitById(request.params.debitId);

    response.status(200).json(
      buildApiResponse({
        message: "Debit profile fetched successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Creates a new debit entry.
 */
const createDebitHandler = async (request, response, next) => {
  try {
    const data = await createDebit(request.body, request.auth);

    response.status(201).json(
      buildApiResponse({
        message: "Debit created successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDebitListHandler,
  getDebitByIdHandler,
  createDebitHandler
};
