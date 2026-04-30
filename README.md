# Prepaid Wallet POS System

Prepaid Wallet POS System is a MERN-based business operations application for prepaid member wallets, card-linked billing, recharge/debit handling, product stock tracking, and operational reporting.

The application is designed for small business counter operations where staff need a controlled, auditable flow for members, cards, wallets, billing, stock, and reports from a single admin dashboard.

## Product Summary

- Card-linked member wallet operations.
- Role-based dashboard for `Super Admin`, `Admin`, and `Cashier`.
- Controlled recharge, manual debit, and billing workflows.
- Billing precheck for member, card, and wallet readiness.
- Product and stock movement tracking.
- Transaction ledger derived from recharge and debit activity.
- Reports for sales, recharges, debits, and stock movements.
- Responsive dashboard UI for desktop, tablet, and mobile screens.

## Business Flow

1. The app owner completes first-time setup and creates the first `Super Admin`.
2. Super Admin creates Admin/Cashier staff accounts based on role needs.
3. Members are created and maintained with operational details.
4. Cards are assigned to eligible members and can be replaced through a controlled flow.
5. Wallets are created for eligible member/card combinations.
6. Wallets are funded through recharge records.
7. Billing precheck validates card, member, and wallet readiness before bill creation.
8. Billing deducts wallet balance and product stock while recording bill and transaction history.
9. Manual debits support controlled operational deductions.
10. Transactions, stock movement, and reports provide traceability for business review.

## Roles

| Role | Access Summary |
|---|---|
| Super Admin | Full system access, first-time setup, staff hierarchy management, all modules |
| Admin | Operational/admin access within hierarchy limits, including Cashier management |
| Cashier | Front-desk operational access for members, cards, wallets, recharges, debits, billing, and transactions |

## Core Modules

- Auth & Setup
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

## Key Capabilities

- First-time Super Admin setup.
- Authenticated route protection and role-based module visibility.
- Server-side logout/session invalidation.
- My Account profile and password management.
- Staff create/update/status control/password reset within role hierarchy.
- Member create/update/details with readiness visibility.
- Card assignment, replacement, expiry handling, and readiness profile.
- Wallet creation/status control with balance protected through operational records.
- Recharge and debit records with before/after balance snapshots.
- Billing precheck, duplicate product protection, bill creation, and bill details.
- Atomic wallet and stock updates for billing, recharge, debit, and stock movement flows.
- Stock opening guard, stock status visibility, and movement history.
- Unified transaction ledger for credit/debit activity.
- Reports for sales, recharges, debits, and stock movements.

## Technology Stack

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- bcrypt password hashing
- Helmet and CORS middleware

### Frontend

- React
- Vite
- React Router
- Custom responsive admin dashboard UI

## Repository Structure

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
|       |-- layouts/
|       |-- pages/
|       |-- routes/
|       `-- utils/
|-- docs/
|   `-- test-cases/
|-- .gitignore
`-- README.md
```

## Documentation

- `README.md` is public project documentation.
- `docs/test-cases/` contains public test coverage documents.
- Internal planning and workflow notes are excluded from version control.

## Local Setup

### Prerequisites

- Node.js
- npm
- MongoDB running locally or a valid MongoDB connection string

### Backend Setup

```bash
cd server
npm install
npm run dev
```

Default backend URL:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/v1/health
```

### Frontend Setup

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

Default frontend URL:

```text
http://localhost:5173
```

## Environment Variables

Create a local `.env` file inside `server/` when needed.

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/prepaid-wallet-pos-system
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRES_IN=1h
```

Notes:

- `.env*` files are ignored by Git.
- `JWT_SECRET` should be set for any shared, demo, staging, or production environment.
- `JWT_EXPIRES_IN` is configurable; the application default is `1h`.

## First-Time Usage

1. Start MongoDB.
2. Start the backend server.
3. Start the frontend app.
4. Open `http://localhost:5173`.
5. Complete first-time setup to create the first `Super Admin`.
6. Log in and create required staff, product, member, card, wallet, stock, recharge, billing, and debit records.

## Backend API Overview

All backend routes are mounted under:

```text
/api/v1
```

Main route groups:

- `/auth`
- `/staff`
- `/members`
- `/cards`
- `/wallets`
- `/recharges`
- `/debits`
- `/products`
- `/billing`
- `/transactions`
- `/stocks`
- `/reports`

Standard API response shape:

```json
{
  "success": true,
  "message": "Request completed successfully.",
  "data": {}
}
```

Error responses use the same structure with `success: false` and optional field-level `errors`.

## Reliability And Data Integrity

- Wallet balance changes for recharge, debit, and billing use atomic database updates.
- Billing stock deduction uses conditional quantity updates.
- Duplicate opening stock is guarded at the database level.
- Billing, recharge, debit, and stock records preserve before/after snapshots where applicable.
- Financial and stock history are intentionally non-destructive through normal UI flows.
- Stock filters are applied before pagination for filtered stock-list requests.

## Development Notes

- The root folder does not currently use a root `package.json`; run client and server commands from their own folders.
- Keep business logic validation on the backend as the source of truth.
- Keep role checks enforced on the backend even when frontend hides unavailable modules.
- Prefer adding reusable helpers/components for repeated UI behavior.
- Keep local environment files and internal planning files out of public commits.
- Run backend checks and the frontend build before handing over changes.

## Verification Commands

Backend syntax checks can be run with:

```bash
node --check server/src/app.js
node --check server/src/modules/billing/billing.service.js
node --check server/src/modules/debits/debit.service.js
node --check server/src/modules/recharges/recharge.service.js
node --check server/src/modules/stocks/stock.service.js
```

Frontend production build:

```bash
cd client
npm run build
```

## Test Documentation

Public test cases are available in:

```text
docs/test-cases/
```

They cover:

- Auth/setup
- Staff
- Products
- Members
- Cards
- Wallets
- Stock
- Recharges
- Billing
- Debits
- Transactions
- Reports
- End-to-end application flow

## Current Status

The application includes the core operational modules required for the prepaid wallet POS workflow. It is ready for local demonstration, structured QA validation, and future enhancement. Production deployment should use environment-specific configuration, a managed MongoDB instance, and a strong JWT secret.
