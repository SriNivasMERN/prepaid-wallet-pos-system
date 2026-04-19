# Module: Members
## Test Objectives
- Verify authenticated allowed roles can create and view member records.
- Verify member search and status filters work correctly.
- Verify member validation, duplicate mobile number checks, and status handling.
- Verify member detail, update, and operational profile endpoints behave correctly.

## Preconditions
- Approved QA environment and approved QA test data are available for execution.

## Positive Test Cases
1. Allowed role can open Members module and load list
   - Steps:
     1. Log in as `Super Admin`, `Admin`, or `Cashier`.
     2. Open the dashboard.
     3. Click `Members` from the sidebar.
     4. Wait for the list to load.
   - Expected Result:
     - The `Create Member` form is visible.
     - The `Filters` section is visible.
     - The members list loads successfully.

2. Create member with valid data
   - Steps:
     1. Open `Members`.
     2. Enter approved valid QA values for `Full Name` and `Mobile Number`.
     3. Optionally enter `Reference Details`.
     4. Select a valid status.
     5. Click `Create Member`.
   - Expected Result:
     - Member creation succeeds.
     - Success message is shown.
     - The new member appears in the members list after reload.

3. Create member with empty reference details
   - Steps:
     1. Open `Members`.
     2. Enter valid values for `Full Name`, `Mobile Number`, and `Status`.
     3. Leave `Reference Details` empty.
     4. Click `Create Member`.
   - Expected Result:
     - Member creation succeeds.
     - The member is stored successfully even without reference details.

4. Search members by full name
   - Steps:
     1. Open `Members`.
     2. In `Search Members`, enter part of an existing member name.
     3. Click `Apply Filters`.
   - Expected Result:
     - The list refreshes.
     - Only matching member records are shown.

5. Search members by mobile number
   - Steps:
     1. Open `Members`.
     2. In `Search Members`, enter part or all of an existing mobile number.
     3. Click `Apply Filters`.
   - Expected Result:
     - Matching member records are shown.

6. Filter members by status
   - Steps:
     1. Open `Members`.
     2. Select `Active` or `Inactive` in the status filter.
     3. Click `Apply Filters`.
   - Expected Result:
     - The list shows only records matching the selected status.

7. Reset member filters restores default listing
   - Steps:
     1. Apply search and/or status filters.
     2. Click `Reset`.
   - Expected Result:
     - Filter inputs return to default values.
     - The members list reloads without the previous filters.

8. Refresh button reloads members list
   - Steps:
     1. Open `Members`.
     2. Click `Refresh` in the list section.
   - Expected Result:
     - The list reloads successfully.

9. Fetch member operational profile for active member with eligible linked card
   - Steps:
     1. Use a member record that has an active linked card and active member status.
     2. Request the operational profile for that member.
   - Expected Result:
     - Operational profile is returned.
     - `canUseCardOperations` is true.
     - Blocking reason is null.

## Negative Test Cases
1. Member form rejects empty required fields
   - Steps:
     1. Open `Members`.
     2. Leave `Full Name` and `Mobile Number` empty.
     3. Click `Create Member`.
   - Expected Result:
     - Member is not created.
     - Required validation messages are shown.

2. Member form rejects name shorter than minimum length
   - Steps:
     1. Enter a one-character name.
     2. Enter a valid mobile number.
     3. Select a valid status.
     4. Click `Create Member`.
   - Expected Result:
     - Member is not created.
     - Full name length validation is shown.

3. Member form rejects invalid mobile number format
   - Steps:
     1. Enter a valid full name.
     2. Enter a mobile number containing fewer than 10 digits, more than 15 digits, or non-digit characters.
     3. Select a valid status.
     4. Click `Create Member`.
   - Expected Result:
     - Member is not created.
     - Mobile number validation is shown.

4. Duplicate mobile number is rejected
   - Steps:
     1. Open `Members`.
     2. Enter a mobile number already used by another active member.
     3. Fill the remaining fields with valid values.
     4. Click `Create Member`.
   - Expected Result:
     - Member is not created.
     - Request error indicates the mobile number is already in use.

