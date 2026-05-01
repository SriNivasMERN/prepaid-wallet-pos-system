/**
 * Module: Transactions API
 * File: transactionApi.js
 * Purpose: Handles Transactions module requests for listing transaction ledger entries.
 */

import { httpRequest } from "../../../api/http";

/**
 * Fetches the transaction list with optional search, type, and date range filters.
 */
export function fetchTransactionList(token, filters = {}, options = {}) {
  const searchParams = new URLSearchParams();

  if (filters.search?.trim()) {
    searchParams.set("search", filters.search.trim());
  }

  if (filters.type?.trim()) {
    searchParams.set("type", filters.type.trim());
  }

  if (filters.fromDate?.trim()) {
    searchParams.set("fromDate", filters.fromDate.trim());
  }

  if (filters.toDate?.trim()) {
    searchParams.set("toDate", filters.toDate.trim());
  }

  const queryString = searchParams.toString();
  const path = queryString ? `/transactions?${queryString}` : "/transactions";

  return httpRequest(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`
    }
  });
}
