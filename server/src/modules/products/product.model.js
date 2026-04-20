/**
 * Module: Product Model
 * File: product.model.js
 * Purpose: Stores product master data used by later Billing and Stock flows.
 */

const mongoose = require("mongoose");

const { RECORD_STATUS } = require("../../constants/appConstants");

const PRODUCT_UNITS = ["Piece", "Bottle", "Pack"];

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120
    },
    productCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 40
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      required: true,
      enum: PRODUCT_UNITS
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

productSchema.index(
  { productCode: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false
    }
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = {
  Product,
  PRODUCT_UNITS
};
