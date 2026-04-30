# Module: Products
## Test Objectives
- Verify only allowed roles can access and use the Products module.
- Verify product creation works correctly with valid product data.
- Verify product list, search, status, and unit filters work correctly.
- Verify product `View`, `Edit`, and `Activate` / `Mark Inactive` flows behave correctly.
- Verify duplicate product code protection, frontend validation, and backend validation behavior.
- Verify generated editable product code, `MRP`, description, and supported unit behavior.

## Preconditions
- Approved QA environment and approved QA test data are available for execution.
- At least one `Super Admin` or `Admin` QA account is available.

## Positive Test Cases
1. Allowed role can open Products module and load product list
   - Steps:
     1. Log in as `Super Admin` or `Admin`.
     2. Open the dashboard.
     3. Click `Products` from the sidebar.
     4. Wait for the module to load.
   - Expected Result:
     - The `Create Product` form is visible.
     - The `Filters` section is visible.
     - The `Products List` section is visible.
     - Real product data loads successfully.

2. Create product with valid data
   - Steps:
     1. Open `Products`.
     2. Confirm `Product Code` is auto-filled.
     3. Enter a valid product name.
     4. Keep the generated code or edit it to another unique product code.
     5. Enter `MRP` greater than zero.
     6. Select a valid unit.
     7. Enter an optional description.
     8. Select a valid status.
     9. Click `Create Product`.
   - Expected Result:
     - Product creation succeeds.
     - Success message is shown.
     - The new product appears in the list after reload.
     - Product code, description, `MRP`, unit, and status are shown correctly.

3. Search products by product name or product code
   - Steps:
     1. Open `Products`.
     2. Enter a known product name or product code in `Search Product`.
     3. Click `Apply Filters`.
   - Expected Result:
     - Matching product records are shown.

4. Filter products by status
   - Steps:
     1. Open `Products`.
     2. Select `Active` or `Inactive` in the status filter.
     3. Click `Apply Filters`.
   - Expected Result:
     - Only product records with the selected status are shown.

5. Filter products by unit
   - Steps:
     1. Open `Products`.
     2. Select a unit in the unit filter.
     3. Click `Apply Filters`.
   - Expected Result:
     - Only product records with the selected unit are shown.

6. Reset product filters restores default listing
   - Steps:
     1. Apply one or more filters.
     2. Click `Reset`.
   - Expected Result:
     - Filter inputs return to default values.
     - Product list reloads without previous filters.

7. Refresh reloads the product list with current filters
   - Steps:
     1. Apply one or more filters.
     2. Click `Refresh`.
   - Expected Result:
     - The list reloads successfully.
     - Currently applied filters remain effective.

8. View action opens product details modal
   - Steps:
     1. Open `Products`.
     2. Click `View` on a product row.
   - Expected Result:
     - Product details modal opens.
     - Product name, code, description, `MRP`, unit, and status are shown.

9. Edit action updates product successfully
   - Steps:
     1. Open `Products`.
     2. Click `Edit` on a product row.
     3. Update one or more fields.
     4. Click `Save Changes`.
   - Expected Result:
     - Product update succeeds.
     - Success message is shown.
     - Updated values appear in the list.

10. Mark product inactive successfully
   - Steps:
     1. Open `Products`.
     2. Click `Mark Inactive` on an active product row.
     3. Confirm the action.
   - Expected Result:
     - Product status changes to `Inactive`.
     - Product remains visible in the normal list.

11. Activate inactive product successfully
   - Steps:
     1. Open `Products`.
     2. Click `Activate` on an inactive product row.
     3. Confirm the action.
   - Expected Result:
     - Product status changes to `Active`.
     - Product remains visible in the normal list.

## Negative Test Cases
1. Product form rejects empty required fields
   - Steps:
     1. Open `Products`.
     2. Leave required fields empty.
     3. Click `Create Product`.
   - Expected Result:
     - Product is not created.
     - Required validation messages are shown.

2. Product form rejects short product name
   - Steps:
     1. Open `Products`.
     2. Enter a 1-character product name.
     3. Enter other valid values.
     4. Click `Create Product`.
   - Expected Result:
     - Product is not created.
     - Product name validation error is shown.

3. Product form rejects zero or negative MRP
   - Steps:
     1. Open `Products`.
     2. Enter valid name and code.
     3. Enter `0` or a negative number for `MRP`.
     4. Submit the form.
   - Expected Result:
     - Product is not created.
     - `MRP` validation error is shown.

4. Duplicate product code is rejected on create or edit
   - Steps:
     1. Use an existing product code.
     2. Attempt create or edit with the same code on another product.
   - Expected Result:
     - Save is rejected.
     - Duplicate code error is shown.

5. Unsupported unit is rejected through direct API test
   - Steps:
     1. Send a product create or update request with an unsupported unit value.
   - Expected Result:
     - The request is rejected.
     - Unit validation error is returned.

