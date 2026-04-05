/**
 * Module: Member Service
 * File: member.service.js
 * Purpose: Handles member creation, listing, detail lookup, and updates for the Members module.
 */

const mongoose = require("mongoose");

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
 * Shapes a member document for module responses.
 */
const toMemberResponse = (member) => ({
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
    : null
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
    const searchPattern = new RegExp(searchValue, "i");
    databaseQuery.$or = [
      { fullName: searchPattern },
      { mobileNumber: searchPattern }
    ];
  }

  const members = await Member.find(databaseQuery)
    .populate("createdBy", "fullName username role")
    .populate("updatedBy", "fullName username role")
    .sort({ createdAt: -1 });

  return members.map(toMemberResponse);
};

/**
 * Returns the detail view for a single member.
 */
const getMemberById = async (memberId) => {
  const member = await getMemberDocumentById(memberId);

  return toMemberResponse(member);
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

  Object.assign(existingMember, values, {
    updatedBy: currentAuth.staffId
  });

  try {
    await existingMember.save();

    const hydratedMember = await getMemberDocumentById(existingMember._id);

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

module.exports = {
  createMember,
  getMemberList,
  getMemberById,
  updateMember
};
