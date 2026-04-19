# Module: Cards
## Test Objectives
- Verify allowed roles can assign cards to eligible members.
- Verify card list, search, member filter, and status filter work correctly.
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

2. Active member appears in member dropdown for card assignment
   - Steps:
     1. Open `Cards`.
     2. Open the `Member` dropdown in the assign form.
   - Expected Result:
     - Eligible active members are available for selection.
     - The dropdown loads without error.

3. Assign card with valid data
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

4. Search cards by card number
   - Steps:
     1. Open `Cards`.
     2. In `Search Cards`, enter part or all of an existing card number.
     3. Click `Apply Filters`.
   - Expected Result:
     - Matching card records are shown in the list.

5. Search cards by member name or mobile number
   - Steps:
     1. Open `Cards`.
     2. In `Search Cards`, enter part of an existing member name or mobile number.
     3. Click `Apply Filters`.
   - Expected Result:
     - Matching card records are shown.

6. Filter cards by status
   - Steps:
     1. Open `Cards`.
     2. Select `Active` or `Inactive` in the status filter.
     3. Click `Apply Filters`.
   - Expected Result:
     - The list shows only records matching the selected status.

7. Filter cards by member
   - Steps:
     1. Open `Cards`.
     2. Select a member in the member filter.
     3. Click `Apply Filters`.
   - Expected Result:
     - The list shows only cards linked to the selected member.

8. Reset card filters restores default listing
   - Steps:
     1. Apply one or more card filters.
     2. Click `Reset`.
   - Expected Result:
     - Filter inputs return to default values.
     - The cards list reloads without the previous filters.

9. Card operational profile is returned for usable active card
   - Steps:
     1. Use an active card linked to an active member and not expired.
     2. Request the card operational profile.
   - Expected Result:
     - Operational profile is returned.
     - `canUseInOperations` is true.
     - Blocking reason is null.

10. Replace an eligible active card successfully
   - Steps:
     1. Use an active, non-expired card linked to an active member.
     2. Send a valid replace request with a new approved card number and valid dates.
   - Expected Result:
     - Card replacement succeeds.
     - Old card becomes `Inactive`.
     - Replacement card becomes `Active`.
     - Member remains linked to the replacement card.

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
     3. Enter valid dates where `Expires At` is earlier than or equal to `Activated At`.
     4. Click `Assign Card`.
   - Expected Result:
     - Card is not assigned.
     - Date validation error is shown.

3. Duplicate card number is rejected
   - Steps:
     1. Open `Cards`.
     2. Enter a card number already used by another card record.
     3. Fill the remaining fields with valid values.
     4. Click `Assign Card`.
   - Expected Result:
     - Card is not assigned.
     - Request error indicates the card number is already in use.

4. Member with existing active card cannot receive another active card
   - Steps:
     1. Select a member who already has an active card.
     2. Fill the remaining fields with valid values.
     3. Click `Assign Card`.
   - Expected Result:
     - Card is not assigned.
     - Request error indicates the member already has an active card.

5. Inactive member cannot receive a card
   - Steps:
     1. Attempt card assignment for an inactive member through direct API test.
   - Expected Result:
     - The request is rejected.
     - Error indicates only an active member can receive a card.

6. Replace request is rejected for inactive card
   - Steps:
     1. Use an inactive card record.
     2. Send a replace request with otherwise valid data.
   - Expected Result:
     - Replacement is rejected.
     - Error indicates only an active card can be replaced.

7. Replace request is rejected for expired card
   - Steps:
     1. Use an expired active card.
     2. Send a replace request with valid new-card data.
   - Expected Result:
     - Replacement is rejected.
     - Error indicates expired card replacement is not allowed through active-card replacement flow.

## Edge Cases
1. Card number is normalized to uppercase
   - Steps:
     1. Open `Cards`.
     2. Enter a valid card number using lowercase or mixed-case letters.
     3. Complete the remaining fields with valid values.
     4. Assign the card.
   - Expected Result:
     - Card assignment succeeds.
     - Returned/stored card number remains normalized consistently.

2. Operational profile blocks use for inactive linked member
   - Steps:
     1. Use a card linked to an inactive member.
     2. Request the operational profile.
   - Expected Result:
     - `canUseInOperations` is false.
     - Blocking reason explains that the linked member is inactive.

3. Operational profile blocks use for expired card
   - Steps:
     1. Use an expired card linked to an active member.
     2. Request the operational profile.
   - Expected Result:
     - `canUseInOperations` is false.
     - Blocking reason explains that the card is expired.

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

- Endpoint: `GET /api/v1/cards/:cardId`
- Payload:
  1. Send a `GET` request using a valid card id.
  2. Include header `Authorization: Bearer <valid token>`.
- Expected Response:
  - `200 OK` for valid existing card.
  - `404 Not Found` for missing or invalid card id.

- Endpoint: `GET /api/v1/cards/:cardId/operational-profile`
- Payload:
  1. Send a `GET` request using a valid card id.
  2. Include header `Authorization: Bearer <valid token>`.
- Expected Response:
  - `200 OK` with operational profile for valid card.
  - `404 Not Found` for missing or invalid card id.

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
  6. Use `Reset` and `Refresh`.
- Expected Result:
  - Cards module opens for allowed roles.
  - Invalid submissions are blocked with clear validation.
  - Valid assignment succeeds.
  - Filters, reset, and refresh behave correctly.
