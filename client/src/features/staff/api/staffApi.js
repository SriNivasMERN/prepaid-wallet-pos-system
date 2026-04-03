/**
 * Module: Staff API
 * File: staffApi.js
 * Purpose: Handles staff module requests for listing and creating staff.
 */

import { httpRequest } from "../../../api/http";

export function fetchStaffList(token) {
  return httpRequest("/staff", {
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
