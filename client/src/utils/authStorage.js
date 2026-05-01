/**
 * Module: Auth Storage Utility
 * File: authStorage.js
 * Purpose: Stores and retrieves the authenticated staff session in the browser.
 */

const AUTH_STORAGE_KEY = "prepaid-wallet-pos-auth";

/**
 * Saves the login session for later route checks.
 */
export function saveAuthSession(sessionData) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
  } catch {
    // If browser storage is unavailable, keep the app from crashing.
  }
}

/**
 * Reads the saved login session from the browser.
 */
export function getAuthSession() {
  let rawValue = null;

  try {
    rawValue = localStorage.getItem(AUTH_STORAGE_KEY);
  } catch {
    return null;
  }

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    clearAuthSession();
    return null;
  }
}

/**
 * Clears the saved login session.
 */
export function clearAuthSession() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // Ignore storage cleanup failures; callers still clear React state.
  }
}
