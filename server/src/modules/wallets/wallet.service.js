/**
 * Module: Wallet Service
 * File: wallet.service.js
 * Purpose: Handles wallet creation, listing, detail lookup, and updates for the Wallets module.
 */

const mongoose = require("mongoose");

const { RECORD_STATUS } = require("../../constants/appConstants");
const { parsePaginationWindow } = require("../../utils/pagination");
const { createSearchPattern } = require("../../utils/search");
const { Card } = require("../cards/card.model");
const { Member } = require("../members/member.model");
const { Wallet } = require("./wallet.model");
const {
  validateCreateWalletPayload,
  validateUpdateWalletPayload
} = require("./wallet.validation");

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
 * Validates MongoDB ids used by wallet APIs.
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
 * Shapes a wallet document for API responses.
 */
const toWalletResponse = (wallet) => ({
  id: wallet._id,
  balance: wallet.balance,
  status: wallet.status,
  createdAt: wallet.createdAt,
  updatedAt: wallet.updatedAt,
  member: wallet.memberId
    ? {
        id: wallet.memberId._id,
        fullName: wallet.memberId.fullName,
        mobileNumber: wallet.memberId.mobileNumber,
        status: wallet.memberId.status,
        linkedCardId: wallet.memberId.linkedCardId,
        linkedWalletId: wallet.memberId.linkedWalletId
      }
    : null,
  createdBy: wallet.createdBy
    ? {
        id: wallet.createdBy._id,
        fullName: wallet.createdBy.fullName,
        username: wallet.createdBy.username,
        role: wallet.createdBy.role
      }
    : null,
  updatedBy: wallet.updatedBy
    ? {
        id: wallet.updatedBy._id,
        fullName: wallet.updatedBy.fullName,
        username: wallet.updatedBy.username,
        role: wallet.updatedBy.role
      }
    : null
});

/**
 * Loads one member record used during wallet flows.
 */
