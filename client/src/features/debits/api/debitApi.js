/**
 * Module: Debits API
 * File: debitApi.js
 * Purpose: Handles Debits module requests for listing and creating debit records.
 */

import { httpRequest } from "../../../api/http";

/**
 * Fetches the debit list with optional search, reason, date, and cashier filters.
 */
export function fetchDebitList(token, filters = {}) {
  const searchParams = new URLSearchParams();

  if (filters.search?.trim()) {
    searchParams.set("search", filters.search.trim());
  }

  if (filters.reason?.trim()) {
    searchParams.set("reason", filters.reason.trim());
  }

  if (filters.date?.trim()) {
    searchParams.set("date", filters.date.trim());
  }

  if (filters.cashierId?.trim()) {
    searchParams.set("cashierId", filters.cashierId.trim());
  }

  const queryString = searchParams.toString();
  const path = queryString ? `/debits?${queryString}` : "/debits";

  return httpRequest(path, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * Creates a new debit record.
 */
export function createDebitRecord(payload, token) {
  return httpRequest("/debits", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: payload
  });
}
