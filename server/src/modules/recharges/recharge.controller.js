/**
 * Module: Recharge Controller
 * File: recharge.controller.js
 * Purpose: Handles recharge create, list, and detail responses for the Recharges module.
 */

const { buildApiResponse } = require("../../utils/apiResponse");
const {
  createRecharge,
  getRechargeById,
  getRechargeList
} = require("./recharge.service");

/**
 * Returns the recharge list.
 */
const getRechargeListHandler = async (request, response, next) => {
  try {
    const data = await getRechargeList(request.query);

    response.status(200).json(
      buildApiResponse({
        message: "Recharge list fetched successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Returns one recharge profile.
 */
const getRechargeByIdHandler = async (request, response, next) => {
  try {
    const data = await getRechargeById(request.params.rechargeId);

    response.status(200).json(
      buildApiResponse({
        message: "Recharge profile fetched successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Creates a new recharge.
 */
const createRechargeHandler = async (request, response, next) => {
  try {
    const data = await createRecharge(request.body, request.auth);

    response.status(201).json(
      buildApiResponse({
        message: "Recharge created successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRechargeListHandler,
  getRechargeByIdHandler,
  createRechargeHandler
};
