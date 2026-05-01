# Test Suite: End-to-End Application Flow
## Scope
- Verify the full application works correctly for a first-time user on an empty database.
- Verify the business flow in proper operational order from first-time setup to final reports review.
- Verify module dependencies are respected before downstream actions are attempted.
- Verify Week 6 safe CRUD behavior works correctly across admin and operational modules.
- Verify latest reliability behavior for session invalidation, stock filtering, and wallet/stock updates.
- Verify latest product/card entry flow for generated editable codes, default dates, and clearer product fields.

## Assumptions
- Database is empty before testing begins.
- No staff, members, cards, wallets, products, stock movements, recharges, debits, bills, transactions, or reports data exists.
- QA tester has access to the frontend application and backend API environment.
- Test execution is performed in business order so later modules have valid upstream data.

## Recommended Execution Order
1. `Auth & Setup`
2. `Staff`
3. `Products`
4. `Members`
5. `Cards`
6. `Wallets`
7. `Stock`
8. `Recharges`
9. `Billing`
10. `Debits`
11. `Transactions`
12. `Reports`

## Base QA Data to Prepare During Run
- 1 first-time `Super Admin`
- 1 additional `Admin`
- 1 `Cashier`
- 2 active `Products` with generated or edited product codes, MRP, units, and optional descriptions
- 2 active `Members`
- 1 active `Card` linked to Member A
- 1 active `Wallet` linked to Member A
- 1 or more `Stock` records for active products
- 1 `Recharge`
- 1 `Bill`
- 1 `Debit`

## End-to-End Test Cases
1. First-time setup opens correctly on empty database
   - Steps:
     1. Open the application in the browser on a fresh database.
     2. Wait for the loading state to finish.
   - Expected Result:
     - The application opens the `First-Time Setup` screen.
     - No `Login` screen is shown first.

2. First Super Admin account is created successfully
   - Steps:
     1. Enter valid QA values in `Full Name`, `Username`, `Password`, and `Confirm Password`.
     2. Click `Create Account`.
   - Expected Result:
     - Setup completes successfully.
     - The application redirects to `Login`.

3. Super Admin logs in successfully
   - Steps:
     1. Enter the newly created Super Admin credentials.
     2. Click `Sign In`.
   - Expected Result:
     - Login succeeds.
     - Dashboard opens successfully.

4. Super Admin creates one Admin staff account
   - Steps:
     1. Open `Staff`.
     2. Enter valid QA values for a new `Admin` account.
     3. Save the record.
   - Expected Result:
     - Staff account is created successfully.
     - New Admin row appears in the staff list.

5. Super Admin creates one Cashier staff account
   - Steps:
     1. Stay in `Staff`.
     2. Enter valid QA values for a new `Cashier` account.
     3. Save the record.
   - Expected Result:
     - Cashier account is created successfully.
     - New Cashier row appears in the staff list.

6. Staff search and filter work after staff creation
   - Steps:
     1. In `Staff`, search by full name or username.
     2. Filter by `Role`.
     3. Filter by `Status`.
     4. Use `Apply Filters`, `Reset`, and `Refresh`.
   - Expected Result:
     - Filters work correctly.
     - List reloads correctly while respecting applied filters.

7. Staff view and edit flow works for allowed target accounts
   - Steps:
     1. Click `View` on the Admin or Cashier row.
     2. Close the details modal.
     3. Click `Edit` on the Cashier row.
     4. Update one safe field such as `Full Name`.
     5. Save changes.
   - Expected Result:
     - Details modal opens correctly.
     - Edit saves successfully.
     - Updated value appears in the staff list.

8. Staff activate and inactivate flow works safely
   - Steps:
     1. Click `Mark Inactive` on the Cashier row.
     2. Confirm the action.
     3. Verify the row status.
     4. Click `Activate`.
     5. Confirm the action.
   - Expected Result:
     - Staff status changes between `Active` and `Inactive`.
     - Staff record remains visible in the list.

9. Super Admin can reset a manageable staff password
   - Steps:
     1. In `Staff`, click `Reset Password` on the Cashier row.
     2. Enter valid new password values.
     3. Submit the reset.
   - Expected Result:
     - Password reset succeeds.
     - Cashier account remains otherwise unchanged.

10. Super Admin can manage own account through `My Account`
    - Steps:
      1. Open `My Account`.
      2. Update one safe profile field.
      3. Change password using valid current and new password values.
   - Expected Result:
     - Profile update succeeds and current session reflects the updated values.
      - Password change succeeds and the current browser session remains usable with refreshed session data.

11. Super Admin creates products needed for downstream operations
   - Steps:
     1. Open `Products`.
     2. Confirm generated editable product code is shown.
     3. Create at least two active products with valid name, code, `MRP`, unit, optional description, and status.
   - Expected Result:
     - Products are created successfully.
     - Product rows appear in the list.
     - Product code, `MRP`, description, and unit values are displayed clearly.

