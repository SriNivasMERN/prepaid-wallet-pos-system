/**
 * Module: Reports Module UI
 * File: ReportsModule.jsx
 * Purpose: Provides the Reports module filters, summary view, and report records table connected to backend APIs.
 */

import { useEffect, useState } from "react";

import SectionCard from "../../../components/common/SectionCard";
import { getApiErrorMessage } from "../../../utils/getApiErrorMessage";
import { fetchReport } from "../api/reportApi";

const reportInitialFilters = {
  type: "Sales",
  fromDate: "",
  toDate: ""
};

function formatCurrency(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "Rs 0.00";
  }

  return `Rs ${amount.toFixed(2)}`;
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return `${date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  })} ${date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  })}`;
}

function toTitleCase(value) {
  return String(value || "")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (character) => character.toUpperCase())
    .trim();
}

function formatSummaryValue(key, value) {
  if (key === "paymentModeTotals" && value && typeof value === "object") {
    const entries = Object.entries(value);

    if (entries.length === 0) {
      return "-";
    }

    return entries
      .map(([paymentMode, amount]) => `${paymentMode}: ${formatCurrency(amount)}`)
      .join(" | ");
  }

  if (key.toLowerCase().includes("amount")) {
    return formatCurrency(value);
  }

  return String(value ?? "-");
}

function buildDashboardMetrics(reportType, summary = {}, recordCount = 0) {
  if (reportType === "Sales") {
    return {
      firstLabel: "Bills",
      firstValue: String(summary.totalBills || recordCount || 0),
      secondLabel: "Sales Value",
      secondValue: formatCurrency(summary.totalAmount || 0),
      thirdLabel: "Items Sold",
      thirdValue: String(summary.totalItems || 0)
    };
  }

  if (reportType === "Recharges") {
    return {
      firstLabel: "Recharges",
      firstValue: String(summary.totalRecharges || recordCount || 0),
      secondLabel: "Recharge Value",
      secondValue: formatCurrency(summary.totalAmount || 0),
      thirdLabel: "Payment Modes",
      thirdValue: String(Object.keys(summary.paymentModeTotals || {}).length)
    };
  }

  if (reportType === "Debits") {
    return {
      firstLabel: "Debits",
      firstValue: String(summary.totalDebits || recordCount || 0),
      secondLabel: "Debit Value",
      secondValue: formatCurrency(summary.totalAmount || 0),
      thirdLabel: "Billing Debits",
      thirdValue: String(summary.billingDebits || 0)
    };
  }

  return {
    firstLabel: "Movements",
    firstValue: String(summary.totalMovements || recordCount || 0),
    secondLabel: "Inward Qty",
    secondValue: String(summary.inwardQuantity || 0),
    thirdLabel: "Outward Qty",
    thirdValue: String(summary.outwardQuantity || 0)
  };
}

function getReportColumns(reportType) {
  if (reportType === "Sales") {
    return ["Reference", "Member", "Card", "Total", "Items", "Status", "Created At"];
  }

  if (reportType === "Recharges") {
    return ["Reference", "Member", "Card", "Amount", "Payment Mode", "Balance After", "Created At"];
  }

  if (reportType === "Debits") {
    return ["Reference", "Member", "Card", "Amount", "Reason", "Balance After", "Created At"];
  }

  return ["Reference", "Product", "Code", "Qty Before", "Qty Change", "Qty After", "Created At"];
}

