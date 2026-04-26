/**
 * Module: Auth Service
 * File: auth.service.js
 * Purpose: Handles first-time setup status checks, Super Admin creation, and login.
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { buildAccessProfile } = require("../../constants/accessControl");
const {
  JWT_EXPIRES_IN,
  JWT_SECRET,
  RECORD_STATUS,
  STAFF_ROLES
} = require("../../constants/appConstants");
const { Staff } = require("../staff/staff.model");
const {
  validateLoginPayload,
  validatePasswordChangePayload,
  validateProfileUpdatePayload,
  validateSetupPayload
} = require("./auth.validation");

/**
 * Reads whether the initial Super Admin account already exists.
 */
const getSetupStatus = async () => {
  const existingSuperAdmin = await Staff.exists({
    role: STAFF_ROLES.SUPER_ADMIN,
    isDeleted: false
  });

  return {
    isSetupComplete: Boolean(existingSuperAdmin)
  };
};

/**
 * Creates a standard conflict error for setup collisions.
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
 * Creates a standard auth error for login failures.
 */
const createAuthError = (field, message, topMessage = "Login could not be completed.") => {
  const error = new Error(topMessage);
  error.statusCode = 401;
  error.errors = [
    {
      field,
      message
    }
  ];
  return error;
};

/**
 * Creates a standard validation error payload.
 */
const createValidationError = (errors, topMessage) => {
  const error = new Error(topMessage);
  error.statusCode = 400;
  error.errors = errors;
  return error;
};

/**
 * Builds the token and staff session payload used by the client.
 */
const buildSessionPayload = (staff) => {
  const token = jwt.sign(
    {
      staffId: staff._id,
      role: staff.role,
      username: staff.username
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN
    }
  );

  return {
    token,
    staff: {
      id: staff._id,
      fullName: staff.fullName,
      username: staff.username,
      role: staff.role,
      status: staff.status,
      ...buildAccessProfile(staff.role)
    }
  };
};

/**
 * Creates the first and only Super Admin account.
 */
const createInitialSuperAdmin = async (payload) => {
  const { errors, values } = validateSetupPayload(payload);

  if (errors.length > 0) {
    const error = new Error("Setup validation failed.");
    error.statusCode = 400;
    error.errors = errors;
    throw error;
  }

  const setupStatus = await getSetupStatus();

  if (setupStatus.isSetupComplete) {
    throw createConflictError(
      "setup",
      "Super Admin already exists.",
      "First-time setup has already been completed."
    );
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
    const createdSuperAdmin = await Staff.create({
      fullName: values.fullName,
      username: values.username,
      passwordHash,
      role: STAFF_ROLES.SUPER_ADMIN,
      status: RECORD_STATUS.ACTIVE,
      createdBy: null,
      updatedBy: null
    });

    return {
      id: createdSuperAdmin._id,
      fullName: createdSuperAdmin.fullName,
      username: createdSuperAdmin.username,
      role: createdSuperAdmin.role,
      status: createdSuperAdmin.status,
      createdAt: createdSuperAdmin.createdAt
    };
  } catch (error) {
    if (error?.code === 11000) {
      if (error.keyPattern?.role) {
        throw createConflictError(
          "setup",
          "Super Admin already exists.",
          "First-time setup has already been completed."
        );
      }

      if (error.keyPattern?.username) {
        throw createConflictError(
          "username",
          "Choose a different username.",
          "Username is already in use."
        );
      }
    }

    throw error;
  }
};

/**
 * Verifies staff credentials and returns an authenticated session.
 */
const loginStaff = async (payload) => {
  const { errors, values } = validateLoginPayload(payload);

  if (errors.length > 0) {
    const error = new Error("Login validation failed.");
    error.statusCode = 400;
    error.errors = errors;
    throw error;
  }

  const staff = await Staff.findOne({
    username: values.username,
    isDeleted: false
  }).select("+passwordHash");

  if (!staff) {
    throw createAuthError("username", "Username or password is incorrect.");
  }

  if (staff.status !== RECORD_STATUS.ACTIVE) {
    throw createAuthError("username", "This account is inactive.", "Login is not allowed.");
  }

  const isPasswordValid = await bcrypt.compare(values.password, staff.passwordHash);

  if (!isPasswordValid) {
    throw createAuthError("password", "Username or password is incorrect.");
  }

  return buildSessionPayload(staff);
};

/**
 * Returns the authenticated staff profile from the token payload.
 */
const getCurrentStaff = async (staffId) => {
  const staff = await Staff.findOne({
    _id: staffId,
    isDeleted: false
  });

  if (!staff || staff.status !== RECORD_STATUS.ACTIVE) {
    throw createAuthError("authorization", "Login again to continue.", "Session is not valid.");
  }

  return {
    id: staff._id,
    fullName: staff.fullName,
    username: staff.username,
    role: staff.role,
    status: staff.status,
    ...buildAccessProfile(staff.role)
  };
};

/**
 * Updates the authenticated staff member's own profile fields.
 */
const updateCurrentStaffProfile = async (staffId, payload) => {
  const { errors, values } = validateProfileUpdatePayload(payload);

  if (errors.length > 0) {
    throw createValidationError(errors, "Profile validation failed.");
  }

  const staff = await Staff.findOne({
    _id: staffId,
    isDeleted: false
  });

  if (!staff || staff.status !== RECORD_STATUS.ACTIVE) {
    throw createAuthError("authorization", "Login again to continue.", "Session is not valid.");
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
  staff.updatedBy = staff._id;

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

  return getCurrentStaff(staff._id);
};

/**
 * Changes the authenticated staff member's password after confirming the current password.
 */
const changeCurrentStaffPassword = async (staffId, payload) => {
  const { errors, values } = validatePasswordChangePayload(payload);

  if (errors.length > 0) {
    throw createValidationError(errors, "Password change validation failed.");
  }

  const staff = await Staff.findOne({
    _id: staffId,
    isDeleted: false
  }).select("+passwordHash");

  if (!staff || staff.status !== RECORD_STATUS.ACTIVE) {
    throw createAuthError("authorization", "Login again to continue.", "Session is not valid.");
  }

  const isCurrentPasswordValid = await bcrypt.compare(values.currentPassword, staff.passwordHash);

  if (!isCurrentPasswordValid) {
    throw createAuthError(
      "currentPassword",
      "Current password is incorrect.",
      "Password change could not be completed."
    );
  }

  staff.passwordHash = await bcrypt.hash(values.newPassword, 10);
  staff.updatedBy = staff._id;
  await staff.save();

  return {
    id: staff._id,
    fullName: staff.fullName,
    username: staff.username,
    role: staff.role,
    status: staff.status
  };
};

module.exports = {
  getSetupStatus,
  createInitialSuperAdmin,
  loginStaff,
  getCurrentStaff,
  updateCurrentStaffProfile,
  changeCurrentStaffPassword
};
