/**
 * Module: Recharge Service
 * File: recharge.service.js
 * Purpose: Handles wallet recharge creation, listing, and detail lookup for the Recharges module.
 */

const mongoose = require("mongoose");

const { RECORD_STATUS } = require("../../constants/appConstants");
const { parsePaginationWindow } = require("../../utils/pagination");
const { createSearchPattern } = require("../../utils/search");
const { Card } = require("../cards/card.model");
const { Member } = require("../members/member.model");
const { Wallet } = require("../wallets/wallet.model");
const { Recharge } = require("./recharge.model");
const { validateCreateRechargePayload } = require("./recharge.validation");

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
 * Validates MongoDB ids used by recharge APIs.
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
 * Shapes a recharge document for API responses.
 */
const toRechargeResponse = (recharge) => ({
  id: recharge._id,
  amount: recharge.amount,
  paymentMode: recharge.paymentMode,
  notes: recharge.notes,
  balanceBefore: recharge.balanceBefore,
  balanceAfter: recharge.balanceAfter,
  createdAt: recharge.createdAt,
  updatedAt: recharge.updatedAt,
  wallet: recharge.walletId
    ? {
        id: recharge.walletId._id,
        balance: recharge.walletId.balance,
        status: recharge.walletId.status
      }
    : null,
  member: recharge.memberId
    ? {
        id: recharge.memberId._id,
        fullName: recharge.memberId.fullName,
        mobileNumber: recharge.memberId.mobileNumber,
        status: recharge.memberId.status
      }
    : null,
  card: recharge.cardId
    ? {
        id: recharge.cardId._id,
        cardNumber: recharge.cardId.cardNumber,
        status: recharge.cardId.status,
        expiresAt: recharge.cardId.expiresAt
      }
    : null,
  createdBy: recharge.createdBy
    ? {
        id: recharge.createdBy._id,
        fullName: recharge.createdBy.fullName,
        username: recharge.createdBy.username,
        role: recharge.createdBy.role
      }
    : null,
  updatedBy: recharge.updatedBy
    ? {
        id: recharge.updatedBy._id,
        fullName: recharge.updatedBy.fullName,
        username: recharge.updatedBy.username,
        role: recharge.updatedBy.role
      }
    : null
});

/**
 * Loads one recharge document with related details.
 */
const getRechargeDocumentById = async (rechargeId) => {
  ensureValidObjectId(rechargeId, "rechargeId", "Recharge was not found.");

  const recharge = await Recharge.findOne({
    _id: rechargeId,
    isDeleted: false
  })
    .populate("walletId", "balance status")
    .populate("memberId", "fullName mobileNumber status")
    .populate("cardId", "cardNumber status expiresAt")
    .populate("createdBy", "fullName username role")
    .populate("updatedBy", "fullName username role");

  if (!recharge) {
    throw createNotFoundError(
      "rechargeId",
      "Recharge record was not found.",
      "Recharge was not found."
    );
  }

  return recharge;
};

/**
 * Loads one wallet with linked member details for recharge flows.
 */
const getWalletForRechargeFlow = async (walletId) => {
  ensureValidObjectId(walletId, "walletId", "Wallet was not found.");

  const wallet = await Wallet.findOne({
    _id: walletId,
    isDeleted: false
  }).populate("memberId", "fullName mobileNumber status linkedCardId linkedWalletId");

  if (!wallet) {
    throw createNotFoundError("walletId", "Wallet record was not found.", "Wallet was not found.");
  }

  return wallet;
};

/**
 * Creates a recharge entry and credits the linked wallet balance.
 */
