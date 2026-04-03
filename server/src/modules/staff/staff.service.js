/**
 * Module: Staff Service
 * File: staff.service.js
 * Purpose: Handles staff creation and staff listing for the management module.
 */

const bcrypt = require("bcryptjs");

const { buildAccessProfile } = require("../../constants/accessControl");
const { Staff } = require("./staff.model");
const { validateCreateStaffPayload } = require("./staff.validation");

/**
 * Creates a standard conflict error for staff collisions.
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
 * Creates a new Admin or Cashier account.
 */
const createStaff = async (payload, currentStaffId) => {
  const { errors, values } = validateCreateStaffPayload(payload);

  if (errors.length > 0) {
    const error = new Error("Staff validation failed.");
    error.statusCode = 400;
    error.errors = errors;
    throw error;
  }

  const existingUsername = await Staff.exists({ username: values.username });

  if (existingUsername) {
    throw createConflictError(
      "username",
      "Choose a different username.",
      "Username is already in use."
    );
  }

  const passwordHash = await bcrypt.hash(values.password, 10);

  try {
    const createdStaff = await Staff.create({
      fullName: values.fullName,
      username: values.username,
      passwordHash,
      role: values.role,
      status: values.status,
      createdBy: currentStaffId,
      updatedBy: currentStaffId
    });

    return {
      id: createdStaff._id,
      fullName: createdStaff.fullName,
      username: createdStaff.username,
      role: createdStaff.role,
      status: createdStaff.status,
      createdAt: createdStaff.createdAt,
      ...buildAccessProfile(createdStaff.role)
    };
  } catch (error) {
    if (error?.code === 11000 && error.keyPattern?.username) {
      throw createConflictError(
        "username",
        "Choose a different username.",
        "Username is already in use."
      );
    }

    throw error;
  }
};

/**
 * Returns visible staff records for the management list.
 */
const getStaffList = async () => {
  const staffList = await Staff.find({ isDeleted: false })
    .populate("createdBy", "fullName username role")
    .sort({ createdAt: -1 });

  return staffList.map((staff) => ({
    id: staff._id,
    fullName: staff.fullName,
    username: staff.username,
    role: staff.role,
    status: staff.status,
    createdAt: staff.createdAt,
    createdBy: staff.createdBy
      ? {
          id: staff.createdBy._id,
          fullName: staff.createdBy.fullName,
          username: staff.createdBy.username,
          role: staff.createdBy.role
        }
      : null,
    ...buildAccessProfile(staff.role)
  }));
};

module.exports = {
  createStaff,
  getStaffList
};