12. Products search, filter, view, edit, and status change all work
   - Steps:
     1. Search by product name or code.
     2. Filter by `Status` and `Unit`.
     3. Open `View` on a product row.
     4. Open `Edit` and update one safe field.
     5. Mark one product inactive, then activate it again.
   - Expected Result:
     - Filters work correctly.
     - Product details modal opens correctly.
     - Product create/edit layout shows two fields per row with readable field values.
     - Edit saves successfully.
     - Product lifecycle remains visible through `Active` and `Inactive`.

13. Super Admin creates members needed for card and wallet operations
   - Steps:
     1. Open `Members`.
     2. Create at least two active member records with valid profile data.
   - Expected Result:
     - Members are created successfully.
     - Member rows appear in the list.

14. Members search, view, edit, and status change work correctly
   - Steps:
     1. Search members using approved QA data.
     2. Filter by `Status`.
     3. Open `View` on a member row.
     4. Open `Edit` and update one safe profile field.
     5. Mark one member inactive, then activate again.
   - Expected Result:
     - List behavior is correct.
     - Member details modal opens correctly.
     - Readiness details are visible in member details.
     - Edit saves successfully.
     - Member remains visible after status change.

15. Card is assigned to an eligible active member
   - Steps:
     1. Open `Cards`.
     2. Confirm generated editable card number is shown.
     3. Confirm activation date defaults to current date and expiry defaults to one year later.
     4. Assign a new valid card to Member A.
   - Expected Result:
     - Card assignment succeeds.
     - Card row appears in the list as `Active`.
     - Generated or edited card number is saved correctly.

16. Cards search, filter, and details flow work correctly
   - Steps:
     1. Search by card number, member name, or mobile number.
     2. Filter by member and status.
     3. Use `Apply Filters`, `Reset`, and `Refresh`.
     4. Click `View` on the assigned card.
   - Expected Result:
     - Filters work correctly.
     - Card details modal opens correctly.
     - Live readiness details are visible in card details.

17. Card replacement flow works correctly for an active card
   - Steps:
     1. Click `Replace` on the active card.
     2. Enter a new valid card number and valid dates.
     3. Save the replacement.
   - Expected Result:
     - Replacement succeeds.
     - Old card becomes `Inactive`.
     - Replacement card becomes `Active`.
     - Member linkage remains correct.

18. Wallet is created for eligible member
   - Steps:
     1. Open `Wallets`.
     2. Search for Member A in the member lookup.
     3. Create a wallet for Member A.
   - Expected Result:
     - Wallet is created successfully.
     - Wallet row appears in the list.
     - `Wallet Status` does not receive automatic focus on page entry.

19. Wallet search, view, edit, and lifecycle flow work correctly
   - Steps:
     1. Search and filter wallet records.
     2. Open `View` on the wallet row.
     3. Open `Edit` and update an allowed administrative field such as `Status`.
     4. Use `Mark Inactive` and `Activate`.
   - Expected Result:
     - Wallet details modal opens correctly.
     - Wallet updates save successfully.
     - Wallet remains visible after lifecycle changes.
     - No balance history is mutated by admin lifecycle actions.

20. Opening stock is created for active products
   - Steps:
     1. Open `Stock`.
     2. Search for an active product by product name or product code.
     3. Record valid opening stock for at least one active product.
   - Expected Result:
     - Stock movement succeeds.
     - Stock list shows current quantity.
     - `Quantity Change` does not receive automatic focus before product selection.

21. Additional stock movement works and stock details can be viewed
   - Steps:
     1. Record one valid manual stock update for an active product.
     2. Search and filter stock rows.
     3. Click `View` on a stock row.
   - Expected Result:
     - Stock quantity updates correctly.
     - Filters work correctly.
     - Stock status and movement type filters return correct rows even when pagination parameters are used.
     - Stock details modal opens correctly.
     - No edit/delete action exists for stock history.

22. Duplicate opening stock remains blocked
   - Steps:
     1. Attempt a second opening stock movement for a product that already has opening stock.
   - Expected Result:
     - The request is rejected.
     - Current quantity is not double-counted.

23. Cashier login works and restricted modules remain unavailable
   - Steps:
     1. Log out from Super Admin.
     2. Log in as the created Cashier.
     3. Review visible modules in the dashboard.
   - Expected Result:
     - Cashier login succeeds if account is active.
     - Cashier can access allowed operational modules only.
     - `Staff`, `Products`, `Stock`, and `Reports` remain unavailable.

24. Cashier creates a recharge successfully
   - Steps:
     1. Open `Recharges`.
     2. Search for Member A's wallet by member, mobile number, or card number.
     3. Create a valid recharge for Member A.
   - Expected Result:
     - Recharge succeeds.
     - Wallet balance increases correctly.
     - Recharge row appears in the list.
     - `Amount` does not receive automatic focus before wallet selection.

25. Recharge list filters and details flow work correctly
   - Steps:
     1. Search and filter recharge records.
     2. Use `Refresh`.
     3. Click `View` on the created recharge row.
   - Expected Result:
     - Recharge list behavior is correct.
     - Recharge details modal opens correctly.
     - Recharge record remains immutable.

