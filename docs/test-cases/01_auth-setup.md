# Module: Auth & Setup
## Test Objectives
- Verify the application opens the correct entry screen based on setup completion state.
- Verify the first Super Admin account can be created only during first-time setup.
- Verify login succeeds only for valid active staff credentials.
- Verify invalid login and invalid setup attempts are rejected correctly.
- Verify protected access to the current authenticated staff session.
- Verify authenticated staff can manage their own account through `My Account`.
- Verify logout and password-change session handling invalidate old session tokens correctly.

## Preconditions
- Approved QA environment and approved QA test data are available for execution.

## Positive Test Cases
1. First-time setup screen opens when setup is incomplete
   - Steps:
     1. Open the application in the browser.
     2. Wait until the loading state finishes.
     3. Observe the screen shown to the user.
   - Expected Result:
     - The application opens the `First-Time Setup` screen.
     - The screen shows `Full Name`, `Username`, `Password`, and `Confirm Password` fields.

2. First Super Admin account is created successfully
   - Steps:
     1. Open the `First-Time Setup` screen.
     2. Enter approved valid QA values in all fields.
     3. Click `Create Account`.
     4. Wait for the next screen.
   - Expected Result:
     - The setup request completes successfully.
     - The application redirects to the `Login` screen.
     - No validation or request error remains on screen.

3. Login screen opens after setup is completed
   - Steps:
     1. Complete first-time setup successfully.
     2. Refresh the browser or reopen the application.
     3. Observe the first screen shown.
   - Expected Result:
     - The application opens the `Login` screen.
     - The application does not return to the `First-Time Setup` screen.

4. Login succeeds with valid active staff account
   - Steps:
     1. Open the `Login` screen.
     2. Enter approved valid credentials for an active staff account.
     3. Click `Sign In`.
     4. Wait for the next screen.
   - Expected Result:
     - Login succeeds.
     - The application redirects to `/dashboard`.
     - No login error message is shown.

5. Logged-in session stays active after browser refresh
   - Steps:
     1. Log in successfully.
     2. Refresh the browser while on the dashboard.
     3. Wait until the page reloads fully.
   - Expected Result:
     - The application verifies the stored session.
     - The dashboard remains accessible after refresh.

6. Current staff profile is returned for a valid authenticated session
   - Steps:
     1. Log in with a valid active staff account.
     2. Use the returned token in the authenticated profile API request.
     3. Send the request.
   - Expected Result:
     - The request succeeds.
     - The response returns the current staff profile with role, status, allowed modules, and allowed permissions.

7. Logged-in active user can update own profile through `My Account`
   - Steps:
     1. Log in with a valid active staff account.
     2. Open `My Account`.
     3. Update `Full Name` or `Username` with approved valid QA values.
     4. Save the profile.
   - Expected Result:
     - Profile update succeeds.
     - Success message is shown.
     - Updated profile values are reflected in the current session view.

8. Logged-in active user can change own password through `My Account`
   - Steps:
     1. Log in with a valid active staff account.
     2. Open `My Account`.
     3. Enter valid values for `Current Password`, `New Password`, and `Confirm Password`.
     4. Submit the password change.
   - Expected Result:
     - Password update succeeds.
     - Success message is shown.
     - Current session remains usable with the refreshed session returned by the backend.

9. Logout invalidates the active session
   - Steps:
     1. Log in with a valid active staff account.
     2. Capture the active session token for API verification.
     3. Click `Logout`.
     4. Attempt to use the previously captured token for `GET /api/v1/auth/me`.
   - Expected Result:
     - Logout completes successfully.
     - The browser session is cleared.
     - The previously captured token is rejected after logout.

## Negative Test Cases
1. Setup form rejects submission when all fields are empty
   - Steps:
     1. Open the `First-Time Setup` screen.
     2. Leave all fields empty.
     3. Click `Create Account`.
   - Expected Result:
     - The account is not created.
     - Required validation messages are shown on the form.

2. Setup form rejects username shorter than minimum length
   - Steps:
     1. Enter a valid full name.
     2. Enter a username shorter than 3 characters.
     3. Enter valid matching password values.
     4. Click `Create Account`.
   - Expected Result:
     - The request is blocked or rejected.
     - The form shows the minimum length validation for username.

3. Setup form rejects password shorter than minimum length
   - Steps:
     1. Enter a valid full name.
     2. Enter a valid username.
     3. Enter a password shorter than 8 characters.
     4. Enter the same short value in `Confirm Password`.
     5. Click `Create Account`.
   - Expected Result:
     - The account is not created.
     - The form shows the minimum length validation for password.

