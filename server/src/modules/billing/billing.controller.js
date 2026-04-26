/**
 * Module: Billing Controller
 * File: billing.controller.js
 * Purpose: Handles bill create, list, and detail responses for the Billing module.
 */

const { buildApiResponse } = require("../../utils/apiResponse");
const { createBill, getBillingPrecheck, getBillById, getBillList } = require("./billing.service");

/**
 * Returns the bill list for the Billing module.
 */
const getBillListHandler = async (request, response, next) => {
  try {
    const data = await getBillList(request.query);

    response.status(200).json(
      buildApiResponse({
        message: "Bill list fetched successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Returns one bill by id.
 */
const getBillByIdHandler = async (request, response, next) => {
  try {
    const data = await getBillById(request.params.billId);

    response.status(200).json(
      buildApiResponse({
        message: "Bill fetched successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Returns the billing readiness profile for one card number.
 */
const getBillingPrecheckHandler = async (request, response, next) => {
  try {
    const data = await getBillingPrecheck(request.query.cardNumber);

    response.status(200).json(
      buildApiResponse({
        message: "Billing precheck fetched successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Creates a new bill.
 */
const createBillHandler = async (request, response, next) => {
  try {
    const data = await createBill(request.body, request.auth);

    response.status(201).json(
      buildApiResponse({
        message: "Bill created successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBillListHandler,
  getBillingPrecheckHandler,
  getBillByIdHandler,
  createBillHandler
};
