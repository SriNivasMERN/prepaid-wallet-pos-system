/**
 * Module: Products API
 * File: productApi.js
 * Purpose: Handles Products module requests for listing, creating, updating, and status-managing product records.
 */

import { httpRequest } from "../../../api/http";

/**
 * Fetches the product list with optional search, status, and unit filters.
 */
export function fetchProductList(token, filters = {}) {
  const searchParams = new URLSearchParams();

  if (filters.search?.trim()) {
    searchParams.set("search", filters.search.trim());
  }

  if (filters.status?.trim()) {
    searchParams.set("status", filters.status.trim());
  }

  if (filters.unit?.trim()) {
    searchParams.set("unit", filters.unit.trim());
  }

  const queryString = searchParams.toString();
  const path = queryString ? `/products?${queryString}` : "/products";

  return httpRequest(path, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * Fetches the next generated product code preview.
 */
export function fetchNextProductCode(token) {
  return httpRequest("/products/next-code", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * Creates a new product record.
 */
export function createProductRecord(payload, token) {
  return httpRequest("/products", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: payload
  });
}

/**
 * Updates one product record.
 */
export function updateProductRecord(productId, payload, token) {
  return httpRequest(`/products/${productId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: payload
  });
}

/**
 * Updates one product status.
 */
export function updateProductStatusRecord(productId, status, token) {
  return httpRequest(`/products/${productId}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: {
      status
    }
  });
}
