/**
 * Module: Transaction Service
 * File: transaction.service.js
 * Purpose: Builds a transaction visibility ledger from recharge and debit entries for the Transactions module.
 */

const { Recharge } = require("../recharges/recharge.model");
const { Debit } = require("../debits/debit.model");
const { Card } = require("../cards/card.model");
const { Member } = require("../members/member.model");
const { parsePaginationWindow } = require("../../utils/pagination");
const { createSearchPattern } = require("../../utils/search");

/**
 * Shapes a recharge-backed credit entry as a transaction response.
 */
const toTransactionResponse = (recharge) => ({
  id: recharge._id,
  reference: `RCG-${String(recharge._id).slice(-6).toUpperCase()}`,
  type: "Credit",
  amount: recharge.amount,
  balanceBefore: recharge.balanceBefore,
  balanceAfter: recharge.balanceAfter,
  paymentMode: recharge.paymentMode,
  notes: recharge.notes,
  createdAt: recharge.createdAt,
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
        status: recharge.cardId.status
      }
    : null,
  createdBy: recharge.createdBy
    ? {
        id: recharge.createdBy._id,
        fullName: recharge.createdBy.fullName,
        username: recharge.createdBy.username,
        role: recharge.createdBy.role
      }
    : null
});

/**
 * Shapes a manual debit entry as a transaction response.
 */
const toDebitTransactionResponse = (debit) => ({
  id: debit._id,
  reference: `DBT-${String(debit._id).slice(-6).toUpperCase()}`,
  type: "Debit",
  amount: debit.amount,
  balanceBefore: debit.balanceBefore,
  balanceAfter: debit.balanceAfter,
  reason: debit.reason,
  notes: debit.notes,
  createdAt: debit.createdAt,
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
        status: debit.cardId.status
      }
    : null,
  createdBy: debit.createdBy
    ? {
        id: debit.createdBy._id,
        fullName: debit.createdBy.fullName,
        username: debit.createdBy.username,
        role: debit.createdBy.role
      }
    : null
});

/**
 * Builds a shared database query for recharge and debit-backed transaction entries.
 */
const buildTransactionQuery = async (query = {}) => {
  const databaseQuery = {
    isDeleted: false
  };

  const searchValue = typeof query.search === "string" ? query.search.trim() : "";
  const fromDateValue = typeof query.fromDate === "string" ? query.fromDate.trim() : "";
  const toDateValue = typeof query.toDate === "string" ? query.toDate.trim() : "";

  if (fromDateValue || toDateValue) {
    const createdAtQuery = {};

    if (fromDateValue) {
      const fromDate = new Date(fromDateValue);

      if (!Number.isNaN(fromDate.getTime())) {
        fromDate.setHours(0, 0, 0, 0);
        createdAtQuery.$gte = fromDate;
      }
    }

    if (toDateValue) {
      const toDate = new Date(toDateValue);

      if (!Number.isNaN(toDate.getTime())) {
        toDate.setHours(23, 59, 59, 999);
        createdAtQuery.$lte = toDate;
      }
    }

    if (Object.keys(createdAtQuery).length > 0) {
      databaseQuery.createdAt = createdAtQuery;
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

  return databaseQuery;
};

/**
 * Returns the derived transaction ledger with optional search, type, and date range filters.
 */
const getTransactionList = async (query = {}) => {
  const typeValue = typeof query.type === "string" ? query.type.trim() : "";
  const databaseQuery = await buildTransactionQuery(query);
  const paginationWindow = parsePaginationWindow(query);
  const sourceLimit = paginationWindow ? paginationWindow.skip + paginationWindow.limit : null;

  const shouldLoadCredits = !typeValue || typeValue === "Credit";
  const shouldLoadDebits = !typeValue || typeValue === "Debit";
  const applySourceWindow = (transactionQuery) =>
    sourceLimit ? transactionQuery.limit(sourceLimit) : transactionQuery;

  const [rechargeTransactions, debitTransactions] = await Promise.all([
    shouldLoadCredits
      ? applySourceWindow(
          Recharge.find(databaseQuery)
            .populate("memberId", "fullName mobileNumber status")
            .populate("cardId", "cardNumber status")
            .populate("createdBy", "fullName username role")
            .sort({ createdAt: -1 })
        ).lean()
      : Promise.resolve([]),
    shouldLoadDebits
      ? applySourceWindow(
          Debit.find(databaseQuery)
            .populate("memberId", "fullName mobileNumber status")
            .populate("cardId", "cardNumber status")
            .populate("createdBy", "fullName username role")
            .sort({ createdAt: -1 })
        ).lean()
      : Promise.resolve([])
  ]);

  return [
    ...rechargeTransactions.map(toTransactionResponse),
    ...debitTransactions.map(toDebitTransactionResponse)
  ]
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .slice(
      paginationWindow ? paginationWindow.skip : 0,
      paginationWindow ? paginationWindow.skip + paginationWindow.limit : undefined
    );
};

module.exports = {
  getTransactionList
};
