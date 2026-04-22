/**
 * Module: Dashboard Page
 * File: DashboardPage.jsx
 * Purpose: Provides the authenticated operational layout with module navigation, staff management, member management, card management, and logout control.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import SectionCard from "../components/common/SectionCard";
import { APP_NAME, DASHBOARD_METRICS } from "../constants/appConstants";
import {
  getAllowedModulesForRole,
  getAllowedPermissionsForRole
} from "../constants/accessControl";
import BillingModule from "../features/billing/components/BillingModule";
import CardsModule from "../features/cards/components/CardsModule";
import DebitsModule from "../features/debits/components/DebitsModule";
import MembersModule from "../features/members/components/MembersModule";
import ProductsModule from "../features/products/components/ProductsModule";
import RechargesModule from "../features/recharges/components/RechargesModule";
import { createStaffAccount, fetchStaffList } from "../features/staff/api/staffApi";
import StocksModule from "../features/stocks/components/StocksModule";
import TransactionsModule from "../features/transactions/components/TransactionsModule";
import WalletsModule from "../features/wallets/components/WalletsModule";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

const staffInitialForm = {
  fullName: "",
  username: "",
  password: "",
  role: "Admin",
  status: "Active"
};

const moduleScreens = {
  Staff: {
    title: "Staff",
    metrics: ["Active Staff", "Admins", "Cashiers"],
    filters: ["Search Staff", "Role", "Status"],
    columns: ["Name", "Username", "Role", "Status", "Created By"]
  },
  Members: {
    title: "Members",
    metrics: ["Total Members", "Active Members", "Inactive Members"]
  },
  Cards: {
    title: "Cards",
    metrics: ["Active Cards", "Expired Cards", "Replaced Cards"]
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
  Debits: {
    title: "Debits",
    metrics: ["Today Debits", "Debit Value", "Recent Debit Entries"],
    formFields: [
      { label: "Wallet", type: "search" },
      { label: "Member", type: "search" },
      { label: "Amount", type: "number" },
      { label: "Reason", type: "text" },
      { label: "Notes", type: "textarea" }
    ],
    filters: ["Search Debit", "Reason", "Date", "Cashier"],
    columns: ["Member", "Card", "Amount", "Reason", "Cashier"]
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

function ModuleField({ field }) {
  if (field.type === "textarea") {
    return (
      <label className="field-group field-group--wide">
        <span>{field.label}</span>
        <textarea rows="3" placeholder={field.label} autoComplete="off" />
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <label className="field-group">
        <span>{field.label}</span>
        <select defaultValue="" autoComplete="off">
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
        autoComplete={field.type === "password" ? "new-password" : "off"}
      />
    </label>
  );
}

function validateStaffForm(formData) {
  const nextErrors = {};

  if (!formData.fullName.trim()) {
    nextErrors.fullName = "Full name is required.";
  }

  if (!formData.username.trim()) {
    nextErrors.username = "Username is required.";
  } else if (formData.username.trim().length < 3) {
    nextErrors.username = "Minimum 3 characters required.";
  }

  if (!formData.password) {
    nextErrors.password = "Password is required.";
  } else if (formData.password.length < 8) {
    nextErrors.password = "Minimum 8 characters required.";
  }

  if (!formData.role) {
    nextErrors.role = "Role is required.";
  }

  if (!formData.status) {
    nextErrors.status = "Status is required.";
  }

  return nextErrors;
}

function formatMoney(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "Rs 0.00";
  }

  return `Rs ${amount.toFixed(2)}`;
}

function getStaffRoleOptions(role) {
  if (role === "Admin") {
    return ["Cashier"];
  }

  return ["Admin", "Cashier"];
}

function DashboardPage({ currentStaff, authToken, onLogout }) {
  const navigate = useNavigate();
  const allowedModules = currentStaff?.allowedModules?.length
    ? currentStaff.allowedModules
    : getAllowedModulesForRole(currentStaff?.role);
  const allowedPermissions = currentStaff?.allowedPermissions?.length
    ? currentStaff.allowedPermissions
    : getAllowedPermissionsForRole(currentStaff?.role);
  const [activeModule, setActiveModule] = useState(
    allowedModules.includes("Billing") ? "Billing" : allowedModules[0] || ""
  );
  const roleOptions = getStaffRoleOptions(currentStaff?.role);
  const [staffForm, setStaffForm] = useState({
    ...staffInitialForm,
    role: roleOptions[0] || staffInitialForm.role
  });
  const [staffFormErrors, setStaffFormErrors] = useState({});
  const [staffRequestError, setStaffRequestError] = useState("");
  const [staffSuccessMessage, setStaffSuccessMessage] = useState("");
  const [isCreatingStaff, setIsCreatingStaff] = useState(false);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [staffRecords, setStaffRecords] = useState([]);
  const [memberMetrics, setMemberMetrics] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });
  const [cardMetrics, setCardMetrics] = useState({
    active: 0,
    expired: 0,
    replaced: 0
  });
  const [walletMetrics, setWalletMetrics] = useState({
    active: 0,
    lowBalance: 0,
    inactive: 0
  });
  const [rechargeMetrics, setRechargeMetrics] = useState({
    todayCount: 0,
    todayValue: 0,
    recentEntries: 0
  });
  const [debitMetrics, setDebitMetrics] = useState({
    todayCount: 0,
    todayValue: 0,
    recentEntries: 0
  });
  const [productMetrics, setProductMetrics] = useState({
    active: 0,
    inactive: 0,
    stockAlerts: 0
  });
  const [transactionMetrics, setTransactionMetrics] = useState({
    today: 0,
    credits: 0,
    debits: 0
  });
  const [stockMetrics, setStockMetrics] = useState({
    available: 0,
    lowStock: 0,
    negative: 0
  });
  const [billingMetrics, setBillingMetrics] = useState({
    todayCount: 0,
    collectedAmount: 0,
    stockWarnings: 0
  });

  useEffect(() => {
    if (!allowedModules.length) {
      navigate("/unauthorized", { replace: true });
      return;
    }

    if (!allowedModules.includes(activeModule)) {
      setActiveModule(allowedModules.includes("Billing") ? "Billing" : allowedModules[0]);
    }
  }, [activeModule, allowedModules, navigate]);

  useEffect(() => {
    setStaffForm((currentState) => ({
      ...currentState,
      role: roleOptions.includes(currentState.role) ? currentState.role : roleOptions[0] || ""
    }));
  }, [currentStaff?.role]);

  useEffect(() => {
    const loadStaff = async () => {
      if (activeModule !== "Staff" || !authToken) {
        return;
      }

      setIsLoadingStaff(true);
      setStaffRequestError("");

      try {
        const response = await fetchStaffList(authToken);
        setStaffRecords(response.data || []);
      } catch (error) {
        setStaffRequestError(getApiErrorMessage(error));
      } finally {
        setIsLoadingStaff(false);
      }
    };

    loadStaff();
  }, [activeModule, authToken]);

  const activeScreen = moduleScreens[activeModule];
  const canCreateEntries = allowedPermissions.length > 0;
  const staffMetrics = {
    active: staffRecords.filter((staff) => staff.status === "Active").length,
    admins: staffRecords.filter((staff) => staff.role === "Admin").length,
    cashiers: staffRecords.filter((staff) => staff.role === "Cashier").length
  };

  const resetStaffForm = () => {
    setStaffForm({
      ...staffInitialForm,
      role: roleOptions[0] || staffInitialForm.role
    });
    setStaffFormErrors({});
    setStaffRequestError("");
    setStaffSuccessMessage("");
  };

  const handleLogout = () => {
    onLogout?.();
    navigate("/login", { replace: true });
  };

  const handleStaffInputChange = (event) => {
    const { name, value } = event.target;

    setStaffForm((currentState) => ({
      ...currentState,
      [name]: value
    }));
    setStaffFormErrors((currentErrors) => ({
      ...currentErrors,
      [name]: ""
    }));
    setStaffRequestError("");
    setStaffSuccessMessage("");
  };

  const handleStaffSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateStaffForm(staffForm);
    if (Object.keys(validationErrors).length > 0) {
      setStaffFormErrors(validationErrors);
      return;
    }

    setIsCreatingStaff(true);
    setStaffRequestError("");
    setStaffSuccessMessage("");

    try {
      const response = await createStaffAccount(
        {
          fullName: staffForm.fullName.trim(),
          username: staffForm.username.trim(),
          password: staffForm.password,
          role: staffForm.role,
          status: staffForm.status
        },
        authToken
      );

      setStaffRecords((currentList) => [response.data, ...currentList]);
      resetStaffForm();
      setStaffSuccessMessage("Staff account created successfully.");
    } catch (error) {
      setStaffRequestError(getApiErrorMessage(error));
    } finally {
      setIsCreatingStaff(false);
    }
  };

  if (!activeScreen) {
    return null;
  }

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
          {allowedModules.map((moduleName) => (
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
            <button type="button" className="primary-button" disabled={!canCreateEntries}>
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
          {activeModule === "Staff"
            ? [
                { label: "Active Staff", value: String(staffMetrics.active) },
                { label: "Admins", value: String(staffMetrics.admins) },
                { label: "Cashiers", value: String(staffMetrics.cashiers) }
              ].map((metric) => (
                <button key={metric.label} type="button" className="metric-card metric-card--muted">
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                </button>
              ))
            : activeModule === "Members"
              ? [
                  { label: "Total Members", value: String(memberMetrics.total) },
                  { label: "Active Members", value: String(memberMetrics.active) },
                  { label: "Inactive Members", value: String(memberMetrics.inactive) }
                ].map((metric) => (
                  <button key={metric.label} type="button" className="metric-card metric-card--muted">
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                  </button>
                ))
              : activeModule === "Cards"
                ? [
                    { label: "Active Cards", value: String(cardMetrics.active) },
                    { label: "Expired Cards", value: String(cardMetrics.expired) },
                    { label: "Replaced Cards", value: String(cardMetrics.replaced) }
                  ].map((metric) => (
                    <button key={metric.label} type="button" className="metric-card metric-card--muted">
                      <span>{metric.label}</span>
                      <strong>{metric.value}</strong>
                    </button>
                  ))
                : activeModule === "Wallets"
                  ? [
                      { label: "Active Wallets", value: String(walletMetrics.active) },
                      { label: "Low Balance", value: String(walletMetrics.lowBalance) },
                      { label: "Inactive Wallets", value: String(walletMetrics.inactive) }
                    ].map((metric) => (
                      <button key={metric.label} type="button" className="metric-card metric-card--muted">
                        <span>{metric.label}</span>
                        <strong>{metric.value}</strong>
                      </button>
                    ))
                : activeModule === "Recharges"
                  ? [
                      { label: "Today Recharges", value: String(rechargeMetrics.todayCount) },
                      { label: "Recharge Value", value: `Rs ${Number(rechargeMetrics.todayValue || 0).toFixed(2)}` },
                      { label: "Recent Credit Entries", value: String(rechargeMetrics.recentEntries) }
                    ].map((metric) => (
                      <button key={metric.label} type="button" className="metric-card metric-card--muted">
                        <span>{metric.label}</span>
                        <strong>{metric.value}</strong>
                      </button>
                    ))
                : activeModule === "Debits"
                  ? [
                      { label: "Today Debits", value: String(debitMetrics.todayCount) },
                      { label: "Debit Value", value: `Rs ${Number(debitMetrics.todayValue || 0).toFixed(2)}` },
                      { label: "Recent Debit Entries", value: String(debitMetrics.recentEntries) }
                    ].map((metric) => (
                      <button key={metric.label} type="button" className="metric-card metric-card--muted">
                        <span>{metric.label}</span>
                        <strong>{metric.value}</strong>
                      </button>
                    ))
                : activeModule === "Products"
                  ? [
                      { label: "Active Products", value: String(productMetrics.active) },
                      { label: "Inactive Products", value: String(productMetrics.inactive) },
                      { label: "Stock Alerts", value: String(productMetrics.stockAlerts) }
                    ].map((metric) => (
                      <button key={metric.label} type="button" className="metric-card metric-card--muted">
                        <span>{metric.label}</span>
                        <strong>{metric.value}</strong>
                      </button>
                    ))
                : activeModule === "Billing"
                  ? [
                      { label: "Today Bills", value: String(billingMetrics.todayCount) },
                      { label: "Collected Amount", value: formatMoney(billingMetrics.collectedAmount) },
                      { label: "Stock Warnings", value: String(billingMetrics.stockWarnings) }
                    ].map((metric) => (
                      <button key={metric.label} type="button" className="metric-card metric-card--muted">
                        <span>{metric.label}</span>
                        <strong>{metric.value}</strong>
                      </button>
                    ))
                : activeModule === "Transactions"
                  ? [
                      { label: "Today Transactions", value: String(transactionMetrics.today) },
                      { label: "Credits", value: String(transactionMetrics.credits) },
                      { label: "Debits", value: String(transactionMetrics.debits) }
                    ].map((metric) => (
                      <button key={metric.label} type="button" className="metric-card metric-card--muted">
                        <span>{metric.label}</span>
                        <strong>{metric.value}</strong>
                      </button>
                    ))
                  : activeModule === "Stock"
                    ? [
                        { label: "Available Items", value: String(stockMetrics.available) },
                        { label: "Low Stock", value: String(stockMetrics.lowStock) },
                        { label: "Negative Stock", value: String(stockMetrics.negative) }
                      ].map((metric) => (
                        <button key={metric.label} type="button" className="metric-card metric-card--muted">
                          <span>{metric.label}</span>
                          <strong>{metric.value}</strong>
                        </button>
                      ))
              : activeScreen.metrics.map((metric) => (
                  <button key={metric} type="button" className="metric-card metric-card--muted">
                    <span>{metric}</span>
                    <strong>View</strong>
                  </button>
                ))}
        </section>

        <SectionCard title="Access Summary">
          <div className="filter-grid">
            <label className="field-group">
              <span>Role</span>
              <input type="text" value={currentStaff?.role || ""} readOnly />
            </label>
            <label className="field-group">
              <span>Allowed Modules</span>
              <input type="text" value={String(allowedModules.length)} readOnly />
            </label>
            <label className="field-group">
              <span>Allowed Permissions</span>
              <input type="text" value={String(allowedPermissions.length)} readOnly />
            </label>
          </div>
        </SectionCard>

        {activeModule === "Staff" ? (
          <>
            <SectionCard title="Create Staff Account">
              <form className="form-grid" onSubmit={handleStaffSubmit} autoComplete="off">
                <label className="field-group">
                  <span>Full Name</span>
                  <input
                    type="text"
                    name="fullName"
                    value={staffForm.fullName}
                    onChange={handleStaffInputChange}
                    placeholder="Enter full name"
                    autoComplete="off"
                  />
                  {staffFormErrors.fullName ? (
                    <small className="field-error">{staffFormErrors.fullName}</small>
                  ) : null}
                </label>

                <label className="field-group">
                  <span>Username</span>
                  <input
                    type="text"
                    name="username"
                    value={staffForm.username}
                    onChange={handleStaffInputChange}
                    placeholder="Enter username"
                    autoComplete="off"
                  />
                  {staffFormErrors.username ? (
                    <small className="field-error">{staffFormErrors.username}</small>
                  ) : null}
                </label>

                <label className="field-group">
                  <span>Password</span>
                  <input
                    type="password"
                    name="password"
                    value={staffForm.password}
                    onChange={handleStaffInputChange}
                    placeholder="Create password"
                    autoComplete="new-password"
                  />
                  {staffFormErrors.password ? (
                    <small className="field-error">{staffFormErrors.password}</small>
                  ) : null}
                </label>

                <label className="field-group">
                  <span>Role</span>
                  <select
                    name="role"
                    value={staffForm.role}
                    onChange={handleStaffInputChange}
                    autoComplete="off"
                  >
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  {staffFormErrors.role ? (
                    <small className="field-error">{staffFormErrors.role}</small>
                  ) : null}
                </label>

                <label className="field-group">
                  <span>Status</span>
                  <select name="status" value={staffForm.status} onChange={handleStaffInputChange} autoComplete="off">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  {staffFormErrors.status ? (
                    <small className="field-error">{staffFormErrors.status}</small>
                  ) : null}
                </label>

                {staffRequestError ? <div className="form-message form-message--error">{staffRequestError}</div> : null}
                {staffSuccessMessage ? <div className="form-message">{staffSuccessMessage}</div> : null}

                <div className="form-actions form-actions--full">
                  <button type="submit" className="primary-button" disabled={isCreatingStaff}>
                    {isCreatingStaff ? "Creating..." : "Create Staff"}
                  </button>
                  <button type="button" className="secondary-button" onClick={resetStaffForm}>
                    Reset
                  </button>
                </div>
              </form>
            </SectionCard>

            <SectionCard title="Staff List">
              {isLoadingStaff ? <div className="feedback-actions">Loading staff...</div> : null}
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Username</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Created By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffRecords.length === 0 && !isLoadingStaff ? (
                      <tr>
                        <td colSpan="5">No staff records found.</td>
                      </tr>
                    ) : (
                      staffRecords.map((staff) => (
                        <tr key={staff.id}>
                          <td>{staff.fullName}</td>
                          <td>{staff.username}</td>
                          <td>{staff.role}</td>
                          <td>
                            <span className="status-badge">{staff.status}</span>
                          </td>
                          <td>{staff.createdBy?.fullName || "System"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </>
        ) : activeModule === "Members" ? (
          <MembersModule authToken={authToken} onMetricsChange={setMemberMetrics} />
        ) : activeModule === "Cards" ? (
          <CardsModule authToken={authToken} onMetricsChange={setCardMetrics} />
        ) : activeModule === "Wallets" ? (
          <WalletsModule authToken={authToken} onMetricsChange={setWalletMetrics} />
        ) : activeModule === "Recharges" ? (
          <RechargesModule authToken={authToken} onMetricsChange={setRechargeMetrics} />
        ) : activeModule === "Debits" ? (
          <DebitsModule authToken={authToken} onMetricsChange={setDebitMetrics} />
        ) : activeModule === "Products" ? (
          <ProductsModule authToken={authToken} onMetricsChange={setProductMetrics} />
        ) : activeModule === "Billing" ? (
          <BillingModule authToken={authToken} onMetricsChange={setBillingMetrics} />
        ) : activeModule === "Transactions" ? (
          <TransactionsModule authToken={authToken} onMetricsChange={setTransactionMetrics} />
        ) : activeModule === "Stock" ? (
          <StocksModule authToken={authToken} onMetricsChange={setStockMetrics} />
        ) : (
          <>
            <SectionCard title={activeScreen.title}>
              <form className="module-form-grid" onSubmit={(event) => event.preventDefault()} autoComplete="off">
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
                      autoComplete="off"
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
          </>
        )}
      </main>
    </div>
  );
}

export default DashboardPage;
