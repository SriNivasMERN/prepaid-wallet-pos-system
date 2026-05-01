# Module: Debits
## Test Objectives
- Verify allowed roles can create manual debit entries only for eligible active wallets.
- Verify debit list, search, reason, cashier, and date filters work correctly.
- Verify debit `View Details` flow behaves correctly while debit records remain immutable.
- Verify debit validation, insufficient-balance handling, and balance deduction behavior.
- Verify debit balance updates remain correct when multiple debit requests are submitted close together.
- Verify wallet selection uses searchable lookup behavior and does not force focus to amount on page entry.
- Verify debit filters do not default to the current date and amount cannot be changed accidentally by mouse-wheel scrolling.

## Preconditions
- Approved QA environment and approved QA test data are available for execution.

## Positive Test Cases
1. Allowed role can open Debits module and load debit list
   - Steps:
     1. Log in as `Super Admin`, `Admin`, or `Cashier`.
     2. Open the dashboard.
     3. Click `Debits` from the sidebar.
     4. Wait for the module to load.
   - Expected Result:
     - The `Create Debit` form is visible.
     - The `Filters` section is visible.
     - The debit list loads successfully.

2. Create debit with valid data and sufficient balance
   - Steps:
     1. Open `Debits`.
     2. Search for and select an eligible wallet with enough balance.
     3. Enter a valid amount and reason.
     4. Optionally enter notes.
     5. Click `Create Debit`.
   - Expected Result:
     - Debit creation succeeds.
     - Success message is shown.
     - The new debit appears in the list after reload.
     - Wallet balance decreases by the debit amount.

3. Wallet lookup supports search before debit entry
   - Steps:
     1. Open `Debits`.
     2. Click the `Wallet` search field.
     3. Search by member name, mobile number, or card number.
   - Expected Result:
     - Matching eligible wallets are shown for selection.
     - The user does not need to scroll through a long wallet dropdown.
     - `Amount` does not receive automatic focus on page entry.

4. Debit date filter is blank by default
   - Steps:
     1. Open `Debits`.
     2. Review the `Date` filter before applying any filters.
   - Expected Result:
     - The `Date` filter is blank.
     - Debit records are not limited to the current date unless the user selects a date.

5. Amount field does not change on mouse-wheel scroll
   - Steps:
     1. Open `Debits`.
     2. Enter a valid amount.
     3. Scroll the mouse wheel while the amount field is focused.
   - Expected Result:
     - The amount value does not increase or decrease because of mouse-wheel scrolling.
     - Page scrolling does not silently alter the debit amount.

6. Search debits by member name, mobile number, card number, or reason
   - Steps:
     1. Open `Debits`.
     2. Use `Search Debits`.
     3. Click `Apply Filters`.
   - Expected Result:
     - Matching debit records are shown.

7. Filter debits by reason
   - Steps:
     1. Open `Debits`.
     2. Enter a reason keyword in the `Reason` filter.
     3. Click `Apply Filters`.
   - Expected Result:
     - Only debit records matching the reason filter are shown.

8. Filter debits by cashier
   - Steps:
     1. Open `Debits`.
     2. Select a staff record in the `Cashier` filter.
     3. Click `Apply Filters`.
   - Expected Result:
     - Only debit records created by the selected cashier are shown.

9. Filter debits by date
   - Steps:
     1. Open `Debits`.
     2. Select a date in the `Date` filter.
     3. Click `Apply Filters`.
   - Expected Result:
     - Only debit records created on the selected date are shown.

10. Reset debit filters restores default listing
   - Steps:
     1. Apply one or more debit filters.
     2. Click `Reset`.
   - Expected Result:
     - Filter inputs return to default values.
     - The `Date` filter returns to blank.
     - The debit list reloads without previous filters.

11. Refresh reloads the debit list with current filters
   - Steps:
     1. Apply one or more filters.
     2. Click `Refresh`.
   - Expected Result:
     - The list reloads successfully.
     - Currently applied filters remain effective.

12. View action opens debit details modal
   - Steps:
     1. Open `Debits`.
     2. Click `View` on a debit row.
   - Expected Result:
     - `Debit Details` modal opens.
     - Member, card, amount, reason, balance before, balance after, and notes are shown.

## Negative Test Cases
1. Debit form rejects empty required fields
   - Steps:
     1. Open `Debits`.
     2. Leave wallet, amount, and reason empty.
     3. Click `Create Debit`.
   - Expected Result:
     - Debit is not created.
     - Required validation messages are shown.

