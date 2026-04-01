/**
 * Module: Auth Session Hook
 * File: useAuthSession.js
 * Purpose: Loads, verifies, and updates the authenticated session used by protected routes.
 */

import { useEffect, useState } from "react";

import { fetchCurrentStaff } from "../features/auth/api/authApi";
import { clearAuthSession, getAuthSession, saveAuthSession } from "../utils/authStorage";

/**
 * Provides auth session state helpers for the route tree.
 */
export function useAuthSession({ isSetupReady, isSetupComplete }) {
  const [session, setSession] = useState(() => getAuthSession());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    /**
     * Verifies any saved token with the backend before trusting it.
     */
    const verifyStoredSession = async () => {
      if (!isSetupReady) {
        return;
      }

      if (!isSetupComplete) {
        clearAuthSession();
        if (isMounted) {
          setSession(null);
          setIsLoading(false);
        }
        return;
      }

      const storedSession = getAuthSession();

      if (!storedSession?.token) {
        if (isMounted) {
          setSession(null);
          setIsLoading(false);
        }
        return;
      }

      if (isMounted) {
        setIsLoading(true);
      }

      try {
        const response = await fetchCurrentStaff(storedSession.token);
        const nextSession = {
          token: storedSession.token,
          staff: response.data
        };

        saveAuthSession(nextSession);

        if (isMounted) {
          setSession(nextSession);
        }
      } catch (error) {
        clearAuthSession();
        if (isMounted) {
          setSession(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    verifyStoredSession();

    return () => {
      isMounted = false;
    };
  }, [isSetupReady, isSetupComplete]);

  /**
   * Saves the latest authenticated session.
   */
  const updateSession = (nextSession) => {
    saveAuthSession(nextSession);
    setSession(nextSession);
    setIsLoading(false);
  };

  /**
   * Clears the authenticated session.
   */
  const removeSession = () => {
    clearAuthSession();
    setSession(null);
    setIsLoading(false);
  };

  return {
    session,
    isLoading,
    isAuthenticated: Boolean(session?.token),
    updateSession,
    removeSession
  };
}