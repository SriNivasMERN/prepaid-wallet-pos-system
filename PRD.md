## 1. Product Overview

**Product name:** Prepaid Wallet POS System (MERN)  
**Goal:** A web application for prepaid member wallet operations, card-linked access, controlled recharge and debit handling, billing, stock visibility, and reporting through a role-based admin dashboard.

**Tech stack:**

- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Frontend:** React (Vite), React Router
- **UI/System behavior:** Custom responsive admin dashboard, shared modal system, shared table/details patterns
- **Project layout:** Root `client/` and `server/` folders

**Business objective:**

- Provide a controlled prepaid-wallet operating system for counter staff.
- Reduce manual error risk in recharge, debit, billing, and stock workflows.
- Preserve auditable financial and stock history for business review.
- Support role-based operations without exposing unauthorized actions.

**Release intent:**

- Deliver a stable single-business application for day-to-day operational use.
- Prioritize correctness, auditability, and operator clarity over feature breadth.
- Keep the product ready for iterative expansion without redesigning the core operating model.

---

## 2. Scope

- **In scope**
  - First-time setup for Super Admin.
  - Secure login and authenticated role-based access.
  - Logout with server-side session invalidation.
  - Self-service profile and password management for the current logged-in staff account.
  - Staff management with hierarchy-safe create, update, status control, and password reset.
  - Member management with operational readiness awareness.
  - Card assignment, operational visibility, and replacement.
  - Wallet creation and status control.
  - Recharge creation and visibility.
  - Manual debit creation and visibility.
  - Product management.
  - Billing precheck, bill creation, and bill visibility.
  - Transaction ledger visibility.
  - Stock movement tracking and stock visibility.
  - Reports visibility for sales, recharge, debit, and stock movement outputs.
  - Responsive admin dashboard behavior across desktop, tablet, and mobile screens.
- **Out of scope**
  - Payment gateway integration.
  - Multi-tenant business support.
  - Multi-branch operations.
  - Public customer portal.
  - Email/OTP-based account workflows.

### 2.1 Delivery Priorities

- **P0 / Must-have for release**
  - Auth and first-time setup
  - Role-based access control
  - Staff hierarchy controls
  - Members, cards, and wallets
  - Recharge, debit, and billing
  - Product and stock management
  - Transactions and reports
  - Audit-safe immutable financial history
- **P1 / Important after release stabilization**
  - Expanded report exports or printable outputs
  - Richer dashboard analytics
  - Faster high-volume operational shortcuts
- **P2 / Future expansion**
  - Branch-aware operations
  - Customer-facing experiences
  - External payment integrations

---

## 3. User Roles & Use Cases

**Roles:**  
- **Super Admin**
- **Admin**
- **Cashier**

**Key use cases:**

- **Authentication**
  - Complete first-time Super Admin setup.
  - Log in and access only allowed modules.
  - Log out and invalidate the active session.
  - Update own profile and password through `My Account`.

- **Staff**
  - Super Admin creates Admin and Cashier accounts.
  - Admin creates and manages Cashier accounts only.
  - Manage allowed staff details.
  - Reset passwords for manageable staff accounts.
  - Activate or mark manageable staff accounts inactive.

- **Members**
  - Create members with identity and reference details.
  - Edit member information safely.
  - Activate or mark members inactive.
  - View member details and operational readiness.

- **Cards**
  - Assign an active card to an eligible member with generated editable card number support.
  - View card details and operational readiness.
  - Replace an active eligible card without breaking member ownership.

- **Wallets**
  - Create one wallet for an operationally eligible member.
  - View wallet details.
  - Update wallet status.

- **Recharges**
  - Recharge active wallets linked to active members with usable cards.
  - View recharge history and recharge details.

- **Debits**
  - Create manual debit entries for active wallets linked to active members with usable cards.
  - View debit history and debit details.

- **Billing**
  - Check card/member/wallet readiness before billing.
  - Create bills with stock deduction and wallet deduction.
  - View bill details and line items.

- **Stock**
  - Record stock movements.
  - View stock state, latest movement visibility, and alert states.

- **Reports**
  - Review derived operational reports for core financial and stock workflows.

---

## 4. Functional Requirements

### 4.1 Global Concepts & Definitions

