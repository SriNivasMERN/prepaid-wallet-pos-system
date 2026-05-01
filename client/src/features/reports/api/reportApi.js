/**
 * Module: Reports API
 * File: reportApi.js
 * Purpose: Handles Reports module requests for fetching derived report data from the backend.
 */

import { httpRequest } from "../../../api/http";

/**
 * Fetches one report response with optional type and date range filters.
 */
export function fetchReport(token, filters = {}, options = {}) {
  const searchParams = new URLSearchParams();

  if (filters.type?.trim()) {
    searchParams.set("type", filters.type.trim());
  }

  if (filters.fromDate?.trim()) {
    searchParams.set("fromDate", filters.fromDate.trim());
  }

  if (filters.toDate?.trim()) {
    searchParams.set("toDate", filters.toDate.trim());
  }

  const queryString = searchParams.toString();
  const path = queryString ? `/reports?${queryString}` : "/reports";

  return httpRequest(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`
    }
  });
}
