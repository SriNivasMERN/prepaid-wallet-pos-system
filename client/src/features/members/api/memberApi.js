/**
 * Module: Members API
 * File: memberApi.js
 * Purpose: Handles Members module requests for listing, creating, and updating member records.
 */

import { httpRequest } from "../../../api/http";

/**
 * Fetches the member list with optional search and status filters.
 */
export function fetchMemberList(token, filters = {}) {
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
  const path = queryString ? `/members?${queryString}` : "/members";

  return httpRequest(path, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * Creates a new member record.
 */
export function createMemberRecord(payload, token) {
  return httpRequest("/members", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: payload
  });
}

/**
 * Updates one member record.
 */
export function updateMemberRecord(memberId, payload, token) {
  return httpRequest(`/members/${memberId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: payload
  });
}

/**
 * Fetches the operational readiness profile for one member.
 */
export function fetchMemberOperationalProfile(memberId, token) {
  return httpRequest(`/members/${memberId}/operational-profile`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
