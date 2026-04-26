/**
 * Module: Staff Service
 * File: staff.service.js
 * Purpose: Handles staff creation and staff listing for the management module.
 */

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const { RECORD_STATUS, STAFF_ROLES } = require("../../constants/appConstants");
const { buildAccessProfile } = require("../../constants/accessControl");
const { Staff } = require("./staff.model");
const {
  validateCreateStaffPayload,
  validateResetStaffPasswordPayload,
  validateUpdateStaffPayload
} = require("./staff.validation");

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
 * Creates a standard validation error.
 */
const createValidationError = (errors, topMessage) => {
  const error = new Error(topMessage);
  error.statusCode = 400;
  error.errors = errors;
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
 * Returns the editable staff roles for the current authenticated role.
 */
const getManageableRolesForCurrentStaff = (role) => {
  return getCreatableRolesForCurrentStaff(role);
};

/**
 * Loads one manageable staff record with role boundary checks.
 */
const getManageableStaffDocumentById = async (staffId, currentAuth) => {
  if (!mongoose.Types.ObjectId.isValid(staffId)) {
    throw createNotFoundError("staffId", "Staff record was not found.", "Staff was not found.");
  }

  const staff = await Staff.findOne({
    _id: staffId,
    isDeleted: false
  }).populate("createdBy", "fullName username role");

  if (!staff) {
    throw createNotFoundError("staffId", "Staff record was not found.", "Staff was not found.");
  }

  if (staff.role === STAFF_ROLES.SUPER_ADMIN) {
    throw createAccessError(
      "staffId",
      "Super Admin accounts are not editable from staff management.",
      "Staff update is not allowed."
    );
  }

  if (String(staff._id) === String(currentAuth?.staffId)) {
    throw createAccessError(
      "staffId",
      "Use a dedicated profile flow for your own account.",
      "Staff update is not allowed."
    );
  }

  const manageableRoles = getManageableRolesForCurrentStaff(currentAuth?.role);

  if (!manageableRoles.includes(staff.role)) {
    throw createAccessError(
      "staffId",
      "Your staff role cannot manage this account.",
      "Staff update is not allowed."
    );
  }

  return staff;
};

/**
 * Creates a new staff account inside the allowed role boundary of the current user.
 */
const createStaff = async (payload, currentAuth) => {
  const { errors, values } = validateCreateStaffPayload(payload);

  if (errors.length > 0) {
    throw createValidationError(errors, "Staff validation failed.");
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
 * Updates a visible staff account inside the allowed role boundary of the current user.
 */
const updateStaff = async (staffId, payload, currentAuth) => {
  const { errors, values } = validateUpdateStaffPayload(payload);

  if (errors.length > 0) {
    throw createValidationError(errors, "Staff validation failed.");
  }

  const staff = await getManageableStaffDocumentById(staffId, currentAuth);
  const manageableRoles = getManageableRolesForCurrentStaff(currentAuth?.role);

  if (!manageableRoles.includes(values.role)) {
    throw createAccessError(
      "role",
      currentAuth?.role === STAFF_ROLES.ADMIN
        ? "Admin can manage only Cashier accounts."
        : "Your staff role cannot assign this account type.",
      "Staff update is not allowed."
    );
  }

  if (values.username !== staff.username) {
    const existingUsername = await Staff.exists({
      _id: { $ne: staff._id },
      username: values.username,
      isDeleted: false
    });

    if (existingUsername) {
      throw createConflictError(
        "username",
        "Choose a different username.",
        "Username is already in use."
      );
    }
  }

  staff.fullName = values.fullName;
  staff.username = values.username;
  staff.role = values.role;
  staff.status = values.status;
  staff.updatedBy = currentAuth.staffId;

  try {
    await staff.save();
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

  const hydratedStaff = await Staff.findById(staff._id).populate("createdBy", "fullName username role");

  return toStaffResponse(hydratedStaff);
};

/**
 * Resets the password of one manageable staff account inside the allowed role boundary.
 */
const resetStaffPassword = async (staffId, payload, currentAuth) => {
  const { errors, values } = validateResetStaffPasswordPayload(payload);

  if (errors.length > 0) {
    throw createValidationError(errors, "Password reset validation failed.");
  }

  const staff = await getManageableStaffDocumentById(staffId, currentAuth);

  staff.passwordHash = await bcrypt.hash(values.newPassword, 10);
  staff.updatedBy = currentAuth.staffId;
  await staff.save();

  const hydratedStaff = await Staff.findById(staff._id).populate("createdBy", "fullName username role");

  return toStaffResponse(hydratedStaff);
};

/**
 * Returns the visible staff records for the current role.
 */
const getStaffList = async (filters = {}, currentAuth) => {
  const searchValue = typeof filters.search === "string" ? filters.search.trim() : "";
  const roleValue = typeof filters.role === "string" ? filters.role.trim() : "";
  const statusValue = typeof filters.status === "string" ? filters.status.trim() : "";

  const databaseQuery = { isDeleted: false };

  if (currentAuth?.role === STAFF_ROLES.ADMIN) {
    databaseQuery.role = STAFF_ROLES.CASHIER;
  } else if (roleValue) {
    databaseQuery.role = roleValue;
  }

  if (statusValue && Object.values(RECORD_STATUS).includes(statusValue)) {
    databaseQuery.status = statusValue;
  }

  if (searchValue) {
    const searchPattern = new RegExp(searchValue, "i");
    databaseQuery.$or = [
      { fullName: searchPattern },
      { username: searchPattern }
    ];
  }

  const staffList = await Staff.find(databaseQuery)
    .populate("createdBy", "fullName username role")
    .sort({ createdAt: -1 });

  return staffList.map(toStaffResponse);
};

module.exports = {
  createStaff,
  getStaffList,
  getCreatableRolesForCurrentStaff,
  getManageableRolesForCurrentStaff,
  updateStaff,
  resetStaffPassword
};
