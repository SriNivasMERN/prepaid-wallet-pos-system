# Module: Cards
## Test Objectives
- Verify allowed roles can assign cards to eligible members.
- Verify card list, search, member filter, and status filter work correctly.
- Verify card `View` and `Replace` flows behave correctly.
- Verify duplicate card number, invalid dates, and ineligible-member assignment are blocked.
- Verify card detail, operational profile, and replacement flows behave correctly.

## Preconditions
- Approved QA environment and approved QA test data are available for execution.

## Positive Test Cases
1. Allowed role can open Cards module and load cards list
   - Steps:
     1. Log in as `Super Admin`, `Admin`, or `Cashier`.
     2. Open the dashboard.
     3. Click `Cards` from the sidebar.
     4. Wait for the module to load.
   - Expected Result:
     - The `Assign Card` form is visible.
     - The `Filters` section is visible.
     - The cards list loads successfully.

2. Assign card with valid data
   - Steps:
     1. Open `Cards`.
     2. Enter an approved valid QA card number.
     3. Select an eligible active member.
     4. Enter a valid `Activated At` date.
     5. Enter an `Expires At` date later than `Activated At`.
     6. Click `Assign Card`.
   - Expected Result:
     - Card assignment succeeds.
     - Success message is shown.
     - The new card appears in the cards list after reload.

3. Search cards by card number, member name, or mobile number
   - Steps:
     1. Open `Cards`.
     2. Use `Search Cards`.
     3. Click `Apply Filters`.
   - Expected Result:
     - Matching card records are shown in the list.

4. Filter cards by status
   - Steps:
     1. Open `Cards`.
     2. Select `Active` or `Inactive` in the status filter.
     3. Click `Apply Filters`.
   - Expected Result:
     - The list shows only records matching the selected status.

5. Filter cards by member
   - Steps:
     1. Open `Cards`.
     2. Select a member in the member filter.
     3. Click `Apply Filters`.
   - Expected Result:
     - The list shows only cards linked to the selected member.

6. Reset card filters restores default listing
   - Steps:
     1. Apply one or more card filters.
     2. Click `Reset`.
   - Expected Result:
     - Filter inputs return to default values.
     - The cards list reloads without previous filters.

7. Refresh reloads the cards list with current filters
   - Steps:
     1. Apply one or more filters.
     2. Click `Refresh`.
   - Expected Result:
     - The list reloads successfully.
     - Current filters remain effective.

8. View action opens card details modal
   - Steps:
     1. Open `Cards`.
     2. Click `View` on a card row.
   - Expected Result:
     - `Card Details` modal opens.
     - Card number, status, member, mobile number, dates, and operational note are shown.

9. Replace an eligible active card successfully through UI
   - Steps:
     1. Open `Cards`.
     2. Click `Replace` on an active, non-expired card.
     3. Enter a new approved valid QA card number and valid dates.
     4. Click `Replace Card`.
   - Expected Result:
     - Card replacement succeeds.
     - Old card becomes `Inactive`.
     - Replacement card becomes `Active`.
     - Member remains linked to the replacement card.

10. Card operational profile is returned for usable active card
   - Steps:
     1. Use an active card linked to an active member and not expired.
     2. Request the card operational profile.
   - Expected Result:
     - Operational profile is returned.
     - `canUseInOperations` is true.
     - Blocking reason is null.

## Negative Test Cases
1. Card form rejects empty required fields
   - Steps:
     1. Open `Cards`.
     2. Leave all fields empty.
     3. Click `Assign Card`.
   - Expected Result:
     - Card is not assigned.
     - Required validation messages are shown.

2. Card form rejects expiry date earlier than or equal to activated date
   - Steps:
     1. Enter a valid card number.
     2. Select an eligible member.
     3. Enter invalid date sequence.
     4. Click `Assign Card`.
   - Expected Result:
     - Card is not assigned.
     - Date validation error is shown.

