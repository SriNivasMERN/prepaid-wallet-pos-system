/**
 * Module: Billing Service
 * File: billing.service.js
 * Purpose: Handles bill creation, bill listing, and bill detail lookup for the Billing module.
 */

const mongoose = require("mongoose");

const { RECORD_STATUS } = require("../../constants/appConstants");
const { Card } = require("../cards/card.model");
const { Debit } = require("../debits/debit.model");
const { Member } = require("../members/member.model");
const { Product } = require("../products/product.model");
const { Stock } = require("../stocks/stock.model");
const { StockMovement } = require("../stocks/stockMovement.model");
const { Wallet } = require("../wallets/wallet.model");
const { Bill, BILL_STATUS } = require("./billing.model");
const { validateCreateBillingPayload } = require("./billing.validation");

/**
 * Creates a standard validation error.
 */
const createValidationError = (errors, topMessage) => {
  const error = new Error(topMessage);
  error.statusCode = 400;
  error.errors = errors;
  return error;
};

/**
 * Creates a standard conflict error.
 */
const createConflictError = (field, message, topMessage) => {
  const error = new Error(topMessage);
  error.statusCode = 409;
  error.errors = [
    {
      field,
      message
    }
  ];
  return error;
};

/**
 * Creates a standard not-found error.
 */
const createNotFoundError = (field, message, topMessage) => {
  const error = new Error(topMessage);
  error.statusCode = 404;
  error.errors = [
    {
      field,
      message
    }
  ];
  return error;
};

/**
 * Validates MongoDB ids used by billing APIs.
 */
const ensureValidObjectId = (value, fieldName, topMessage) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw createNotFoundError(fieldName, `${fieldName} record was not found.`, topMessage);
  }
};

/**
 * Returns true when the supplied card date is already expired.
 */
const isCardExpired = (expiresAt) => {
  if (!expiresAt) {
    return false;
  }

  const expiryDate = new Date(expiresAt);

  if (Number.isNaN(expiryDate.getTime())) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return expiryDate < today;
};

/**
 * Creates a readable bill number.
 */
const generateBillNumber = () => {
  const now = new Date();
  const parts = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ];
  const suffix = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");

  return `BIL-${parts.join("")}-${suffix}`;
};

/**
 * Shapes one bill record for API responses.
 */
const toBillResponse = (bill) => ({
  id: bill._id,
  billNumber: bill.billNumber,
  totalAmount: bill.totalAmount,
  itemCount: bill.itemCount,
  status: bill.status,
  notes: bill.notes,
  balanceBefore: bill.balanceBefore,
  balanceAfter: bill.balanceAfter,
  createdAt: bill.createdAt,
  updatedAt: bill.updatedAt,
  items: Array.isArray(bill.items)
    ? bill.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        productCode: item.productCode,
        unit: item.unit,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        lineTotal: item.lineTotal
      }))
    : [],
  wallet: bill.walletId
    ? {
        id: bill.walletId._id,
        balance: bill.walletId.balance,
        status: bill.walletId.status
      }
    : null,
  member: bill.memberId
    ? {
        id: bill.memberId._id,
        fullName: bill.memberId.fullName,
        mobileNumber: bill.memberId.mobileNumber,
        status: bill.memberId.status
      }
    : null,
  card: bill.cardId
    ? {
        id: bill.cardId._id,
        cardNumber: bill.cardId.cardNumber,
        status: bill.cardId.status,
        expiresAt: bill.cardId.expiresAt
      }
    : null,
  createdBy: bill.createdBy
    ? {
        id: bill.createdBy._id,
        fullName: bill.createdBy.fullName,
        username: bill.createdBy.username,
        role: bill.createdBy.role
      }
    : null,
  updatedBy: bill.updatedBy
    ? {
        id: bill.updatedBy._id,
        fullName: bill.updatedBy.fullName,
        username: bill.updatedBy.username,
        role: bill.updatedBy.role
      }
    : null
});

/**
 * Loads one bill document with related details.
 */
const getBillDocumentById = async (billId) => {
  ensureValidObjectId(billId, "billId", "Bill was not found.");

  const bill = await Bill.findOne({
    _id: billId,
    isDeleted: false
  })
    .populate("walletId", "balance status")
    .populate("memberId", "fullName mobileNumber status")
    .populate("cardId", "cardNumber status expiresAt")
    .populate("createdBy", "fullName username role")
    .populate("updatedBy", "fullName username role");

  if (!bill) {
    throw createNotFoundError("billId", "Bill record was not found.", "Bill was not found.");
  }

  return bill;
};

/**
 * Loads one active linked billing context from card number.
 */