26. Billing precheck confirms readiness before bill creation
   - Steps:
     1. Open `Billing`.
     2. Enter Member A's valid card number.
     3. Click `Check Card`.
   - Expected Result:
     - Billing precheck shows member, card, wallet, and readiness state clearly.
     - No blocking reason is shown for the valid funded scenario.

27. Cashier creates a bill successfully using stocked product and funded wallet
   - Steps:
     1. Open `Billing`.
     2. Search for or enter Member A's card number.
     3. Search for available products by product name or product code.
     4. Create a bill for Member A using available product stock and wallet balance.
   - Expected Result:
     - Billing succeeds.
     - Bill row appears in the list.
     - Product stock reduces correctly.
     - Wallet balance updates correctly.

28. Billing list details flow works correctly
   - Steps:
     1. Search and filter bill records if filters are available.
     2. Use `Refresh`.
     3. Click `View` on the created bill row.
   - Expected Result:
     - Billing list loads correctly.
     - Bill details modal opens correctly.
     - Bill line items and balances are shown clearly.
     - Bill record remains immutable after creation.

29. Cashier creates a debit successfully
   - Steps:
     1. Open `Debits`.
     2. Search for Member A's wallet by member, mobile number, or card number.
     3. Create a valid debit for Member A.
   - Expected Result:
     - Debit succeeds.
     - Wallet balance decreases correctly.
     - Debit row appears in the list.
     - `Amount` does not receive automatic focus before wallet selection.

30. Debits list details flow works correctly
   - Steps:
     1. Search and filter debit records if applicable.
     2. Use `Refresh`.
     3. Click `View` on the created debit row.
   - Expected Result:
     - Debits list loads correctly.
     - Debit details modal opens correctly.
     - Debit record remains immutable after creation.

31. Transaction ledger shows both recharge credit and debit records
   - Steps:
     1. Open `Transactions`.
     2. Review the ledger after the recharge and debit are created.
     3. Search by member, mobile number, or card.
     4. Filter by `Credit` and `Debit`.
   - Expected Result:
     - Recharge appears as `Credit`.
     - Debit appears as `Debit`.
     - Reference values and balances match source operations.

32. Admin login works and admin role restrictions are enforced
   - Steps:
     1. Log out from Cashier.
     2. Log in as the created Admin.
     3. Open `Staff`.
     4. Attempt to manage the Cashier row.
     5. Review whether higher-privilege management is blocked.
   - Expected Result:
     - Admin login succeeds.
     - Admin can manage allowed subordinate staff only.
     - Restricted role-management boundaries remain enforced.

33. Reports module shows derived data from completed end-to-end flow
   - Steps:
     1. While logged in as Super Admin or Admin, open `Reports`.
     2. Review default `Sales`.
     3. Switch to `Recharges`, `Debits`, and `Stock`.
     4. Apply valid date filters.
   - Expected Result:
     - Sales report shows billing-derived records.
     - Recharges report shows recharge-derived data.
     - Debits report shows debit-derived data.
     - Stock report shows stock-movement-derived data.
     - Summary metrics change correctly by report type.

34. Final data integrity check across all modules passes
   - Steps:
     1. Review created records across `Members`, `Cards`, `Wallets`, `Stock`, `Recharges`, `Billing`, `Debits`, `Transactions`, and `Reports`.
     2. Cross-check one full member journey end to end.
   - Expected Result:
     - Member, card, wallet, billing, debit, recharge, stock, transaction, and report data remain internally consistent.
     - No hidden archive behavior exists.
     - Safe CRUD lifecycle remains visible through normal UI.
     - Wallet balance and stock quantity reflect the exact net effect of recharge, bill, debit, and stock movement records.

## Role-Based End-to-End Checks
- `Super Admin`
  - Can complete first-time setup.
  - Can access all admin-safe modules.
  - Can create Admin and Cashier accounts.

- `Admin`
  - Can access operational and most admin-safe modules.
  - Can manage allowed subordinate staff only.
  - Can access reports.

- `Cashier`
  - Can access front-desk operational modules only.
  - Can create allowed operational records such as recharge, bill, and debit.
  - Cannot access restricted admin modules such as staff management, products management, stock management, and reports.

## Final Acceptance Criteria
- First-time setup, login, and session handling work correctly.
- Logout and password-change session refresh behavior work correctly.
- All module dependencies can be created in correct order from an empty database.
- Week 6 CRUD behavior works correctly for:
  - `Products`
  - `Members`
  - `Staff`
  - `Wallets`
- Operational action behavior works correctly for:
  - `Cards`
  - `Billing`
  - `Recharges`
  - `Debits`
  - `Stock`
- Stock filtering remains accurate with filtered paginated requests.
- Wallet and stock quantities remain consistent after operational actions.
- Derived visibility works correctly for:
  - `Transactions`
  - `Reports`
- No hard delete or soft archive behavior is required for successful end-to-end execution.
