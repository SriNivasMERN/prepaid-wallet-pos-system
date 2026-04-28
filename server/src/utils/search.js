/**
 * Module: Search Utilities
 * File: search.js
 * Purpose: Provides safe helpers for building case-insensitive regex search patterns.
 */

/**
 * Escapes regex metacharacters in a plain search string.
 */
const escapeRegex = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Creates a safe case-insensitive regex from user-supplied text.
 */
const createSearchPattern = (value = "") => new RegExp(escapeRegex(value), "i");

module.exports = {
  escapeRegex,
  createSearchPattern
};
