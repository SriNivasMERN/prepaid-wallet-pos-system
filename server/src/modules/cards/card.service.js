/**
 * Module: Card Service
 * File: card.service.js
 * Purpose: Handles card assignment, replacement, listing, detail lookup, and operational readiness checks.
 */

const mongoose = require("mongoose");

const { RECORD_STATUS } = require("../../constants/appConstants");
const { parsePaginationWindow } = require("../../utils/pagination");
const { createSearchPattern } = require("../../utils/search");
const { Member } = require("../members/member.model");
const { Card } = require("./card.model");
const {
  validateAssignCardPayload,
  validateReplaceCardPayload
} = require("./card.validation");

/**
 * Creates a standard validation error.
 */
const createValidationError = (errors, topMessage) => {
  const error = new Error(topMessage);
  error.statusCode = 400;
  error.errors = errors;
  return error;
};

/**
 * Creates a standard conflict error.
 */
const createConflictError = (field, message, topMessage) => {
  const error = new Error(topMessage);
  error.statusCode = 409;
  error.errors = [
    {
      field,
      message
    }
  ];
  return error;
};

/**
 * Creates a standard not-found error.
 */
const createNotFoundError = (field, message, topMessage) => {
  const error = new Error(topMessage);
  error.statusCode = 404;
  error.errors = [
    {
      field,
      message
    }
  ];
  return error;
};

/**
 * Validates MongoDB ids used by card APIs.
 */
const ensureValidObjectId = (value, fieldName, topMessage) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw createNotFoundError(fieldName, `${fieldName} record was not found.`, topMessage);
  }
};

/**
 * Returns true when the supplied card date is already expired.
 */
const isCardExpired = (expiresAt) => {
  if (!expiresAt) {
    return false;
  }

  const expiryDate = new Date(expiresAt);

  if (Number.isNaN(expiryDate.getTime())) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return expiryDate < today;
};

/**
 * Builds the operational readiness profile for one card and linked member.
 */
const buildCardOperationalProfile = (card, member) => {
  const expired = isCardExpired(card.expiresAt);
  const activeCard = card.status === RECORD_STATUS.ACTIVE;
  const activeMember = member?.status === RECORD_STATUS.ACTIVE;
  const canUseInOperations = activeCard && activeMember && !expired;

  return {
    expired,
    activeMember,
    canUseInOperations,
    blockingReason:
      card.status !== RECORD_STATUS.ACTIVE
        ? "Card is inactive."
        : member?.status !== RECORD_STATUS.ACTIVE
          ? "Linked member is inactive."
          : expired
            ? "Card is expired."
            : null
  };
};

/**
 * Shapes a card document for API responses.
 */
const toCardResponse = (card, options = {}) => ({
  id: card._id,
  cardNumber: card.cardNumber,
  status: card.status,
  activatedAt: card.activatedAt,
  expiresAt: card.expiresAt,
  createdAt: card.createdAt,
  updatedAt: card.updatedAt,
  member: card.memberId
    ? {
        id: card.memberId._id,
        fullName: card.memberId.fullName,
        mobileNumber: card.memberId.mobileNumber,
        status: card.memberId.status,
        linkedCardId: card.memberId.linkedCardId,
        linkedWalletId: card.memberId.linkedWalletId
      }
    : null,
  createdBy: card.createdBy
    ? {
        id: card.createdBy._id,
        fullName: card.createdBy.fullName,
        username: card.createdBy.username,
        role: card.createdBy.role
      }
    : null,
  updatedBy: card.updatedBy
    ? {
        id: card.updatedBy._id,
        fullName: card.updatedBy.fullName,
        username: card.updatedBy.username,
        role: card.updatedBy.role
      }
    : null,
  ...(options.operationalProfile ? { operationalProfile: options.operationalProfile } : {})
});

/**
 * Loads one card document with related member and staff details.
 */
const getCardDocumentById = async (cardId) => {
  ensureValidObjectId(cardId, "cardId", "Card was not found.");

  const card = await Card.findOne({
    _id: cardId,
    isDeleted: false
  })
    .populate("memberId", "fullName mobileNumber status linkedCardId linkedWalletId")
    .populate("createdBy", "fullName username role")
    .populate("updatedBy", "fullName username role");

  if (!card) {
    throw createNotFoundError("cardId", "Card record was not found.", "Card was not found.");
  }

  return card;
};

