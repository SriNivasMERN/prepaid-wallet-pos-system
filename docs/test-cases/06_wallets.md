# Module: Wallets
## Test Objectives
- Verify allowed roles can create wallets only for operationally eligible members.
- Verify wallet list, search, status filter, reset, and refresh behavior.
- Verify wallet `View`, `Edit`, and `Activate` / `Mark Inactive` flows behave correctly.
- Verify wallet creation validation, member eligibility rules, and duplicate-wallet prevention.
- Verify wallet detail and update flows remain administrative only and do not mutate balance history.
- Verify member selection uses searchable lookup behavior and does not force focus to the status field on page entry.

## Preconditions
- Approved QA environment and approved QA test data are available for execution.

## Positive Test Cases
1. Allowed role can open Wallets module and load wallets list
   - Steps:
     1. Log in as `Super Admin`, `Admin`, or `Cashier`.
     2. Open the dashboard.
     3. Click `Wallets` from the sidebar.
     4. Wait for the module to load.
   - Expected Result:
     - The `Create Wallet` form is visible.
     - The `Filters` section is visible.
     - The wallets list loads successfully.

2. Eligible members appear in wallet creation searchable selector
   - Steps:
     1. Open `Wallets`.
     2. Click the `Member` search field in the create form.
     3. Search by member name or mobile number.
   - Expected Result:
     - Only eligible active members without a wallet and with a usable linked card are available.
     - Matching members can be selected without scrolling through a long static dropdown.
     - The `Wallet Status` field does not receive automatic focus when the page opens.

3. Create wallet with valid eligible member
   - Steps:
     1. Open `Wallets`.
     2. Search for and select an eligible member.
     3. Select a valid wallet status.
     4. Click `Create Wallet`.
   - Expected Result:
     - Wallet creation succeeds.
     - Success message is shown.
     - The wallet appears in the wallets list after reload.

4. Search wallets by member name or mobile number
   - Steps:
     1. Open `Wallets`.
     2. In `Search Wallets`, enter part of a member name or mobile number.
     3. Click `Apply Filters`.
   - Expected Result:
     - Matching wallet records are shown.

5. Filter wallets by status
   - Steps:
     1. Open `Wallets`.
     2. Select `Active` or `Inactive` in the status filter.
     3. Click `Apply Filters`.
   - Expected Result:
     - The list shows only records matching the selected status.

6. Reset wallet filters restores default listing
   - Steps:
     1. Apply search and/or status filters.
     2. Click `Reset`.
   - Expected Result:
     - Filter inputs return to default values.
     - The wallets list reloads without previous filters.

7. Refresh button reloads wallets list with current filters
   - Steps:
     1. Apply a filter in `Wallets`.
     2. Click `Refresh`.
   - Expected Result:
     - The list reloads successfully.
     - The currently applied filters remain effective.

8. View action opens wallet details modal
   - Steps:
     1. Open `Wallets`.
     2. Click `View` on a wallet row.
   - Expected Result:
     - `Wallet Details` modal opens.
     - Member, mobile number, linked card, balance, status, and updated date are shown.

9. Edit action updates wallet status successfully
   - Steps:
     1. Open `Wallets`.
     2. Click `Edit` on a wallet row.
     3. Change `Status`.
     4. Click `Save Changes`.
   - Expected Result:
     - Wallet update succeeds.
     - Updated status is shown in the list.
     - Balance remains unchanged.

10. Mark wallet inactive successfully
   - Steps:
     1. Open `Wallets`.
     2. Click `Mark Inactive` on an active wallet row.
     3. Confirm the action.
   - Expected Result:
     - Wallet status changes to `Inactive`.
     - Wallet remains visible in the list.

11. Activate inactive wallet successfully
   - Steps:
     1. Open `Wallets`.
     2. Click `Activate` on an inactive wallet row.
     3. Confirm the action.
   - Expected Result:
     - Wallet status changes to `Active`.
     - Wallet remains visible in the list.

## Negative Test Cases
1. Wallet form rejects empty member selection
   - Steps:
     1. Open `Wallets`.
     2. Leave `Member` empty.
     3. Click `Create Wallet`.
   - Expected Result:
     - Wallet is not created.
     - Required validation message is shown.

2. Wallet creation is rejected for inactive member
   - Steps:
     1. Attempt wallet creation for an inactive member through direct API test.
   - Expected Result:
     - The request is rejected.
     - Error indicates only an active member can receive a wallet.

