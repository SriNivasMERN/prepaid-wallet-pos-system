/**
 * Module: Wallet Controller
 * File: wallet.controller.js
 * Purpose: Handles wallet create, list, detail, and update responses for the Wallets module.
 */

const { buildApiResponse } = require("../../utils/apiResponse");
const {
  createWallet,
  getWalletById,
  getWalletList,
  updateWallet
} = require("./wallet.service");

/**
 * Returns the wallet list.
 */
const getWalletListHandler = async (request, response, next) => {
  try {
    const data = await getWalletList(request.query);

    response.status(200).json(
      buildApiResponse({
        message: "Wallet list fetched successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Returns one wallet profile.
 */
const getWalletByIdHandler = async (request, response, next) => {
  try {
    const data = await getWalletById(request.params.walletId);

    response.status(200).json(
      buildApiResponse({
        message: "Wallet profile fetched successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Creates a new wallet.
 */
const createWalletHandler = async (request, response, next) => {
  try {
    const data = await createWallet(request.body, request.auth);

    response.status(201).json(
      buildApiResponse({
        message: "Wallet created successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Updates an existing wallet.
 */
const updateWalletHandler = async (request, response, next) => {
  try {
    const data = await updateWallet(
      request.params.walletId,
      request.body,
      request.auth
    );

    response.status(200).json(
      buildApiResponse({
        message: "Wallet updated successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWalletListHandler,
  getWalletByIdHandler,
  createWalletHandler,
  updateWalletHandler
};
