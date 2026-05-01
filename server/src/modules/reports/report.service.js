/**
 * Module: Report Service
 * File: report.service.js
 * Purpose: Builds reusable report responses from Billing, Recharge, Debit, and Stock module records.
 */

const { Bill } = require("../billing/billing.model");
const { Debit } = require("../debits/debit.model");
const { Recharge } = require("../recharges/recharge.model");
const { StockMovement } = require("../stocks/stockMovement.model");
const { parsePaginationWindow } = require("../../utils/pagination");
const { validateReportQuery } = require("./report.validation");

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
 * Returns a createdAt query fragment from the supplied date range.
 */
const buildCreatedAtQuery = (fromDate, toDate) => {
  const createdAt = {};

  if (fromDate) {
    const normalizedFromDate = new Date(fromDate);
    normalizedFromDate.setHours(0, 0, 0, 0);
    createdAt.$gte = normalizedFromDate;
  }

  if (toDate) {
    const normalizedToDate = new Date(toDate);
    normalizedToDate.setHours(23, 59, 59, 999);
    createdAt.$lte = normalizedToDate;
  }

  return Object.keys(createdAt).length > 0 ? createdAt : null;
};

/**
 * Returns a clean date string for report response metadata.
 */
const toDateLabel = (value) => {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return null;
  }

  return value.toISOString().slice(0, 10);
};

/**
 * Builds the base database query for report source records.
 */
const buildBaseQuery = (fromDate, toDate) => {
  const databaseQuery = {
    isDeleted: false
  };
  const createdAt = buildCreatedAtQuery(fromDate, toDate);

  if (createdAt) {
    databaseQuery.createdAt = createdAt;
  }

  return databaseQuery;
};

/**
 * Shapes billing records into a sales report.
 */
const buildSalesReport = async (fromDate, toDate) => {
  const bills = await Bill.find(buildBaseQuery(fromDate, toDate))
    .select("billNumber totalAmount itemCount status createdAt memberId cardId createdBy")
    .populate("memberId", "fullName mobileNumber")
    .populate("cardId", "cardNumber")
    .populate("createdBy", "fullName username role")
    .sort({ createdAt: -1 })
    .lean();

  const records = bills.map((bill) => ({
    id: bill._id,
    reference: bill.billNumber,
    member: bill.memberId
      ? {
          id: bill.memberId._id,
          fullName: bill.memberId.fullName,
          mobileNumber: bill.memberId.mobileNumber
        }
      : null,
    card: bill.cardId
      ? {
          id: bill.cardId._id,
          cardNumber: bill.cardId.cardNumber
        }
      : null,
    totalAmount: bill.totalAmount,
    itemCount: bill.itemCount,
    status: bill.status,
    createdAt: bill.createdAt,
    createdBy: bill.createdBy
      ? {
          id: bill.createdBy._id,
          fullName: bill.createdBy.fullName,
          username: bill.createdBy.username,
          role: bill.createdBy.role
        }
      : null
  }));

  const salesSummary = records.reduce(
    (summary, record) => {
      summary.totalAmount += Number(record.totalAmount || 0);
      summary.totalItems += Number(record.itemCount || 0);

      return summary;
    },
    {
      totalAmount: 0,
      totalItems: 0
    }
  );

  return {
    reportType: "Sales",
    summary: {
      totalBills: records.length,
      totalAmount: salesSummary.totalAmount,
      totalItems: salesSummary.totalItems
    },
    records
  };
};

/**
 * Shapes recharge records into a recharge report.
 */
const buildRechargesReport = async (fromDate, toDate) => {
  const recharges = await Recharge.find(buildBaseQuery(fromDate, toDate))
    .select("amount paymentMode balanceBefore balanceAfter notes createdAt memberId cardId createdBy")
    .populate("memberId", "fullName mobileNumber")
    .populate("cardId", "cardNumber")
    .populate("createdBy", "fullName username role")
    .sort({ createdAt: -1 })
    .lean();

  const records = recharges.map((recharge) => ({
    id: recharge._id,
    reference: `RCG-${String(recharge._id).slice(-6).toUpperCase()}`,
    member: recharge.memberId
      ? {
          id: recharge.memberId._id,
          fullName: recharge.memberId.fullName,
          mobileNumber: recharge.memberId.mobileNumber
        }
      : null,
    card: recharge.cardId
      ? {
          id: recharge.cardId._id,
          cardNumber: recharge.cardId.cardNumber
        }
      : null,
    amount: recharge.amount,
    paymentMode: recharge.paymentMode,
    balanceBefore: recharge.balanceBefore,
    balanceAfter: recharge.balanceAfter,
    notes: recharge.notes,
    createdAt: recharge.createdAt,
    createdBy: recharge.createdBy
      ? {
          id: recharge.createdBy._id,
          fullName: recharge.createdBy.fullName,
          username: recharge.createdBy.username,
          role: recharge.createdBy.role
        }
      : null
  }));

  let totalAmount = 0;
  const paymentModeTotals = records.reduce((totals, record) => {
    const paymentMode = record.paymentMode || "Unknown";
    const nextAmount = Number(record.amount || 0);

    totalAmount += nextAmount;
    totals[paymentMode] = Number(totals[paymentMode] || 0) + nextAmount;

    return totals;
  }, {});

  return {
    reportType: "Recharges",
    summary: {
      totalRecharges: records.length,
      totalAmount,
      paymentModeTotals
    },
    records
  };
};

