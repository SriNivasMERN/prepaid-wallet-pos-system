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
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
}

/**
 * Reads the saved login session from the browser.
 */
export function getAuthSession() {
  const rawValue = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

/**
 * Clears the saved login session.
 */
export function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}