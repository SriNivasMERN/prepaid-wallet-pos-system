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
 * Invalidates the current staff login token on the server.
 */
export function logoutStaff(token) {
  return httpRequest("/auth/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
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

/**
 * Updates the current authenticated staff member's profile.
 */
export function updateCurrentStaffProfile(payload, token) {
  return httpRequest("/auth/me/profile", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: payload
  });
}

/**
 * Changes the current authenticated staff member's password.
 */
export function changeCurrentStaffPassword(payload, token) {
  return httpRequest("/auth/me/password", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: payload
  });
}
