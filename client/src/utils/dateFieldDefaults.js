/**
 * Module: Date Field Defaults
 * File: dateFieldDefaults.js
 * Purpose: Provides consistent default values for date inputs across the client.
 */

function formatInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getTodayInputDateValue() {
  return formatInputDate(new Date());
}

export function getOneYearLaterInputDateValue(fromDateValue = getTodayInputDateValue()) {
  const baseDate = fromDateValue
    ? new Date(`${fromDateValue}T00:00:00`)
    : new Date();

  if (Number.isNaN(baseDate.getTime())) {
    const fallbackDate = new Date();

    fallbackDate.setFullYear(fallbackDate.getFullYear() + 1);
    return formatInputDate(fallbackDate);
  }

  baseDate.setFullYear(baseDate.getFullYear() + 1);

  return formatInputDate(baseDate);
}