- **Staff account:** Internal user account with role, status, and access profile.
- **Member:** A business customer identity that may hold one linked card and one linked wallet.
- **Card:** A member-linked access card used for wallet-backed operations.
- **Wallet:** A member balance store used for recharge, debit, and billing.
- **Recharge:** A wallet credit entry.
- **Debit:** A wallet deduction entry outside the billing flow.
- **Bill:** A completed product purchase record that deducts wallet balance and stock.
- **Stock movement:** An auditable quantity change record for a product.
- **Operational readiness:** Whether a member/card/wallet combination is currently eligible for an operation.
- **Immutable financial history:** Billing, recharge, debit, and stock history remain visible and auditable rather than editable/deletable.
- **Correction flow:** Operational mistakes are corrected through explicit reversal or adjustment records, never by mutating or deleting committed financial history.

---

### 4.2 Authentication & Session Management

**Capabilities:**

- First-time setup creates the initial Super Admin account.
- Login is required before any protected module access.
- JWT expiry is configurable through backend runtime configuration.
- Authenticated staff profile can be fetched through the current-session endpoint.
- Logout invalidates the current token by advancing the staff token version.
- Current staff can update own:
  - full name
  - username
  - password
- Password change refreshes the current session token so the active browser flow remains usable while older tokens are rejected.

**Routes:**

- `GET /api/v1/auth/setup-status`
- `POST /api/v1/auth/setup`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `PATCH /api/v1/auth/me/profile`
- `PATCH /api/v1/auth/me/password`

**Rules:**

- Setup is one-time only.
- Username remains unique.
- Password change requires current password.
- Old tokens are rejected after logout or successful password change.
- Self-service account flow does not allow self role or self status changes.

---

### 4.3 Role Access Model

**Module visibility:**

- **Super Admin**
  - Staff
  - Members
  - Cards
  - Wallets
  - Recharges
  - Debits
  - Products
  - Billing
  - Transactions
  - Stock
  - Reports

- **Admin**
  - Staff
  - Members
  - Cards
  - Wallets
  - Recharges
  - Debits
  - Products
  - Billing
  - Transactions
  - Stock
  - Reports

- **Cashier**
  - Members
  - Cards
  - Wallets
  - Recharges
  - Debits
  - Billing
  - Transactions

**Hierarchy rules:**

- Super Admin can manage Admin and Cashier.
- Admin can manage Cashier only.
- Cashier cannot manage staff.
- Self account must not be managed through Staff module; self-service account flow is separate.

---

### 4.4 Staff Management

**Model concepts:**

- `fullName`
- `username`
- `passwordHash`
- `tokenVersion`
- `role`
- `status`
- `createdBy`
- `updatedBy`
- audit timestamps

**Functional rules:**

- Only allowed hierarchy roles can be created.
- Username is unique.
- Staff update respects role boundary.
- Staff password reset is separate from normal edit flow.
- Inactivation is status-only, not destructive removal.
- Staff details view is always non-destructive.

**Routes:**

- `GET /api/v1/staff`
- `POST /api/v1/staff`
- `PATCH /api/v1/staff/:staffId`
- `PATCH /api/v1/staff/:staffId/reset-password`

---

### 4.5 Members

**Model fields:**

- `fullName`
- `mobileNumber`
- `referenceDetails`
- `linkedCardId`
- `linkedWalletId`
- `status`
- audit fields

**Functional rules:**

- Mobile number is unique across active records.
- Member can be active or inactive.
- Member details modal shows operational readiness context.
- When an active member is marked inactive, the linked active card is also protected through status change logic.
- Member history is not soft-archived through UI flows; lifecycle is handled through active/inactive state.
- Reactivation must fail if it would violate active-record uniqueness rules such as mobile number conflicts.

**Routes:**

- `GET /api/v1/members`
- `POST /api/v1/members`
- `GET /api/v1/members/:memberId`
- `PATCH /api/v1/members/:memberId`
- `GET /api/v1/members/:memberId/operational-profile`

---

### 4.6 Cards

**Model fields:**

- `cardNumber`
- `memberId`
- `status`
- `activatedAt`
- `expiresAt`
- audit fields

**Functional rules:**

