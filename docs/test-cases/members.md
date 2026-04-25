# Module: Members
## Test Objectives
- Verify authenticated allowed roles can create and view member records.
- Verify member search and status filters work correctly.
- Verify member `View`, `Edit`, and `Activate` / `Mark Inactive` flows behave correctly.
- Verify member validation, duplicate mobile number checks, and status handling.
- Verify member detail, update, and operational profile rules remain correct.

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

3. Search members by full name or mobile number
   - Steps:
     1. Open `Members`.
     2. Use `Search Members`.
     3. Click `Apply Filters`.
   - Expected Result:
     - Matching member records are shown.

4. Filter members by status
   - Steps:
     1. Open `Members`.
     2. Select `Active` or `Inactive` in the status filter.
     3. Click `Apply Filters`.
   - Expected Result:
     - The list shows only records matching the selected status.

5. Reset member filters restores default listing
   - Steps:
     1. Apply filters.
     2. Click `Reset`.
   - Expected Result:
     - Filter inputs return to default values.
     - The members list reloads without previous filters.

6. Refresh button reloads members list with current filters
   - Steps:
     1. Apply a filter.
     2. Click `Refresh`.
   - Expected Result:
     - The list reloads successfully.
     - Currently applied filters remain effective.

7. View action opens member details modal
   - Steps:
     1. Open `Members`.
     2. Click `View` on a member row.
   - Expected Result:
     - Member details modal opens.
     - Member profile information is shown.

8. Edit action updates member successfully
   - Steps:
     1. Open `Members`.
     2. Click `Edit` on a member row.
     3. Update one or more safe fields.
     4. Click `Save Changes`.
   - Expected Result:
     - Member update succeeds.
     - Success message is shown.
     - Updated values appear in the list.

9. Mark member inactive successfully
   - Steps:
     1. Open `Members`.
     2. Click `Mark Inactive` on an active member row.
     3. Confirm the action.
   - Expected Result:
     - Member status changes to `Inactive`.
     - Member remains visible in the list.

10. Activate inactive member successfully
   - Steps:
     1. Open `Members`.
     2. Click `Activate` on an inactive member row.
     3. Confirm the action.
   - Expected Result:
     - Member status changes to `Active`.
     - Member remains visible in the list.

11. Fetch member operational profile for active member with eligible linked card
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

2. Member edit form rejects invalid mobile number format
   - Steps:
     1. Open `Members`.
     2. Click `Edit`.
     3. Enter an invalid mobile number.
     4. Click `Save Changes`.
   - Expected Result:
     - Member is not updated.
     - Mobile number validation is shown.

3. Duplicate mobile number is rejected
   - Steps:
     1. Use a mobile number already used by another active member.
     2. Attempt create or edit with that mobile number.
   - Expected Result:
     - Save is rejected.
     - Request error indicates the mobile number is already in use.

4. Update request with no recognized fields is rejected
   - Steps:
     1. Send a member update request with no valid member fields in the payload.
   - Expected Result:
     - The request is rejected.
     - Validation indicates at least one valid field must be provided.

5. Invalid member id is rejected
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

4. Member remains visible and manageable after status change
   - Steps:
     1. Mark a member inactive.
     2. Filter by `Inactive`.
     3. Use `View` or `Activate` on that same member.
   - Expected Result:
     - Member remains accessible in normal UI.
     - No hidden archive behavior exists.

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
  6. Use `View`, `Edit`, `Activate` / `Mark Inactive`.
  7. Use `Reset` and `Refresh`.
- Expected Result:
  - Members module opens for allowed roles.
  - Invalid submissions are blocked with clear validation.
  - Valid member create and update actions succeed.
  - Status lifecycle remains visible in the normal UI.
  - Filters, reset, and refresh behave correctly.