2. Debit form rejects zero or negative amount
   - Steps:
     1. Select an eligible wallet.
     2. Enter `0` or a negative number.
     3. Submit the debit.
   - Expected Result:
     - Debit is not created.
     - Amount validation error is shown.

3. Debit form rejects reason longer than allowed length
   - Steps:
     1. Enter a reason longer than 120 characters.
     2. Submit the debit.
   - Expected Result:
     - Debit is not created.
     - Reason length validation error is shown.

4. Debit is rejected when amount exceeds wallet balance
   - Steps:
     1. Select a wallet with known current balance.
     2. Enter an amount greater than that balance.
     3. Submit the debit.
   - Expected Result:
     - Debit is not created.
     - Error indicates insufficient wallet balance.

5. Inactive wallet cannot be debited
   - Steps:
     1. Attempt debit for an inactive wallet through direct API test.
   - Expected Result:
     - The request is rejected.
     - Error indicates only an active wallet can be debited.

6. Inactive member wallet cannot be debited
   - Steps:
     1. Attempt debit for a wallet linked to an inactive member.
   - Expected Result:
     - The request is rejected.
     - Error indicates only an active member wallet can be debited.

7. Debit is rejected when linked card is inactive or expired
   - Steps:
     1. Attempt debit for a wallet whose linked card is inactive or expired.
   - Expected Result:
     - The request is rejected.
     - Error indicates a usable active card is required before debit.

8. Debit cannot be edited or deleted through normal UI
   - Steps:
     1. Open `Debits`.
     2. Review debit row actions and available controls.
   - Expected Result:
     - No edit or delete action is exposed for debit records.

## Edge Cases
1. Balance after debit is calculated correctly
   - Steps:
     1. Note the current balance of an eligible wallet.
     2. Create a valid debit.
     3. Check the created debit entry.
   - Expected Result:
     - `balanceBefore` matches the earlier wallet balance.
     - `balanceAfter` equals `balanceBefore - amount`.

2. Search remains case-insensitive for reason and member name
   - Steps:
     1. Search using different uppercase and lowercase versions of a reason or member name.
   - Expected Result:
     - Matching debit records are still returned.

3. Today debit metrics reflect created records
   - Steps:
     1. Open `Debits`.
     2. Create one or more debits today.
     3. Review the module metrics.
   - Expected Result:
     - Today count and value reflect today's debit entries.

4. Close-together debits do not overdraw wallet balance
   - Steps:
     1. Note the current balance of an eligible wallet.
     2. Submit two valid-looking debit requests close together where the combined amount exceeds available balance.
     3. Reload wallet and debit records.
   - Expected Result:
     - Only debit requests covered by the actual wallet balance succeed.
     - Wallet balance never becomes negative.
     - Rejected request shows an insufficient balance error.

## API Verification Steps
- Endpoint: `GET /api/v1/debits`
- Payload:
  1. Send a `GET` request to `/api/v1/debits`.
  2. Include header `Authorization: Bearer <valid token>`.
  3. Optionally add `search`, `reason`, `date`, and `cashierId` query parameters.
- Expected Response:
  - `200 OK` for allowed roles.
  - Debit list is returned.
  - Filtering works with provided query parameters.

- Endpoint: `POST /api/v1/debits`
- Payload:
  1. Send a `POST` request to `/api/v1/debits`.
  2. Include header `Authorization: Bearer <valid token>`.
  3. Use approved valid QA values for `walletId`, `amount`, `reason`, and `notes`.
- Expected Response:
  - `201 Created` for valid debit.
  - `400 Bad Request` for invalid payload.
  - `404 Not Found` for missing wallet/member/card records.
  - `409 Conflict` for insufficient balance or ineligible debit conditions.
  - Close-together debit requests do not overwrite or overdraw wallet balance updates.

- Endpoint: `GET /api/v1/debits/:debitId`
- Payload:
  1. Send a `GET` request using a valid debit id.
  2. Include header `Authorization: Bearer <valid token>`.
- Expected Response:
  - `200 OK` for valid existing debit.
  - `404 Not Found` for missing or invalid debit id.

## UI Verification Steps
- Page/Screen: `Debits`
- Steps:
  1. Open `Debits` from the sidebar.
  2. Verify the create form, filters, and debit list are visible.
  3. Submit invalid values.
  4. Submit valid approved QA values.
  5. Use search, reason, date, and cashier filters.
  6. Use `View`, `Reset`, and `Refresh`.
- Expected Result:
  - Debits module opens for allowed roles.
  - Invalid submissions are blocked with clear validation.
  - Valid debit creation succeeds only for eligible wallets with sufficient balance.
  - Debit details modal works correctly.
  - Filters, reset, and refresh behave correctly.
