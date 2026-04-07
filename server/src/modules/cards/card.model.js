/**
 * Module: Card Model
 * File: card.model.js
 * Purpose: Stores card assignment details, lifecycle status, and audit fields.
 */

const mongoose = require("mongoose");

const { RECORD_STATUS } = require("../../constants/appConstants");

const cardSchema = new mongoose.Schema(
  {
    cardNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(RECORD_STATUS),
      default: RECORD_STATUS.ACTIVE
    },
    activatedAt: {
      type: Date,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
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

cardSchema.index(
  { cardNumber: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false
    }
  }
);

cardSchema.index(
  { memberId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: RECORD_STATUS.ACTIVE,
      isDeleted: false
    }
  }
);

const Card = mongoose.model("Card", cardSchema);

module.exports = {
  Card
};
