/**
 * Module: Debit Model
 * File: debit.model.js
 * Purpose: Stores wallet debit entries, balance snapshots, debit reasons, and audit fields.
 */

const mongoose = require("mongoose");

const debitSchema = new mongoose.Schema(
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
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
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

debitSchema.index({ walletId: 1, createdAt: -1 });
debitSchema.index({ memberId: 1, createdAt: -1 });
debitSchema.index({ cardId: 1, createdAt: -1 });

const Debit = mongoose.model("Debit", debitSchema);

module.exports = {
  Debit
};
