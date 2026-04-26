# Module: Staff
## Test Objectives
- Verify only authenticated `Super Admin` and `Admin` users can open the Staff module.
- Verify staff creation follows role-based restrictions.
- Verify staff list search, role filter, status filter, reset, and refresh work correctly.
- Verify staff `View`, `Edit`, and `Activate` / `Mark Inactive` flows behave correctly.
- Verify controlled `Reset Password` flow behaves correctly for manageable staff targets.
- Verify backend hierarchy protections block unsafe staff updates.

## Preconditions
- Approved QA environment and approved QA test data are available for execution.
- At least one `Super Admin` QA account and one `Admin` QA account are available.
- At least one manageable `Cashier` record exists for `Admin`-level verification.

## Positive Test Cases
1. Super Admin can open Staff module and load staff list
   - Steps:
     1. Log in as a `Super Admin`.
     2. Open the dashboard.
     3. Click `Staff` from the sidebar.
     4. Wait for the list to load.
   - Expected Result:
     - The `Create Staff Account` form is visible.
     - The `Filters` section is visible.
     - The `Staff List` section is visible.
     - Existing staff records load successfully.

2. Admin can open Staff module and view allowed staff list
   - Steps:
     1. Log in as an `Admin`.
     2. Open the dashboard.
     3. Click `Staff`.
     4. Wait for the list to load.
   - Expected Result:
     - The Staff module opens successfully.
     - The list loads.
     - Only allowed visible records for the `Admin` role are shown.

3. Super Admin can create an Admin account
   - Steps:
     1. Log in as a `Super Admin`.
     2. Open `Staff`.
     3. Enter approved valid QA values in `Full Name`, `Username`, and `Password`.
     4. Select `Admin` as role.
     5. Keep or select a valid status.
     6. Click `Create Staff`.
   - Expected Result:
     - Staff account creation succeeds.
     - Success message is shown.
     - The new record appears in the staff list.

4. Admin can create a Cashier account
   - Steps:
     1. Log in as an `Admin`.
     2. Open `Staff`.
     3. Fill the form with approved valid QA values.
     4. Confirm the available role option is `Cashier`.
     5. Click `Create Staff`.
   - Expected Result:
     - Staff account creation succeeds.
     - The new Cashier record appears in the staff list.

5. Search staff by full name or username
   - Steps:
     1. Open `Staff`.
     2. In `Search Staff`, enter part of an existing full name or username.
     3. Click `Apply Filters`.
   - Expected Result:
     - Matching staff rows are shown.

6. Filter staff by role
   - Steps:
     1. Open `Staff`.
     2. Select a role in the `Role` filter.
     3. Click `Apply Filters`.
   - Expected Result:
     - Only staff records matching the selected role are shown.

7. Filter staff by status
   - Steps:
     1. Open `Staff`.
     2. Select `Active` or `Inactive` in the `Status` filter.
     3. Click `Apply Filters`.
   - Expected Result:
     - Only staff records with the selected status are shown.

8. Reset staff filters restores default listing
   - Steps:
     1. Apply one or more filters in `Staff`.
     2. Click `Reset`.
   - Expected Result:
     - Filter inputs return to default values.
     - The staff list reloads without previous filters.

9. Refresh reloads the staff list with current filters
   - Steps:
     1. Apply a filter in `Staff`.
     2. Click `Refresh`.
   - Expected Result:
     - The list reloads successfully.
     - The currently applied filters remain effective.

10. View action opens staff details modal
   - Steps:
     1. Open `Staff`.
     2. Click the `View` action on a staff row.
   - Expected Result:
     - `Staff Details` modal opens.
     - Full name, username, role, status, and created-by information are shown.

11. Edit action updates a manageable staff account successfully
   - Steps:
     1. Open `Staff`.
     2. Click `Edit` on a manageable staff row.
     3. Update one or more safe fields such as `Full Name`, `Username`, `Role`, or `Status`.
     4. Click `Save Changes`.
   - Expected Result:
     - Staff update succeeds.
     - Success message is shown.
     - Updated values appear in the staff list.

12. Mark staff inactive successfully
   - Steps:
     1. Open `Staff`.
     2. Click `Mark Inactive` on an active manageable staff row.
     3. Confirm the action.
   - Expected Result:
     - Status changes to `Inactive`.
     - Staff record remains visible in the list.

13. Activate inactive staff successfully
   - Steps:
     1. Open `Staff`.
     2. Click `Activate` on an inactive manageable staff row.
     3. Confirm the action.
   - Expected Result:
     - Status changes to `Active`.
     - Staff record remains visible in the list.

14. Reset password succeeds for a manageable staff account
   - Steps:
     1. Open `Staff`.
     2. Click `Reset Password` on a manageable staff row.
     3. Enter valid approved QA values in `New Password` and `Confirm Password`.
     4. Submit the reset.
   - Expected Result:
     - Password reset succeeds.
     - Success message is shown.
     - Role and status remain unchanged.

## Negative Test Cases
1. Staff form rejects empty required fields
   - Steps:
     1. Open `Staff`.
     2. Leave `Full Name`, `Username`, and `Password` empty.
     3. Click `Create Staff`.
   - Expected Result:
     - Staff account is not created.
     - Required validation messages are shown.

2. Staff edit form rejects empty required fields
   - Steps:
     1. Open `Staff`.
     2. Click `Edit` on a staff row.
     3. Clear `Full Name` or `Username`.
     4. Click `Save Changes`.
   - Expected Result:
     - Staff account is not updated.
     - Validation messages are shown.

3. Duplicate username is rejected on create or edit
   - Steps:
     1. Use an existing active staff username.
     2. Attempt create or edit with that same username on another record.
   - Expected Result:
     - Save is rejected.
     - Request error indicates username is already in use.

