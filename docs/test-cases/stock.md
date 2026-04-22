# Module: Stock
## Test Objectives
- Verify only allowed roles can access and use the Stock module.
- Verify stock movement creation works correctly for active products.
- Verify stock list, search, stock status, and movement type filters work correctly.
- Verify current quantity updates correctly and stock status is shown correctly after movements.

## Preconditions
- Approved QA environment and approved QA test data are available for execution.
- At least one `Super Admin` or `Admin` QA account is available.
- At least one active product record exists for stock movement testing.

## Positive Test Cases
1. Allowed role can open Stock module and load stock list
   - Steps:
     1. Log in as `Super Admin` or `Admin`.
     2. Open the dashboard.
     3. Click `Stock` from the sidebar.
     4. Wait for the module to load.
   - Expected Result:
     - The `Record Stock Movement` form is visible.
     - The `Filters` section is visible.
     - The `Stock List` section is visible.
     - Real stock data loads successfully.

2. Active products appear in stock movement dropdown
   - Steps:
     1. Open `Stock`.
     2. Open the `Product` dropdown.
   - Expected Result:
     - Active products are available for selection.
     - Product options load without error.

3. Selected product shows current quantity
   - Steps:
     1. Open `Stock`.
     2. Select a product from the dropdown.
   - Expected Result:
     - The `Current Qty` field shows the current quantity for that product.

4. Create opening stock with valid data
   - Steps:
     1. Open `Stock`.
     2. Select an active product with no existing opening stock.
     3. Enter a positive quantity change.
     4. Select `Opening` as movement type.
     5. Optionally enter valid notes.
     6. Click `Save Stock Movement`.
   - Expected Result:
     - Stock movement creation succeeds.
     - Success message is shown.
     - The stock list reloads successfully.
     - Current quantity reflects the opening quantity.

5. Create manual stock update with valid data
   - Steps:
     1. Open `Stock`.
     2. Select an active product.
     3. Enter a positive or negative non-zero quantity change.
     4. Select `Manual Update` as movement type.
     5. Click `Save Stock Movement`.
   - Expected Result:
     - Stock movement creation succeeds.
     - The stock list reloads successfully.
     - Current quantity is updated correctly.

6. Search stock by product name or product code
   - Steps:
     1. Open `Stock`.
     2. Enter a known product name or product code in `Search Product`.
     3. Click `Apply Filters`.
   - Expected Result:
     - Matching stock records are shown.

7. Filter stock by stock status
   - Steps:
     1. Open `Stock`.
     2. Select a stock status such as `Available`, `Low Stock`, `Out of Stock`, or `Negative Stock`.
     3. Click `Apply Filters`.
   - Expected Result:
     - Only stock rows with the selected status are shown.

8. Filter stock by movement type
   - Steps:
     1. Open `Stock`.
     2. Select `Opening` or `Manual Update` in the movement type filter.
     3. Click `Apply Filters`.
   - Expected Result:
     - Only stock rows matching the selected latest movement type are shown.

9. Reset stock filters restores default listing
   - Steps:
     1. Apply one or more stock filters.
     2. Click `Reset`.
   - Expected Result:
     - Filter inputs return to default values.
     - The stock list reloads without the previous filters.

10. Refresh reloads the stock list
   - Steps:
     1. Open `Stock`.
     2. Click `Refresh`.
   - Expected Result:
     - The stock list reloads successfully.

11. Dashboard stock metrics reflect live records
   - Steps:
     1. Open `Stock`.
     2. Create stock movements that produce `Available`, `Low Stock`, or `Negative Stock` conditions where applicable.
     3. Review the module metrics.
   - Expected Result:
     - `Available Items` reflects available stock rows.
     - `Low Stock` reflects low stock rows.
     - `Negative Stock` reflects negative stock rows.

## Negative Test Cases
1. Stock movement form rejects empty required fields
   - Steps:
     1. Open `Stock`.
     2. Leave required fields empty.
     3. Click `Save Stock Movement`.
   - Expected Result:
     - Stock movement is not created.
     - Required validation messages are shown.