const createRecharge = async (payload, currentAuth) => {
  const { errors, values } = validateCreateRechargePayload(payload);

  if (errors.length > 0) {
    throw createValidationError(errors, "Recharge validation failed.");
  }

  const wallet = await getWalletForRechargeFlow(values.walletId);
  const member = await Member.findOne({
    _id: wallet.memberId?._id || wallet.memberId,
    isDeleted: false
  });

  if (!member) {
    throw createNotFoundError("memberId", "Member record was not found.", "Member was not found.");
  }

  if (wallet.status !== RECORD_STATUS.ACTIVE) {
    throw createConflictError(
      "walletId",
      "Only an active wallet can be recharged.",
      "Recharge is not allowed."
    );
  }

  if (member.status !== RECORD_STATUS.ACTIVE) {
    throw createConflictError(
      "memberId",
      "Only an active member can be recharged.",
      "Recharge is not allowed."
    );
  }

  if (!member.linkedCardId) {
    throw createConflictError(
      "cardId",
      "Member must have a linked card before recharge.",
      "Recharge is not allowed."
    );
  }

  const card = await Card.findOne({
    _id: member.linkedCardId,
    isDeleted: false
  });

  if (!card) {
    throw createNotFoundError("cardId", "Card record was not found.", "Card was not found.");
  }

  if (card.status !== RECORD_STATUS.ACTIVE || isCardExpired(card.expiresAt)) {
    throw createConflictError(
      "cardId",
      "Member must have a usable active card before recharge.",
      "Recharge is not allowed."
    );
  }

  const walletBeforeRecharge = await Wallet.findOneAndUpdate(
    {
      _id: wallet._id,
      isDeleted: false,
      status: RECORD_STATUS.ACTIVE
    },
    {
      $inc: {
        balance: values.amount
      },
      $set: {
        updatedBy: currentAuth.staffId
      }
    },
    {
      new: false
    }
  );

  if (!walletBeforeRecharge) {
    throw createConflictError(
      "walletId",
      "Only an active wallet can be recharged.",
      "Recharge is not allowed."
    );
  }

  const balanceBefore = Number(walletBeforeRecharge.balance || 0);
  const balanceAfter = balanceBefore + values.amount;
  let createdRechargeId = null;

  try {
    const recharge = await Recharge.create({
      walletId: wallet._id,
      memberId: member._id,
      cardId: card._id,
      amount: values.amount,
      paymentMode: values.paymentMode,
      notes: values.notes,
      balanceBefore,
      balanceAfter,
      createdBy: currentAuth.staffId,
      updatedBy: currentAuth.staffId
    });
    createdRechargeId = recharge._id;

    const hydratedRecharge = await getRechargeDocumentById(recharge._id);

    return toRechargeResponse(hydratedRecharge);
  } catch (error) {
    // Recharge updates wallet balance before the history row exists, so roll the balance
    // back if the entry write fails and keep the ledger consistent.
    if (createdRechargeId) {
      await Recharge.deleteOne({ _id: createdRechargeId }).catch(() => null);
    }

    await Wallet.updateOne(
      { _id: wallet._id, isDeleted: false },
      {
        $inc: {
          balance: values.amount * -1
        },
        $set: {
          updatedBy: currentAuth.staffId
        }
      }
    ).catch(() => null);

    throw error;
  }
};

/**
 * Returns the recharge list with optional search, payment mode, cashier, and date filters.
 */
const getRechargeList = async (query = {}) => {
  const databaseQuery = {
    isDeleted: false
  };

  const searchValue = typeof query.search === "string" ? query.search.trim() : "";
  const paymentModeValue =
    typeof query.paymentMode === "string" ? query.paymentMode.trim() : "";
  const cashierIdValue =
    typeof query.cashierId === "string" ? query.cashierId.trim() : "";
  const dateValue = typeof query.date === "string" ? query.date.trim() : "";

  if (paymentModeValue) {
    databaseQuery.paymentMode = paymentModeValue;
  }

  if (cashierIdValue) {
    ensureValidObjectId(cashierIdValue, "cashierId", "Staff was not found.");
    databaseQuery.createdBy = cashierIdValue;
  }

  if (dateValue) {
    const fromDate = new Date(dateValue);

    if (!Number.isNaN(fromDate.getTime())) {
      fromDate.setHours(0, 0, 0, 0);
      const toDate = new Date(fromDate);
      toDate.setDate(toDate.getDate() + 1);

      databaseQuery.createdAt = {
        $gte: fromDate,
        $lt: toDate
      };
    }
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
    const cardMatches = await Card.find({
      isDeleted: false,
      cardNumber: searchPattern
    }).select("_id").lean();

    databaseQuery.$or = [
      { memberId: { $in: memberMatches.map((member) => member._id) } },
      { cardId: { $in: cardMatches.map((card) => card._id) } }
    ];
  }

  const paginationWindow = parsePaginationWindow(query);
  let rechargeQuery = Recharge.find(databaseQuery)
    .populate("walletId", "balance status")
    .populate("memberId", "fullName mobileNumber status")
    .populate("cardId", "cardNumber status expiresAt")
    .populate("createdBy", "fullName username role")
    .populate("updatedBy", "fullName username role")
    .sort({ createdAt: -1 });

  if (paginationWindow) {
    rechargeQuery = rechargeQuery.skip(paginationWindow.skip).limit(paginationWindow.limit);
  }

  const recharges = await rechargeQuery.lean();

  return recharges.map(toRechargeResponse);
};

/**
 * Returns one recharge detail view.
 */
const getRechargeById = async (rechargeId) => {
  const recharge = await getRechargeDocumentById(rechargeId);

  return toRechargeResponse(recharge);
};

module.exports = {
  createRecharge,
  getRechargeList,
  getRechargeById
};
