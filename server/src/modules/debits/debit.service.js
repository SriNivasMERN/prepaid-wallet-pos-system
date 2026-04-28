/**
 * Module: Debit Service
 * File: debit.service.js
 * Purpose: Handles wallet debit creation, listing, and detail lookup for the Debits module.
 */

const mongoose = require("mongoose");

const { RECORD_STATUS } = require("../../constants/appConstants");
const { parsePaginationWindow } = require("../../utils/pagination");
const { createSearchPattern } = require("../../utils/search");
const { Card } = require("../cards/card.model");
const { Member } = require("../members/member.model");
const { Wallet } = require("../wallets/wallet.model");
const { Debit } = require("./debit.model");
const { validateCreateDebitPayload } = require("./debit.validation");

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
 * Validates MongoDB ids used by debit APIs.
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
 * Shapes a debit document for API responses.
 */
const toDebitResponse = (debit) => ({
  id: debit._id,
  amount: debit.amount,
  reason: debit.reason,
  notes: debit.notes,
  balanceBefore: debit.balanceBefore,
  balanceAfter: debit.balanceAfter,
  createdAt: debit.createdAt,
  updatedAt: debit.updatedAt,
  wallet: debit.walletId
    ? {
        id: debit.walletId._id,
        balance: debit.walletId.balance,
        status: debit.walletId.status
      }
    : null,
  member: debit.memberId
    ? {
        id: debit.memberId._id,
        fullName: debit.memberId.fullName,
        mobileNumber: debit.memberId.mobileNumber,
        status: debit.memberId.status
      }
    : null,
  card: debit.cardId
    ? {
        id: debit.cardId._id,
        cardNumber: debit.cardId.cardNumber,
        status: debit.cardId.status,
        expiresAt: debit.cardId.expiresAt
      }
    : null,
  createdBy: debit.createdBy
    ? {
        id: debit.createdBy._id,
        fullName: debit.createdBy.fullName,
        username: debit.createdBy.username,
        role: debit.createdBy.role
      }
    : null,
  updatedBy: debit.updatedBy
    ? {
        id: debit.updatedBy._id,
        fullName: debit.updatedBy.fullName,
        username: debit.updatedBy.username,
        role: debit.updatedBy.role
      }
    : null
});

/**
 * Loads one debit document with related details.
 */
const getDebitDocumentById = async (debitId) => {
  ensureValidObjectId(debitId, "debitId", "Debit was not found.");

  const debit = await Debit.findOne({
    _id: debitId,
    isDeleted: false
  })
    .populate("walletId", "balance status")
    .populate("memberId", "fullName mobileNumber status")
    .populate("cardId", "cardNumber status expiresAt")
    .populate("createdBy", "fullName username role")
    .populate("updatedBy", "fullName username role");

  if (!debit) {
    throw createNotFoundError("debitId", "Debit record was not found.", "Debit was not found.");
  }

  return debit;
};

/**
 * Loads one wallet with linked member details for debit flows.
 */
const getWalletForDebitFlow = async (walletId) => {
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
 * Creates a manual debit entry and deducts the linked wallet balance.
 */
const createDebit = async (payload, currentAuth) => {
  const { errors, values } = validateCreateDebitPayload(payload);

  if (errors.length > 0) {
    throw createValidationError(errors, "Debit validation failed.");
  }

  const wallet = await getWalletForDebitFlow(values.walletId);
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
      "Only an active wallet can be debited.",
      "Debit is not allowed."
    );
  }

  if (member.status !== RECORD_STATUS.ACTIVE) {
    throw createConflictError(
      "memberId",
      "Only an active member wallet can be debited.",
      "Debit is not allowed."
    );
  }

  if (!member.linkedCardId) {
    throw createConflictError(
      "cardId",
      "Member must have a linked card before debit.",
      "Debit is not allowed."
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
      "Member must have a usable active card before debit.",
      "Debit is not allowed."
    );
  }

  const balanceBefore = Number(wallet.balance || 0);

  if (values.amount > balanceBefore) {
    throw createConflictError(
      "amount",
      "Insufficient wallet balance for this debit.",
      "Debit is not allowed."
    );
  }

  const balanceAfter = balanceBefore - values.amount;
  let balanceUpdated = false;
  let createdDebitId = null;

  try {
    wallet.balance = balanceAfter;
    wallet.updatedBy = currentAuth.staffId;
    await wallet.save();
    balanceUpdated = true;

    const debit = await Debit.create({
      walletId: wallet._id,
      memberId: member._id,
      cardId: card._id,
      amount: values.amount,
      reason: values.reason,
      notes: values.notes,
      balanceBefore,
      balanceAfter,
      createdBy: currentAuth.staffId,
      updatedBy: currentAuth.staffId
    });
    createdDebitId = debit._id;

    const hydratedDebit = await getDebitDocumentById(debit._id);

    return toDebitResponse(hydratedDebit);
  } catch (error) {
    // Debit mirrors the recharge safety net: if the history entry fails, put the wallet
    // back where it started so balance-only updates do not leak through.
    if (createdDebitId) {
      await Debit.deleteOne({ _id: createdDebitId }).catch(() => null);
    }

    if (balanceUpdated) {
      await Wallet.updateOne(
        { _id: wallet._id, isDeleted: false },
        {
          $set: {
            balance: balanceBefore,
            updatedBy: currentAuth.staffId
          }
        }
      ).catch(() => null);
    }

    throw error;
  }
};

/**
 * Returns the debit list with optional search, reason, cashier, and date filters.
 */
const getDebitList = async (query = {}) => {
  const databaseQuery = {
    isDeleted: false
  };

  const searchValue = typeof query.search === "string" ? query.search.trim() : "";
  const reasonValue = typeof query.reason === "string" ? query.reason.trim() : "";
  const cashierIdValue =
    typeof query.cashierId === "string" ? query.cashierId.trim() : "";
  const dateValue = typeof query.date === "string" ? query.date.trim() : "";

  if (reasonValue) {
    databaseQuery.reason = createSearchPattern(reasonValue);
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
      { cardId: { $in: cardMatches.map((card) => card._id) } },
      { reason: searchPattern }
    ];
  }

  const paginationWindow = parsePaginationWindow(query);
  let debitQuery = Debit.find(databaseQuery)
    .populate("walletId", "balance status")
    .populate("memberId", "fullName mobileNumber status")
    .populate("cardId", "cardNumber status expiresAt")
    .populate("createdBy", "fullName username role")
    .populate("updatedBy", "fullName username role")
    .sort({ createdAt: -1 });

  if (paginationWindow) {
    debitQuery = debitQuery.skip(paginationWindow.skip).limit(paginationWindow.limit);
  }

  const debits = await debitQuery.lean();

  return debits.map(toDebitResponse);
};

/**
 * Returns one debit detail view.
 */
const getDebitById = async (debitId) => {
  const debit = await getDebitDocumentById(debitId);

  return toDebitResponse(debit);
};

module.exports = {
  createDebit,
  getDebitList,
  getDebitById
};
