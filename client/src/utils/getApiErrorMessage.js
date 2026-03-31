/**
 * Module: Error Message Helper
 * File: getApiErrorMessage.js
 * Purpose: Extracts a user-friendly message from API or runtime errors.
 */

/**
 * Returns the best available error message for UI display.
 */
export function getApiErrorMessage(error) {
  if (error?.response?.message) {
    return error.response.message;
  }

  if (error?.message) {
    return error.message;
  }

  return "Something went wrong.";
}