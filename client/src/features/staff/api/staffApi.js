/**
 * Module: Staff API
 * File: staffApi.js
 * Purpose: Handles staff module requests for listing, creating, and updating staff.
 */

import { httpRequest } from "../../../api/http";

export function fetchStaffList(token, filters = {}) {
  const searchParams = new URLSearchParams();

  if (filters.search?.trim()) {
    searchParams.set("search", filters.search.trim());
  }

  if (filters.role?.trim()) {
    searchParams.set("role", filters.role.trim());
  }

  if (filters.status?.trim()) {
    searchParams.set("status", filters.status.trim());
  }

  const queryString = searchParams.toString();
  const path = queryString ? `/staff?${queryString}` : "/staff";

  return httpRequest(path, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export function createStaffAccount(payload, token) {
  return httpRequest("/staff", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: payload
  });
}

export function updateStaffAccount(staffId, payload, token) {
  return httpRequest(`/staff/${staffId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: payload
  });
}

export function resetStaffPassword(staffId, payload, token) {
  return httpRequest(`/staff/${staffId}/reset-password`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: payload
  });
}