/**
 * Loads one member record used during card assignment flows.
 */
const getMemberForCardFlow = async (memberId) => {
  ensureValidObjectId(memberId, "memberId", "Member was not found.");

  const member = await Member.findOne({
    _id: memberId,
    isDeleted: false
  });

  if (!member) {
    throw createNotFoundError("memberId", "Member record was not found.", "Member was not found.");
  }

  return member;
};

/**
 * Assigns a new active card to a member.
 */
const assignCard = async (payload, currentAuth) => {
  const { errors, values } = validateAssignCardPayload(payload);

  if (errors.length > 0) {
    throw createValidationError(errors, "Card validation failed.");
  }

  const member = await getMemberForCardFlow(values.memberId);

  if (member.status !== RECORD_STATUS.ACTIVE) {
    throw createConflictError(
      "memberId",
      "Only an active member can receive a card.",
      "Card assignment is not allowed."
    );
  }

  const existingCardNumber = await Card.exists({
    cardNumber: values.cardNumber,
    isDeleted: false
  });

  if (existingCardNumber) {
    throw createConflictError(
      "cardNumber",
      "Choose a different card number.",
      "Card number is already in use."
    );
  }

  const existingActiveCard = await Card.exists({
    memberId: member._id,
    status: RECORD_STATUS.ACTIVE,
    isDeleted: false
  });

  if (existingActiveCard) {
    throw createConflictError(
      "memberId",
      "This member already has an active card.",
      "Card assignment is not allowed."
    );
  }

  try {
    const createdCard = await Card.create({
      cardNumber: values.cardNumber,
      memberId: member._id,
      status: RECORD_STATUS.ACTIVE,
      activatedAt: values.activatedAt,
      expiresAt: values.expiresAt,
      createdBy: currentAuth.staffId,
      updatedBy: currentAuth.staffId
    });

    member.linkedCardId = createdCard._id;
    member.updatedBy = currentAuth.staffId;
    await member.save();

    const hydratedCard = await getCardDocumentById(createdCard._id);

    return toCardResponse(hydratedCard, {
      operationalProfile: buildCardOperationalProfile(hydratedCard, hydratedCard.memberId)
    });
  } catch (error) {
    if (error?.code === 11000) {
      if (error.keyPattern?.cardNumber) {
        throw createConflictError(
          "cardNumber",
          "Choose a different card number.",
          "Card number is already in use."
        );
      }

      if (error.keyPattern?.memberId) {
        throw createConflictError(
          "memberId",
          "This member already has an active card.",
          "Card assignment is not allowed."
        );
      }
    }

    throw error;
  }
};

/**
 * Returns the visible card list with optional search and status filters.
 */
const getCardList = async (query = {}) => {
  const databaseQuery = {
    isDeleted: false
  };

  const searchValue = typeof query.search === "string" ? query.search.trim() : "";
  const statusValue = typeof query.status === "string" ? query.status.trim() : "";
  const memberIdValue = typeof query.memberId === "string" ? query.memberId.trim() : "";

  if (statusValue) {
    databaseQuery.status = statusValue;
  }

  if (memberIdValue) {
    ensureValidObjectId(memberIdValue, "memberId", "Member was not found.");
    databaseQuery.memberId = memberIdValue;
  }

  if (searchValue) {
    const searchPattern = createSearchPattern(searchValue);
    const memberMatches = await Member.find({
      isDeleted: false,
      $or: [
        { fullName: searchPattern },
        { mobileNumber: searchPattern }
      ]
    }).select("_id").lean();

    databaseQuery.$or = [
      { cardNumber: searchPattern },
      { memberId: { $in: memberMatches.map((member) => member._id) } }
    ];
  }

  const paginationWindow = parsePaginationWindow(query);
  let cardQuery = Card.find(databaseQuery)
    .populate("memberId", "fullName mobileNumber status linkedCardId linkedWalletId")
    .populate("createdBy", "fullName username role")
    .populate("updatedBy", "fullName username role")
    .sort({ createdAt: -1 });

  if (paginationWindow) {
    cardQuery = cardQuery.skip(paginationWindow.skip).limit(paginationWindow.limit);
  }

  const cards = await cardQuery.lean();

  return cards.map((card) =>
    toCardResponse(card, {
      operationalProfile: buildCardOperationalProfile(card, card.memberId)
    })
  );
};