- Card number is unique.
- Card number can be generated by the system and still edited before save.
- Only active members can receive a card.
- One active card per member is enforced.
- Card activation date should default to the current date.
- Card expiry date should default to one year after activation.
- Expiry state affects operational readiness.
- Card replacement:
  - allowed only for active non-expired cards
  - preserves member ownership
  - inactivates the previous card
- Card detail view shows readiness information and blocking reason where applicable.

**Routes:**

- `GET /api/v1/cards`
- `GET /api/v1/cards/next-number`
- `POST /api/v1/cards`
- `GET /api/v1/cards/:cardId`
- `GET /api/v1/cards/:cardId/operational-profile`
- `PATCH /api/v1/cards/:cardId/replace`

---

### 4.7 Wallets

**Model fields:**

- `memberId`
- `balance`
- `status`
- audit fields

**Functional rules:**

- One wallet per member.
- Wallet can be created only for:
  - active member
  - linked usable active card
- Wallet details are viewable.
- Wallet status may be changed administratively.
- Wallet balance history is preserved through recharge, debit, and billing records rather than direct manual editing.

**Routes:**

- `GET /api/v1/wallets`
- `POST /api/v1/wallets`
- `GET /api/v1/wallets/:walletId`
- `PATCH /api/v1/wallets/:walletId`

---

### 4.8 Recharges

**Model fields:**

- `walletId`
- `memberId`
- `cardId`
- `amount`
- `paymentMode`
- `notes`
- `balanceBefore`
- `balanceAfter`
- audit fields

**Functional rules:**

- Recharge is allowed only for:
  - active wallet
  - active member
  - usable active linked card
- Recharge updates wallet balance.
- Recharge balance updates use atomic balance increments so close-together valid recharges do not overwrite each other.
- Recharge creation must be safe against duplicate submission or client retry so the same intended recharge cannot be committed twice.
- Recharge records remain immutable after creation.
- Recharge details modal shows member/card/amount/payment/balance context.

**Routes:**

- `GET /api/v1/recharges`
- `POST /api/v1/recharges`
- `GET /api/v1/recharges/:rechargeId`

---

### 4.9 Debits

**Model fields:**

- `walletId`
- `memberId`
- `cardId`
- `amount`
- `reason`
- `notes`
- `balanceBefore`
- `balanceAfter`
- audit fields

**Functional rules:**

- Debit is allowed only for:
  - active wallet
  - active member
  - usable active linked card
- Debit amount cannot exceed available wallet balance.
- Debit balance updates use atomic conditional deduction so close-together debits cannot overdraw the wallet.
- Debit creation must be safe against duplicate submission or client retry so the same intended debit cannot be committed twice.
- Debit records remain immutable after creation.
- Debit details modal shows member/card/amount/reason/balance context.

**Routes:**

- `GET /api/v1/debits`
- `POST /api/v1/debits`
- `GET /api/v1/debits/:debitId`

---

### 4.10 Products

**Model fields:**

- `productName`
- `productCode`
- `description`
- `sellingPrice` (displayed as `MRP` in the UI)
- `unit`
- `status`
- audit fields

**Functional rules:**

- Product code is unique.
- Product code can be generated by the system and still edited before save.
- Product form uses a two-field-per-row layout:
  - product name and product code
  - MRP and unit
  - description and status
- Description is optional and limited to a controlled text length.
- Supported units should show common units first:
  - `kg`
  - `Litre`
  - `Piece`
  - `Bottle`
  - `Pack`
  - `Dozen`
  - `Box`
  - `Case`
- `kg` must remain fully lowercase in the UI.
- Products can be active or inactive.
- Only active products are eligible for billing and active stock selection flows.
- Product history is kept visible through lifecycle status rather than delete/archive UI.
- Product form values should have clear readable contrast and should not visually appear disabled.
- Product description control should stay compact and visually aligned with the status control.

**Routes:**

- `GET /api/v1/products`
- `GET /api/v1/products/next-code`
- `POST /api/v1/products`
- `PATCH /api/v1/products/:productId`
- `PATCH /api/v1/products/:productId/status`

---

### 4.11 Billing

**Model fields:**

