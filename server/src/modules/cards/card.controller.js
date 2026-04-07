/**
 * Module: Card Controller
 * File: card.controller.js
 * Purpose: Handles card assign, list, detail, and replacement responses.
 */

const { buildApiResponse } = require("../../utils/apiResponse");
const {
  assignCard,
  getCardById,
  getCardList,
  replaceCard
} = require("./card.service");

/**
 * Returns the card list.
 */
const getCardListHandler = async (request, response, next) => {
  try {
    const data = await getCardList(request.query);

    response.status(200).json(
      buildApiResponse({
        message: "Card list fetched successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Returns one card profile.
 */
const getCardByIdHandler = async (request, response, next) => {
  try {
    const data = await getCardById(request.params.cardId);

    response.status(200).json(
      buildApiResponse({
        message: "Card profile fetched successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Assigns a new card to a member.
 */
const assignCardHandler = async (request, response, next) => {
  try {
    const data = await assignCard(request.body, request.auth);

    response.status(201).json(
      buildApiResponse({
        message: "Card assigned successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Replaces an active card.
 */
const replaceCardHandler = async (request, response, next) => {
  try {
    const data = await replaceCard(request.params.cardId, request.body, request.auth);

    response.status(200).json(
      buildApiResponse({
        message: "Card replaced successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCardListHandler,
  getCardByIdHandler,
  assignCardHandler,
  replaceCardHandler
};
