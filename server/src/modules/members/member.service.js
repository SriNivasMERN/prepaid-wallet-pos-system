/**
 * Module: Member Service
 * File: member.service.js
 * Purpose: Handles member creation, listing, detail lookup, updates, and operational readiness checks for the Members module.
 */

const mongoose = require("mongoose");

const { RECORD_STATUS } = require("../../constants/appConstants");
const { parsePaginationWindow } = require("../../utils/pagination");
const { Card } = require("../cards/card.model");
const { createSearchPattern } = require("../../utils/search");
const { Member } = require("./member.model");
const {
  validateCreateMemberPayload,
  validateUpdateMemberPayload
} = require("./member.validation");

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
 * Validates the supplied member id before querying MongoDB.
 */
const ensureValidMemberId = (memberId) => {
  if (!mongoose.Types.ObjectId.isValid(memberId)) {
    throw createNotFoundError(
      "memberId",
      "Member record was not found.",
      "Member was not found."
    );
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
 * Builds the operational readiness profile for a member and linked card.
 */
const buildMemberOperationalProfile = (member, linkedCard = null) => {
  const hasLinkedCard = Boolean(linkedCard);
  const cardExpired = linkedCard ? isCardExpired(linkedCard.expiresAt) : false;
  const activeLinkedCard =
    linkedCard && linkedCard.status === RECORD_STATUS.ACTIVE && !cardExpired;
  const canUseCardOperations =
    member.status === RECORD_STATUS.ACTIVE && activeLinkedCard;

  return {
    hasLinkedCard,
    linkedCardStatus: linkedCard?.status || null,
    linkedCardNumber: linkedCard?.cardNumber || null,
    linkedCardExpired: cardExpired,
    canAssignNewCard: member.status === RECORD_STATUS.ACTIVE && !activeLinkedCard,
    canReplaceCard: member.status === RECORD_STATUS.ACTIVE && activeLinkedCard,
    canUseCardOperations,
    blockingReason:
      member.status !== RECORD_STATUS.ACTIVE
        ? "Member is inactive."
        : !linkedCard
          ? "Member does not have a linked card."
          : linkedCard.status !== RECORD_STATUS.ACTIVE
            ? "Linked card is inactive."
            : cardExpired
              ? "Linked card is expired."
              : null
  };
};

/**
 * Shapes a member document for module responses.
 */
const toMemberResponse = (member, options = {}) => ({
  id: member._id,
  fullName: member.fullName,
  mobileNumber: member.mobileNumber,
  referenceDetails: member.referenceDetails,
  linkedCardId: member.linkedCardId,
  linkedWalletId: member.linkedWalletId,
  status: member.status,
  createdAt: member.createdAt,
  updatedAt: member.updatedAt,
  createdBy: member.createdBy
    ? {
        id: member.createdBy._id,
        fullName: member.createdBy.fullName,
        username: member.createdBy.username,
        role: member.createdBy.role
      }
    : null,
  updatedBy: member.updatedBy
    ? {
        id: member.updatedBy._id,
        fullName: member.updatedBy.fullName,
        username: member.updatedBy.username,
        role: member.updatedBy.role
      }
    : null,
  ...(options.operationalProfile ? { operationalProfile: options.operationalProfile } : {})
});

/**
 * Reads a single member record and returns a populated response shape.
 */
const getMemberDocumentById = async (memberId) => {
  ensureValidMemberId(memberId);

  const member = await Member.findOne({
    _id: memberId,
    isDeleted: false
  })
    .populate("createdBy", "fullName username role")
    .populate("updatedBy", "fullName username role");

  if (!member) {
    throw createNotFoundError(
      "memberId",
      "Member record was not found.",
      "Member was not found."
    );
  }

  return member;
};

/**
 * Returns the linked active or inactive card associated with a member when present.
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
 * Creates a new member record.
 */
const createMember = async (payload, currentAuth) => {
  const { errors, values } = validateCreateMemberPayload(payload);

  if (errors.length > 0) {
    throw createValidationError(errors, "Member validation failed.");
  }

  const existingMember = await Member.exists({
    mobileNumber: values.mobileNumber,
    isDeleted: false
  });

  if (existingMember) {
    throw createConflictError(
      "mobileNumber",
      "Choose a different mobile number.",
      "Mobile number is already in use."
    );
  }

  try {
    const createdMember = await Member.create({
      ...values,
      createdBy: currentAuth.staffId,
      updatedBy: currentAuth.staffId
    });

    const hydratedMember = await getMemberDocumentById(createdMember._id);

    return toMemberResponse(hydratedMember);
  } catch (error) {
    if (error?.code === 11000 && error.keyPattern?.mobileNumber) {
      throw createConflictError(
        "mobileNumber",
        "Choose a different mobile number.",
        "Mobile number is already in use."
      );
    }

    throw error;
  }
};

/**
 * Returns the visible member list with optional search and status filters.
 */
const getMemberList = async (query = {}) => {
  const databaseQuery = {
    isDeleted: false
  };

  const searchValue =
    typeof query.search === "string" ? query.search.trim() : "";
  const statusValue =
    typeof query.status === "string" ? query.status.trim() : "";

  if (statusValue) {
    databaseQuery.status = statusValue;
  }

  if (searchValue) {
    const searchPattern = createSearchPattern(searchValue);
    databaseQuery.$or = [
      { fullName: searchPattern },
      { mobileNumber: searchPattern }
    ];
  }

  const paginationWindow = parsePaginationWindow(query);
  let memberQuery = Member.find(databaseQuery)
    .populate("createdBy", "fullName username role")
    .populate("updatedBy", "fullName username role")
    .sort({ createdAt: -1 });

  if (paginationWindow) {
    memberQuery = memberQuery.skip(paginationWindow.skip).limit(paginationWindow.limit);
  }

  const members = await memberQuery.lean();

  return members.map((member) => toMemberResponse(member));
};

/**
 * Returns the detail view for a single member.
 */
const getMemberById = async (memberId) => {
  const member = await getMemberDocumentById(memberId);

  return toMemberResponse(member);
};

/**
 * Returns the operational readiness view for one member.
 */
const getMemberOperationalProfile = async (memberId) => {
  const member = await getMemberDocumentById(memberId);
  const linkedCard = await getLinkedCardForMember(member);

  return toMemberResponse(member, {
    operationalProfile: buildMemberOperationalProfile(member, linkedCard)
  });
};

/**
 * Updates an existing member record.
 */
const updateMember = async (memberId, payload, currentAuth) => {
  ensureValidMemberId(memberId);

  const { errors, values } = validateUpdateMemberPayload(payload);

  if (errors.length > 0) {
    throw createValidationError(errors, "Member validation failed.");
  }

  const existingMember = await Member.findOne({
    _id: memberId,
    isDeleted: false
  });

  if (!existingMember) {
    throw createNotFoundError(
      "memberId",
      "Member record was not found.",
      "Member was not found."
    );
  }

  if (values.mobileNumber && values.mobileNumber !== existingMember.mobileNumber) {
    const duplicateMember = await Member.exists({
      _id: { $ne: existingMember._id },
      mobileNumber: values.mobileNumber,
      isDeleted: false
    });

    if (duplicateMember) {
      throw createConflictError(
        "mobileNumber",
        "Choose a different mobile number.",
        "Mobile number is already in use."
      );
    }
  }

  const nextStatus = values.status || existingMember.status;
  const currentStatus = existingMember.status;

  Object.assign(existingMember, values, {
    updatedBy: currentAuth.staffId
  });

  try {
    await existingMember.save();

    if (
      currentStatus === RECORD_STATUS.ACTIVE &&
      nextStatus === RECORD_STATUS.INACTIVE &&
      existingMember.linkedCardId
    ) {
      await Card.updateOne(
        {
          _id: existingMember.linkedCardId,
          isDeleted: false,
          status: RECORD_STATUS.ACTIVE
        },
        {
          $set: {
            status: RECORD_STATUS.INACTIVE,
            updatedBy: currentAuth.staffId
          }
        }
      );
    }

    const hydratedMember = await getMemberDocumentById(existingMember._id);
    const linkedCard = await getLinkedCardForMember(hydratedMember);

    return toMemberResponse(hydratedMember, {
      operationalProfile: buildMemberOperationalProfile(hydratedMember, linkedCard)
    });
  } catch (error) {
    if (error?.code === 11000 && error.keyPattern?.mobileNumber) {
      throw createConflictError(
        "mobileNumber",
        "Choose a different mobile number.",
        "Mobile number is already in use."
      );
    }

    throw error;
  }
};

module.exports = {
  createMember,
  getMemberList,
  getMemberById,
  getMemberOperationalProfile,
  updateMember
};
