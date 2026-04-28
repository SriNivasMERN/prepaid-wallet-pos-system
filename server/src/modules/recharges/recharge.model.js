/**
 * Module: Recharge Model
 * File: recharge.model.js
 * Purpose: Stores wallet credit entries, balance snapshots, payment details, and audit fields.
 */

const mongoose = require("mongoose");

const rechargeSchema = new mongoose.Schema(
  {
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true
    },
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01
    },
    paymentMode: {
      type: String,
      required: true,
      trim: true
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 300,
      default: ""
    },
    balanceBefore: {
      type: Number,
      required: true,
      min: 0
    },
    balanceAfter: {
      type: Number,
      required: true,
      min: 0
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

rechargeSchema.index({ walletId: 1, createdAt: -1 });
rechargeSchema.index({ memberId: 1, createdAt: -1 });
rechargeSchema.index({ cardId: 1, createdAt: -1 });
rechargeSchema.index({ isDeleted: 1, createdBy: 1, createdAt: -1 });
rechargeSchema.index({ isDeleted: 1, paymentMode: 1, createdAt: -1 });

const Recharge = mongoose.model("Recharge", rechargeSchema);

module.exports = {
  Recharge
};
