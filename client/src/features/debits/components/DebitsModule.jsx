/**
 * Module: Debits Module UI
 * File: DebitsModule.jsx
 * Purpose: Provides the Debits module create form, filters, and list connected to backend APIs.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import IconButton from "../../../components/common/IconButton";
import ModalDialog from "../../../components/common/ModalDialog";
import SectionCard from "../../../components/common/SectionCard";
import SearchableSelect from "../../../components/common/SearchableSelect";
import { LoadingState, TableEmptyState } from "../../../components/common/VisualStates";
import { getApiErrorMessage } from "../../../utils/getApiErrorMessage";
import { revealFeedbackInContainer } from "../../../utils/revealFeedbackInContainer";
import { scrollElementBelowHeader } from "../../../utils/scrollElementBelowHeader";
import { fetchStaffList } from "../../staff/api/staffApi";
import { fetchWalletList } from "../../wallets/api/walletApi";
import { createDebitRecord, fetchDebitList } from "../api/debitApi";

const debitInitialForm = {
  walletId: "",
  amount: "",
  reason: "",
  notes: ""
};

const createDebitInitialFilters = () => ({
  search: "",
  reason: "",
  date: "",
  cashierId: ""
});

function validateDebitForm(formData) {
  const nextErrors = {};

  if (!formData.walletId) {
    nextErrors.walletId = "Wallet is required.";
  }

  if (!formData.amount) {
    nextErrors.amount = "Amount is required.";
  } else if (!Number.isFinite(Number(formData.amount)) || Number(formData.amount) <= 0) {
    nextErrors.amount = "Amount must be greater than zero.";
  }

  if (!formData.reason.trim()) {
    nextErrors.reason = "Reason is required.";
  } else if (formData.reason.trim().length > 120) {
    nextErrors.reason = "Reason must be 120 characters or less.";
  }

  if (formData.notes.trim().length > 300) {
    nextErrors.notes = "Notes must be 300 characters or less.";
  }

  return nextErrors;
}

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

function DebitsModule({ authToken, onMetricsChange, onRecordsChange }) {
  const debitListSectionRef = useRef(null);
  const [debitForm, setDebitForm] = useState(debitInitialForm);
  const [debitFormErrors, setDebitFormErrors] = useState({});
  const [debitRequestError, setDebitRequestError] = useState("");
  const [debitSuccessMessage, setDebitSuccessMessage] = useState("");
  const [isCreatingDebit, setIsCreatingDebit] = useState(false);
  const [isLoadingDebits, setIsLoadingDebits] = useState(false);
  const [debitRecords, setDebitRecords] = useState([]);
  const [walletOptions, setWalletOptions] = useState([]);
  const [isLoadingWallets, setIsLoadingWallets] = useState(false);
  const [cashierOptions, setCashierOptions] = useState([]);
  const [debitFilterForm, setDebitFilterForm] = useState(createDebitInitialFilters);
  const [appliedDebitFilters, setAppliedDebitFilters] = useState(createDebitInitialFilters);
  const [debitReloadToken, setDebitReloadToken] = useState(0);
  const [selectedDebitRecord, setSelectedDebitRecord] = useState(null);

  useEffect(() => {
    const loadFormOptions = async () => {
      if (!authToken) {
        return;
      }

      setIsLoadingWallets(true);

      try {
        const [walletResponse, staffResponse] = await Promise.all([
          fetchWalletList(authToken, { status: "Active", limit: "12" }),
          fetchStaffList(authToken)
        ]);
        const nextWallets = (walletResponse.data || []).filter(
          (wallet) => wallet.status === "Active" && wallet.member?.status === "Active"
        );

        setWalletOptions(nextWallets);
        setCashierOptions(staffResponse.data || []);
        setDebitForm((currentState) => ({
          ...currentState,
          walletId:
            currentState.walletId &&
            nextWallets.some((wallet) => wallet.id === currentState.walletId)
              ? currentState.walletId
              : ""
        }));
      } catch (error) {
        setDebitRequestError(getApiErrorMessage(error));
      } finally {
        setIsLoadingWallets(false);
      }
    };

    loadFormOptions();
  }, [authToken, debitReloadToken]);

  useEffect(() => {
    const loadDebits = async () => {
      if (!authToken) {
        return;
      }

      setIsLoadingDebits(true);
      setDebitRequestError("");

      try {
        const response = await fetchDebitList(authToken, appliedDebitFilters);
        const nextRecords = response.data || [];
        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const todayRecords = nextRecords.filter((debit) => {
          const createdAt = new Date(debit.createdAt);

          return !Number.isNaN(createdAt.getTime()) && createdAt >= today;
        });

        setDebitRecords(nextRecords);
        onRecordsChange?.(nextRecords);
        onMetricsChange?.({
          todayCount: todayRecords.length,
          todayValue: todayRecords.reduce(
            (total, debit) => total + Number(debit.amount || 0),
            0
          ),
          recentEntries: nextRecords.length
        });
      } catch (error) {
        setDebitRequestError(getApiErrorMessage(error));
      } finally {
        setIsLoadingDebits(false);
      }
    };

    loadDebits();
  }, [authToken, appliedDebitFilters, debitReloadToken, onMetricsChange, onRecordsChange]);

  const selectedWallet = useMemo(
    () => walletOptions.find((wallet) => wallet.id === debitForm.walletId) || null,
    [walletOptions, debitForm.walletId]
  );

  const loadDebitWalletSearchOptions = useCallback(async (search) => {
    if (!authToken) {
      return [];
    }

    const response = await fetchWalletList(authToken, {
      search,
      status: "Active",
      limit: "12"
    });

    return (response.data || []).filter(
      (wallet) => wallet.status === "Active" && wallet.member?.status === "Active"
    );
  }, [authToken]);

  const resetDebitForm = () => {
    setDebitForm(debitInitialForm);
    setDebitFormErrors({});
    setDebitRequestError("");
    setDebitSuccessMessage("");
  };

  const handleDebitInputChange = (event) => {
    const { name, value } = event.target;

    setDebitForm((currentState) => ({
      ...currentState,
      [name]: value
    }));
    setDebitFormErrors((currentErrors) => ({
      ...currentErrors,
      [name]: ""
    }));
    setDebitRequestError("");
    setDebitSuccessMessage("");
  };

  const handleDebitFilterChange = (event) => {
    const { name, value } = event.target;

    setDebitFilterForm((currentState) => ({
      ...currentState,
      [name]: value
    }));
  };

  const handleDebitSubmit = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;

    const validationErrors = validateDebitForm(debitForm);
    if (Object.keys(validationErrors).length > 0) {
      setDebitFormErrors(validationErrors);
      window.setTimeout(() => revealFeedbackInContainer(formElement), 0);
      return;
    }

    setIsCreatingDebit(true);
    setDebitRequestError("");
    setDebitSuccessMessage("");

    try {
      await createDebitRecord(
        {
          walletId: debitForm.walletId,
          amount: Number(debitForm.amount),
          reason: debitForm.reason.trim(),
          notes: debitForm.notes.trim()
        },
        authToken
      );

      resetDebitForm();
      setDebitSuccessMessage("Debit created successfully.");
      setDebitReloadToken((currentValue) => currentValue + 1);
      window.setTimeout(() => scrollElementBelowHeader(debitListSectionRef.current), 150);
    } catch (error) {
      setDebitRequestError(getApiErrorMessage(error));
      window.setTimeout(() => revealFeedbackInContainer(formElement), 0);
    } finally {
      setIsCreatingDebit(false);
    }
  };

  const handleDebitFilterSubmit = (event) => {
    event.preventDefault();
    setAppliedDebitFilters({
      search: debitFilterForm.search.trim(),
      reason: debitFilterForm.reason.trim(),
      date: debitFilterForm.date,
      cashierId: debitFilterForm.cashierId
    });
  };

  const resetDebitFilters = () => {
    const initialFilters = createDebitInitialFilters();

    setDebitFilterForm(initialFilters);
    setAppliedDebitFilters(initialFilters);
  };

  return (
    <>
      <SectionCard title="Create Debit">
        <form className="form-grid" onSubmit={handleDebitSubmit} autoComplete="off">
          <label className="field-group field-group--wide">
            <span>Wallet</span>
            <SearchableSelect
              value={debitForm.walletId}
              onChange={(nextWalletId, wallet) => {
                setDebitForm((currentState) => ({
                  ...currentState,
                  walletId: nextWalletId
                }));
                if (wallet) {
                  setWalletOptions((currentWallets) =>
                    currentWallets.some((currentWallet) => currentWallet.id === wallet.id)
                      ? currentWallets
                      : [wallet, ...currentWallets]
                  );
                }
                setDebitFormErrors((currentErrors) => ({
                  ...currentErrors,
                  walletId: ""
                }));
                setDebitRequestError("");
                setDebitSuccessMessage("");
              }}
              loadOptions={loadDebitWalletSearchOptions}
              getOptionValue={(wallet) => wallet.id}
              getOptionLabel={(wallet) => `${wallet.member?.fullName || "-"} (${wallet.member?.mobileNumber || "-"})`}
              getOptionMeta={(wallet) => `Card ${wallet.card?.cardNumber || "-"} · Bal ${formatCurrency(wallet.balance)}`}
              placeholder={isLoadingWallets ? "Loading wallets..." : "Search member, mobile, or card"}
              disabled={isLoadingWallets}
            />
            {debitFormErrors.walletId ? (
              <small className="field-error">{debitFormErrors.walletId}</small>
            ) : null}
          </label>

          <label className="field-group">
            <span>Member</span>
            <input
              type="text"
              value={selectedWallet?.member?.fullName || ""}
              readOnly
              placeholder="Selected member"
              autoComplete="off"
            />
          </label>

          <label className="field-group">
            <span>Current Balance</span>
            <input
              type="text"
              value={selectedWallet ? formatCurrency(selectedWallet.balance) : ""}
              readOnly
              placeholder="Current balance"
              autoComplete="off"
            />
          </label>

          <label className="field-group">
            <span>Amount</span>
            <input
              type="number"
              name="amount"
              value={debitForm.amount}
              onChange={handleDebitInputChange}
              placeholder="Enter amount"
              min="0.01"
              step="0.01"
              autoComplete="off"
            />
            {debitFormErrors.amount ? (
              <small className="field-error">{debitFormErrors.amount}</small>
            ) : null}
          </label>

          <label className="field-group field-group--wide">
            <span>Reason</span>
            <input
              type="text"
              name="reason"
              value={debitForm.reason}
              onChange={handleDebitInputChange}
              placeholder="Enter debit reason"
              autoComplete="off"
            />
            {debitFormErrors.reason ? (
              <small className="field-error">{debitFormErrors.reason}</small>
            ) : null}
          </label>

          <label className="field-group field-group--wide">
            <span>Notes</span>
            <textarea
              rows="3"
              name="notes"
              value={debitForm.notes}
              onChange={handleDebitInputChange}
              placeholder="Enter notes"
              autoComplete="off"
            />
            {debitFormErrors.notes ? (
              <small className="field-error">{debitFormErrors.notes}</small>
            ) : null}
          </label>

          {debitRequestError ? <div className="form-message form-message--error">{debitRequestError}</div> : null}
          {debitSuccessMessage ? <div className="form-message">{debitSuccessMessage}</div> : null}

          <div className="form-actions form-actions--full">
            <button type="submit" className="primary-button" disabled={isCreatingDebit || isLoadingWallets}>
              {isCreatingDebit ? "Creating..." : "Create Debit"}
            </button>
            <button type="button" className="secondary-button" onClick={resetDebitForm}>
              Reset
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Filters">
        <form className="filter-grid" onSubmit={handleDebitFilterSubmit} autoComplete="off">
          <label className="field-group field-group--wide">
            <span>Search Debits</span>
            <input
              type="search"
              name="search"
              value={debitFilterForm.search}
              onChange={handleDebitFilterChange}
              placeholder="Search by member, mobile number, card number, or reason"
              autoComplete="off"
            />
          </label>

          <label className="field-group">
            <span>Reason</span>
            <input
              type="text"
              name="reason"
              value={debitFilterForm.reason}
              onChange={handleDebitFilterChange}
              placeholder="Filter by reason"
              autoComplete="off"
            />
          </label>

          <label className="field-group">
            <span>Date</span>
            <input
              type="date"
              name="date"
              value={debitFilterForm.date}
              onChange={handleDebitFilterChange}
              autoComplete="off"
            />
          </label>

          <label className="field-group">
            <span>Cashier</span>
            <select
              name="cashierId"
              value={debitFilterForm.cashierId}
              onChange={handleDebitFilterChange}
              autoComplete="off"
            >
              <option value="">All</option>
              {cashierOptions.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.fullName}
                </option>
              ))}
            </select>
          </label>

          <div className="form-actions form-actions--full">
            <button type="submit" className="primary-button">
              Apply Filters
            </button>
            <button type="button" className="secondary-button" onClick={resetDebitFilters}>
              Reset
            </button>
          </div>
        </form>
      </SectionCard>

      <div ref={debitListSectionRef}>
        <SectionCard
          title="Debits List"
          actions={
          <IconButton
            icon="refresh"
            label="Refresh debits"
            text="Refresh"
            onClick={() => setDebitReloadToken((currentValue) => currentValue + 1)}
          />
          }
        >
          {debitSuccessMessage ? <div className="form-message">{debitSuccessMessage}</div> : null}
          {isLoadingDebits ? <LoadingState message="Loading debits..." /> : null}
          <div className="table-wrapper">
          <table className="data-table data-table--dense">
            <thead>
              <tr>
                <th>Member</th>
                <th>Card</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Cashier</th>
                <th>Balance After</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {debitRecords.length === 0 && !isLoadingDebits ? (
                  <TableEmptyState
                    colSpan={8}
                    title="No debit records found"
                    message="Create a debit or adjust the current filters."
                  />
              ) : (
                debitRecords.map((debit) => (
                  <tr key={debit.id}>
                    <td>{debit.member?.fullName || "-"}</td>
                    <td>{debit.card?.cardNumber || "-"}</td>
                    <td>{formatCurrency(debit.amount)}</td>
                    <td>{debit.reason || "-"}</td>
                    <td>{debit.createdBy?.fullName || "System"}</td>
                    <td>{formatCurrency(debit.balanceAfter)}</td>
                    <td>{formatDateTime(debit.createdAt)}</td>
                    <td>
                      <div className="table-row-actions">
                        <IconButton
                          icon="view"
                          label={`View debit for ${debit.member?.fullName || "member"}`}
                          title="View details"
                          onClick={() => setSelectedDebitRecord(debit)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </SectionCard>
      </div>

      <ModalDialog
        isOpen={Boolean(selectedDebitRecord)}
        title="Debit Details"
        onClose={() => setSelectedDebitRecord(null)}
        footer={(
          <button type="button" className="secondary-button" onClick={() => setSelectedDebitRecord(null)}>
            Close
          </button>
        )}
        width="620px"
      >
        {selectedDebitRecord ? (
          <div className="details-grid">
            <div className="details-grid__item">
              <span>Member</span>
              <strong>{selectedDebitRecord.member?.fullName || "-"}</strong>
            </div>
            <div className="details-grid__item">
              <span>Card</span>
              <strong>{selectedDebitRecord.card?.cardNumber || "-"}</strong>
            </div>
            <div className="details-grid__item">
              <span>Amount</span>
              <strong>{formatCurrency(selectedDebitRecord.amount)}</strong>
            </div>
            <div className="details-grid__item">
              <span>Reason</span>
              <strong>{selectedDebitRecord.reason}</strong>
            </div>
            <div className="details-grid__item">
              <span>Balance Before</span>
              <strong>{formatCurrency(selectedDebitRecord.balanceBefore)}</strong>
            </div>
            <div className="details-grid__item">
              <span>Balance After</span>
              <strong>{formatCurrency(selectedDebitRecord.balanceAfter)}</strong>
            </div>
            <div className="details-grid__item details-grid__item--wide">
              <span>Notes</span>
              <strong>{selectedDebitRecord.notes || "-"}</strong>
            </div>
          </div>
        ) : null}
      </ModalDialog>
    </>
  );
}

export default DebitsModule;
