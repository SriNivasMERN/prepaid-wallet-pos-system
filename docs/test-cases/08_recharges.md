# Module: Recharges
## Test Objectives
- Verify allowed roles can create recharge entries only for eligible active wallets.
- Verify recharge list, search, payment mode, cashier, and date filters work correctly.
- Verify recharge `View Details` flow behaves correctly while recharge records remain immutable.
- Verify recharge validation, operational eligibility checks, and balance credit behavior.
- Verify recharge balance updates remain correct when multiple valid recharges are created close together.

## Preconditions
- Approved QA environment and approved QA test data are available for execution.

## Positive Test Cases
1. Allowed role can open Recharges module and load recharge list
   - Steps:
     1. Log in as `Super Admin`, `Admin`, or `Cashier`.
     2. Open the dashboard.
     3. Click `Recharges` from the sidebar.
     4. Wait for the module to load.
   - Expected Result:
     - The `Create Recharge` form is visible.
     - The `Filters` section is visible.
     - The recharge list loads successfully.

2. Create recharge with valid data
   - Steps:
     1. Open `Recharges`.
     2. Select an eligible wallet.
     3. Enter a valid amount greater than zero.
     4. Select a valid payment mode.
     5. Optionally enter notes within allowed length.
     6. Click `Create Recharge`.
   - Expected Result:
     - Recharge creation succeeds.
     - Success message is shown.
     - The new recharge appears in the list after reload.
     - Wallet balance increases by the recharge amount.

3. Search recharges by member name, mobile number, or card number
   - Steps:
     1. Open `Recharges`.
     2. Use `Search Recharges`.
     3. Click `Apply Filters`.
   - Expected Result:
     - Matching recharge records are shown.

4. Filter recharges by payment mode
   - Steps:
     1. Open `Recharges`.
     2. Select a payment mode.
     3. Click `Apply Filters`.
   - Expected Result:
     - Only recharge records with the selected payment mode are shown.

5. Filter recharges by cashier
   - Steps:
     1. Open `Recharges`.
     2. Select a staff record in the `Cashier` filter.
     3. Click `Apply Filters`.
   - Expected Result:
     - Only recharge records created by the selected cashier are shown.

6. Filter recharges by date
   - Steps:
     1. Open `Recharges`.
     2. Select a date in the `Date` filter.
     3. Click `Apply Filters`.
   - Expected Result:
     - Only recharge records created on the selected date are shown.

7. Reset recharge filters restores default listing
   - Steps:
     1. Apply one or more recharge filters.
     2. Click `Reset`.
   - Expected Result:
     - Filter inputs return to default values.
     - The recharge list reloads without previous filters.

8. Refresh reloads the recharge list with current filters
   - Steps:
     1. Apply one or more filters.
     2. Click `Refresh`.
   - Expected Result:
     - The list reloads successfully.
     - Currently applied filters remain effective.

9. View action opens recharge details modal
   - Steps:
     1. Open `Recharges`.
     2. Click `View` on a recharge row.
   - Expected Result:
     - `Recharge Details` modal opens.
     - Member, card, amount, payment mode, balance before, balance after, and notes are shown.

## Negative Test Cases
1. Recharge form rejects empty required fields
   - Steps:
     1. Open `Recharges`.
     2. Leave wallet and amount empty.
     3. Click `Create Recharge`.
   - Expected Result:
     - Recharge is not created.
     - Required validation messages are shown.

2. Recharge form rejects zero or negative amount
   - Steps:
     1. Select an eligible wallet.
     2. Enter `0` or a negative number.
     3. Submit the recharge.
   - Expected Result:
     - Recharge is not created.
     - Amount validation error is shown.

3. Recharge form rejects notes longer than allowed length
   - Steps:
     1. Enter notes longer than 300 characters.
     2. Submit the recharge.
   - Expected Result:
     - Recharge is not created.
     - Notes length validation error is shown.

