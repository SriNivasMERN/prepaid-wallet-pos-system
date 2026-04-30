/**
 * Module: Card Controller
 * File: card.controller.js
 * Purpose: Handles card assign, list, detail, replacement, and operational readiness responses.
 */

const { buildApiResponse } = require("../../utils/apiResponse");
const {
  assignCard,
  getCardById,
  getCardList,
  getCardOperationalProfile,
  generateNextCardNumber,
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
 * Returns the next generated card number preview.
 */
const getNextCardNumberHandler = async (request, response, next) => {
  try {
    const cardNumber = await generateNextCardNumber();

    response.status(200).json(
      buildApiResponse({
        message: "Next card number fetched successfully.",
        data: {
          cardNumber
        }
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
 * Returns the operational readiness profile for one card.
 */
const getCardOperationalProfileHandler = async (request, response, next) => {
  try {
    const data = await getCardOperationalProfile(request.params.cardId);

    response.status(200).json(
      buildApiResponse({
        message: "Card operational profile fetched successfully.",
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
  getNextCardNumberHandler,
  getCardByIdHandler,
  getCardOperationalProfileHandler,
  assignCardHandler,
  replaceCardHandler
};
