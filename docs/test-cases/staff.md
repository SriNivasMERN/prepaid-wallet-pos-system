# Module: Staff
## Test Objectives
- Verify only authenticated `Super Admin` and `Admin` users can open the Staff module.
- Verify staff creation follows role-based restrictions.
- Verify the staff list shows the correct records based on the logged-in role.
- Verify staff form validation, duplicate username handling, and status handling.

## Preconditions
- Approved QA environment and approved QA test data are available for execution.

## Positive Test Cases
1. Super Admin can open Staff module and load staff list
   - Steps:
     1. Log in as a `Super Admin`.
     2. Open the dashboard.
     3. Click `Staff` from the sidebar.
     4. Wait for the list to load.
   - Expected Result:
     - The `Create Staff Account` form is visible.
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
     - The staff list loads.
     - Only visible allowed records for the `Admin` role are shown.

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

4. Super Admin can create a Cashier account
   - Steps:
     1. Log in as a `Super Admin`.
     2. Open `Staff`.
     3. Fill the form with approved valid QA values.
     4. Select `Cashier` as role.
     5. Click `Create Staff`.
   - Expected Result:
     - Staff account creation succeeds.
     - The new Cashier record appears in the staff list.

5. Admin can create a Cashier account
   - Steps:
     1. Log in as an `Admin`.
     2. Open `Staff`.
     3. Fill the form with approved valid QA values.
     4. Confirm the available role option is `Cashier`.
     5. Click `Create Staff`.
   - Expected Result:
     - Staff account creation succeeds.
     - The new Cashier record appears in the staff list.

6. Reset clears the Staff form
   - Steps:
     1. Open `Staff`.
     2. Type values into the form fields.
     3. Click `Reset`.
   - Expected Result:
     - Form fields return to their initial values.
     - Previous field errors and request messages are cleared.

## Negative Test Cases
1. Staff form rejects empty required fields
   - Steps:
     1. Open `Staff`.
     2. Leave `Full Name`, `Username`, and `Password` empty.
     3. Click `Create Staff`.
   - Expected Result:
     - Staff account is not created.
     - Required validation messages are shown.

2. Staff form rejects username shorter than minimum length
   - Steps:
     1. Enter a valid full name.
     2. Enter a username shorter than 3 characters.
     3. Enter a valid password.
     4. Choose a valid role and status.
     5. Click `Create Staff`.
   - Expected Result:
     - Account is not created.
     - Username length validation is shown.

3. Staff form rejects password shorter than minimum length
   - Steps:
     1. Enter a valid full name.
     2. Enter a valid username.
     3. Enter a password shorter than 8 characters.
     4. Choose a valid role and status.
     5. Click `Create Staff`.
   - Expected Result:
     - Account is not created.
     - Password length validation is shown.

4. Duplicate username is rejected
   - Steps:
     1. Open `Staff`.
     2. Enter a username already used by an active staff account.
     3. Fill the other fields with valid values.
     4. Click `Create Staff`.
   - Expected Result:
     - Account is not created.
     - Request error indicates the username is already in use.

5. Admin cannot create an Admin account
   - Steps:
     1. Log in as an `Admin`.
     2. Open `Staff`.
     3. Try to create an `Admin` account through the available UI or direct API test.
   - Expected Result:
     - The action is not allowed.
     - If tested through API, the request is rejected with role-based access error.

6. Cashier cannot access Staff module
   - Steps:
     1. Log in as a `Cashier`.
     2. Open the dashboard.
     3. Check the sidebar and attempt to access `Staff`.
   - Expected Result:
     - `Staff` is not available as an allowed module.
     - Cashier cannot use staff management routes successfully.

## Edge Cases
1. Username entered with uppercase letters is normalized
   - Steps:
     1. Open `Staff`.
     2. Enter a new username using uppercase or mixed-case letters.
     3. Complete the rest of the form with valid values.
     4. Create the account.
   - Expected Result:
     - Account is created successfully.
     - Stored and returned username remains normalized consistently.

2. Admin staff list is limited to Cashier records
   - Steps:
     1. Log in as an `Admin`.
     2. Open `Staff`.
     3. Review the list content.
   - Expected Result:
     - The list does not expose higher-role records beyond the allowed scope.

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
- Expected Response:
  - `200 OK` for authorized `Super Admin` and `Admin`.
  - Staff records are returned.
  - Unauthorized or lower-role access is rejected.

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

## UI Verification Steps
- Page/Screen: `Staff`
- Steps:
  1. Log in as an allowed role.
  2. Open `Staff` from the sidebar.
  3. Verify the create form and staff list are displayed.
  4. Submit invalid values.
  5. Submit valid approved QA values.
  6. Use `Reset`.
- Expected Result:
  - Staff module opens only for allowed roles.
  - Invalid form submissions are blocked.
  - Valid submissions create staff successfully.
  - Reset restores the form state.