5. Update request with no recognized fields is rejected
   - Steps:
     1. Send a member update request with no valid member fields in the payload.
   - Expected Result:
     - The request is rejected.
     - Validation indicates at least one valid field must be provided.

6. Invalid member id is rejected
   - Steps:
     1. Request member detail, update, or operational profile using an invalid member id format.
   - Expected Result:
     - The request is rejected.
     - Member not found response is returned.

## Edge Cases
1. Search is case-insensitive for full name
   - Steps:
     1. Open `Members`.
     2. Search using different uppercase and lowercase combinations of an existing member name.
     3. Apply filters.
   - Expected Result:
     - Matching records are still returned.

2. Member becomes inactive while linked card is active
   - Steps:
     1. Use a member with an active linked card.
     2. Update the member status from `Active` to `Inactive`.
     3. Read the updated member and linked card state.
   - Expected Result:
     - Member status changes to `Inactive`.
     - Linked active card is updated to `Inactive`.

3. Operational profile blocks card operations for inactive member
   - Steps:
     1. Use an inactive member record.
     2. Request the operational profile.
   - Expected Result:
     - `canUseCardOperations` is false.
     - Blocking reason explains that the member is inactive.

4. Operational profile blocks card operations when no linked card exists
   - Steps:
     1. Use an active member with no linked card.
     2. Request the operational profile.
   - Expected Result:
     - `hasLinkedCard` is false.
     - Blocking reason explains that the member does not have a linked card.

## API Verification Steps
- Endpoint: `GET /api/v1/members`
- Payload:
  1. Send a `GET` request to `/api/v1/members`.
  2. Include header `Authorization: Bearer <valid token>`.
  3. Optionally add `search` and `status` query parameters.
- Expected Response:
  - `200 OK` for allowed roles.
  - Member list is returned.
  - Filtering works with search and status parameters.

- Endpoint: `POST /api/v1/members`
- Payload:
  1. Send a `POST` request to `/api/v1/members`.
  2. Include header `Authorization: Bearer <valid token>`.
  3. Use approved valid QA values for `fullName`, `mobileNumber`, `referenceDetails`, and `status`.
- Expected Response:
  - `201 Created` for valid payload.
  - `400 Bad Request` for invalid payload.
  - `409 Conflict` for duplicate mobile number.

- Endpoint: `GET /api/v1/members/:memberId`
- Payload:
  1. Send a `GET` request using a valid member id.
  2. Include header `Authorization: Bearer <valid token>`.
- Expected Response:
  - `200 OK` for a valid existing member.
  - `404 Not Found` for missing or invalid member id.

- Endpoint: `PATCH /api/v1/members/:memberId`
- Payload:
  1. Send a `PATCH` request using a valid member id.
  2. Include header `Authorization: Bearer <valid token>`.
  3. Send at least one valid member field to update.
- Expected Response:
  - `200 OK` for valid update.
  - `400 Bad Request` for invalid or empty update payload.
  - `409 Conflict` for duplicate mobile number.

- Endpoint: `GET /api/v1/members/:memberId/operational-profile`
- Payload:
  1. Send a `GET` request using a valid member id.
  2. Include header `Authorization: Bearer <valid token>`.
- Expected Response:
  - `200 OK` with operational profile fields for valid member.
  - `404 Not Found` for missing or invalid member id.

## UI Verification Steps
- Page/Screen: `Members`
- Steps:
  1. Open `Members` from the sidebar.
  2. Verify the create form, filters, and members list are visible.
  3. Submit invalid values.
  4. Submit valid approved QA values.
  5. Use search and status filters.
  6. Use `Reset` and `Refresh`.
- Expected Result:
  - Members module opens for allowed roles.
  - Invalid submissions are blocked with clear validation.
  - Valid member creation succeeds.
  - Filters, reset, and refresh behave correctly.