function ReportsModule({ authToken, onMetricsChange }) {
  const [reportRequestError, setReportRequestError] = useState("");
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [reportFilterForm, setReportFilterForm] = useState(reportInitialFilters);
  const [appliedReportFilters, setAppliedReportFilters] = useState(reportInitialFilters);
  const [reportReloadToken, setReportReloadToken] = useState(0);
  const [reportData, setReportData] = useState({
    reportType: "Sales",
    fromDate: null,
    toDate: null,
    summary: {},
    records: []
  });

  useEffect(() => {
    const loadReport = async () => {
      if (!authToken) {
        return;
      }

      setIsLoadingReport(true);
      setReportRequestError("");

      try {
        const response = await fetchReport(authToken, appliedReportFilters);
        const nextReport = response.data || {
          reportType: appliedReportFilters.type || "Sales",
          summary: {},
          records: []
        };

        setReportData(nextReport);
        onMetricsChange?.(
          buildDashboardMetrics(
            nextReport.reportType,
            nextReport.summary,
            Array.isArray(nextReport.records) ? nextReport.records.length : 0
          )
        );
      } catch (error) {
        setReportRequestError(getApiErrorMessage(error));
      } finally {
        setIsLoadingReport(false);
      }
    };

    loadReport();
  }, [authToken, appliedReportFilters, reportReloadToken, onMetricsChange]);

  const handleReportFilterChange = (event) => {
    const { name, value } = event.target;

    setReportFilterForm((currentState) => ({
      ...currentState,
      [name]: value
    }));
  };

  const handleReportFilterSubmit = (event) => {
    event.preventDefault();
    setAppliedReportFilters({
      type: reportFilterForm.type,
      fromDate: reportFilterForm.fromDate,
      toDate: reportFilterForm.toDate
    });
  };

  const resetReportFilters = () => {
    setReportFilterForm(reportInitialFilters);
    setAppliedReportFilters(reportInitialFilters);
  };

  const summaryEntries = Object.entries(reportData.summary || {});
  const reportColumns = getReportColumns(reportData.reportType);

  return (
    <>
      <SectionCard title="Filters">
        <form className="filter-grid" onSubmit={handleReportFilterSubmit} autoComplete="off">
          <label className="field-group">
            <span>Report Type</span>
            <select
              name="type"
              value={reportFilterForm.type}
              onChange={handleReportFilterChange}
              autoComplete="off"
            >
              <option value="Sales">Sales</option>
              <option value="Recharges">Recharges</option>
              <option value="Debits">Debits</option>
              <option value="Stock">Stock</option>
            </select>
          </label>

          <label className="field-group">
            <span>From Date</span>
            <input
              type="date"
              name="fromDate"
              value={reportFilterForm.fromDate}
              onChange={handleReportFilterChange}
              autoComplete="off"
            />
          </label>

          <label className="field-group">
            <span>To Date</span>
            <input
              type="date"
              name="toDate"
              value={reportFilterForm.toDate}
              onChange={handleReportFilterChange}
              autoComplete="off"
            />
          </label>

          <div className="form-actions form-actions--full">
            <button type="submit" className="primary-button">
              Apply Filters
            </button>
            <button type="button" className="secondary-button" onClick={resetReportFilters}>
              Reset
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title={`${reportData.reportType} Summary`}>
        {reportRequestError ? <div className="form-message form-message--error">{reportRequestError}</div> : null}
        {isLoadingReport ? <div className="feedback-actions">Loading report...</div> : null}
        <div className="metric-grid">
          {summaryEntries.length === 0 && !isLoadingReport ? (
            <button type="button" className="metric-card metric-card--muted">
              <span>No Summary</span>
              <strong>0</strong>
            </button>
          ) : (
            summaryEntries.map(([key, value]) => (
              <button key={key} type="button" className="metric-card metric-card--muted">
                <span>{toTitleCase(key)}</span>
                <strong>{formatSummaryValue(key, value)}</strong>
              </button>
            ))
          )}
        </div>
      </SectionCard>

      <SectionCard
        title={`${reportData.reportType} Records`}
        actions={(
          <button
            type="button"
            className="secondary-button"
            onClick={() => setReportReloadToken((currentValue) => currentValue + 1)}
          >
            Refresh
          </button>
        )}
      >
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                {reportColumns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportData.records.length === 0 && !isLoadingReport ? (
                <tr>
                  <td colSpan={String(reportColumns.length)}>No report records found.</td>
                </tr>
              ) : reportData.reportType === "Sales" ? (
                reportData.records.map((record) => (
                  <tr key={record.id}>
                    <td>{record.reference}</td>
                    <td>{record.member?.fullName || "-"}</td>
                    <td>{record.card?.cardNumber || "-"}</td>
                    <td>{formatCurrency(record.totalAmount)}</td>
                    <td>{record.itemCount}</td>
                    <td>
                      <span className="status-badge">{record.status}</span>
                    </td>
                    <td>{formatDateTime(record.createdAt)}</td>
                  </tr>
                ))
              ) : reportData.reportType === "Recharges" ? (
                reportData.records.map((record) => (
                  <tr key={record.id}>
                    <td>{record.reference}</td>
                    <td>{record.member?.fullName || "-"}</td>
                    <td>{record.card?.cardNumber || "-"}</td>
                    <td>{formatCurrency(record.amount)}</td>
                    <td>{record.paymentMode || "-"}</td>
                    <td>{formatCurrency(record.balanceAfter)}</td>
                    <td>{formatDateTime(record.createdAt)}</td>
                  </tr>
                ))
              ) : reportData.reportType === "Debits" ? (
                reportData.records.map((record) => (
                  <tr key={record.id}>
                    <td>{record.reference}</td>
                    <td>{record.member?.fullName || "-"}</td>
                    <td>{record.card?.cardNumber || "-"}</td>
                    <td>{formatCurrency(record.amount)}</td>
                    <td>{record.reason || "-"}</td>
                    <td>{formatCurrency(record.balanceAfter)}</td>
                    <td>{formatDateTime(record.createdAt)}</td>
                  </tr>
                ))
              ) : (
                reportData.records.map((record) => (
                  <tr key={record.id}>
                    <td>{record.reference}</td>
                    <td>{record.product?.productName || "-"}</td>
                    <td>{record.product?.productCode || "-"}</td>
                    <td>{record.quantityBefore}</td>
                    <td>{record.quantityChange}</td>
                    <td>{record.quantityAfter}</td>
                    <td>{formatDateTime(record.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </>
  );
}

export default ReportsModule;