4. Setup form rejects mismatched password confirmation
   - Steps:
     1. Enter valid values in `Full Name`, `Username`, and `Password`.
     2. Enter a different value in `Confirm Password`.
     3. Click `Create Account`.
   - Expected Result:
     - The account is not created.
     - The form shows `Passwords do not match.`

5. Setup is rejected after it has already been completed
   - Steps:
     1. Complete first-time setup successfully.
     2. Attempt the setup request again using approved QA data.
   - Expected Result:
     - The repeated setup request is rejected.
     - A second initial Super Admin account is not created.

6. Login form rejects empty username and password
   - Steps:
     1. Open the `Login` screen.
     2. Leave `Username` and `Password` empty.
     3. Click `Sign In`.
   - Expected Result:
     - Login does not proceed.
     - Required validation messages are shown for both fields.

7. Login fails with incorrect credentials
   - Steps:
     1. Open the `Login` screen.
     2. Enter an incorrect username, incorrect password, or both.
     3. Click `Sign In`.
   - Expected Result:
     - Login fails.
     - The user remains on the `Login` screen.
     - A request error message is shown.

8. Login fails for inactive staff account
   - Steps:
     1. Open the `Login` screen.
     2. Enter valid credentials for an inactive staff account.
     3. Click `Sign In`.
   - Expected Result:
     - Login fails.
     - The user remains on the `Login` screen.
     - The request error indicates the account is inactive or login is not allowed.

9. Authenticated profile request fails without bearer token
   - Steps:
     1. Send the current staff profile request without an `Authorization` header.
   - Expected Result:
     - The request is rejected.
     - The response indicates authentication is required.

10. Dashboard route is blocked when the user is not logged in
   - Steps:
     1. Make sure there is no valid logged-in session.
     2. Open `/dashboard` directly in the browser.
   - Expected Result:
     - The dashboard is not shown.
     - The application redirects to `/login` when setup is already complete.

11. `My Account` profile update rejects duplicate username
   - Steps:
     1. Log in with a valid active staff account.
     2. Open `My Account`.
     3. Enter a username already used by another staff account.
     4. Save the profile.
   - Expected Result:
     - Profile update is rejected.
     - Duplicate-username error is shown.

12. `My Account` password change rejects incorrect current password
   - Steps:
     1. Log in with a valid active staff account.
     2. Open `My Account`.
     3. Enter an incorrect `Current Password`.
     4. Enter valid new password values.
     5. Submit the password change.
   - Expected Result:
     - Password update is rejected.
     - Error indicates the current password is incorrect.

13. `My Account` password change rejects invalid new password input
   - Steps:
     1. Log in with a valid active staff account.
     2. Open `My Account`.
     3. Enter a too-short new password or mismatched confirm password.
     4. Submit the password change.
   - Expected Result:
     - Password update is rejected.
     - Field validation is shown.

14. Old token is rejected after password change
   - Steps:
     1. Log in with a valid active staff account.
     2. Capture the current token.
     3. Change password successfully through `My Account`.
     4. Use the old captured token for `GET /api/v1/auth/me`.
   - Expected Result:
     - Password change succeeds and the current browser session remains usable.
     - The old token is rejected.

## Edge Cases
1. Username is entered with different letter casing
   - Steps:
     1. Create or use an account with an approved QA username.
     2. On the `Login` screen, enter the same username using different uppercase and lowercase letters.
     3. Enter the correct password.
     4. Click `Sign In`.
   - Expected Result:
     - Login succeeds if the credentials are otherwise valid.
     - Username handling remains consistent across casing variations.

2. User refreshes immediately after successful login
   - Steps:
     1. Log in successfully.
     2. Refresh the browser immediately after the dashboard appears.
   - Expected Result:
     - The application reloads safely.
     - The session remains valid and the dashboard remains accessible.

3. Saved session becomes invalid before refresh
   - Steps:
     1. Log in successfully.
     2. Invalidate the session according to approved QA preparation.
     3. Refresh the browser.
   - Expected Result:
     - The saved session is no longer accepted.
     - The application requires the user to log in again.

4. Logged-in user manually opens the login route
   - Steps:
     1. Log in successfully.
     2. Enter `/login` in the browser address bar.
   - Expected Result:
     - The application redirects the user to `/dashboard`.