2. Stock movement form rejects zero quantity change
   - Steps:
     1. Select a valid product.
     2. Enter `0` in `Quantity Change`.
     3. Choose a valid movement type.
     4. Click `Save Stock Movement`.
   - Expected Result:
     - Stock movement is not created.
     - Quantity validation error is shown.

3. Opening stock rejects zero or negative quantity
   - Steps:
     1. Select a valid product.
     2. Enter `0` or a negative quantity.
     3. Select `Opening`.
     4. Submit the form.
   - Expected Result:
     - Stock movement is not created.
     - Opening quantity validation error is shown.

4. Duplicate opening stock is rejected
   - Steps:
     1. Create one opening stock movement for a product.
     2. Attempt a second opening stock movement for the same product.
   - Expected Result:
     - Second opening stock is not created.
     - Duplicate opening error is shown.

5. Unsupported movement type is rejected through direct API test
   - Steps:
     1. Send a stock movement create request with an unsupported movement type.
   - Expected Result:
     - The request is rejected.
     - Movement type validation error is returned.

6. Inactive product cannot receive stock movement
   - Steps:
     1. Attempt stock movement for an inactive product through direct API test.
   - Expected Result:
     - The request is rejected.
     - Error indicates only an active product can receive stock movement.

7. Cashier cannot access Stock module
   - Steps:
     1. Log in as `Cashier`.
     2. Try to open `Stock` or call the stocks API.
   - Expected Result:
     - Access is rejected.
     - Stock management is unavailable for cashier role.

## Edge Cases
1. Search remains case-insensitive for product name and code
   - Steps:
     1. Open `Stock`.
     2. Search using different uppercase and lowercase versions of a product name or product code.
     3. Apply filters.
   - Expected Result:
     - Matching stock records are still returned.

2. Stock list remains stable when filters return no matches
   - Steps:
     1. Open `Stock`.
     2. Apply filters using values that match no stock rows.
   - Expected Result:
     - The module remains stable.
     - A no-records message is shown.

3. Current quantity updates correctly after manual stock increase and decrease
   - Steps:
     1. Note the current quantity of a selected product.
     2. Create a valid manual stock increase.
     3. Create a valid manual stock decrease.
     4. Review the stock row.
   - Expected Result:
     - Current quantity reflects the net effect of both movements correctly.

## API Verification Steps
- Endpoint: `GET /api/v1/stocks`
- Payload:
  1. Send a `GET` request to `/api/v1/stocks`.
  2. Include header `Authorization: Bearer <valid token>`.
  3. Optionally add `search`, `stockStatus`, and `movementType` query parameters.
- Expected Response:
  - `200 OK` for allowed roles.
  - Stock list is returned.
  - Filtering works with provided query parameters.

- Endpoint: `POST /api/v1/stocks/movements`
- Payload:
  1. Send a `POST` request to `/api/v1/stocks/movements`.
  2. Include header `Authorization: Bearer <valid token>`.
  3. Use approved valid QA values for `productId`, `quantityChange`, `movementType`, and `notes`.
- Expected Response:
  - `201 Created` for valid stock movement.
  - `400 Bad Request` for invalid payload.
  - `404 Not Found` for missing product.
  - `409 Conflict` for duplicate opening stock or ineligible stock movement conditions.

## UI Verification Steps
- Page/Screen: `Stock`
- Steps:
  1. Open `Stock` from the sidebar.
  2. Verify the movement form, filters, and stock list are visible.
  3. Submit invalid values.
  4. Submit valid approved QA values for opening stock and manual update.
  5. Use search, stock status, and movement type filters.
  6. Use `Reset` and `Refresh`.
  7. Review live stock metrics.
- Expected Result:
  - Stock module opens for allowed roles.
  - Invalid submissions are blocked with clear validation.
  - Valid stock movement creation succeeds.
  - Filters, reset, and refresh behave correctly.
  - Metrics reflect live stock records.
