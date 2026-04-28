/**
 * Module: Pagination Utilities
 * File: pagination.js
 * Purpose: Parses safe optional paging parameters for list-style backend queries.
 */

const DEFAULT_MAX_LIMIT = 200;

/**
 * Parses page/limit values when supplied and returns a Mongo skip/limit window.
 */
const parsePaginationWindow = (query = {}, maxLimit = DEFAULT_MAX_LIMIT) => {
  const rawPage = Number.parseInt(query.page, 10);
  const rawLimit = Number.parseInt(query.limit, 10);

  if (!Number.isInteger(rawPage) || !Number.isInteger(rawLimit) || rawPage < 1 || rawLimit < 1) {
    return null;
  }

  const limit = Math.min(rawLimit, maxLimit);
  const skip = (rawPage - 1) * limit;

  return {
    page: rawPage,
    limit,
    skip
  };
};

module.exports = {
  parsePaginationWindow,
  DEFAULT_MAX_LIMIT
};
