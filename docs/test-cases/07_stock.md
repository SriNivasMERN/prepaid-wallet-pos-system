# Module: Stock
## Test Objectives
- Verify only allowed roles can access and use the Stock module.
- Verify stock movement creation works correctly for active products.
- Verify stock list, search, stock status, and movement type filters work correctly.
- Verify stock `View Details` flow behaves correctly while movement history remains immutable.
- Verify current quantity updates correctly and stock status is shown correctly after movements.
- Verify duplicate opening stock is prevented even when duplicate requests are submitted close together.
- Verify stock status and movement type filtering remain accurate with paginated requests.
- Verify product selection uses searchable lookup behavior and does not force focus to quantity before a product is selected.

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

2. Create opening stock with valid data
   - Steps:
     1. Open `Stock`.
     2. Search for and select an active product with no existing opening stock.
     3. Enter a positive quantity change.
     4. Select `Opening` as movement type.
     5. Optionally enter valid notes.
     6. Click `Save Stock Movement`.
   - Expected Result:
     - Stock movement creation succeeds.
     - Success message is shown.
     - The stock list reloads successfully.
     - Current quantity reflects the opening quantity.

3. Create manual stock update with valid data
   - Steps:
     1. Open `Stock`.
     2. Search for and select an active product.
     3. Enter a positive or negative non-zero quantity change.
     4. Select `Manual Update` as movement type.
     5. Click `Save Stock Movement`.
   - Expected Result:
     - Stock movement creation succeeds.
     - The stock list reloads successfully.
     - Current quantity is updated correctly.

4. Product lookup supports search before stock entry
   - Steps:
     1. Open `Stock`.
     2. Click the `Product` search field.
     3. Search by product name or product code.
   - Expected Result:
     - Matching active products are shown for selection.
     - The user does not need to scroll through a long product dropdown.
     - `Quantity Change` does not receive automatic focus on page entry.

5. Search stock by product name or product code
   - Steps:
     1. Open `Stock`.
     2. Enter a known product name or product code in `Search Product`.
     3. Click `Apply Filters`.
   - Expected Result:
     - Matching stock records are shown.

6. Filter stock by stock status
   - Steps:
     1. Open `Stock`.
     2. Select a stock status.
     3. Click `Apply Filters`.
   - Expected Result:
     - Only stock rows with the selected status are shown.

7. Filter stock by movement type
   - Steps:
     1. Open `Stock`.
     2. Select `Opening` or `Manual Update`.
     3. Click `Apply Filters`.
   - Expected Result:
     - Only stock rows matching the selected latest movement type are shown.

8. Reset stock filters restores default listing
   - Steps:
     1. Apply one or more stock filters.
     2. Click `Reset`.
   - Expected Result:
     - Filter inputs return to default values.
     - The stock list reloads without previous filters.

9. Refresh reloads the stock list with current filters
   - Steps:
     1. Apply one or more stock filters.
     2. Click `Refresh`.
   - Expected Result:
     - The list reloads successfully.
     - Currently applied filters remain effective.

10. View action opens stock details modal
   - Steps:
     1. Open `Stock`.
     2. Click `View` on a stock row.
   - Expected Result:
     - `Stock Details` modal opens.
     - Product, code, current quantity, last change, movement type, stock status, and notes are shown.

11. Dashboard stock metrics reflect live records
   - Steps:
     1. Open `Stock`.
     2. Create stock movements that produce `Available`, `Low Stock`, or `Negative Stock` conditions where applicable.
     3. Review the module metrics.
   - Expected Result:
     - `Available Items`, `Low Stock`, and `Negative Stock` match visible stock rows.

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
     3. Submit the form.
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

5. Duplicate opening stock is rejected under near-simultaneous requests
   - Steps:
     1. Prepare one active product with no existing opening movement.
     2. Submit two `Opening` stock movement API requests for the same product close together.
   - Expected Result:
     - Only one opening stock movement is created.
     - The duplicate request is rejected with a conflict response.
     - Current quantity is not double-counted.

6. Inactive product cannot receive stock movement
   - Steps:
     1. Attempt stock movement for an inactive product through direct API test.
   - Expected Result:
     - The request is rejected.
     - Error indicates only an active product can receive stock movement.

7. Stock history cannot be edited or deleted through normal UI
   - Steps:
     1. Open `Stock`.
     2. Review available row actions and controls.
   - Expected Result:
     - No edit or delete action is exposed for stock history.

8. Cashier cannot access Stock module
   - Steps:
     1. Log in as `Cashier`.
     2. Try to open `Stock` or call the stocks API.
   - Expected Result:
     - Access is rejected.
     - Stock management is unavailable for cashier role.

## Edge Cases
1. Search remains case-insensitive for product name and code
   - Steps:
     1. Search using different uppercase and lowercase versions of a product name or product code.
   - Expected Result:
     - Matching stock records are still returned.

2. Stock list remains stable when filters return no matches
   - Steps:
     1. Apply filters using values that match no stock rows.
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

4. Stock status filter returns correct records when pagination parameters are present
   - Steps:
     1. Prepare enough stock records to require multiple pages.
     2. Create records across different stock statuses.
     3. Request stock list with `stockStatus`, `page`, and `limit`.
   - Expected Result:
     - Returned rows match the selected status.
     - Page 1 is not empty when matching records exist on later unfiltered pages.

5. Movement type filter returns correct records when pagination parameters are present
   - Steps:
     1. Prepare enough stock records to require multiple pages.
     2. Create rows with different latest movement types.
     3. Request stock list with `movementType`, `page`, and `limit`.
   - Expected Result:
     - Returned rows match the selected movement type.
     - Pagination is applied after the movement type filter.

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
  - When `page` and `limit` are supplied with stock-status or movement-type filters, filtering is applied before pagination.

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
  6. Use `View`, `Reset`, and `Refresh`.
- Expected Result:
  - Stock module opens for allowed roles.
  - Invalid submissions are blocked with clear validation.
  - Valid stock movement creation succeeds.
  - Stock details modal works correctly.
  - Filters, reset, and refresh behave correctly.