4. Admin cannot create or assign `Admin` role
   - Steps:
     1. Log in as an `Admin`.
     2. Attempt to create or update a staff account with role `Admin`.
   - Expected Result:
     - The action is not allowed.
     - Role-based access error is returned.

5. Admin cannot manage non-cashier staff through API
   - Steps:
     1. Log in as an `Admin`.
     2. Send a staff update request for a non-cashier target.
   - Expected Result:
     - The request is rejected with role-boundary access error.

6. Super Admin account cannot be edited from staff management
   - Steps:
     1. Send an update request targeting a `Super Admin` account.
   - Expected Result:
     - The request is rejected.
     - Error indicates super-admin accounts are not editable from staff management.

7. Logged-in user cannot edit their own account through staff management
   - Steps:
     1. Send an update request targeting the currently logged-in staff account.
   - Expected Result:
     - The request is rejected.
     - Error indicates a dedicated profile flow is required.

8. Cashier cannot access Staff module
   - Steps:
     1. Log in as a `Cashier`.
     2. Open the dashboard.
     3. Check the sidebar and attempt to access `Staff`.
   - Expected Result:
     - `Staff` is not available as an allowed module.
     - Staff routes are rejected for cashier role.

9. Reset password rejects mismatched or too-short new password
   - Steps:
     1. Open `Staff`.
     2. Click `Reset Password` on a manageable staff row.
     3. Enter a too-short password or mismatched confirm value.
     4. Submit the reset.
   - Expected Result:
     - Password reset is rejected.
     - Validation messages are shown.

10. Admin cannot reset password for non-manageable target
    - Steps:
      1. Log in as an `Admin`.
      2. Attempt a password reset request for a non-cashier target.
    - Expected Result:
      - The request is rejected with hierarchy or access error.

11. Logged-in user cannot reset own password through Staff management
    - Steps:
      1. Send a staff password reset request targeting the currently logged-in account.
    - Expected Result:
      - The request is rejected.
      - Error indicates a dedicated self-service flow is required.

## Edge Cases
1. Username entered with uppercase letters is normalized
   - Steps:
     1. Open `Staff`.
     2. Enter a username using uppercase or mixed-case letters.
     3. Create or update the account.
   - Expected Result:
     - Operation succeeds when otherwise valid.
     - Stored and returned username remains normalized consistently.

2. Admin staff list is limited to cashier records
   - Steps:
     1. Log in as an `Admin`.
     2. Open `Staff`.
     3. Review the list and filter options.
   - Expected Result:
     - Higher-role records are not exposed in the visible list.
     - Role filter remains aligned to allowed visible records.

3. New staff account can be created with `Inactive` status
   - Steps:
     1. Open `Staff`.
     2. Fill valid form data.
     3. Select `Inactive` as status.
     4. Create the account.
   - Expected Result:
     - Account is created successfully.
     - The new record shows `Inactive` in the staff list.

## API Verification Steps
- Endpoint: `GET /api/v1/staff`
- Payload:
  1. Send a `GET` request to `/api/v1/staff`.
  2. Include header `Authorization: Bearer <valid token>`.
  3. Optionally add `search`, `role`, and `status` query parameters.
- Expected Response:
  - `200 OK` for authorized `Super Admin` and `Admin`.
  - Staff records are returned.
  - Filtering works with provided query parameters.

- Endpoint: `POST /api/v1/staff`
- Payload:
  1. Send a `POST` request to `/api/v1/staff`.
  2. Include header `Authorization: Bearer <valid token>`.
  3. Use approved valid QA values for `fullName`, `username`, `password`, `role`, and `status`.
- Expected Response:
  - `201 Created` for allowed staff creation.
  - `400 Bad Request` for invalid payload.
  - `403 Forbidden` when the current role is not allowed to create the requested role.
  - `409 Conflict` for duplicate username.

- Endpoint: `PATCH /api/v1/staff/:staffId`
- Payload:
  1. Send a `PATCH` request to `/api/v1/staff/:staffId`.
  2. Include header `Authorization: Bearer <valid token>`.
  3. Send valid editable fields: `fullName`, `username`, `role`, `status`.
- Expected Response:
  - `200 OK` for valid allowed update.
  - `400 Bad Request` for invalid payload.
  - `403 Forbidden` for hierarchy violations, self-edit attempts, or super-admin target.
  - `404 Not Found` for invalid or missing staff id.
  - `409 Conflict` for duplicate username.

- Endpoint: `PATCH /api/v1/staff/:staffId/reset-password`
- Payload:
  1. Send a `PATCH` request to `/api/v1/staff/:staffId/reset-password`.
  2. Include header `Authorization: Bearer <valid token>`.
  3. Use approved valid QA values for `newPassword` and `confirmPassword`.
- Expected Response:
  - `200 OK` for valid reset on a manageable target.
  - `400 Bad Request` for invalid password input.
  - `403 Forbidden` for hierarchy violations or self-target reset attempts.
  - `404 Not Found` for invalid or missing staff id.

## UI Verification Steps
- Page/Screen: `Staff`
- Steps:
  1. Log in as an allowed role.
  2. Open `Staff` from the sidebar.
  3. Verify the create form, filters, and staff list are displayed.
  4. Submit invalid values in create and edit flows.
  5. Submit valid approved QA values.
  6. Use search, role, and status filters.
  7. Use `View`, `Edit`, `Reset Password`, `Activate` / `Mark Inactive`.
  8. Use `Reset` and `Refresh`.
- Expected Result:
  - Staff module opens only for allowed roles.
  - Invalid form submissions are blocked.
  - Valid create and update actions succeed for allowed targets only.
  - Filters, reset, refresh, and modal actions behave correctly.
  - Password reset is available only for manageable staff targets.
