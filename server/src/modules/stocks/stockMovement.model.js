/**
 * Module: Stock Movement Model
 * File: stockMovement.model.js
 * Purpose: Stores stock movement history so quantity changes remain auditable and report-ready.
 */

const mongoose = require("mongoose");

const { STOCK_MOVEMENT_TYPES } = require("./stock.model");

const stockMovementSchema = new mongoose.Schema(
  {
    stockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
      required: true
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    quantityBefore: {
      type: Number,
      required: true
    },
    quantityChange: {
      type: Number,
      required: true
    },
    quantityAfter: {
      type: Number,
      required: true
    },
    movementType: {
      type: String,
      required: true,
      enum: STOCK_MOVEMENT_TYPES
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 300,
      default: ""
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

stockMovementSchema.index({ stockId: 1, createdAt: -1 });
stockMovementSchema.index({ productId: 1, createdAt: -1 });
stockMovementSchema.index({ isDeleted: 1, movementType: 1, createdAt: -1 });
stockMovementSchema.index({ isDeleted: 1, createdAt: -1 });

const StockMovement = mongoose.model("StockMovement", stockMovementSchema);

module.exports = {
  StockMovement
};
