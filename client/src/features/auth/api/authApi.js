/**
 * Module: Auth API
 * File: authApi.js
 * Purpose: Handles first-time setup requests and authentication calls.
 */

import { httpRequest } from "../../../api/http";

/**
 * Fetches whether the system still requires first-time setup.
 */
export function fetchSetupStatus() {
  return httpRequest("/auth/setup-status");
}

/**
 * Submits the first Super Admin setup form.
 */
export function createInitialSuperAdmin(payload) {
  return httpRequest("/auth/setup", {
    method: "POST",
    body: payload
  });
}

/**
 * Submits the staff login form.
 */
export function loginStaff(payload) {
  return httpRequest("/auth/login", {
    method: "POST",
    body: payload
  });
}

/**
 * Fetches the current staff profile using the login token.
 */
export function fetchCurrentStaff(token) {
  return httpRequest("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}