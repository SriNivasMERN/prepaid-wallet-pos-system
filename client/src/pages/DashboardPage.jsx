/**
 * Module: Dashboard Page
 * File: DashboardPage.jsx
 * Purpose: Provides the authenticated operational layout with module navigation and logout control.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import SectionCard from "../components/common/SectionCard";
import {
  APP_MODULES,
  APP_NAME,
  DASHBOARD_METRICS
} from "../constants/appConstants";

const moduleScreens = {
  Staff: {
    title: "Staff",
    metrics: ["Active Staff", "Admins", "Cashiers"],
    formFields: [
      { label: "Full Name", type: "text" },
      { label: "Username", type: "text" },
      { label: "Role", type: "select", options: ["Super Admin", "Admin", "Cashier"] },
      { label: "Status", type: "select", options: ["Active", "Inactive"] }
    ],
    filters: ["Search Staff", "Role", "Status"],
    columns: ["Name", "Username", "Role", "Status", "Created By"]
  },
  Members: {
    title: "Members",
    metrics: ["Total Members", "Active Members", "Inactive Members"],
    formFields: [
      { label: "Full Name", type: "text" },
      { label: "Mobile Number", type: "text" },
      { label: "Reference Details", type: "textarea" },
      { label: "Status", type: "select", options: ["Active", "Inactive"] }
    ],
    filters: ["Search Members", "Status", "Card Number"],
    columns: ["Member", "Mobile", "Card", "Wallet", "Status"]
  },
  Cards: {
    title: "Cards",
    metrics: ["Active Cards", "Expired Cards", "Replaced Cards"],
    formFields: [
      { label: "Card Number", type: "text" },
      { label: "Member", type: "search" },
      { label: "Activated At", type: "date" },
      { label: "Expires At", type: "date" }
    ],
    filters: ["Search Card", "Status", "Expiry"],
    columns: ["Card Number", "Member", "Status", "Activated At", "Expires At"]
  },
  Wallets: {
    title: "Wallets",
    metrics: ["Active Wallets", "Low Balance", "Inactive Wallets"],
    formFields: [
      { label: "Member", type: "search" },
      { label: "Wallet Status", type: "select", options: ["Active", "Inactive"] },
      { label: "Current Balance", type: "number", readOnly: true },
      { label: "Linked Card", type: "text", readOnly: true }
    ],
    filters: ["Search Wallet", "Status", "Balance Range"],
    columns: ["Member", "Card", "Balance", "Status", "Updated At"]
  },
  Recharges: {
    title: "Recharges",
    metrics: ["Today Recharges", "Recharge Value", "Recent Credit Entries"],
    formFields: [
      { label: "Card Number", type: "text" },
      { label: "Member", type: "search" },
      { label: "Amount", type: "number" },
      { label: "Payment Mode", type: "select", options: ["Cash", "UPI", "Card"] },
      { label: "Notes", type: "textarea" }
    ],
    filters: ["Date", "Payment Mode", "Cashier"],
    columns: ["Member", "Card", "Amount", "Payment Mode", "Cashier"]
  },
  Products: {
    title: "Products",
    metrics: ["Active Products", "Inactive Products", "Stock Alerts"],
    formFields: [
      { label: "Product Name", type: "text" },
      { label: "Product Code", type: "text" },
      { label: "Selling Price", type: "number" },
      { label: "Unit", type: "select", options: ["Piece", "Bottle", "Pack"] },
      { label: "Status", type: "select", options: ["Active", "Inactive"] }
    ],
    filters: ["Search Product", "Unit", "Status"],
    columns: ["Product", "Code", "Price", "Unit", "Status"]
  },
  Billing: {
    title: "Billing",
    metrics: ["Today Bills", "Collected Amount", "Stock Warnings"],
    formFields: [
      { label: "Card Number", type: "text" },
      { label: "Member", type: "search" },
      { label: "Wallet Balance", type: "number", readOnly: true },
      { label: "Product Lookup", type: "search" },
      { label: "Quantity", type: "number" }
    ],
    filters: ["Bill Number", "Cashier", "Status"],
    columns: ["Product", "Unit Price", "Quantity", "Line Total", "Stock Status"]
  },
  Transactions: {
    title: "Transactions",
    metrics: ["Today Transactions", "Credits", "Debits"],
    formFields: [
      { label: "Member", type: "search" },
      { label: "Transaction Type", type: "select", options: ["Credit", "Debit"] },
      { label: "From Date", type: "date" },
      { label: "To Date", type: "date" }
    ],
    filters: ["Member", "Type", "Date Range"],
    columns: ["Reference", "Member", "Type", "Amount", "Balance After"]
  },
  Stock: {
    title: "Stock",
    metrics: ["Available Items", "Low Stock", "Negative Stock"],
    formFields: [
      { label: "Product", type: "search" },
      { label: "Current Qty", type: "number", readOnly: true },
      { label: "Quantity Change", type: "number" },
      { label: "Movement Type", type: "select", options: ["Opening", "Manual Update"] },
      { label: "Notes", type: "textarea" }
    ],
    filters: ["Search Product", "Stock Status", "Movement Type"],
    columns: ["Product", "Current Qty", "Last Change", "Movement Type", "Updated At"]
  },
  Reports: {
    title: "Reports",
    metrics: ["Sales Report", "Recharge Report", "Stock Report"],
    formFields: [
      { label: "Report Type", type: "select", options: ["Sales", "Recharges", "Stock Movement"] },
      { label: "From Date", type: "date" },
      { label: "To Date", type: "date" },
      { label: "Staff", type: "search" }
    ],
    filters: ["Report Type", "Date Range", "Export"],
    columns: ["Report", "Period", "Records", "Amount", "Action"]
  }
};

/**
 * Renders a form control based on the supplied field type.
 */