const getBillingContextByCardNumber = async (cardNumber) => {
  const card = await Card.findOne({
    cardNumber: new RegExp(`^${cardNumber.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
    isDeleted: false
  });

  if (!card) {
    throw createNotFoundError("cardNumber", "Card record was not found.", "Billing is not allowed.");
  }

  const member = await Member.findOne({
    _id: card.memberId,
    isDeleted: false
  });

  if (!member) {
    throw createNotFoundError("memberId", "Member record was not found.", "Billing is not allowed.");
  }

  if (!member.linkedWalletId) {
    throw createConflictError(
      "walletId",
      "Member must have a linked wallet before billing.",
      "Billing is not allowed."
    );
  }

  const wallet = await Wallet.findOne({
    _id: member.linkedWalletId,
    isDeleted: false
  });

  if (!wallet) {
    throw createNotFoundError("walletId", "Wallet record was not found.", "Billing is not allowed.");
  }

  return {
    card,
    member,
    wallet
  };
};

/**
 * Builds a readable operational billing precheck from the resolved billing context.
 */
const buildBillingPrecheck = ({ card, member, wallet }) => {
  const cardUsable = card.status === RECORD_STATUS.ACTIVE && !isCardExpired(card.expiresAt);
  const memberActive = member.status === RECORD_STATUS.ACTIVE;
  const walletActive = wallet.status === RECORD_STATUS.ACTIVE;
  const canBill = cardUsable && memberActive && walletActive;

  return {
    canBill,
    blockingReason:
      !cardUsable
        ? "Member must have a usable active card before billing."
        : !memberActive
          ? "Only an active member can be billed."
          : !walletActive
            ? "Only an active wallet can be billed."
            : null,
    card: {
      id: card._id,
      cardNumber: card.cardNumber,
      status: card.status,
      expiresAt: card.expiresAt,
      expired: isCardExpired(card.expiresAt)
    },
    member: {
      id: member._id,
      fullName: member.fullName,
      mobileNumber: member.mobileNumber,
      status: member.status
    },
    wallet: {
      id: wallet._id,
      balance: wallet.balance,
      status: wallet.status
    }
  };
};

/**
 * Returns validated bill line items from requested products.
 */
const buildBillItems = async (requestedItems) => {
  const productIds = requestedItems.map((item) => item.productId);

  productIds.forEach((productId, index) => {
    ensureValidObjectId(productId, `items[${index}].productId`, "Billing validation failed.");
  });

  const duplicateProductIds = productIds.filter(
    (productId, index) => productIds.indexOf(productId) !== index
  );

  if (duplicateProductIds.length > 0) {
    throw createConflictError(
      "items",
      "Duplicate products are not allowed in one bill.",
      "Billing validation failed."
    );
  }

  const products = await Product.find({
    _id: { $in: productIds },
    isDeleted: false
  });

  if (products.length !== productIds.length) {
    throw createNotFoundError(
      "items",
      "One or more selected products were not found.",
      "Billing is not allowed."
    );
  }

  const productMap = new Map(products.map((product) => [String(product._id), product]));

  const stocks = await Stock.find({
    productId: { $in: productIds },
    isDeleted: false
  });
  const stockMap = new Map(stocks.map((stock) => [String(stock.productId), stock]));

  return requestedItems.map((item, index) => {
    const product = productMap.get(String(item.productId));
    const stock = stockMap.get(String(item.productId));
    const availableQuantity = Number(stock?.currentQuantity || 0);

    if (product.status !== RECORD_STATUS.ACTIVE) {
      throw createConflictError(
        `items[${index}].productId`,
        "Only active products can be billed.",
        "Billing is not allowed."
      );
    }

    if (availableQuantity < item.quantity) {
      throw createConflictError(
        `items[${index}].quantity`,
        `Only ${availableQuantity} units are currently available for ${product.productName}.`,
        "Billing is not allowed."
      );
    }

    const lineTotal = Number(product.sellingPrice) * item.quantity;

    return {
      product,
      stock,
      quantity: item.quantity,
      unitPrice: Number(product.sellingPrice),
      lineTotal
    };
  });
};

/**
 * Creates a bill, deducts wallet balance, updates stock, and records the debit.
 */
const createBill = async (payload, currentAuth) => {
  const { errors, values } = validateCreateBillingPayload(payload);

  if (errors.length > 0) {
    throw createValidationError(errors, "Billing validation failed.");
  }

  const { card, member, wallet } = await getBillingContextByCardNumber(values.cardNumber);

  if (card.status !== RECORD_STATUS.ACTIVE || isCardExpired(card.expiresAt)) {
    throw createConflictError(
      "cardNumber",
      "Member must have a usable active card before billing.",
      "Billing is not allowed."
    );
  }

  if (member.status !== RECORD_STATUS.ACTIVE) {
    throw createConflictError(
      "memberId",
      "Only an active member can be billed.",
      "Billing is not allowed."
    );
  }

  if (wallet.status !== RECORD_STATUS.ACTIVE) {
    throw createConflictError(
      "walletId",
      "Only an active wallet can be billed.",
      "Billing is not allowed."
    );
  }

  const billItems = await buildBillItems(values.items);
  const totalAmount = billItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const balanceBefore = Number(wallet.balance || 0);

  if (totalAmount > balanceBefore) {
    throw createConflictError(
      "items",
      "Insufficient wallet balance for this bill.",
      "Billing is not allowed."
    );
  }

  const balanceAfter = balanceBefore - totalAmount;
  const billNumber = generateBillNumber();

  wallet.balance = balanceAfter;
  wallet.updatedBy = currentAuth.staffId;
  await wallet.save();

  for (const billItem of billItems) {
    const currentStock = billItem.stock || await Stock.create({
      productId: billItem.product._id,
      currentQuantity: 0,
      createdBy: currentAuth.staffId,
      updatedBy: currentAuth.staffId
    });

    const quantityBefore = Number(currentStock.currentQuantity || 0);
    const quantityAfter = quantityBefore - billItem.quantity;

    const movement = await StockMovement.create({
      stockId: currentStock._id,
      productId: billItem.product._id,
      quantityBefore,
      quantityChange: billItem.quantity * -1,
      quantityAfter,
      movementType: "Manual Update",
      notes: `Billing deduction for ${billNumber}`,
      createdBy: currentAuth.staffId,
      updatedBy: currentAuth.staffId
    });

    currentStock.currentQuantity = quantityAfter;
    currentStock.lastQuantityChange = billItem.quantity * -1;
    currentStock.lastMovementType = "Manual Update";
    currentStock.lastMovementAt = movement.createdAt;
    currentStock.updatedBy = currentAuth.staffId;
    await currentStock.save();
  }

  await Debit.create({
    walletId: wallet._id,
    memberId: member._id,
    cardId: card._id,
    amount: totalAmount,
    reason: "Billing",
    notes: billNumber,
    balanceBefore,
    balanceAfter,
    createdBy: currentAuth.staffId,
    updatedBy: currentAuth.staffId
  });

  const bill = await Bill.create({
    billNumber,
    walletId: wallet._id,
    memberId: member._id,
    cardId: card._id,
    items: billItems.map((item) => ({
      productId: item.product._id,
      productName: item.product.productName,
      productCode: item.product.productCode,
      unit: item.product.unit,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal
    })),
    totalAmount,
    itemCount: billItems.reduce((sum, item) => sum + item.quantity, 0),
    status: BILL_STATUS.COMPLETED,
    notes: values.notes,
    balanceBefore,
    balanceAfter,
    createdBy: currentAuth.staffId,
    updatedBy: currentAuth.staffId
  });

  const hydratedBill = await getBillDocumentById(bill._id);

  return toBillResponse(hydratedBill);
};

/**
 * Returns the billing readiness profile for a supplied card number.
 */
const getBillingPrecheck = async (cardNumber) => {
  const normalizedCardNumber = typeof cardNumber === "string" ? cardNumber.trim() : "";

  if (!normalizedCardNumber) {
    throw createValidationError(
      [
        {
          field: "cardNumber",
          message: "Card number is required."
        }
      ],
      "Billing precheck validation failed."
    );
  }

  const context = await getBillingContextByCardNumber(normalizedCardNumber);

  return buildBillingPrecheck(context);
};

/**
 * Returns the bill list with optional search, status, cashier, and date filters.
 */
const getBillList = async (query = {}) => {
  const databaseQuery = {
    isDeleted: false
  };

  const searchValue = typeof query.search === "string" ? query.search.trim() : "";
  const statusValue = typeof query.status === "string" ? query.status.trim() : "";
  const cashierIdValue =
    typeof query.cashierId === "string" ? query.cashierId.trim() : "";
  const dateValue = typeof query.date === "string" ? query.date.trim() : "";

  if (statusValue) {
    databaseQuery.status = statusValue;
  }

  if (cashierIdValue) {
    ensureValidObjectId(cashierIdValue, "cashierId", "Staff was not found.");
    databaseQuery.createdBy = cashierIdValue;
  }

  if (dateValue) {
    const fromDate = new Date(dateValue);

    if (!Number.isNaN(fromDate.getTime())) {
      fromDate.setHours(0, 0, 0, 0);
      const toDate = new Date(fromDate);
      toDate.setDate(toDate.getDate() + 1);

      databaseQuery.createdAt = {
        $gte: fromDate,
        $lt: toDate
      };
    }
  }

  if (searchValue) {
    const memberMatches = await Member.find({
      isDeleted: false,
      $or: [
        { fullName: new RegExp(searchValue, "i") },
        { mobileNumber: new RegExp(searchValue, "i") }
      ]
    }).select("_id");
    const cardMatches = await Card.find({
      isDeleted: false,
      cardNumber: new RegExp(searchValue, "i")
    }).select("_id");

    databaseQuery.$or = [
      { billNumber: new RegExp(searchValue, "i") },
      { memberId: { $in: memberMatches.map((member) => member._id) } },
      { cardId: { $in: cardMatches.map((card) => card._id) } }
    ];
  }

  const bills = await Bill.find(databaseQuery)
    .populate("walletId", "balance status")
    .populate("memberId", "fullName mobileNumber status")
    .populate("cardId", "cardNumber status expiresAt")
    .populate("createdBy", "fullName username role")
    .populate("updatedBy", "fullName username role")
    .sort({ createdAt: -1 });

  return bills.map(toBillResponse);
};

/**
 * Returns one bill by id.
 */
const getBillById = async (billId) => {
  const bill = await getBillDocumentById(billId);

  return toBillResponse(bill);
};

module.exports = {
  createBill,
  getBillingPrecheck,
  getBillList,
  getBillById
};
