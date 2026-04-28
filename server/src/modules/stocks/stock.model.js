/**
 * Module: Stock Model
 * File: stock.model.js
 * Purpose: Stores product-linked stock state used by stock operations, billing checks, and stock visibility.
 */

const mongoose = require("mongoose");

const STOCK_MOVEMENT_TYPES = ["Opening", "Manual Update"];
const STOCK_ALERT_THRESHOLD = 5;

const stockSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    currentQuantity: {
      type: Number,
      required: true,
      default: 0
    },
    lastQuantityChange: {
      type: Number,
      required: true,
      default: 0
    },
    lastMovementType: {
      type: String,
      enum: STOCK_MOVEMENT_TYPES,
      default: null
    },
    lastMovementAt: {
      type: Date,
      default: null
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

stockSchema.index(
  { productId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false
    }
  }
);

stockSchema.index({ lastMovementAt: -1 });
stockSchema.index({ isDeleted: 1, updatedAt: -1 });

const Stock = mongoose.model("Stock", stockSchema);

module.exports = {
  Stock,
  STOCK_MOVEMENT_TYPES,
  STOCK_ALERT_THRESHOLD
};
