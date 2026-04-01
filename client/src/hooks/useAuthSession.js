/**
 * Module: Auth Session Hook
 * File: useAuthSession.js
 * Purpose: Loads and updates the authenticated session used by protected routes.
 */

import { useState } from "react";

import { clearAuthSession, getAuthSession, saveAuthSession } from "../utils/authStorage";

/**
 * Provides auth session state helpers for the route tree.
 */
export function useAuthSession() {
  const [session, setSession] = useState(() => getAuthSession());

  /**
   * Saves the latest authenticated session.
   */
  const updateSession = (nextSession) => {
    saveAuthSession(nextSession);
    setSession(nextSession);
  };

  /**
   * Clears the authenticated session.
   */
  const removeSession = () => {
    clearAuthSession();
    setSession(null);
  };

  return {
    session,
    isAuthenticated: Boolean(session?.token),
    updateSession,
    removeSession
  };
}