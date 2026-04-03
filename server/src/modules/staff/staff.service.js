/**
 * Module: Staff Service
 * File: staff.service.js
 * Purpose: Handles staff creation and staff listing for the management module.
 */

const bcrypt = require("bcryptjs");

const { STAFF_ROLES } = require("../../constants/appConstants");
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
 * Creates a standard authorization error for role-restricted staff creation.
 */
const createAccessError = (field, message, topMessage) => {
  const error = new Error(topMessage);
  error.statusCode = 403;
  error.errors = [
    {
      field,
      message
    }
  ];
  return error;
};

/**
 * Shapes a staff document for module responses.
 */
const toStaffResponse = (staff) => ({
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
});

/**
 * Returns the creatable staff roles for the current authenticated role.
 */
const getCreatableRolesForCurrentStaff = (role) => {
  if (role === STAFF_ROLES.SUPER_ADMIN) {
    return [STAFF_ROLES.ADMIN, STAFF_ROLES.CASHIER];
  }

  if (role === STAFF_ROLES.ADMIN) {
    return [STAFF_ROLES.CASHIER];
  }

  return [];
};

/**
 * Creates a new staff account inside the allowed role boundary of the current user.
 */
const createStaff = async (payload, currentAuth) => {
  const { errors, values } = validateCreateStaffPayload(payload);

  if (errors.length > 0) {
    const error = new Error("Staff validation failed.");
    error.statusCode = 400;
    error.errors = errors;
    throw error;
  }

  const creatableRoles = getCreatableRolesForCurrentStaff(currentAuth?.role);

  if (!creatableRoles.includes(values.role)) {
    throw createAccessError(
      "role",
      currentAuth?.role === STAFF_ROLES.ADMIN
        ? "Admin can create only Cashier accounts."
        : "Your staff role cannot create this account type.",
      "Staff creation is not allowed."
    );
  }

  const existingUsername = await Staff.exists({ username: values.username, isDeleted: false });

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
      createdBy: currentAuth.staffId,
      updatedBy: currentAuth.staffId
    });

    const hydratedStaff = await Staff.findById(createdStaff._id).populate(
      "createdBy",
      "fullName username role"
    );

    return toStaffResponse(hydratedStaff);
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
 * Returns the visible staff records for the current role.
 */
const getStaffList = async (currentAuth) => {
  const query = { isDeleted: false };

  if (currentAuth?.role === STAFF_ROLES.ADMIN) {
    query.role = STAFF_ROLES.CASHIER;
  }

  const staffList = await Staff.find(query)
    .populate("createdBy", "fullName username role")
    .sort({ createdAt: -1 });

  return staffList.map(toStaffResponse);
};

module.exports = {
  createStaff,
  getStaffList,
  getCreatableRolesForCurrentStaff
};