- `billNumber`
- `walletId`
- `memberId`
- `cardId`
- `items`
- `totalAmount`
- `itemCount`
- `status`
- `notes`
- `balanceBefore`
- `balanceAfter`
- audit fields

**Functional rules:**

- Billing precheck verifies readiness before bill creation.
- Billing requires:
  - active usable card
  - active member
  - active wallet
  - sufficient balance
  - active products
  - sufficient stock
- Bill creation deducts:
  - wallet balance
  - stock quantities
- Wallet deduction is atomic and conditional on available balance.
- Stock deduction is atomic and conditional on available quantity.
- Billing also records a linked billing debit record so wallet outflow appears consistently in financial history and the unified transaction ledger.
- Billing creation must be safe against duplicate submission or client retry so the same intended bill cannot be committed twice.
- Bills remain immutable after creation.
- Wrong bills are corrected only through approved reversal or offset flows; original bills are never edited or deleted.
- Bill detail modal shows summary plus line items.

**Routes:**

- `GET /api/v1/billing`
- `GET /api/v1/billing/precheck`
- `GET /api/v1/billing/:billId`
- `POST /api/v1/billing`

---

### 4.12 Transactions

**Definition:**

- Derived ledger view built from recharge records and debit records, including billing-linked debit records.

**Functional rules:**

- Supports search, type, and date filtering.
- Presents credit/debit entries in one unified visibility layer.
- Remains read-only.
- Each transaction row must expose its source type clearly so users can distinguish recharge, manual debit, and billing-linked debit activity.

**Routes:**

- `GET /api/v1/transactions`

---

### 4.13 Stock

**Model concepts:**

- `Stock`
  - `productId`
  - `currentQuantity`
  - latest movement metadata
- `StockMovement`
  - `stockId`
  - `productId`
  - `quantityBefore`
  - `quantityChange`
  - `quantityAfter`
  - `movementType`
  - `notes`

**Functional rules:**

- Opening movement allowed once per product.
- Duplicate opening movement is guarded at database level for the same product.
- Stock updates are auditable through movement history.
- Manual stock movements update current quantity through atomic quantity changes.
- Stock list derives:
  - available
  - low stock
  - negative stock
  - out of stock
- Stock status and movement type filters are applied before pagination when filtered pagination is requested.
- Stock detail visibility is non-destructive.
- Stock history is not edited or deleted through UI.

**Routes:**

- `GET /api/v1/stocks`
- `POST /api/v1/stocks/movements`

---

### 4.14 Reports

**Supported report types:**

- Sales
- Recharges
- Debits
- Stock

**Functional rules:**

- Reports are derived from source operational data.
- Date filtering is supported.
- Records remain read-only.
- Financial summaries must remain historically stable for the selected date range and must not shift because of later edits to master data such as staff, member, or product names.
- Report rows should prefer transaction-time snapshot values for audit readability wherever historical labels matter.

**Routes:**

- `GET /api/v1/reports`

---

## 5. Non-Functional Requirements

- **Performance**
  - Shared search handling for list endpoints.
  - Optional pagination support for list/report endpoints.
  - Lighter read queries through broader `lean()` use on non-mutating paths.
  - Billing, debit, recharge, and stock detail/read paths avoid unnecessary Mongoose document hydration where mutation is not required.
  - Added index coverage for high-frequency query dimensions.
- **Reliability**
  - Billing, recharge, debit, and stock flows use atomic updates for balance and quantity changes where concurrent use can happen.
  - Billing, recharge, and debit flows include rollback/compensation protection for partial failure scenarios.
  - Money-moving create operations must be safe against duplicate client submission and network retry behavior.
  - Duplicate opening stock is prevented consistently.
  - Validation errors return consistent API response structure.
- **Usability**
  - Responsive dashboard and module layouts.
  - Consistent popup/modal system.
  - Dense table and details visibility patterns for operational users.
- **Security**
  - Protected routes require authentication.
  - Role-based access enforced on backend and reflected in frontend visibility.
  - Username uniqueness and password validation remain enforced.
  - Session tokens include staff token version validation.
  - Logout and password change invalidate previous tokens.

---

## 6. System Architecture

- **Overall Architecture**
  - `server/`: Express + Mongoose REST backend
  - `client/`: Vite + React SPA
- **API Style**
  - REST JSON
