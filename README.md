Prepaid Wallet POS System

Prepaid Wallet POS System is a MERN-based business application for card-linked wallet billing. Members use a linked card to access their wallet, recharge balance, and complete purchases through a controlled billing workflow that keeps billing records, wallet transactions, and stock movements traceable.

Project Highlights

- Card-linked member wallet operations
- Role-based access for Super Admin, Admin, and Cashier
- Wallet recharge, manual debit, and billing workflow with auditability
- Product and stock visibility for counter operations
- Linked transaction, billing, debit, recharge, and stock history design
- Self-service account management for logged-in staff
- Safe operational details, readiness checks, and card replacement flow
- Responsive admin dashboard UI for desktop, tablet, and mobile screens

Business Flow

1. A staff user completes first-time setup or signs in with role-based access.
2. A member is maintained with one linked card and one linked wallet.
3. An active card is assigned to the member and can be replaced through a controlled replacement flow.
4. Wallet balance is recharged through controlled recharge records.
5. Billing can precheck member, card, and wallet readiness before submission.
6. Billing reads active product pricing, validates wallet balance, records the bill, deducts wallet balance, and reduces stock within one protected workflow.
7. Manual debit entries remain controlled and auditable.
8. Transactions, stock movements, billing records, recharge records, and debit records remain linked for audit and reporting.

Roles

- Super Admin: full system control, first-time setup authority, can create Admin and Cashier, can manage higher-level operational settings
- Admin: operational control, can create Cashier, manages core business modules within allowed hierarchy
- Cashier: billing, recharge, debit, and transaction-oriented operations with limited visibility

Core Modules

- Auth
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

Key Functional Coverage

- First-time Super Admin setup
- Secure login and authenticated route protection
- My Account profile update and password change for the current logged-in staff
- Staff creation, update, status control, and controlled password reset
- Member create, update, details view, and operational readiness profile
- Card assign, details view, operational readiness profile, and replacement
- Wallet create, update, details view, and lifecycle control
- Recharge creation and details view
- Debit creation and details view
- Product create, update, details view, and lifecycle control
- Billing precheck, bill creation, and bill details view
- Transaction ledger visibility
- Stock movement recording and stock details view
- Reports for sales, recharges, debits, and stock movement

Technology Stack

- MongoDB
- Express.js
- React.js
- Node.js
- Vite

Repository Structure

```text
prepaid-wallet-pos-system/
|-- server/
|   |-- package.json
|   |-- server.js
|   `-- src/
|       |-- app.js
|       |-- config/
|       |-- constants/
|       |-- middlewares/
|       |-- modules/
|       `-- utils/
|-- client/
|   |-- package.json
|   |-- index.html
|   |-- vite.config.js
|   `-- src/
|       |-- api/
|       |-- components/
|       |-- constants/
|       |-- features/
|       |-- hooks/
|       |-- pages/
|       |-- routes/
|       `-- utils/
|-- docs/
|   `-- test-cases/
|-- workflow/
|-- .gitignore
`-- README.md
```

Build Scope

This repository now covers the main application structure and operational workflows for authentication, staff operations, member and card management, wallet-based transactions, recharge and debit handling, billing, stock handling, transaction visibility, and reporting workflows.

Performance and Safety Notes

- Search-heavy list endpoints use safer shared search handling.
- Major list endpoints support optional pagination parameters.
- Billing, recharge, and debit flows include stronger rollback protection to reduce inconsistent partial-write risk.
- The frontend dashboard uses shared responsive layout behavior and lighter metric computation patterns for smoother use.

Setup

1. Install backend dependencies:

   ```bash
   cd server
   npm install
   ```

2. Install frontend dependencies:

   ```bash
   cd client
   npm install
   ```

3. Start the backend server:

   ```bash
   cd server
   npm run dev
   ```

4. Start the frontend development server:

   ```bash
   cd client
   npm run dev
   ```

Usage Note

By default, the backend runs against MongoDB configured through environment/runtime settings, and the frontend runs through Vite. Start both the `server` and `client` applications in their respective folders before opening the app in the browser.
