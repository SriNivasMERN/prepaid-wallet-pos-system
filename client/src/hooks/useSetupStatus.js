/**
 * Module: Setup Status Hook
 * File: useSetupStatus.js
 * Purpose: Loads and refreshes the first-time setup state for route gating.
 */

import { useEffect, useState } from "react";

import { fetchSetupStatus } from "../features/auth/api/authApi";

/**
 * Retrieves the setup state used by public routes.
 */
export function useSetupStatus() {
  const [state, setState] = useState({
    isLoading: true,
    isSetupComplete: false,
    errorMessage: ""
  });

  /**
   * Reloads setup status from the backend.
   */
  const refreshSetupStatus = async () => {
    setState((currentState) => ({
      ...currentState,
      isLoading: true,
      errorMessage: ""
    }));

    try {
      const response = await fetchSetupStatus();
      setState({
        isLoading: false,
        isSetupComplete: Boolean(response?.data?.isSetupComplete),
        errorMessage: ""
      });
    } catch (error) {
      setState({
        isLoading: false,
        isSetupComplete: false,
        errorMessage: error?.message || "Unable to load setup status."
      });
    }
  };

  useEffect(() => {
    refreshSetupStatus();
  }, []);

  return {
    ...state,
    refreshSetupStatus
  };
}