- **Response format**
  - Success: `{ success: true, message, data }`
  - Error: `{ success: false, message, errors? }`
- **Routing**
  - Backend routes mounted under `/api/v1`
  - Frontend uses route protection and dashboard-driven module navigation

---

## 7. Data Model (MongoDB Collections)

### 7.1 `staff`

- Stores staff identity, password hash, token version, role, status, and audit fields.

### 7.2 `members`

- Stores member identity, reference details, linked card/wallet ids, status, and audit fields.

### 7.3 `cards`

- Stores member-linked card records, lifecycle state, activation and expiry dates, and audit fields.

### 7.4 `wallets`

- Stores member-linked wallet state, balance, status, and audit fields.

### 7.5 `recharges`

- Stores wallet credit entries and before/after balance snapshots.

### 7.6 `debits`

- Stores manual or billing-linked wallet debit entries and before/after balance snapshots.

### 7.7 `products`

- Stores product master data used by billing and stock flows.

### 7.8 `bills`

- Stores immutable completed bill records and line items.

### 7.9 `stocks`

- Stores current stock state per product.

### 7.10 `stock_movements`

- Stores auditable stock movement history.
- Enforces one active opening movement per product.

---

## 8. API Design

All endpoints are mounted under `/api/v1`.

### 8.1 Auth

- `GET /api/v1/auth/setup-status`
- `POST /api/v1/auth/setup`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `PATCH /api/v1/auth/me/profile`
- `PATCH /api/v1/auth/me/password`

### 8.2 Staff

- `GET /api/v1/staff`
- `POST /api/v1/staff`
- `PATCH /api/v1/staff/:staffId`
- `PATCH /api/v1/staff/:staffId/reset-password`

### 8.3 Members

- `GET /api/v1/members`
- `POST /api/v1/members`
- `GET /api/v1/members/:memberId`
- `PATCH /api/v1/members/:memberId`
- `GET /api/v1/members/:memberId/operational-profile`

### 8.4 Cards

- `GET /api/v1/cards`
- `POST /api/v1/cards`
- `GET /api/v1/cards/:cardId`
- `GET /api/v1/cards/:cardId/operational-profile`
- `PATCH /api/v1/cards/:cardId/replace`

### 8.5 Wallets

- `GET /api/v1/wallets`
- `POST /api/v1/wallets`
- `GET /api/v1/wallets/:walletId`
- `PATCH /api/v1/wallets/:walletId`

### 8.6 Recharges

- `GET /api/v1/recharges`
- `POST /api/v1/recharges`
- `GET /api/v1/recharges/:rechargeId`

### 8.7 Debits

- `GET /api/v1/debits`
- `POST /api/v1/debits`
- `GET /api/v1/debits/:debitId`

### 8.8 Products

- `GET /api/v1/products`
- `POST /api/v1/products`
- `PATCH /api/v1/products/:productId`
- `PATCH /api/v1/products/:productId/status`

### 8.9 Billing

- `GET /api/v1/billing`
- `GET /api/v1/billing/precheck`
- `GET /api/v1/billing/:billId`
- `POST /api/v1/billing`

### 8.10 Transactions

- `GET /api/v1/transactions`

### 8.11 Stock

- `GET /api/v1/stocks`
- `POST /api/v1/stocks/movements`

### 8.12 Reports

- `GET /api/v1/reports`

### 8.13 API Validation & Error Handling

- Validation failures return structured errors.
- Not-found, conflict, access, and generic failures use centralized error patterns.
- Protected routes require valid authenticated staff context.
- Token version mismatch is treated as an invalid session.
- Recharge, debit, and billing create endpoints must reject duplicate retried submissions through a defined request identity or equivalent idempotency mechanism.

---

## 9. Frontend Application

### 9.1 Layout & Navigation

- Sidebar-driven admin layout.
- Sticky page header with module title and utility actions.
- Role-driven module visibility.
- Shared metric-card dashboard pattern.

### 9.2 Global State & Data Loading

- Auth session is loaded and refreshed at app level.
- Current staff access profile drives allowed modules and permissions.
- Password-change response refreshes the active app session.
- Logout clears the local session after server-side invalidation.
- Module data loads on demand.

