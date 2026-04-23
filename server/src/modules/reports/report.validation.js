/**
 * Module: Report Validation
 * File: report.validation.js
 * Purpose: Validates report query inputs before report records are derived from existing module data.
 */

const REPORT_TYPES = ["Sales", "Recharges", "Debits", "Stock"];

/**
 * Matches a report type in a case-insensitive way.
 */
const normalizeReportType = (value) => {
  if (typeof value !== "string") {
    return REPORT_TYPES[0];
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return REPORT_TYPES[0];
  }

  return REPORT_TYPES.find((reportType) => reportType.toLowerCase() === trimmedValue.toLowerCase()) || null;
};

/**
 * Parses a date string if supplied.
 */
const parseDateValue = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const parsedDate = new Date(value.trim());

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
};

/**
 * Validates report query filters and returns normalized values.
 */
const validateReportQuery = (query = {}) => {
  const errors = [];
  const normalizedType = normalizeReportType(query.type);
  const rawType = typeof query.type === "string" ? query.type.trim() : "";
  const fromDate = parseDateValue(query.fromDate);
  const toDate = parseDateValue(query.toDate);

  if (rawType && !normalizedType) {
    errors.push({
      field: "type",
      message: `Report type must be one of: ${REPORT_TYPES.join(", ")}.`
    });
  }

  if (typeof query.fromDate === "string" && query.fromDate.trim() && !fromDate) {
    errors.push({
      field: "fromDate",
      message: "fromDate must be a valid date value."
    });
  }

  if (typeof query.toDate === "string" && query.toDate.trim() && !toDate) {
    errors.push({
      field: "toDate",
      message: "toDate must be a valid date value."
    });
  }

  if (fromDate && toDate && fromDate > toDate) {
    errors.push({
      field: "dateRange",
      message: "fromDate cannot be later than toDate."
    });
  }

  return {
    errors,
    values: {
      type: normalizedType || REPORT_TYPES[0],
      fromDate,
      toDate
    }
  };
};

module.exports = {
  REPORT_TYPES,
  validateReportQuery
};
