# Module: Reports
## Test Objectives
- Verify only allowed roles can access and use the Reports module.
- Verify the Reports module loads live derived report data from backend records.
- Verify report type, from-date, and to-date filters work correctly.
- Verify summary cards, records table, and dashboard report metrics update correctly for each report type.
- Verify report date filters start blank so report records are not limited to the current date by default.

## Preconditions
- Approved QA environment and approved QA test data are available for execution.
- At least one `Super Admin` or `Admin` QA account is available.
- At least one valid `Cashier` QA account is available for access restriction testing.
- Approved QA data exists for at least one of the following as applicable:
  - completed bills
  - recharge entries
  - debit entries
  - stock movement entries

## Positive Test Cases
1. Allowed role can open Reports module and load default Sales report
   - Steps:
     1. Log in as `Super Admin` or `Admin`.
     2. Open the dashboard.
     3. Click `Reports` from the sidebar.
     4. Wait for the module to load.
   - Expected Result:
     - The `Filters` section is visible.
     - The `Sales Summary` section is visible by default.
     - The `Sales Records` section is visible by default.
     - Live report data loads successfully.

2. Reports module defaults to Sales report
   - Steps:
     1. Open `Reports`.
     2. Review the default selected report type.
   - Expected Result:
     - `Sales` is selected by default.
     - Sales summary and sales records are shown.

3. Sales report shows billing-derived records
   - Steps:
     1. Open `Reports`.
     2. Keep `Sales` selected.
     3. Review the summary cards and records table.
   - Expected Result:
     - Sales summary includes bill totals and billed amounts.
     - Sales records show `Reference`, `Member`, `Card`, `Total`, `Items`, `Status`, and `Created At`.

4. Recharges report loads successfully
   - Steps:
     1. Open `Reports`.
     2. Select `Recharges`.
     3. Click `Apply Filters`.
   - Expected Result:
     - Recharges summary loads successfully.
     - Recharges records table is shown with recharge-specific columns.
     - Recharge-derived data appears when approved QA data exists.

5. Debits report loads successfully
   - Steps:
     1. Open `Reports`.
     2. Select `Debits`.
     3. Click `Apply Filters`.
   - Expected Result:
     - Debits summary loads successfully.
     - Debits records table is shown with debit-specific columns.
     - Debit-derived data appears when approved QA data exists.

6. Stock report loads successfully
   - Steps:
     1. Open `Reports`.
     2. Select `Stock`.
     3. Click `Apply Filters`.
   - Expected Result:
     - Stock summary loads successfully.
     - Stock records table is shown with stock-specific columns.
     - Stock-movement-derived data appears when approved QA data exists.

7. From-date and to-date filter narrow report records
   - Steps:
     1. Open `Reports`.
     2. Select any report type with known QA data.
     3. Select valid `From Date` and `To Date` values.
     4. Click `Apply Filters`.
   - Expected Result:
     - Only records within the selected date range are shown.
     - Summary values reflect only the filtered records.

8. Report date filters are blank by default
   - Steps:
     1. Open `Reports`.
     2. Review `From Date` and `To Date` before applying filters.
   - Expected Result:
     - Both date fields are blank by default.
     - Reports are not limited to the current date unless the user selects a date range.

9. Refresh reloads current report with applied filters
   - Steps:
     1. Apply a report type and optional date filters.
     2. Click `Refresh`.
   - Expected Result:
     - The report reloads successfully.
     - The currently applied filters remain effective.

10. Reset restores default report state
   - Steps:
     1. Select a non-default report type.
     2. Apply one or more date filters.
     3. Click `Reset`.
   - Expected Result:
     - Filters return to default values.
     - `From Date` and `To Date` return to blank.
     - Default `Sales` report reloads.

11. Dashboard report metrics update with selected report type
   - Steps:
     1. Open `Reports`.
     2. Review the top dashboard metrics.
     3. Switch between `Sales`, `Recharges`, `Debits`, and `Stock`.
     4. Apply filters after each selection.
   - Expected Result:
     - Dashboard metrics update to the selected report type.
     - Sales shows bill-based metrics.
     - Recharges shows recharge-based metrics.
     - Debits shows debit-based metrics.
     - Stock shows movement-based metrics.

