/**
 * Module: Transaction Service
 * File: transaction.service.js
 * Purpose: Builds a transaction visibility ledger from recharge credit entries for the Transactions module.
 */

const { Recharge } = require("../recharges/recharge.model");
const { Card } = require("../cards/card.model");
const { Member } = require("../members/member.model");

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
 * Returns the derived transaction ledger with optional search, type, and date range filters.
 */
const getTransactionList = async (query = {}) => {
  const databaseQuery = {
    isDeleted: false
  };

  const searchValue = typeof query.search === "string" ? query.search.trim() : "";
  const typeValue = typeof query.type === "string" ? query.type.trim() : "";
  const fromDateValue = typeof query.fromDate === "string" ? query.fromDate.trim() : "";
  const toDateValue = typeof query.toDate === "string" ? query.toDate.trim() : "";

  if (typeValue === "Debit") {
    return [];
  }

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
    const memberMatches = await Member.find({
      isDeleted: false,
      $or: [
        { fullName: new RegExp(searchValue, "i") },
        { mobileNumber: new RegExp(searchValue, "i") }
      ]
    }).select("_id");
    const cardMatches = await Card.find({
      isDeleted: false,
      cardNumber: new RegExp(searchValue, "i")
    }).select("_id");

    databaseQuery.$or = [
      { memberId: { $in: memberMatches.map((member) => member._id) } },
      { cardId: { $in: cardMatches.map((card) => card._id) } }
    ];
  }

  const rechargeTransactions = await Recharge.find(databaseQuery)
    .populate("memberId", "fullName mobileNumber status")
    .populate("cardId", "cardNumber status")
    .populate("createdBy", "fullName username role")
    .sort({ createdAt: -1 });

  return rechargeTransactions.map(toTransactionResponse);
};

module.exports = {
  getTransactionList
};
