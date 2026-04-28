/**
 * Module: Billing Model
 * File: billing.model.js
 * Purpose: Stores completed billing records, line items, balance snapshots, and audit fields.
 */

const mongoose = require("mongoose");

const BILL_STATUS = {
  COMPLETED: "Completed"
};

const billItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    productName: {
      type: String,
      required: true,
      trim: true
    },
    productCode: {
      type: String,
      required: true,
      trim: true
    },
    unit: {
      type: String,
      required: true,
      trim: true
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    _id: false
  }
);

const billSchema = new mongoose.Schema(
  {
    billNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64
    },
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
    items: {
      type: [billItemSchema],
      required: true,
      default: []
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0.01
    },
    itemCount: {
      type: Number,
      required: true,
      min: 1
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(BILL_STATUS),
      default: BILL_STATUS.COMPLETED
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

billSchema.index(
  { billNumber: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false
    }
  }
);

billSchema.index({ walletId: 1, createdAt: -1 });
billSchema.index({ memberId: 1, createdAt: -1 });
billSchema.index({ cardId: 1, createdAt: -1 });
billSchema.index({ isDeleted: 1, status: 1, createdAt: -1 });
billSchema.index({ isDeleted: 1, createdBy: 1, createdAt: -1 });

const Bill = mongoose.model("Bill", billSchema);

module.exports = {
  Bill,
  BILL_STATUS
};