## Negative Test Cases
1. Cashier cannot access Reports module
   - Steps:
     1. Log in as `Cashier`.
     2. Try to open `Reports` or call the reports API.
   - Expected Result:
     - Access is rejected.
     - Reports module is unavailable for cashier role.

2. Unauthenticated user cannot access Reports module
   - Steps:
     1. Log out.
     2. Try to open `Reports` or call the reports API.
   - Expected Result:
     - Access is rejected.
     - Authentication is required.

3. Invalid token cannot fetch report data
   - Steps:
     1. Send the reports request with missing or invalid bearer token.
   - Expected Result:
     - The request is rejected.
     - Session or authentication error is returned.

4. Unsupported report type is rejected through direct API test
   - Steps:
     1. Send a reports request using an unsupported `type` value.
   - Expected Result:
     - The request is rejected.
     - Report-type validation error is returned.

5. Invalid from-date is rejected through direct API test
   - Steps:
     1. Send a reports request with an invalid `fromDate` value.
   - Expected Result:
     - The request is rejected.
     - Date validation error is returned.

6. Invalid to-date is rejected through direct API test
   - Steps:
     1. Send a reports request with an invalid `toDate` value.
   - Expected Result:
     - The request is rejected.
     - Date validation error is returned.

7. Invalid date range is rejected through direct API test
   - Steps:
     1. Send a reports request where `fromDate` is later than `toDate`.
   - Expected Result:
     - The request is rejected.
     - Date-range validation error is returned.

## Edge Cases
1. Reports module remains stable when selected report has no records
   - Steps:
     1. Open `Reports`.
     2. Select a report type or date range with no matching data.
     3. Apply filters.
   - Expected Result:
     - The module remains stable.
     - A no-records message is shown.
     - Summary section remains readable.

2. Same-day date range includes same-day records correctly
   - Steps:
     1. Open `Reports`.
     2. Select the same valid date in both `From Date` and `To Date`.
     3. Apply filters.
   - Expected Result:
     - Records created on that selected day are included correctly.

3. Recharges summary shows payment-mode totals in readable form
   - Steps:
     1. Open `Reports`.
     2. Select `Recharges`.
     3. Apply filters using data with multiple payment modes where available.
   - Expected Result:
     - `paymentModeTotals` is shown in readable text form.
     - Payment modes and amounts are displayed clearly.

4. Records table columns change correctly with report type
   - Steps:
     1. Open `Reports`.
     2. Load `Sales`, `Recharges`, `Debits`, and `Stock` one by one.
   - Expected Result:
     - The records table columns change correctly for the selected report type.
     - No stale columns from the previous report remain visible.

## API Verification Steps
- Endpoint: `GET /api/v1/reports`
- Payload:
  1. Send a `GET` request to `/api/v1/reports`.
  2. Include header `Authorization: Bearer <valid token>`.
  3. Optionally add `type`, `fromDate`, and `toDate` query parameters.
- Expected Response:
  - `200 OK` for allowed roles.
  - One derived report response is returned.
  - Response includes `reportType`, `fromDate`, `toDate`, `summary`, and `records`.
  - Filtering works with provided query parameters.

- Supported Query Examples:
  - `/api/v1/reports?type=Sales`
  - `/api/v1/reports?type=Recharges`
  - `/api/v1/reports?type=Debits`
  - `/api/v1/reports?type=Stock`
  - `/api/v1/reports?type=Sales&fromDate=2026-04-01&toDate=2026-04-24`

- Expected Error Responses:
  - `401 Unauthorized` for missing or invalid token.
  - `403 Forbidden` for disallowed role such as `Cashier`.
  - `400 Bad Request` for unsupported report type or invalid date inputs.

## UI Verification Steps
- Page/Screen: `Reports`
- Steps:
  1. Open `Reports` from the sidebar.
  2. Verify the filters, summary section, and records table are visible.
  3. Verify default Sales report load.
  4. Switch between `Sales`, `Recharges`, `Debits`, and `Stock`.
  5. Apply valid date filters.
  6. Use `Reset` and `Refresh`.
  7. Review dashboard metrics after changing report type.
- Expected Result:
  - Reports module opens for allowed roles.
  - Report loading succeeds.
  - Filters behave correctly.
  - Summary and records update correctly for the selected report type.
  - Dashboard metrics reflect the selected live report.