6. Description longer than allowed length is rejected
   - Steps:
     1. Open `Products`.
     2. Enter a description longer than 300 characters.
     3. Submit the form.
   - Expected Result:
     - Product is not created or updated.
     - Description validation error is shown.

7. Unsupported status is rejected through direct API test
   - Steps:
     1. Send a product create or update request with an unsupported status value.
   - Expected Result:
     - The request is rejected.
     - Status validation error is returned.

8. Cashier cannot access Products module
   - Steps:
     1. Log in as `Cashier`.
     2. Try to open `Products` or call the products API.
   - Expected Result:
     - Access is rejected.
     - Products management is unavailable for cashier role.

## Edge Cases
1. Product code is saved in normalized uppercase form
   - Steps:
     1. Create or update a product using lowercase or mixed-case product code.
   - Expected Result:
     - The saved product code appears in uppercase form.

2. Product code remains editable after auto-generation
   - Steps:
     1. Open `Products`.
     2. Confirm the generated product code is visible.
     3. Edit the generated code before saving.
   - Expected Result:
     - Edited unique product code is saved successfully.

3. Unit list includes common units in expected order
   - Steps:
     1. Open `Products`.
     2. Open the `Unit` dropdown.
   - Expected Result:
     - Unit list starts with common units such as `kg`, `Litre`, `Piece`, `Bottle`, and `Pack`.
     - `kg` is shown fully lowercase.
     - `Dozen`, `Box`, and `Case` are also available.

4. Search remains case-insensitive for product name and code
   - Steps:
     1. Open `Products`.
     2. Search using different uppercase and lowercase versions of a product name or product code.
     3. Apply filters.
   - Expected Result:
     - Matching product records are still returned.

5. Inactive product remains visible and manageable
   - Steps:
     1. Mark a product inactive.
     2. Filter by `Inactive`.
     3. Use `View` or `Activate` on that same row.
   - Expected Result:
     - Product remains accessible in normal UI.
     - No hidden archive behavior exists.

## API Verification Steps
- Endpoint: `GET /api/v1/products`
- Payload:
  1. Send a `GET` request to `/api/v1/products`.
  2. Include header `Authorization: Bearer <valid token>`.
  3. Optionally add `search`, `status`, and `unit` query parameters.
  - Expected Response:
  - `200 OK` for allowed roles.
  - Product list is returned.
  - Filtering works with provided query parameters.

- Endpoint: `GET /api/v1/products/next-code`
- Payload:
  1. Send a `GET` request to `/api/v1/products/next-code`.
  2. Include header `Authorization: Bearer <valid token>`.
- Expected Response:
  - `200 OK` for allowed roles.
  - Next generated product code is returned.

- Endpoint: `POST /api/v1/products`
- Payload:
  1. Send a `POST` request to `/api/v1/products`.
  2. Include header `Authorization: Bearer <valid token>`.
  3. Use approved valid QA values for `productName`, optional/editable `productCode`, `description`, `sellingPrice` as `MRP`, `unit`, and `status`.
- Expected Response:
  - `201 Created` for valid product.
  - Product code is generated if not supplied.
  - `400 Bad Request` for invalid payload.
  - `409 Conflict` for duplicate product code.

- Endpoint: `PATCH /api/v1/products/:productId`
- Payload:
  1. Send a `PATCH` request using a valid product id.
  2. Include header `Authorization: Bearer <valid token>`.
  3. Send valid editable fields.
- Expected Response:
  - `200 OK` for valid update.
  - `400 Bad Request` for invalid payload.
  - `404 Not Found` for missing product.
  - `409 Conflict` for duplicate product code.

- Endpoint: `PATCH /api/v1/products/:productId/status`
- Payload:
  1. Send a `PATCH` request using a valid product id.
  2. Include header `Authorization: Bearer <valid token>`.
  3. Send `status` as `Active` or `Inactive`.
- Expected Response:
  - `200 OK` for valid status update.
  - `400 Bad Request` for invalid status.
  - `404 Not Found` for missing product.

## UI Verification Steps
- Page/Screen: `Products`
- Steps:
  1. Open `Products` from the sidebar.
  2. Verify the create form, filters, and product list are visible.
  3. Confirm the form is arranged as `Product Name / Product Code`, `MRP / Unit`, and `Description / Status`.
  4. Confirm field values are clearly readable and do not look disabled.
  5. Submit invalid values.
  6. Submit valid approved QA values.
  7. Use search, status, and unit filters.
  8. Use `View`, `Edit`, `Activate` / `Mark Inactive`.
  9. Use `Reset` and `Refresh`.
- Expected Result:
  - Products module opens for allowed roles.
  - Invalid submissions are blocked with clear validation.
  - Valid product creation and update succeed.
  - Status lifecycle remains visible in the normal UI.
  - Filters, reset, and refresh behave correctly.