/**
 * Returns the detail view for a single card.
 */
const getCardById = async (cardId) => {
  const card = await getCardDocumentById(cardId);

  return toCardResponse(card, {
    operationalProfile: buildCardOperationalProfile(card, card.memberId)
  });
};

/**
 * Returns the operational readiness view for a single card.
 */
const getCardOperationalProfile = async (cardId) => {
  const card = await getCardDocumentById(cardId);

  return toCardResponse(card, {
    operationalProfile: buildCardOperationalProfile(card, card.memberId)
  });
};

/**
 * Replaces an existing active card while keeping the same member ownership.
 */
const replaceCard = async (cardId, payload, currentAuth) => {
  ensureValidObjectId(cardId, "cardId", "Card was not found.");

  const { errors, values } = validateReplaceCardPayload(payload);

  if (errors.length > 0) {
    throw createValidationError(errors, "Card validation failed.");
  }

  const currentCard = await Card.findOne({
    _id: cardId,
    isDeleted: false
  });

  if (!currentCard) {
    throw createNotFoundError("cardId", "Card record was not found.", "Card was not found.");
  }

  if (currentCard.status !== RECORD_STATUS.ACTIVE) {
    throw createConflictError(
      "cardId",
      "Only an active card can be replaced.",
      "Card replacement is not allowed."
    );
  }

  if (isCardExpired(currentCard.expiresAt)) {
    throw createConflictError(
      "cardId",
      "An expired card cannot be replaced through active-card replacement flow.",
      "Card replacement is not allowed."
    );
  }

  const member = await getMemberForCardFlow(currentCard.memberId);

  if (member.status !== RECORD_STATUS.ACTIVE) {
    throw createConflictError(
      "memberId",
      "Only an active member can replace a card.",
      "Card replacement is not allowed."
    );
  }

  const duplicateCard = await Card.exists({
    _id: { $ne: currentCard._id },
    cardNumber: values.cardNumber,
    isDeleted: false
  });

  if (duplicateCard) {
    throw createConflictError(
      "cardNumber",
      "Choose a different card number.",
      "Card number is already in use."
    );
  }

  currentCard.status = RECORD_STATUS.INACTIVE;
  currentCard.updatedBy = currentAuth.staffId;
  await currentCard.save();

  try {
    const replacementCard = await Card.create({
      cardNumber: values.cardNumber,
      memberId: member._id,
      status: RECORD_STATUS.ACTIVE,
      activatedAt: values.activatedAt,
      expiresAt: values.expiresAt,
      createdBy: currentAuth.staffId,
      updatedBy: currentAuth.staffId
    });

    member.linkedCardId = replacementCard._id;
    member.updatedBy = currentAuth.staffId;
    await member.save();

    const hydratedOldCard = await getCardDocumentById(currentCard._id);
    const hydratedReplacementCard = await getCardDocumentById(replacementCard._id);

    return {
      replacedCard: toCardResponse(hydratedOldCard, {
        operationalProfile: buildCardOperationalProfile(hydratedOldCard, hydratedOldCard.memberId)
      }),
      replacementCard: toCardResponse(hydratedReplacementCard, {
        operationalProfile: buildCardOperationalProfile(
          hydratedReplacementCard,
          hydratedReplacementCard.memberId
        )
      })
    };
  } catch (error) {
    if (error?.code === 11000 && error.keyPattern?.cardNumber) {
      throw createConflictError(
        "cardNumber",
        "Choose a different card number.",
        "Card number is already in use."
      );
    }

    throw error;
  }
};

module.exports = {
  assignCard,
  getCardList,
  getCardById,
  getCardOperationalProfile,
  replaceCard
};
