/**
 * Module: Cards API
 * File: cardApi.js
 * Purpose: Handles Cards module requests for listing, assigning, and replacing cards.
 */

import { httpRequest } from "../../../api/http";

/**
 * Fetches the card list with optional search, status, and member filters.
 */
export function fetchCardList(token, filters = {}) {
  const searchParams = new URLSearchParams();

  if (filters.search?.trim()) {
    searchParams.set("search", filters.search.trim());
  }

  if (filters.status?.trim()) {
    searchParams.set("status", filters.status.trim());
  }

  if (filters.memberId?.trim()) {
    searchParams.set("memberId", filters.memberId.trim());
  }

  const queryString = searchParams.toString();
  const path = queryString ? `/cards?${queryString}` : "/cards";

  return httpRequest(path, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * Assigns a new active card to a member.
 */
export function assignCardToMember(payload, token) {
  return httpRequest("/cards", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: payload
  });
}

/**
 * Fetches the next generated card number preview.
 */
export function fetchNextCardNumber(token) {
  return httpRequest("/cards/next-number", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * Replaces one active card while preserving member ownership.
 */
export function replaceCardRecord(cardId, payload, token) {
  return httpRequest(`/cards/${cardId}/replace`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: payload
  });
}

/**
 * Fetches the operational readiness profile for one card.
 */
export function fetchCardOperationalProfile(cardId, token) {
  return httpRequest(`/cards/${cardId}/operational-profile`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
