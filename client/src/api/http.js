/**
 * Module: HTTP Utility
 * File: http.js
 * Purpose: Provides a small fetch wrapper for client API requests.
 */

import { API_BASE_URL } from "../constants/appConstants";
import { clearAuthSession } from "../utils/authStorage";

const AUTH_SESSION_EXPIRED_EVENT = "prepaid-wallet-pos:session-expired";

function hasAuthorizationHeader(headers = {}) {
  return Boolean(headers.Authorization || headers.authorization);
}

/**
 * Sends an API request and returns parsed JSON when available.
 */
export async function httpRequest(path, options = {}) {
  const hasAuthHeader = hasAuthorizationHeader(options.headers);
  const requestOptions = {
    ...options,
    headers: {
      ...(options.headers || {})
    }
  };

  if (requestOptions.body && !(requestOptions.body instanceof FormData)) {
    requestOptions.headers["Content-Type"] =
      requestOptions.headers["Content-Type"] || "application/json";
    requestOptions.body = JSON.stringify(requestOptions.body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, requestOptions);
  const contentType = response.headers.get("content-type") || "";
  const responseData = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    if (response.status === 401 && hasAuthHeader) {
      clearAuthSession();
      window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
    }

    const error = new Error(
      responseData?.message || "Request could not be completed."
    );
    error.response = responseData;
    throw error;
  }

  return responseData;
}

export { AUTH_SESSION_EXPIRED_EVENT };