### 9.3 Forms

- Create/edit flows use inline validation and shared field styling.
- Default focus behavior targets the first editable/selectable field when it improves data entry.
- Search-first forms do not force focus to the next editable field if the primary lookup is searchable.
- High-volume lookup fields use searchable selectors for member, wallet, product, and card-number selection where applicable.
- Date fields use sensible defaults where applicable:
  - current date by default
  - one-year expiry default for card expiry fields

### 9.4 Dashboard

- Module-aware metric cards
- Record popup drilldowns
- Shared modal/table presentation

### 9.5 Modules

- Staff
- Members
- Cards
- Wallets
- Recharges
- Debits
- Products
- Billing
- Transactions
- Stock
- Reports

### 9.6 Popup System

- Shared modal shell
- Uniform detail, edit, confirmation, and metric-popup structure
- Responsive body/footer behavior

---

## 10. Error Handling & Notifications

- API error messages are surfaced through shared frontend helpers.
- Form-level errors stay inline.
- Success/error messages are shown near module actions and form areas.

---

## 11. Environment & Project Setup

### 11.1 Repository Structure

- Root:
  - `client/`
  - `server/`
  - `docs/`
  - `workflow/`
  - `README.md`

### 11.2 Runtime Basics

- Backend default Mongo connection is configured through server runtime config.
- Frontend runs through Vite.
- Backend and frontend are started separately in their own folders.

---

## 12. Assumptions, Clarifications, and Open Decisions

### 12.1 Confirmed Assumptions

- Single business deployment.
- Same operational timezone for server and UI usage.
- Business-day filters and daily reports use the single configured operational timezone for day-boundary calculations.
- Financial history remains immutable after creation.
- Lifecycle control uses active/inactive status rather than archive/delete flows.
- Search behavior is partial-match oriented on supported fields.
- Core list endpoints support optional pagination without requiring backend redesign.
- Filtered stock pagination is expected to filter first and then apply the page window.

### 12.2 Open Product Decisions

- Decide whether correction flows for wrong recharge, debit, or billing actions will be available to Admin only or Super Admin only.
- Decide whether report export is in scope for the release.
- Decide whether negative stock visibility is informational only or whether privileged corrective movements are part of the product policy.
- Decide whether cashier-created records require additional maker-checker approval in any future compliance-sensitive deployment.

---

## 13. Validation, Acceptance, and Readiness

### 13.1 Business Logic Validation

- First-time setup creates exactly one initial Super Admin and blocks repeated setup once completed.
- Only eligible members receive wallets and cards.
- Only usable member/card/wallet combinations can recharge, debit, or bill.
- Billing cannot proceed with insufficient balance, inactive dependencies, or invalid stock state.
- Close-together recharge, debit, billing, and stock requests keep balances and quantities consistent without double-application.
- Opening stock cannot be recorded more than once for the same product.
- Staff hierarchy rules remain enforced for create, update, status control, and password reset actions.
- Self-service profile flow remains separate from Staff management flow.
- Wrong operational records are corrected through approved reversal or adjustment flows rather than mutation of committed history.

### 13.2 Performance Validation

- Search handling is predictable across supported list modules.
- Frequent list queries have appropriate index coverage for expected operational usage.
- Large list/report endpoints support optional pagination windows without changing filtering behavior.
- Read-heavy service paths use lean query results where document mutation is not required.
- Stock filtered pagination returns matching rows instead of paginating before filtering.
- Dashboard metric calculations remain lightweight enough for repeated operational refresh.

### 13.3 UI/UX Validation

- Responsive layout works across desktop, tablet, and mobile breakpoints used by the business.
- Shared modal behavior remains consistent across detail, create, edit, and confirmation flows.
- Detail, table, and confirmation patterns remain consistent across modules.
- Sticky header and navigation patterns support repeated operational use without hiding critical actions or feedback.
- Search-first and high-frequency entry flows reduce avoidable data-entry friction.

### 13.4 Release Readiness

- Core business modules are implemented for the agreed release scope.
- Operational flows are connected end-to-end across auth, wallet movement, billing, stock, and reporting.
- Performance, auditability, and operational safety meet release expectations for the defined scope.
- The application is suitable for business operational use and further iterative expansion.
