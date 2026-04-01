/**
 * Module: HTTP Utility
 * File: http.js
 * Purpose: Provides a small fetch wrapper for client API requests.
 */

import { API_BASE_URL } from "../constants/appConstants";

/**
 * Sends an API request and returns parsed JSON when available.
 */
export async function httpRequest(path, options = {}) {
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
    const error = new Error(
      responseData?.message || "Request could not be completed."
    );
    error.response = responseData;
    throw error;
  }

  return responseData;
}