const getMemberForWalletFlow = async (memberId) => {
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
 * Loads one card linked to a member when present.
 */
const getLinkedCardForMember = async (member) => {
  if (!member?.linkedCardId) {
    return null;
  }

  return Card.findOne({
    _id: member.linkedCardId,
    isDeleted: false
  });
};

/**
 * Loads one wallet document with member and staff details.
 */
const getWalletDocumentById = async (walletId) => {
  ensureValidObjectId(walletId, "walletId", "Wallet was not found.");

  const wallet = await Wallet.findOne({
    _id: walletId,
    isDeleted: false
  })
    .populate("memberId", "fullName mobileNumber status linkedCardId linkedWalletId")
    .populate("createdBy", "fullName username role")
    .populate("updatedBy", "fullName username role");

  if (!wallet) {
    throw createNotFoundError("walletId", "Wallet record was not found.", "Wallet was not found.");
  }

  return wallet;
};

/**
 * Creates a wallet for an operationally eligible member.
 */
const createWallet = async (payload, currentAuth) => {
  const { errors, values } = validateCreateWalletPayload(payload);

  if (errors.length > 0) {
    throw createValidationError(errors, "Wallet validation failed.");
  }

  const member = await getMemberForWalletFlow(values.memberId);

  if (member.status !== RECORD_STATUS.ACTIVE) {
    throw createConflictError(
      "memberId",
      "Only an active member can receive a wallet.",
      "Wallet creation is not allowed."
    );
  }

  const linkedCard = await getLinkedCardForMember(member);

  if (!linkedCard) {
    throw createConflictError(
      "memberId",
      "Member must have an active linked card before wallet creation.",
      "Wallet creation is not allowed."
    );
  }

  if (linkedCard.status !== RECORD_STATUS.ACTIVE || isCardExpired(linkedCard.expiresAt)) {
    throw createConflictError(
      "memberId",
      "Member must have a usable active linked card before wallet creation.",
      "Wallet creation is not allowed."
    );
  }

  const existingWallet = await Wallet.exists({
    memberId: member._id,
    isDeleted: false
  });

  if (existingWallet) {
    throw createConflictError(
      "memberId",
      "This member already has a wallet.",
      "Wallet creation is not allowed."
    );
  }

  let createdWalletId = null;

  try {
    const createdWallet = await Wallet.create({
      memberId: member._id,
      status: values.status,
      balance: 0,
      createdBy: currentAuth.staffId,
      updatedBy: currentAuth.staffId
    });
    createdWalletId = createdWallet._id;

    member.linkedWalletId = createdWallet._id;
    member.updatedBy = currentAuth.staffId;
    await member.save();

    const hydratedWallet = await getWalletDocumentById(createdWallet._id);

    return toWalletResponse(hydratedWallet);
  } catch (error) {
    if (error?.code === 11000 && error.keyPattern?.memberId) {
      throw createConflictError(
        "memberId",
        "This member already has a wallet.",
        "Wallet creation is not allowed."
      );
    }

    if (createdWalletId) {
      await Wallet.deleteOne({ _id: createdWalletId }).catch(() => null);
    }

    throw error;
  }
};

/**
 * Returns the visible wallet list with optional search and status filters.
 */
const getWalletList = async (query = {}) => {
  const databaseQuery = {
    isDeleted: false
  };

  const searchValue = typeof query.search === "string" ? query.search.trim() : "";
  const statusValue = typeof query.status === "string" ? query.status.trim() : "";

  if (statusValue) {
    databaseQuery.status = statusValue;
  }

  if (searchValue) {
    const searchPattern = createSearchPattern(searchValue);
    const [memberMatches, cardMatches] = await Promise.all([
      Member.find({
        isDeleted: false,
        $or: [
          { fullName: searchPattern },
          { mobileNumber: searchPattern }
        ]
      }).select("_id").lean(),
      Card.find({
        isDeleted: false,
        cardNumber: searchPattern
      }).select("memberId").lean()
    ]);

    databaseQuery.memberId = {
      $in: [
        ...memberMatches.map((member) => member._id),
        ...cardMatches.map((card) => card.memberId).filter(Boolean)
      ]
    };
  }

  const paginationWindow = parsePaginationWindow(query);
  let walletQuery = Wallet.find(databaseQuery)
    .populate("memberId", "fullName mobileNumber status linkedCardId linkedWalletId")
    .populate("createdBy", "fullName username role")
    .populate("updatedBy", "fullName username role")
    .sort({ createdAt: -1 });

  if (paginationWindow) {
    walletQuery = walletQuery.skip(paginationWindow.skip).limit(paginationWindow.limit);
  }

  const wallets = await walletQuery.lean();

  return wallets.map(toWalletResponse);
};

/**
 * Returns one wallet detail view.
 */
const getWalletById = async (walletId) => {
  const wallet = await getWalletDocumentById(walletId);

  return toWalletResponse(wallet);
};

/**
 * Updates an existing wallet record.
 */
const updateWallet = async (walletId, payload, currentAuth) => {
  ensureValidObjectId(walletId, "walletId", "Wallet was not found.");

  const { errors, values } = validateUpdateWalletPayload(payload);

  if (errors.length > 0) {
    throw createValidationError(errors, "Wallet validation failed.");
  }

  const existingWallet = await Wallet.findOne({
    _id: walletId,
    isDeleted: false
  });

  if (!existingWallet) {
    throw createNotFoundError("walletId", "Wallet record was not found.", "Wallet was not found.");
  }

  Object.assign(existingWallet, values, {
    updatedBy: currentAuth.staffId
  });

  await existingWallet.save();

  const hydratedWallet = await getWalletDocumentById(existingWallet._id);

  return toWalletResponse(hydratedWallet);
};

module.exports = {
  createWallet,
  getWalletList,
  getWalletById,
  updateWallet
};
