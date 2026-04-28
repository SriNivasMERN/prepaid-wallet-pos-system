/**
 * Module: Staff Model
 * File: staff.model.js
 * Purpose: Stores staff accounts, role details, and account status information.
 */

const mongoose = require("mongoose");

const { RECORD_STATUS, STAFF_ROLES } = require("../../constants/appConstants");

const staffSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120
    },
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 3,
      maxlength: 40,
      lowercase: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      required: true,
      enum: Object.values(STAFF_ROLES)
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(RECORD_STATUS),
      default: RECORD_STATUS.ACTIVE
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      default: null
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      default: null
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

staffSchema.index(
  { role: 1 },
  {
    unique: true,
    partialFilterExpression: {
      role: STAFF_ROLES.SUPER_ADMIN,
      isDeleted: false
    }
  }
);
staffSchema.index({ isDeleted: 1, status: 1, createdAt: -1 });
staffSchema.index({ isDeleted: 1, role: 1, createdAt: -1 });

const Staff = mongoose.model("Staff", staffSchema);

module.exports = {
  Staff
};
