/**
 * Module: Billing API
 * File: billingApi.js
 * Purpose: Handles Billing module requests for listing bills, creating bills, and loading active product options.
 */

import { httpRequest } from "../../../api/http";

/**
 * Fetches the bill list with optional search, status, and date filters.
 */
export function fetchBillList(token, filters = {}, options = {}) {
  const searchParams = new URLSearchParams();

  if (filters.search?.trim()) {
    searchParams.set("search", filters.search.trim());
  }

  if (filters.status?.trim()) {
    searchParams.set("status", filters.status.trim());
  }

  if (filters.date?.trim()) {
    searchParams.set("date", filters.date.trim());
  }

  const queryString = searchParams.toString();
  const path = queryString ? `/billing?${queryString}` : "/billing";

  return httpRequest(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * Creates a new bill record.
 */
export function createBillRecord(payload, token) {
  return httpRequest("/billing", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: payload
  });
}

/**
 * Fetches the billing readiness profile for one card number.
 */
export function fetchBillingPrecheck(cardNumber, token, options = {}) {
  const searchParams = new URLSearchParams();
  searchParams.set("cardNumber", cardNumber.trim());

  return httpRequest(`/billing/precheck?${searchParams.toString()}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * Loads active product options for billing line items.
 */
export function fetchBillingProductOptions(token, options = {}) {
  return httpRequest("/products?status=Active", {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`
    }
  });
}
