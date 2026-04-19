# Module: Wallets
## Test Objectives
- Verify allowed roles can create wallets only for operationally eligible members.
- Verify wallet list, search, and status filter behavior.
- Verify wallet creation validation, member eligibility rules, and duplicate-wallet prevention.
- Verify wallet detail and update flows behave correctly.

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

2. Eligible members appear in wallet creation dropdown
   - Steps:
     1. Open `Wallets`.
     2. Open the `Member` dropdown in the create form.
   - Expected Result:
     - Only eligible active members without a wallet and with a usable linked card are available.

3. Create wallet with valid eligible member
   - Steps:
     1. Open `Wallets`.
     2. Select an eligible member.
     3. Select a valid wallet status.
     4. Click `Create Wallet`.
   - Expected Result:
     - Wallet creation succeeds.
     - Success message is shown.
     - The wallet appears in the wallets list after reload.

4. New wallet starts with zero balance
   - Steps:
     1. Create a wallet successfully.
     2. Open the wallets list or fetch wallet detail.
   - Expected Result:
     - The wallet balance is `0`.

5. Search wallets by member name
   - Steps:
     1. Open `Wallets`.
     2. In `Search Wallets`, enter part of an existing member name.
     3. Click `Apply Filters`.
   - Expected Result:
     - Matching wallet records are shown.

6. Search wallets by mobile number
   - Steps:
     1. Open `Wallets`.
     2. In `Search Wallets`, enter part or all of an existing member mobile number.
     3. Click `Apply Filters`.
   - Expected Result:
     - Matching wallet records are shown.

7. Filter wallets by status
   - Steps:
     1. Open `Wallets`.
     2. Select `Active` or `Inactive` in the status filter.
     3. Click `Apply Filters`.
   - Expected Result:
     - The list shows only records matching the selected status.

8. Reset wallet filters restores default listing
   - Steps:
     1. Apply search and/or status filters.
     2. Click `Reset`.
   - Expected Result:
     - Filter inputs return to default values.
     - The wallets list reloads without the previous filters.

9. Refresh button reloads wallets list
   - Steps:
     1. Open `Wallets`.
     2. Click `Refresh` in the list section.
   - Expected Result:
     - The list reloads successfully.

10. Update wallet status successfully
   - Steps:
     1. Use an existing wallet record.
     2. Send a valid update request with a changed status.
   - Expected Result:
     - Wallet update succeeds.
     - Updated status is returned in the response.

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
  6. Use `Reset` and `Refresh`.
- Expected Result:
  - Wallets module opens for allowed roles.
  - Invalid submissions are blocked with clear validation.
  - Valid wallet creation succeeds for eligible members only.
  - Filters, reset, and refresh behave correctly.
