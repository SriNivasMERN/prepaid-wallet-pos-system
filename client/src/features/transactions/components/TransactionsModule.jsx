/**
 * Module: Transactions Module UI
 * File: TransactionsModule.jsx
 * Purpose: Provides the Transactions module filters and transaction ledger list connected to backend APIs.
 */

import { useEffect, useState } from "react";

import SectionCard from "../../../components/common/SectionCard";
import { LoadingState, TableEmptyState } from "../../../components/common/VisualStates";
import { getApiErrorMessage } from "../../../utils/getApiErrorMessage";
import { fetchTransactionList } from "../api/transactionApi";

const createTransactionInitialFilters = () => ({
  search: "",
  type: "",
  fromDate: "",
  toDate: ""
});

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

function TransactionsModule({ authToken, onMetricsChange, onRecordsChange }) {
  const [transactionRequestError, setTransactionRequestError] = useState("");
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [transactionRecords, setTransactionRecords] = useState([]);
  const [transactionFilterForm, setTransactionFilterForm] = useState(
    createTransactionInitialFilters
  );
  const [appliedTransactionFilters, setAppliedTransactionFilters] = useState(
    createTransactionInitialFilters
  );
  const [transactionReloadToken, setTransactionReloadToken] = useState(0);

  useEffect(() => {
    const loadTransactions = async () => {
      if (!authToken) {
        return;
      }

      setIsLoadingTransactions(true);
      setTransactionRequestError("");

      try {
        const response = await fetchTransactionList(authToken, appliedTransactionFilters);
        const nextRecords = response.data || [];
        const today = new Date();

        today.setHours(0, 0, 0, 0);

        setTransactionRecords(nextRecords);
        onRecordsChange?.(nextRecords);
        onMetricsChange?.({
          today: nextRecords.filter((transaction) => {
            const createdAt = new Date(transaction.createdAt);

            return !Number.isNaN(createdAt.getTime()) && createdAt >= today;
          }).length,
          credits: nextRecords.filter((transaction) => transaction.type === "Credit").length,
          debits: nextRecords.filter((transaction) => transaction.type === "Debit").length
        });
      } catch (error) {
        setTransactionRequestError(getApiErrorMessage(error));
      } finally {
        setIsLoadingTransactions(false);
      }
    };

    loadTransactions();
  }, [authToken, appliedTransactionFilters, transactionReloadToken, onMetricsChange, onRecordsChange]);

  const handleTransactionFilterChange = (event) => {
    const { name, value } = event.target;

    setTransactionFilterForm((currentState) => ({
      ...currentState,
      [name]: value
    }));
  };

  const handleTransactionFilterSubmit = (event) => {
    event.preventDefault();
    setAppliedTransactionFilters({
      search: transactionFilterForm.search.trim(),
      type: transactionFilterForm.type,
      fromDate: transactionFilterForm.fromDate,
      toDate: transactionFilterForm.toDate
    });
  };

  const resetTransactionFilters = () => {
    const initialFilters = createTransactionInitialFilters();

    setTransactionFilterForm(initialFilters);
    setAppliedTransactionFilters(initialFilters);
  };

  return (
    <>
      <SectionCard title="Filters">
        <form className="filter-grid" onSubmit={handleTransactionFilterSubmit} autoComplete="off">
          <label className="field-group field-group--wide">
            <span>Search Transactions</span>
            <input
              type="search"
              name="search"
              value={transactionFilterForm.search}
              onChange={handleTransactionFilterChange}
              placeholder="Search by member, mobile number, or card number"
              autoComplete="off"
            />
          </label>

          <label className="field-group">
            <span>Type</span>
            <select
              name="type"
              value={transactionFilterForm.type}
              onChange={handleTransactionFilterChange}
              autoComplete="off"
            >
              <option value="">All</option>
              <option value="Credit">Credit</option>
              <option value="Debit">Debit</option>
            </select>
          </label>

          <label className="field-group">
            <span>From Date</span>
            <input
              type="date"
              name="fromDate"
              value={transactionFilterForm.fromDate}
              onChange={handleTransactionFilterChange}
              autoComplete="off"
            />
          </label>

          <label className="field-group">
            <span>To Date</span>
            <input
              type="date"
              name="toDate"
              value={transactionFilterForm.toDate}
              onChange={handleTransactionFilterChange}
              autoComplete="off"
            />
          </label>

          <div className="form-actions form-actions--full">
            <button type="submit" className="primary-button">
              Apply Filters
            </button>
            <button type="button" className="secondary-button" onClick={resetTransactionFilters}>
              Reset
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard
        title="Transactions List"
        actions={
          <button
            type="button"
            className="secondary-button"
            onClick={() => setTransactionReloadToken((currentValue) => currentValue + 1)}
          >
            Refresh
          </button>
        }
      >
        {transactionRequestError ? <div className="form-message form-message--error">{transactionRequestError}</div> : null}
        {isLoadingTransactions ? <LoadingState message="Loading transactions..." /> : null}
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Member</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Balance After</th>
                <th>Card</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {transactionRecords.length === 0 && !isLoadingTransactions ? (
                  <TableEmptyState
                    colSpan={7}
                    title="No transaction records found"
                    message="Transactions will appear after recharge, debit, or billing activity."
                  />
              ) : (
                transactionRecords.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.reference}</td>
                    <td>{transaction.member?.fullName || "-"}</td>
                    <td>
                      <span className="status-badge">{transaction.type}</span>
                    </td>
                    <td>{formatCurrency(transaction.amount)}</td>
                    <td>{formatCurrency(transaction.balanceAfter)}</td>
                    <td>{transaction.card?.cardNumber || "-"}</td>
                    <td>{formatDateTime(transaction.createdAt)}</td>
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

export default TransactionsModule;