5. Profile update changes session-visible account identity immediately
   - Steps:
     1. Log in successfully.
     2. Open `My Account`.
     3. Update `Full Name` or `Username`.
     4. Save the profile and observe the dashboard header or session-visible account area.
   - Expected Result:
     - Updated account information is reflected immediately without requiring a fresh login.

## API Verification Steps
- Endpoint: `GET /api/v1/auth/setup-status`
- Payload:
  1. Send a `GET` request to `/api/v1/auth/setup-status`.
- Expected Response:
  - Response status is `200`.
  - The response returns `isSetupComplete`.
  - The value is `false` before first-time setup and `true` after setup completion.

- Endpoint: `POST /api/v1/auth/setup`
- Payload:
  1. Send a `POST` request to `/api/v1/auth/setup`.
  2. Use approved valid QA values for `fullName`, `username`, `password`, and `confirmPassword`.
- Expected Response:
  - Response status is `201` for a valid first-time setup request.
  - The response returns created staff details.
  - Repeated setup or invalid payloads are rejected.

- Endpoint: `POST /api/v1/auth/login`
- Payload:
  1. Send a `POST` request to `/api/v1/auth/login`.
  2. Use approved valid QA login credentials.
- Expected Response:
  - Response status is `200` for valid active credentials.
  - The response returns a token and staff session data.
  - Invalid credentials or inactive account attempts are rejected.

- Endpoint: `POST /api/v1/auth/logout`
- Payload:
  1. Send a `POST` request to `/api/v1/auth/logout`.
  2. Include header `Authorization: Bearer <valid token>`.
- Expected Response:
  - Response status is `200` for a valid active session.
  - The active token is invalidated for future authenticated requests.
  - Missing, invalid, expired, or already invalidated token requests are rejected.

- Endpoint: `GET /api/v1/auth/me`
- Payload:
  1. Send a `GET` request to `/api/v1/auth/me`.
  2. Include header `Authorization: Bearer <valid token>`.
- Expected Response:
  - Response status is `200` for a valid active session.
  - Missing, invalid, or expired token requests are rejected.

- Endpoint: `PATCH /api/v1/auth/me/profile`
- Payload:
  1. Send a `PATCH` request to `/api/v1/auth/me/profile`.
  2. Include header `Authorization: Bearer <valid token>`.
  3. Use approved valid QA values for `fullName` and `username`.
- Expected Response:
  - Response status is `200` for a valid profile update.
  - Updated current staff profile is returned.
  - Invalid payload, duplicate username, or invalid session requests are rejected.

- Endpoint: `PATCH /api/v1/auth/me/password`
- Payload:
  1. Send a `PATCH` request to `/api/v1/auth/me/password`.
  2. Include header `Authorization: Bearer <valid token>`.
  3. Use approved valid QA values for `currentPassword`, `newPassword`, and `confirmPassword`.
- Expected Response:
  - Response status is `200` for a valid password change.
  - The response returns a refreshed token and staff session data.
  - Invalid payload, incorrect current password, or invalid session requests are rejected.

## UI Verification Steps
- Page/Screen: First-Time Setup
- Steps:
  1. Open the application when setup is incomplete.
  2. Confirm the `First-Time Setup` screen appears.
  3. Test invalid field combinations one by one.
  4. Submit valid approved QA values.
  5. Confirm the application redirects to `Login`.
- Expected Result:
  - The setup screen appears only before setup completion.
  - Field validation is shown correctly.
  - Valid setup redirects the user to `Login`.

- Page/Screen: Login
- Steps:
  1. Open the `Login` screen after setup completion.
  2. Test empty input.
  3. Test incorrect credentials.
  4. Test valid approved QA credentials.
  5. Refresh after successful login.
- Expected Result:
  - Empty input is blocked.
  - Invalid login is rejected.
  - Valid login redirects to the dashboard.
  - Refresh keeps the session active when valid.

- Page/Screen: Route Protection
- Steps:
  1. Open `/dashboard` without login.
  2. Log in and open `/dashboard` again.
  3. While logged in, open `/login`.
- Expected Result:
  - Unauthenticated users cannot access the dashboard.
  - Authenticated users can access the dashboard.
  - Logged-in users are redirected away from the login screen.

- Page/Screen: `My Account`
- Steps:
  1. Log in with a valid active staff account.
  2. Open `My Account`.
  3. Update valid profile values and save.
  4. Submit invalid profile values such as duplicate username.
  5. Submit valid and invalid password-change combinations.
- Expected Result:
  - Profile and password actions are available only for the current authenticated user.
  - Valid self-service updates succeed.
  - Invalid profile and password updates are blocked with clear validation or request errors.
