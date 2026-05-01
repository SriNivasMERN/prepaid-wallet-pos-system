/**
 * Module: Stocks API
 * File: stockApi.js
 * Purpose: Handles Stocks module requests for listing stock records, creating stock movements, and loading active product options.
 */

import { httpRequest } from "../../../api/http";

/**
 * Fetches the stock list with optional search, stock status, and movement type filters.
 */
export function fetchStockList(token, filters = {}, options = {}) {
  const searchParams = new URLSearchParams();

  if (filters.search?.trim()) {
    searchParams.set("search", filters.search.trim());
  }

  if (filters.stockStatus?.trim()) {
    searchParams.set("stockStatus", filters.stockStatus.trim());
  }

  if (filters.movementType?.trim()) {
    searchParams.set("movementType", filters.movementType.trim());
  }

  const queryString = searchParams.toString();
  const path = queryString ? `/stocks?${queryString}` : "/stocks";

  return httpRequest(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * Creates a stock movement entry.
 */
export function createStockMovementRecord(payload, token) {
  return httpRequest("/stocks/movements", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: payload
  });
}

/**
 * Loads active product options for stock movement selection.
 */
export function fetchActiveProductOptions(token, options = {}) {
  return httpRequest("/products?status=Active", {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`
    }
  });
}
