# Module: Billing
## Test Objectives
- Verify only allowed roles can access and use the Billing module.
- Verify bill creation works correctly with valid card-linked wallet and valid bill items.
- Verify billing list, search, status, and date filters work correctly.
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

2. Active product options load in billing product dropdown
   - Steps:
     1. Open `Billing`.
     2. Open the `Product` dropdown.
   - Expected Result:
     - Active products are available for selection.
     - Product options load without error.

3. Selected product shows unit price
   - Steps:
     1. Open `Billing`.
     2. Select a product from the dropdown.
   - Expected Result:
     - The `Unit Price` field shows the selected product selling price.

4. Add one valid item to pending bill
   - Steps:
     1. Open `Billing`.
     2. Select a valid active product.
     3. Enter a valid whole-number quantity greater than zero.
     4. Click `Add Item`.
   - Expected Result:
     - The pending bill table shows the selected product row.
     - The row includes product, code, unit price, quantity, and line total.
     - The running `Total` updates correctly.

5. Remove a pending bill item
   - Steps:
     1. Add one or more valid bill items.
     2. Click `Remove` on one pending row.
   - Expected Result:
     - The selected item is removed from the pending bill table.
     - The running `Total` updates correctly.

6. Create bill with valid card number and valid items
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

7. Search bills by bill number
   - Steps:
     1. Open `Billing`.
     2. Enter a known bill number in `Search Bill`.
     3. Click `Apply Filters`.
   - Expected Result:
     - Matching bill records are shown.

8. Search bills by member name
   - Steps:
     1. Open `Billing`.
     2. Enter a known member name in `Search Bill`.
     3. Click `Apply Filters`.
   - Expected Result:
     - Matching bill records are shown.

9. Search bills by card number
   - Steps:
     1. Open `Billing`.
     2. Enter a known card number in `Search Bill`.
     3. Click `Apply Filters`.
   - Expected Result:
     - Matching bill records are shown.

10. Filter bills by status
   - Steps:
     1. Open `Billing`.
     2. Select `Completed` in the status filter.
     3. Click `Apply Filters`.
   - Expected Result:
     - Only completed bill rows are shown.

11. Filter bills by date
   - Steps:
     1. Open `Billing`.
     2. Select a valid billing date in the `Date` filter.
     3. Click `Apply Filters`.
   - Expected Result:
     - Only bills created on the selected date are shown.

12. Reset billing filters restores default listing
   - Steps:
     1. Apply one or more billing filters.
     2. Click `Reset`.
   - Expected Result:
     - Filter inputs return to default values.
     - The bills list reloads without the previous filters.

13. Refresh reloads the bills list
   - Steps:
     1. Open `Billing`.
     2. Click `Refresh`.
   - Expected Result:
     - The bills list reloads successfully.

14. Dashboard billing metrics reflect live records
   - Steps:
     1. Open `Billing`.
     2. Create one or more valid bills.
     3. Review the module metrics.
   - Expected Result:
     - `Today Bills` reflects today bill count.
     - `Collected Amount` reflects the sum of currently loaded bill records.
     - `Stock Warnings` remains visible as designed for current scope.

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

3. Add Item rejects empty product
   - Steps:
     1. Open `Billing`.
     2. Leave `Product` unselected.
     3. Enter a valid quantity.
     4. Click `Add Item`.
   - Expected Result:
     - Item is not added.
     - Product validation error is shown.

4. Add Item rejects empty quantity
   - Steps:
     1. Open `Billing`.
     2. Select a valid product.
     3. Clear the quantity value.
     4. Click `Add Item`.
   - Expected Result:
     - Item is not added.
     - Quantity validation error is shown.

5. Add Item rejects zero or negative quantity
   - Steps:
     1. Open `Billing`.
     2. Select a valid product.
     3. Enter `0` or a negative quantity.
     4. Click `Add Item`.
   - Expected Result:
     - Item is not added.
     - Quantity validation error is shown.

6. Add Item rejects non-integer quantity
   - Steps:
     1. Open `Billing`.
     2. Select a valid product.
     3. Enter a decimal quantity such as `1.5`.
     4. Click `Add Item`.
   - Expected Result:
     - Item is not added.
     - Whole-number quantity validation error is shown.

7. Duplicate product cannot be added to the same bill
   - Steps:
     1. Add a valid product to the pending bill.
     2. Try to add the same product again.
   - Expected Result:
     - Duplicate item is not added.
     - Duplicate-product error is shown.

8. Billing request is rejected for invalid card number
   - Steps:
     1. Enter a card number that does not exist in approved QA data.
     2. Add valid bill items.
     3. Submit the bill.
   - Expected Result:
     - Bill is not created.
     - Backend returns a not-found or billing-not-allowed error.

9. Billing request is rejected for insufficient wallet balance
   - Steps:
     1. Use a valid card linked to a wallet with insufficient balance.
     2. Add items whose total exceeds wallet balance.
     3. Submit the bill.
   - Expected Result:
     - Bill is not created.
     - Insufficient balance error is shown.

10. Billing request is rejected for insufficient stock
   - Steps:
     1. Use a valid card and wallet.
     2. Add a product quantity greater than available stock.
     3. Submit the bill.
   - Expected Result:
     - Bill is not created.
     - Insufficient stock error is shown.

11. Billing request is rejected for inactive product through direct API test
   - Steps:
     1. Send a bill create request using an inactive product id.
   - Expected Result:
     - The request is rejected.
     - Error indicates only active products can be billed.

12. Billing request is rejected for duplicate products through direct API test
   - Steps:
     1. Send a bill create request with the same `productId` repeated in `items`.
   - Expected Result:
     - The request is rejected.
     - Duplicate-product error is returned.

## Edge Cases
1. Search remains case-insensitive for member name and card number
   - Steps:
     1. Open `Billing`.
     2. Search using different uppercase and lowercase forms of known member or card values.
     3. Apply filters.
   - Expected Result:
     - Matching bill records are still returned.

2. Bills list remains stable when filters return no matches
   - Steps:
     1. Open `Billing`.
     2. Apply filters using values that match no bills.
   - Expected Result:
     - The module remains stable.
     - A no-records message is shown.

3. Refresh keeps currently applied filters
   - Steps:
     1. Apply one or more billing filters.
     2. Click `Refresh`.
   - Expected Result:
     - The list reloads successfully.
     - The currently applied filters remain effective.

4. Bill total updates correctly when multiple items are added and one is removed
   - Steps:
     1. Add multiple valid items.
     2. Note the total.
     3. Remove one item.
     4. Review the total again.
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
  7. Use `Reset` and `Refresh`.
  8. Review live billing metrics.
- Expected Result:
  - Billing module opens for allowed roles.
  - Invalid submissions are blocked with clear validation.
  - Valid bill creation succeeds.
  - Filters, reset, and refresh behave correctly.
  - Metrics reflect live bill records.
