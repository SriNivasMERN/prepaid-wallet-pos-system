/**
 * Module: Member Model
 * File: member.model.js
 * Purpose: Stores member identity, reference details, linked resource ids, and audit fields.
 */

const mongoose = require("mongoose");

const { RECORD_STATUS } = require("../../constants/appConstants");

const memberSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 15
    },
    referenceDetails: {
      type: String,
      trim: true,
      maxlength: 300,
      default: ""
    },
    linkedCardId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    linkedWalletId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
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

memberSchema.index(
  { mobileNumber: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false
    }
  }
);

const Member = mongoose.model("Member", memberSchema);

module.exports = {
  Member
};