3. Wallet creation is rejected when member has no linked card
   - Steps:
     1. Attempt wallet creation for an active member with no linked card.
   - Expected Result:
     - The request is rejected.
     - Error indicates linked card is required before wallet creation.

4. Wallet creation is rejected when linked card is inactive or expired
   - Steps:
     1. Attempt wallet creation for an active member whose linked card is inactive or expired.
   - Expected Result:
     - The request is rejected.
     - Error indicates member must have a usable active linked card.

5. Duplicate wallet creation is rejected
   - Steps:
     1. Attempt wallet creation for a member who already has a wallet.
   - Expected Result:
     - The request is rejected.
     - Error indicates the member already has a wallet.

6. Wallet update is rejected with no valid field
   - Steps:
     1. Send a wallet update request with no recognized updatable field.
   - Expected Result:
     - The request is rejected.
     - Validation indicates at least one valid wallet field must be provided.

7. Invalid wallet id is rejected
   - Steps:
     1. Request wallet detail or update using an invalid wallet id format.
   - Expected Result:
     - The request is rejected.
     - Wallet not found response is returned.

## Edge Cases
1. Eligible member list excludes members who already have a wallet
   - Steps:
     1. Open `Wallets`.
     2. Review the member dropdown options.
   - Expected Result:
     - Members already linked to a wallet do not appear as wallet-creation options.

2. Eligible member list excludes members whose cards cannot be used in operations
   - Steps:
     1. Open `Wallets`.
     2. Review the member dropdown options after card and member data are loaded.
   - Expected Result:
     - Members with inactive or expired cards are excluded from wallet creation options.

3. Wallet low-balance metric counts active wallets with balance less than or equal to 100
   - Steps:
     1. Open `Wallets`.
     2. Review the wallet metrics after list load.
     3. Compare them with wallet records having active status and balance `<= 100`.
   - Expected Result:
     - Low-balance count matches the rule used by the module.

4. Wallet status update does not change balance
   - Steps:
     1. Note the balance of an existing wallet.
     2. Update status through `Edit` or `Activate` / `Mark Inactive`.
     3. Reopen wallet details.
   - Expected Result:
     - Balance remains unchanged after status-only update.

## API Verification Steps
- Endpoint: `GET /api/v1/wallets`
- Payload:
  1. Send a `GET` request to `/api/v1/wallets`.
  2. Include header `Authorization: Bearer <valid token>`.
  3. Optionally add `search` and `status` query parameters.
- Expected Response:
  - `200 OK` for allowed roles.
  - Wallet list is returned.
  - Filtering works with provided query parameters.

- Endpoint: `POST /api/v1/wallets`
- Payload:
  1. Send a `POST` request to `/api/v1/wallets`.
  2. Include header `Authorization: Bearer <valid token>`.
  3. Use approved valid QA values for `memberId` and `status`.
- Expected Response:
  - `201 Created` for valid eligible member.
  - `400 Bad Request` for invalid payload.
  - `409 Conflict` for ineligible member or existing wallet.

- Endpoint: `GET /api/v1/wallets/:walletId`
- Payload:
  1. Send a `GET` request using a valid wallet id.
  2. Include header `Authorization: Bearer <valid token>`.
- Expected Response:
  - `200 OK` for valid existing wallet.
  - `404 Not Found` for missing or invalid wallet id.

- Endpoint: `PATCH /api/v1/wallets/:walletId`
- Payload:
  1. Send a `PATCH` request using a valid wallet id.
  2. Include header `Authorization: Bearer <valid token>`.
  3. Send a valid `status` value.
- Expected Response:
  - `200 OK` for valid wallet update.
  - `400 Bad Request` for invalid or empty payload.
  - `404 Not Found` for missing or invalid wallet id.

## UI Verification Steps
- Page/Screen: `Wallets`
- Steps:
  1. Open `Wallets` from the sidebar.
  2. Verify the create form, filters, and wallets list are visible.
  3. Submit invalid values.
  4. Submit valid approved QA values.
  5. Use search and status filters.
  6. Use `View`, `Edit`, `Activate` / `Mark Inactive`.
  7. Use `Reset` and `Refresh`.
- Expected Result:
  - Wallets module opens for allowed roles.
  - Invalid submissions are blocked with clear validation.
  - Valid wallet creation succeeds for eligible members only.
  - Detail, edit, and status actions behave correctly.
  - Filters, reset, and refresh behave correctly.
