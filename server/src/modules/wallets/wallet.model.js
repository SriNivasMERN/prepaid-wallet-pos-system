/**
 * Module: Wallet Model
 * File: wallet.model.js
 * Purpose: Stores member wallet ownership, current balance, status, and audit fields.
 */

const mongoose = require("mongoose");

const { RECORD_STATUS } = require("../../constants/appConstants");

const walletSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true
    },
    balance: {
      type: Number,
      required: true,
      min: 0,
      default: 0
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

walletSchema.index(
  { memberId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false
    }
  }
);
walletSchema.index({ isDeleted: 1, status: 1, createdAt: -1 });
walletSchema.index({ balance: 1, isDeleted: 1 });

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = {
  Wallet
};