4. Inactive wallet cannot be recharged
   - Steps:
     1. Attempt recharge for an inactive wallet through direct API test.
   - Expected Result:
     - The request is rejected.
     - Error indicates only an active wallet can be recharged.

5. Inactive member wallet cannot be recharged
   - Steps:
     1. Attempt recharge for a wallet linked to an inactive member.
   - Expected Result:
     - The request is rejected.
     - Error indicates only an active member can be recharged.

6. Recharge is rejected when linked card is inactive or expired
   - Steps:
     1. Attempt recharge for a wallet whose linked card is inactive or expired.
   - Expected Result:
     - The request is rejected.
     - Error indicates a usable active card is required before recharge.

7. Recharge cannot be edited or deleted through normal UI
   - Steps:
     1. Open `Recharges`.
     2. Review recharge row actions and available controls.
   - Expected Result:
     - No edit or delete action is exposed for recharge records.

## Edge Cases
1. Balance after recharge is calculated correctly
   - Steps:
     1. Note the current balance of an eligible wallet.
     2. Create a valid recharge.
     3. Check the created recharge entry.
   - Expected Result:
     - `balanceBefore` matches the earlier wallet balance.
     - `balanceAfter` equals `balanceBefore + amount`.

2. Search remains case-insensitive for member name
   - Steps:
     1. Search using different uppercase and lowercase versions of a member name.
   - Expected Result:
     - Matching recharge records are still returned.

3. Today recharge metrics reflect created records
   - Steps:
     1. Open `Recharges`.
     2. Create one or more recharges today.
     3. Review the module metrics.
   - Expected Result:
     - Today count and value reflect today's recharge entries.

4. Multiple close-together recharges are reflected in final wallet balance
   - Steps:
     1. Note the current balance of an eligible active wallet.
     2. Submit two valid recharge requests for the same wallet close together.
     3. Reload wallet and recharge details.
   - Expected Result:
     - Both recharge records are created if both requests are valid.
     - Final wallet balance equals starting balance plus both recharge amounts.
     - Each recharge row has correct `balanceBefore` and `balanceAfter` snapshots for its own operation.

## API Verification Steps
- Endpoint: `GET /api/v1/recharges`
- Payload:
  1. Send a `GET` request to `/api/v1/recharges`.
  2. Include header `Authorization: Bearer <valid token>`.
  3. Optionally add `search`, `date`, `paymentMode`, and `cashierId` query parameters.
- Expected Response:
  - `200 OK` for allowed roles.
  - Recharge list is returned.
  - Filtering works with provided query parameters.

- Endpoint: `POST /api/v1/recharges`
- Payload:
  1. Send a `POST` request to `/api/v1/recharges`.
  2. Include header `Authorization: Bearer <valid token>`.
  3. Use approved valid QA values for `walletId`, `amount`, `paymentMode`, and `notes`.
- Expected Response:
  - `201 Created` for valid recharge.
  - `400 Bad Request` for invalid payload.
  - `404 Not Found` for missing wallet/member/card records.
  - `409 Conflict` for ineligible recharge conditions.
  - Close-together valid recharge requests do not overwrite each other’s wallet balance updates.

- Endpoint: `GET /api/v1/recharges/:rechargeId`
- Payload:
  1. Send a `GET` request using a valid recharge id.
  2. Include header `Authorization: Bearer <valid token>`.
- Expected Response:
  - `200 OK` for valid existing recharge.
  - `404 Not Found` for missing or invalid recharge id.

## UI Verification Steps
- Page/Screen: `Recharges`
- Steps:
  1. Open `Recharges` from the sidebar.
  2. Verify the create form, filters, and recharge list are visible.
  3. Submit invalid values.
  4. Submit valid approved QA values.
  5. Use search, date, payment mode, and cashier filters.
  6. Use `View`, `Reset`, and `Refresh`.
- Expected Result:
  - Recharges module opens for allowed roles.
  - Invalid submissions are blocked with clear validation.
  - Valid recharge creation succeeds only for eligible wallets.
  - Recharge details modal works correctly.
  - Filters, reset, and refresh behave correctly.
