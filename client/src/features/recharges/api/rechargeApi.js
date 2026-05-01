/**
 * Module: Recharges API
 * File: rechargeApi.js
 * Purpose: Handles Recharges module requests for listing and creating recharge records.
 */

import { httpRequest } from "../../../api/http";

/**
 * Fetches the recharge list with optional search, date, payment mode, and cashier filters.
 */
export function fetchRechargeList(token, filters = {}, options = {}) {
  const searchParams = new URLSearchParams();

  if (filters.search?.trim()) {
    searchParams.set("search", filters.search.trim());
  }

  if (filters.date?.trim()) {
    searchParams.set("date", filters.date.trim());
  }

  if (filters.paymentMode?.trim()) {
    searchParams.set("paymentMode", filters.paymentMode.trim());
  }

  if (filters.cashierId?.trim()) {
    searchParams.set("cashierId", filters.cashierId.trim());
  }

  const queryString = searchParams.toString();
  const path = queryString ? `/recharges?${queryString}` : "/recharges";

  return httpRequest(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * Creates a new recharge record.
 */
export function createRechargeRecord(payload, token) {
  return httpRequest("/recharges", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: payload
  });
}
