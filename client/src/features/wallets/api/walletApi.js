/**
 * Module: Wallets API
 * File: walletApi.js
 * Purpose: Handles Wallets module requests for listing, creating, and updating wallet records.
 */

import { httpRequest } from "../../../api/http";

/**
 * Fetches the wallet list with optional search and status filters.
 */
export function fetchWalletList(token, filters = {}) {
  const searchParams = new URLSearchParams();

  if (filters.search?.trim()) {
    searchParams.set("search", filters.search.trim());
  }

  if (filters.status?.trim()) {
    searchParams.set("status", filters.status.trim());
  }

  if (filters.page) {
    searchParams.set("page", String(filters.page));
  }

  if (filters.limit) {
    searchParams.set("limit", String(filters.limit));
  }

  const queryString = searchParams.toString();
  const path = queryString ? `/wallets?${queryString}` : "/wallets";

  return httpRequest(path, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * Creates a new wallet for an eligible member.
 */
export function createWalletRecord(payload, token) {
  return httpRequest("/wallets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: payload
  });
}

/**
 * Updates one wallet record.
 */
export function updateWalletRecord(walletId, payload, token) {
  return httpRequest(`/wallets/${walletId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: payload
  });
}
