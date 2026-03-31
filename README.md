Prepaid Wallet POS System

Prepaid Wallet POS System is a MERN-based business application for card-linked wallet billing. Members use a linked card to access their wallet, recharge balance, and complete purchases through a controlled billing workflow that keeps billing records, wallet transactions, and stock movements traceable.

Project Highlights

- Card-linked member wallet operations
- Role-based access for Super Admin, Admin, and Cashier
- Wallet recharge and billing workflow with auditability
- Product and stock visibility for counter operations
- Linked transaction, billing, and stock history design

Business Flow

1. A staff user signs in with role-based access.
2. A member is maintained with one linked wallet.
3. An active card is assigned to the member.
4. Wallet balance is recharged through controlled recharge records.
5. Billing reads active product pricing, validates wallet balance, records the bill, deducts wallet balance, and reduces stock within one protected workflow.
6. Transactions and stock movements remain linked for audit and reporting.

Roles

- Super Admin: full system control, first-time setup authority, can create Admin and Cashier
- Admin: operational control, can create Cashier, manages core business modules
- Cashier: billing and recharge operations with limited visibility

Core Modules

- Auth
- Staff
- Members
- Cards
- Wallets
- Recharges
- Products
- Billing
- Transactions
- Stock
- Reports

Technology Stack

- MongoDB
- Express.js
- React.js
- Node.js
- Vite

Repository Structure

```text
prepaid-wallet-pos-system/
├── server/
│   ├── package.json
│   ├── server.js
│   └── src/
│       ├── app.js
│       ├── constants/
│       ├── middlewares/
│       ├── modules/
│       ├── utils/
│       └── validations/
├── client/
│   ├── package.json
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── api/
│       ├── components/
│       ├── constants/
│       ├── features/
│       ├── layouts/
│       ├── pages/
│       ├── routes/
│       ├── utils/
│       ├── App.jsx
│       ├── index.css
│       └── main.jsx
├── .gitignore
└── README.md
```

Build Scope

This repository establishes the core application structure for authentication, staff operations, member and card management, wallet-based transactions, billing, stock handling, and reporting workflows.

Usage Note

Install dependencies for the `server` and `client` applications, then start the backend service and frontend development server in their respective folders.
