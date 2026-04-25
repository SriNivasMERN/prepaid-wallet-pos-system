# Module: Billing
## Test Objectives
- Verify only allowed roles can access and use the Billing module.
- Verify bill creation works correctly with valid card-linked wallet and valid bill items.
- Verify billing list, search, status, and date filters work correctly.
- Verify bill `View Details` flow behaves correctly while keeping completed bills immutable.
- Verify frontend validation, duplicate-item protection, and backend billing validation behavior.

## Preconditions
- Approved QA environment and approved QA test data are available for execution.
- At least one valid `Super Admin`, `Admin`, or `Cashier` QA account is available.
- At least one active member with active card and active wallet exists.
- The test wallet has sufficient balance for approved billing test data.
- At least one active product exists.
- The selected products have sufficient stock for approved billing test data.

## Positive Test Cases
1. Allowed role can open Billing module and load bills list
   - Steps:
     1. Log in as `Super Admin`, `Admin`, or `Cashier`.
     2. Open the dashboard.
     3. Click `Billing` from the sidebar.
     4. Wait for the module to load.
   - Expected Result:
     - The `Create Bill` form is visible.
     - The `Filters` section is visible.
     - The `Bills List` section is visible.
     - Real bill data loads successfully.

2. Create bill with valid card number and valid items
   - Steps:
     1. Open `Billing`.
     2. Enter a valid linked card number.
     3. Add one or more valid products with valid quantities.
     4. Optionally enter valid notes.
     5. Click `Create Bill`.
   - Expected Result:
     - Bill creation succeeds.
     - Success message is shown.
     - The bills list reloads successfully.
     - A new completed bill appears in the list.

3. Search bills by bill number, member name, or card number
   - Steps:
     1. Open `Billing`.
     2. Use `Search Bill`.
     3. Click `Apply Filters`.
   - Expected Result:
     - Matching bill records are shown.

4. Filter bills by status
   - Steps:
     1. Open `Billing`.
     2. Select `Completed` in the status filter.
     3. Click `Apply Filters`.
   - Expected Result:
     - Only completed bill rows are shown.

5. Filter bills by date
   - Steps:
     1. Open `Billing`.
     2. Select a valid billing date in the `Date` filter.
     3. Click `Apply Filters`.
   - Expected Result:
     - Only bills created on the selected date are shown.

6. Reset billing filters restores default listing
   - Steps:
     1. Apply one or more billing filters.
     2. Click `Reset`.
   - Expected Result:
     - Filter inputs return to default values.
     - The bills list reloads without previous filters.

7. Refresh reloads the bills list with current filters
   - Steps:
     1. Apply one or more filters.
     2. Click `Refresh`.
   - Expected Result:
     - The list reloads successfully.
     - Currently applied filters remain effective.

8. View action opens bill details modal
   - Steps:
     1. Open `Billing`.
     2. Click `View` on a bill row.
   - Expected Result:
     - `Bill Details` modal opens.
     - Bill number, status, member, card, balance before, balance after, and line items are shown.

## Negative Test Cases
1. Billing form rejects empty card number on submit
   - Steps:
     1. Open `Billing`.
     2. Add valid bill items.
     3. Leave `Card Number` empty.
     4. Click `Create Bill`.
   - Expected Result:
     - Bill is not created.
     - Card number validation error is shown.

2. Billing form rejects submit with no pending items
   - Steps:
     1. Open `Billing`.
     2. Enter a valid card number.
     3. Do not add any products.
     4. Click `Create Bill`.
   - Expected Result:
     - Bill is not created.
     - Bill-items validation error is shown.

3. Duplicate product cannot be added to the same bill
   - Steps:
     1. Add a valid product to the pending bill.
     2. Try to add the same product again.
   - Expected Result:
     - Duplicate item is not added.
     - Duplicate-product error is shown.

4. Billing request is rejected for invalid card number
   - Steps:
     1. Enter a card number that does not exist in approved QA data.
     2. Add valid bill items.
     3. Submit the bill.
   - Expected Result:
     - Bill is not created.
     - Backend returns a billing-not-allowed or not-found error.

5. Billing request is rejected for insufficient wallet balance
   - Steps:
     1. Use a valid card linked to a wallet with insufficient balance.
     2. Add items whose total exceeds wallet balance.
     3. Submit the bill.
   - Expected Result:
     - Bill is not created.
     - Insufficient balance error is shown.

6. Billing request is rejected for insufficient stock
   - Steps:
     1. Use a valid card and wallet.
     2. Add a product quantity greater than available stock.
     3. Submit the bill.
   - Expected Result:
     - Bill is not created.
     - Insufficient stock error is shown.

7. Billing cannot be edited or deleted through normal UI
   - Steps:
     1. Open `Billing`.
     2. Review bill row actions and available controls.
   - Expected Result:
     - No edit or delete action is exposed for completed bills.

## Edge Cases
1. Search remains case-insensitive for member name and card number
   - Steps:
     1. Open `Billing`.
     2. Search using different uppercase and lowercase forms of known values.
     3. Apply filters.
   - Expected Result:
     - Matching bill records are still returned.

2. Bills list remains stable when filters return no matches
   - Steps:
     1. Apply filters using values that match no bills.
   - Expected Result:
     - The module remains stable.
     - A no-records message is shown.

3. Bill total updates correctly when multiple items are added and one is removed
   - Steps:
     1. Add multiple valid items.
     2. Note the total.
     3. Remove one item.
   - Expected Result:
     - The total always reflects the exact current pending item list.

## API Verification Steps
- Endpoint: `GET /api/v1/billing`
- Payload:
  1. Send a `GET` request to `/api/v1/billing`.
  2. Include header `Authorization: Bearer <valid token>`.
  3. Optionally add `search`, `status`, and `date` query parameters.
- Expected Response:
  - `200 OK` for allowed roles.
  - Bill list is returned.
  - Filtering works with provided query parameters.

- Endpoint: `POST /api/v1/billing`
- Payload:
  1. Send a `POST` request to `/api/v1/billing`.
  2. Include header `Authorization: Bearer <valid token>`.
  3. Use approved valid QA values for `cardNumber`, `items`, and `notes`.
- Expected Response:
  - `201 Created` for valid bill.
  - `400 Bad Request` for invalid payload.
  - `404 Not Found` for missing linked records.
  - `409 Conflict` for insufficient balance, insufficient stock, duplicate product, inactive product, or other billing-not-allowed conditions.

- Endpoint: `GET /api/v1/billing/:billId`
- Payload:
  1. Send a `GET` request to `/api/v1/billing/<valid bill id>`.
  2. Include header `Authorization: Bearer <valid token>`.
- Expected Response:
  - `200 OK` for valid bill id.
  - Bill detail is returned.
  - `404 Not Found` for invalid or missing bill id.

## UI Verification Steps
- Page/Screen: `Billing`
- Steps:
  1. Open `Billing` from the sidebar.
  2. Verify the bill form, filters, and bills list are visible.
  3. Add valid pending items and verify total calculation.
  4. Submit invalid values.
  5. Submit valid approved QA billing values.
  6. Use search, status, and date filters.
  7. Use `View`, `Reset`, and `Refresh`.
- Expected Result:
  - Billing module opens for allowed roles.
  - Invalid submissions are blocked with clear validation.
  - Valid bill creation succeeds.
  - Bill details modal works correctly.
  - Filters, reset, and refresh behave correctly.
