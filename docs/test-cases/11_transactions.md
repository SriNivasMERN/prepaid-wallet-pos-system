# Module: Transactions
## Test Objectives
- Verify allowed roles can view the derived transaction ledger.
- Verify the ledger combines recharge credit entries and manual debit entries.
- Verify search, type, and date range filters work correctly.
- Verify transaction ordering, reference format, and response structure are correct.
- Verify transaction date range filters start blank so old records are visible unless the user narrows the range.

## Preconditions
- Approved QA environment and approved QA test data are available for execution.

## Positive Test Cases
1. Allowed role can open Transactions module and load ledger
   - Steps:
     1. Log in as `Super Admin`, `Admin`, or `Cashier`.
     2. Open the dashboard.
     3. Click `Transactions` from the sidebar.
     4. Wait for the module to load.
   - Expected Result:
     - The `Filters` section is visible.
     - The `Transactions List` section is visible.
     - The ledger loads successfully.

2. Ledger shows recharge entries as Credit
   - Steps:
     1. Create or use an existing recharge entry.
     2. Open `Transactions`.
     3. Locate the related ledger record.
   - Expected Result:
     - The transaction type is `Credit`.
     - Amount, balance, member, and card details match the recharge entry.
     - Reference begins with `RCG-`.

3. Ledger shows debit entries as Debit
   - Steps:
     1. Create or use an existing debit entry.
     2. Open `Transactions`.
     3. Locate the related ledger record.
   - Expected Result:
     - The transaction type is `Debit`.
     - Amount, balance, member, and card details match the debit entry.
     - Reference begins with `DBT-`.

4. Search transactions by member name, mobile number, or card number
   - Steps:
     1. Open `Transactions`.
     2. Enter a known member name, mobile number, or card number in `Search Transactions`.
     3. Click `Apply Filters`.
   - Expected Result:
     - Matching transaction records are shown.

5. Filter transactions by type Credit
   - Steps:
     1. Open `Transactions`.
     2. Select `Credit` in the type filter.
     3. Click `Apply Filters`.
   - Expected Result:
     - Only credit transaction records are shown.

6. Filter transactions by type Debit
   - Steps:
     1. Open `Transactions`.
     2. Select `Debit` in the type filter.
     3. Click `Apply Filters`.
   - Expected Result:
     - Only debit transaction records are shown.

7. Filter transactions by from and to date
   - Steps:
     1. Open `Transactions`.
     2. Select a valid `From Date`.
     3. Select a valid `To Date`.
     4. Click `Apply Filters`.
   - Expected Result:
     - Only transaction records within the selected date range are shown.

8. Transaction date range filters are blank by default
   - Steps:
     1. Open `Transactions`.
     2. Review `From Date` and `To Date` before applying filters.
   - Expected Result:
     - Both date fields are blank by default.
     - The ledger is not limited to the current date unless the user selects a date range.

9. Reset transaction filters restores default listing
   - Steps:
     1. Apply one or more transaction filters.
     2. Click `Reset`.
   - Expected Result:
     - Filter inputs return to default values.
     - `From Date` and `To Date` return to blank.
     - The ledger reloads without the previous filters.

10. Refresh reloads the transaction ledger
   - Steps:
     1. Open `Transactions`.
     2. Click `Refresh`.
   - Expected Result:
     - The ledger reloads successfully.

11. Ledger order is newest first
   - Steps:
     1. Open `Transactions`.
     2. Review the created timestamps of consecutive rows.
   - Expected Result:
     - Newer transactions appear before older transactions.

## Negative Test Cases
1. Unauthenticated user cannot access Transactions module
   - Steps:
     1. Log out.
     2. Try to open `Transactions` or call the transactions API.
   - Expected Result:
     - Access is rejected.
     - Authentication is required.

2. Invalid token cannot fetch transaction ledger
   - Steps:
     1. Send the transactions list request with a missing or invalid bearer token.
   - Expected Result:
     - The request is rejected.
     - Session/authentication error is returned.

3. Unsupported transaction type does not match valid ledger types
   - Steps:
     1. Send the transactions list request with an unsupported `type` value.
   - Expected Result:
     - No valid type-specific filtering is applied beyond the supported values.
     - The response remains stable and does not mislabel entries.

## Edge Cases
1. Search is case-insensitive for member names and card numbers
   - Steps:
     1. Open `Transactions`.
     2. Search using different uppercase and lowercase versions of a member name or card number.
     3. Apply filters.
   - Expected Result:
     - Matching transaction records are still returned.

2. Date range filter includes same-day records correctly
   - Steps:
     1. Open `Transactions`.
     2. Set the same value in `From Date` and `To Date`.
     3. Apply filters.
   - Expected Result:
     - Records created on that selected day are included correctly.

3. Mixed ledger includes both recharge and debit records together when no type filter is applied
   - Steps:
     1. Open `Transactions`.
     2. Do not set the `Type` filter.
     3. Review the ledger rows.
   - Expected Result:
     - Both `Credit` and `Debit` records are shown in one combined list.

## API Verification Steps
- Endpoint: `GET /api/v1/transactions`
- Payload:
  1. Send a `GET` request to `/api/v1/transactions`.
  2. Include header `Authorization: Bearer <valid token>`.
  3. Optionally add `search`, `type`, `fromDate`, and `toDate` query parameters.
- Expected Response:
  - `200 OK` for allowed roles.
  - Combined transaction ledger is returned.
  - Recharge entries appear as `Credit`.
  - Debit entries appear as `Debit`.
  - Filtering works with provided query parameters.

## UI Verification Steps
- Page/Screen: `Transactions`
- Steps:
  1. Open `Transactions` from the sidebar.
  2. Verify the filters and transaction list are visible.
  3. Use search, type, and date range filters.
  4. Use `Reset` and `Refresh`.
  5. Confirm both credit and debit records display correctly when applicable.
- Expected Result:
  - Transactions module opens for allowed roles.
  - Filters behave correctly.
  - Combined ledger entries are displayed with correct type, reference, amount, and balance.
