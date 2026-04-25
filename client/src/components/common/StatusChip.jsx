/**
 * Module: Status Chip
 * File: StatusChip.jsx
 * Purpose: Renders business-friendly status chips with consistent tones across admin modules.
 */

/**
 * Maps a status label into a visual tone.
 */
function getStatusTone(value) {
  const normalizedValue = String(value || "").toLowerCase();

  if (["active", "completed", "available", "credit"].includes(normalizedValue)) {
    return "positive";
  }

  if (["inactive", "replaced", "out of stock", "debit"].includes(normalizedValue)) {
    return "neutral";
  }

  if (["low stock", "negative stock"].includes(normalizedValue)) {
    return "warning";
  }

  return "neutral";
}

/**
 * Displays a standardized status chip.
 */
function StatusChip({ value }) {
  return <span className={`status-badge status-badge--${getStatusTone(value)}`}>{value}</span>;
}

export default StatusChip;
