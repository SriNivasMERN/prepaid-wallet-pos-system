# Module: Debits
## Test Objectives
- Verify allowed roles can create manual debit entries only for eligible active wallets.
- Verify debit list, search, reason, cashier, and date filters work correctly.
- Verify debit validation, insufficient-balance handling, and balance deduction behavior.
- Verify debit detail lookup behaves correctly.

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

2. Eligible active wallets appear in debit dropdown
   - Steps:
     1. Open `Debits`.
     2. Open the `Wallet` dropdown.
   - Expected Result:
     - Active wallets linked to active members are available for selection.

3. Selected wallet displays member and current balance
   - Steps:
     1. Open `Debits`.
     2. Select a wallet from the dropdown.
   - Expected Result:
     - The `Member` field auto-fills with the linked member name.
     - The `Current Balance` field shows the selected wallet balance.

4. Create debit with valid data and sufficient balance
   - Steps:
     1. Open `Debits`.
     2. Select an eligible wallet with enough balance.
     3. Enter a valid amount greater than zero and not more than the current balance.
     4. Enter a valid reason.
     5. Optionally enter notes within allowed length.
     6. Click `Create Debit`.
   - Expected Result:
     - Debit creation succeeds.
     - Success message is shown.
     - The new debit appears in the list after reload.
     - Wallet balance decreases by the debit amount.

5. Search debits by member name, mobile number, card number, or reason
   - Steps:
     1. Open `Debits`.
     2. Enter a known member name, mobile number, card number, or reason in `Search Debits`.
     3. Click `Apply Filters`.
   - Expected Result:
     - Matching debit records are shown.

6. Filter debits by reason
   - Steps:
     1. Open `Debits`.
     2. Enter a reason keyword in the `Reason` filter.
     3. Click `Apply Filters`.
   - Expected Result:
     - Only debit records matching the reason filter are shown.

7. Filter debits by cashier
   - Steps:
     1. Open `Debits`.
     2. Select a staff record in the `Cashier` filter.
     3. Click `Apply Filters`.
   - Expected Result:
     - Only debit records created by the selected cashier are shown.

8. Filter debits by date
   - Steps:
     1. Open `Debits`.
     2. Select a date in the `Date` filter.
     3. Click `Apply Filters`.
   - Expected Result:
     - Only debit records created on the selected date are shown.

9. Reset debit filters restores default listing
   - Steps:
     1. Apply one or more debit filters.
     2. Click `Reset`.
   - Expected Result:
     - Filter inputs return to default values.
     - The debit list reloads without the previous filters.

10. Refresh reloads the debit list
   - Steps:
     1. Open `Debits`.
     2. Click `Refresh`.
   - Expected Result:
     - The debit list reloads successfully.

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
     2. Enter `0` or a negative number in `Amount`.
     3. Enter a valid reason.
     4. Click `Create Debit`.
   - Expected Result:
     - Debit is not created.
     - Amount validation error is shown.

3. Debit form rejects reason longer than allowed length
   - Steps:
     1. Select a valid wallet.
     2. Enter valid amount.
     3. Enter a reason longer than 120 characters.
     4. Submit the debit.
   - Expected Result:
     - Debit is not created.
     - Reason length validation error is shown.

4. Debit form rejects notes longer than allowed length
   - Steps:
     1. Select a valid wallet.
     2. Enter valid amount and reason.
     3. Enter notes longer than 300 characters.
     4. Submit the debit.
   - Expected Result:
     - Debit is not created.
     - Notes length validation error is shown.

5. Debit is rejected when amount exceeds wallet balance
   - Steps:
     1. Select a wallet with known current balance.
     2. Enter an amount greater than that balance.
     3. Enter a valid reason.
     4. Click `Create Debit`.
   - Expected Result:
     - Debit is not created.
     - Error indicates insufficient wallet balance.

6. Inactive wallet cannot be debited
   - Steps:
     1. Attempt debit for an inactive wallet through direct API test.
   - Expected Result:
     - The request is rejected.
     - Error indicates only an active wallet can be debited.

7. Inactive member wallet cannot be debited
   - Steps:
     1. Attempt debit for a wallet linked to an inactive member.
   - Expected Result:
     - The request is rejected.
     - Error indicates only an active member wallet can be debited.

8. Debit is rejected when member has no linked card
   - Steps:
     1. Attempt debit for a wallet whose member has no linked card.
   - Expected Result:
     - The request is rejected.
     - Error indicates a linked card is required before debit.

9. Debit is rejected when linked card is inactive or expired
   - Steps:
     1. Attempt debit for a wallet whose linked card is inactive or expired.
   - Expected Result:
     - The request is rejected.
     - Error indicates a usable active card is required before debit.

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
     1. Open `Debits`.
     2. Search using different uppercase and lowercase versions of a reason or member name.
     3. Apply filters.
   - Expected Result:
     - Matching debit records are still returned.

3. Today debit metrics reflect created records
   - Steps:
     1. Open `Debits`.
     2. Create one or more debits today.
     3. Review the module metrics.
   - Expected Result:
     - Today count and value reflect today's debit entries.

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
  6. Use `Reset` and `Refresh`.
- Expected Result:
  - Debits module opens for allowed roles.
  - Invalid submissions are blocked with clear validation.
  - Valid debit creation succeeds only for eligible wallets with sufficient balance.
  - Filters, reset, and refresh behave correctly.