3. Duplicate card number is rejected on assign or replace
   - Steps:
     1. Use a card number already used by another card record.
     2. Attempt assign or replace with that number.
   - Expected Result:
     - Save is rejected.
     - Duplicate card number error is shown.

4. Member with existing active card cannot receive another active card
   - Steps:
     1. Select a member who already has an active card.
     2. Fill the remaining fields with valid values.
     3. Click `Assign Card`.
   - Expected Result:
     - Card is not assigned.
     - Error indicates the member already has an active card.

5. Inactive member cannot receive a card
   - Steps:
     1. Attempt card assignment for an inactive member through direct API test.
   - Expected Result:
     - The request is rejected.
     - Error indicates only an active member can receive a card.

6. Replace request is rejected for inactive card
   - Steps:
     1. Use an inactive card record.
     2. Attempt replacement with otherwise valid data.
   - Expected Result:
     - Replacement is rejected.
     - Error indicates only an active card can be replaced.

7. Replace request is rejected for expired card
   - Steps:
     1. Use an expired active card.
     2. Attempt replacement with valid new-card data.
   - Expected Result:
     - Replacement is rejected.
     - Error indicates expired card replacement is not allowed through active-card replacement flow.

## Edge Cases
1. Card number is normalized to uppercase
   - Steps:
     1. Assign or replace a card using lowercase or mixed-case letters.
   - Expected Result:
     - Returned/stored card number remains normalized consistently.

2. Replace button is disabled for inactive rows in UI
   - Steps:
     1. Open `Cards`.
     2. Locate an inactive card row.
   - Expected Result:
     - `Replace` action is visibly unavailable or disabled for inactive card rows.

3. Operational profile blocks use for inactive linked member or expired card
   - Steps:
     1. Use an ineligible card.
     2. Request the operational profile.
   - Expected Result:
     - `canUseInOperations` is false.
     - Blocking reason explains the actual issue.

## API Verification Steps
- Endpoint: `GET /api/v1/cards`
- Payload:
  1. Send a `GET` request to `/api/v1/cards`.
  2. Include header `Authorization: Bearer <valid token>`.
  3. Optionally add `search`, `status`, and `memberId` query parameters.
- Expected Response:
  - `200 OK` for allowed roles.
  - Card list is returned.
  - Filtering works with provided query parameters.

- Endpoint: `POST /api/v1/cards`
- Payload:
  1. Send a `POST` request to `/api/v1/cards`.
  2. Include header `Authorization: Bearer <valid token>`.
  3. Use approved valid QA values for `cardNumber`, `memberId`, `activatedAt`, and `expiresAt`.
- Expected Response:
  - `201 Created` for valid assignment.
  - `400 Bad Request` for invalid payload.
  - `409 Conflict` for duplicate card number, ineligible member, or existing active card.

- Endpoint: `PATCH /api/v1/cards/:cardId/replace`
- Payload:
  1. Send a `PATCH` request using a valid eligible card id.
  2. Include header `Authorization: Bearer <valid token>`.
  3. Use approved valid QA values for replacement `cardNumber`, `activatedAt`, and `expiresAt`.
- Expected Response:
  - `200 OK` for valid replacement.
  - `400 Bad Request` for invalid payload.
  - `409 Conflict` for duplicate number or ineligible replacement conditions.

## UI Verification Steps
- Page/Screen: `Cards`
- Steps:
  1. Open `Cards` from the sidebar.
  2. Verify the assign form, filters, and cards list are visible.
  3. Submit invalid values.
  4. Submit valid approved QA values.
  5. Use search, status, and member filters.
  6. Use `View` and `Replace`.
  7. Use `Reset` and `Refresh`.
- Expected Result:
  - Cards module opens for allowed roles.
  - Invalid submissions are blocked with clear validation.
  - Valid assignment and replacement succeed where allowed.
  - Filters, reset, refresh, and details modal behave correctly.