function ModuleField({ field }) {
  if (field.type === "textarea") {
    return (
      <label className="field-group field-group--wide">
        <span>{field.label}</span>
        <textarea rows="3" placeholder={field.label} />
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <label className="field-group">
        <span>{field.label}</span>
        <select defaultValue="">
          <option value="" disabled>
            Select
          </option>
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className={`field-group ${field.type === "search" ? "field-group--wide" : ""}`}>
      <span>{field.label}</span>
      <input
        type={field.type === "search" ? "search" : field.type}
        placeholder={field.label}
        readOnly={field.readOnly}
      />
    </label>
  );
}

/**
 * Displays the dashboard shell with module-focused UI sections.
 */
function DashboardPage({ currentStaff, onLogout }) {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState("Billing");

  const activeScreen = moduleScreens[activeModule];

  /**
   * Clears the authenticated session and returns to login.
   */
  const handleLogout = () => {
    onLogout?.();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="app-shell__sidebar">
        <div className="sidebar-brand">
          <span className="brand-badge">POS</span>
          <div>
            <h1>{APP_NAME}</h1>
            <span>{currentStaff?.role || "Staff"}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {APP_MODULES.map((moduleName) => (
            <button
              key={moduleName}
              type="button"
              className={`sidebar-nav__button ${
                activeModule === moduleName ? "is-active" : ""
              }`}
              onClick={() => setActiveModule(moduleName)}
            >
              {moduleName}
            </button>
          ))}
        </nav>
      </aside>

      <main className="app-shell__content">
        <header className="page-header">
          <div>
            <h2>{activeScreen.title}</h2>
            <span>{currentStaff?.fullName || "Staff Session"}</span>
          </div>
          <div className="header-actions">
            <button type="button" className="secondary-button" onClick={handleLogout}>
              Logout
            </button>
            <button type="button" className="primary-button">
              New Entry
            </button>
          </div>
        </header>

        <section className="metric-grid">
          {DASHBOARD_METRICS.map((metric) => (
            <button key={metric.label} type="button" className="metric-card">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </button>
          ))}
          {activeScreen.metrics.map((metric) => (
            <button key={metric} type="button" className="metric-card metric-card--muted">
              <span>{metric}</span>
              <strong>View</strong>
            </button>
          ))}
        </section>

        <SectionCard title={activeScreen.title}>
          <form className="module-form-grid" onSubmit={(event) => event.preventDefault()}>
            {activeScreen.formFields.map((field) => (
              <ModuleField key={field.label} field={field} />
            ))}
            <div className="form-actions form-actions--full">
              <button type="submit" className="primary-button">
                Save
              </button>
              <button type="button" className="secondary-button">
                Reset
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard title="Filters">
          <div className="filter-grid">
            {activeScreen.filters.map((filter) => (
              <label key={filter} className="field-group">
                <span>{filter}</span>
                <input
                  type={
                    filter.toLowerCase().includes("date")
                      ? "date"
                      : filter.toLowerCase().includes("range")
                        ? "text"
                        : "search"
                  }
                  placeholder={filter}
                />
              </label>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title={`${activeScreen.title} List`}
          actions={<button type="button" className="secondary-button">Refresh</button>}
        >
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  {activeScreen.columns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((rowIndex) => (
                  <tr key={rowIndex}>
                    {activeScreen.columns.map((column) => (
                      <td key={`${column}-${rowIndex}`}>
                        {column === "Status" || column.includes("Status") ? (
                          <span className="status-badge">
                            {rowIndex === 3 ? "Inactive" : "Active"}
                          </span>
                        ) : column === "Amount" || column.includes("Price") ? (
                          `Rs ${rowIndex * 120}`
                        ) : (
                          `${column} ${rowIndex}`
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </main>
    </div>
  );
}

export default DashboardPage;