/**
 * Shapes debit records into a debit report.
 */
const buildDebitsReport = async (fromDate, toDate) => {
  const debits = await Debit.find(buildBaseQuery(fromDate, toDate))
    .select("amount reason balanceBefore balanceAfter notes createdAt memberId cardId createdBy")
    .populate("memberId", "fullName mobileNumber")
    .populate("cardId", "cardNumber")
    .populate("createdBy", "fullName username role")
    .sort({ createdAt: -1 })
    .lean();

  const records = debits.map((debit) => ({
    id: debit._id,
    reference: `DBT-${String(debit._id).slice(-6).toUpperCase()}`,
    member: debit.memberId
      ? {
          id: debit.memberId._id,
          fullName: debit.memberId.fullName,
          mobileNumber: debit.memberId.mobileNumber
        }
      : null,
    card: debit.cardId
      ? {
          id: debit.cardId._id,
          cardNumber: debit.cardId.cardNumber
        }
      : null,
    amount: debit.amount,
    reason: debit.reason,
    balanceBefore: debit.balanceBefore,
    balanceAfter: debit.balanceAfter,
    notes: debit.notes,
    createdAt: debit.createdAt,
    createdBy: debit.createdBy
      ? {
          id: debit.createdBy._id,
          fullName: debit.createdBy.fullName,
          username: debit.createdBy.username,
          role: debit.createdBy.role
        }
      : null
  }));

  const debitSummary = records.reduce(
    (summary, record) => {
      summary.totalAmount += Number(record.amount || 0);

      if (record.reason === "Billing") {
        summary.billingDebits += 1;
      } else {
        summary.manualDebits += 1;
      }

      return summary;
    },
    {
      totalAmount: 0,
      billingDebits: 0,
      manualDebits: 0
    }
  );

  return {
    reportType: "Debits",
    summary: {
      totalDebits: records.length,
      totalAmount: debitSummary.totalAmount,
      billingDebits: debitSummary.billingDebits,
      manualDebits: debitSummary.manualDebits
    },
    records
  };
};

/**
 * Shapes stock movement records into a stock report.
 */
const buildStockReport = async (fromDate, toDate) => {
  const stockMovements = await StockMovement.find(buildBaseQuery(fromDate, toDate))
    .select("quantityBefore quantityChange quantityAfter movementType notes createdAt productId createdBy")
    .populate("productId", "productName productCode unit")
    .populate("createdBy", "fullName username role")
    .sort({ createdAt: -1 })
    .lean();

  const records = stockMovements.map((movement) => ({
    id: movement._id,
    reference: `STM-${String(movement._id).slice(-6).toUpperCase()}`,
    product: movement.productId
      ? {
          id: movement.productId._id,
          productName: movement.productId.productName,
          productCode: movement.productId.productCode,
          unit: movement.productId.unit
        }
      : null,
    quantityBefore: movement.quantityBefore,
    quantityChange: movement.quantityChange,
    quantityAfter: movement.quantityAfter,
    movementType: movement.movementType,
    notes: movement.notes,
    createdAt: movement.createdAt,
    createdBy: movement.createdBy
      ? {
          id: movement.createdBy._id,
          fullName: movement.createdBy.fullName,
          username: movement.createdBy.username,
          role: movement.createdBy.role
        }
      : null
  }));

  const stockSummary = records.reduce(
    (summary, record) => {
      const quantityChange = Number(record.quantityChange || 0);

      if (quantityChange > 0) {
        summary.inwardQuantity += quantityChange;
      }

      if (quantityChange < 0) {
        summary.outwardQuantity += Math.abs(quantityChange);
      }

      summary.netQuantityChange += quantityChange;

      return summary;
    },
    {
      inwardQuantity: 0,
      outwardQuantity: 0,
      netQuantityChange: 0
    }
  );

  return {
    reportType: "Stock",
    summary: {
      totalMovements: records.length,
      inwardQuantity: stockSummary.inwardQuantity,
      outwardQuantity: stockSummary.outwardQuantity,
      netQuantityChange: stockSummary.netQuantityChange
    },
    records
  };
};

/**
 * Returns one derived report response by type.
 */
const getReport = async (query = {}) => {
  const { errors, values } = validateReportQuery(query);

  if (errors.length > 0) {
    throw createValidationError(errors, "Report validation failed.");
  }

  let report;

  if (values.type === "Sales") {
    report = await buildSalesReport(values.fromDate, values.toDate);
  } else if (values.type === "Recharges") {
    report = await buildRechargesReport(values.fromDate, values.toDate);
  } else if (values.type === "Debits") {
    report = await buildDebitsReport(values.fromDate, values.toDate);
  } else {
    report = await buildStockReport(values.fromDate, values.toDate);
  }

  const paginationWindow = parsePaginationWindow(query);
  const records = paginationWindow
    ? report.records.slice(paginationWindow.skip, paginationWindow.skip + paginationWindow.limit)
    : report.records;

  return {
    reportType: report.reportType,
    fromDate: toDateLabel(values.fromDate),
    toDate: toDateLabel(values.toDate),
    summary: report.summary,
    records
  };
};

module.exports = {
  getReport
};
