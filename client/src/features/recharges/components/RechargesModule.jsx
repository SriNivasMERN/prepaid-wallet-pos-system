/**
 * Module: Recharges Module UI
 * File: RechargesModule.jsx
 * Purpose: Provides the Recharges module create form, filters, and list connected to backend APIs.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import IconButton from "../../../components/common/IconButton";
import ModalDialog from "../../../components/common/ModalDialog";
import SectionCard from "../../../components/common/SectionCard";
import SearchableSelect from "../../../components/common/SearchableSelect";
import { LoadingState, TableEmptyState } from "../../../components/common/VisualStates";
import { getApiErrorMessage } from "../../../utils/getApiErrorMessage";
import { preventNumberInputWheel } from "../../../utils/preventNumberInputWheel";
import { revealFeedbackInContainer } from "../../../utils/revealFeedbackInContainer";
import { scrollElementBelowHeader } from "../../../utils/scrollElementBelowHeader";
import { fetchStaffList } from "../../staff/api/staffApi";
import { fetchWalletList } from "../../wallets/api/walletApi";
import { createRechargeRecord, fetchRechargeList } from "../api/rechargeApi";

const rechargeInitialForm = {
  walletId: "",
  amount: "",
  paymentMode: "Cash",
  notes: ""
};

const createRechargeInitialFilters = () => ({
  search: "",
  date: "",
  paymentMode: "",
  cashierId: ""
});

function validateRechargeForm(formData) {
  const nextErrors = {};

  if (!formData.walletId) {
    nextErrors.walletId = "Wallet is required.";
  }

  if (!formData.amount) {
    nextErrors.amount = "Amount is required.";
  } else if (!Number.isFinite(Number(formData.amount)) || Number(formData.amount) <= 0) {
    nextErrors.amount = "Amount must be greater than zero.";
  }

  if (!formData.paymentMode) {
    nextErrors.paymentMode = "Payment mode is required.";
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

function RechargesModule({ authToken, onMetricsChange, onRecordsChange }) {
  const rechargeListSectionRef = useRef(null);
  const [rechargeForm, setRechargeForm] = useState(rechargeInitialForm);
  const [rechargeFormErrors, setRechargeFormErrors] = useState({});
  const [rechargeRequestError, setRechargeRequestError] = useState("");
  const [rechargeSuccessMessage, setRechargeSuccessMessage] = useState("");
  const [isCreatingRecharge, setIsCreatingRecharge] = useState(false);
  const [isLoadingRecharges, setIsLoadingRecharges] = useState(false);
  const [rechargeRecords, setRechargeRecords] = useState([]);
  const [walletOptions, setWalletOptions] = useState([]);
  const [isLoadingWallets, setIsLoadingWallets] = useState(false);
  const [cashierOptions, setCashierOptions] = useState([]);
  const [rechargeFilterForm, setRechargeFilterForm] = useState(createRechargeInitialFilters);
  const [appliedRechargeFilters, setAppliedRechargeFilters] = useState(createRechargeInitialFilters);
  const [rechargeReloadToken, setRechargeReloadToken] = useState(0);
  const [selectedRechargeRecord, setSelectedRechargeRecord] = useState(null);

  useEffect(() => {
    const formOptionsController = new AbortController();

    const loadFormOptions = async () => {
      if (!authToken) {
        return;
      }

      setIsLoadingWallets(true);

      try {
        const [walletResponse, staffResponse] = await Promise.all([
          fetchWalletList(authToken, { status: "Active", limit: "12" }, {
            signal: formOptionsController.signal
          }),
          fetchStaffList(authToken, {}, {
            signal: formOptionsController.signal
          })
        ]);
        const nextWallets = (walletResponse.data || []).filter(
          (wallet) => wallet.status === "Active" && wallet.member?.status === "Active"
        );

        setWalletOptions(nextWallets);
        setCashierOptions(staffResponse.data || []);
        setRechargeForm((currentState) => ({
          ...currentState,
          walletId:
            currentState.walletId &&
            nextWallets.some((wallet) => wallet.id === currentState.walletId)
              ? currentState.walletId
              : ""
        }));
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        setRechargeRequestError(getApiErrorMessage(error));
      } finally {
        if (!formOptionsController.signal.aborted) {
          setIsLoadingWallets(false);
        }
      }
    };

    loadFormOptions();

    return () => formOptionsController.abort();
  }, [authToken, rechargeReloadToken]);

  useEffect(() => {
    const rechargeListController = new AbortController();

    const loadRecharges = async () => {
      if (!authToken) {
        return;
      }

      setIsLoadingRecharges(true);
      setRechargeRequestError("");

      try {
        const response = await fetchRechargeList(authToken, appliedRechargeFilters, {
          signal: rechargeListController.signal
        });
        const nextRecords = response.data || [];
        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const todayRecords = nextRecords.filter((recharge) => {
          const createdAt = new Date(recharge.createdAt);

          return !Number.isNaN(createdAt.getTime()) && createdAt >= today;
        });

        setRechargeRecords(nextRecords);
        onRecordsChange?.(nextRecords);
        onMetricsChange?.({
          todayCount: todayRecords.length,
          todayValue: todayRecords.reduce(
            (total, recharge) => total + Number(recharge.amount || 0),
            0
          ),
          recentEntries: nextRecords.length
        });
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        setRechargeRequestError(getApiErrorMessage(error));
      } finally {
        if (!rechargeListController.signal.aborted) {
          setIsLoadingRecharges(false);
        }
      }
    };

    loadRecharges();

    return () => rechargeListController.abort();
  }, [authToken, appliedRechargeFilters, rechargeReloadToken, onMetricsChange, onRecordsChange]);

  const selectedWallet = useMemo(
    () => walletOptions.find((wallet) => wallet.id === rechargeForm.walletId) || null,
    [walletOptions, rechargeForm.walletId]
  );

  const loadRechargeWalletSearchOptions = useCallback(async (search, requestOptions = {}) => {
    if (!authToken) {
      return [];
    }

    const response = await fetchWalletList(authToken, {
      search,
      status: "Active",
      limit: "12"
    }, requestOptions);

    return (response.data || []).filter(
      (wallet) => wallet.status === "Active" && wallet.member?.status === "Active"
    );
  }, [authToken]);

  const resetRechargeForm = () => {
    setRechargeForm(rechargeInitialForm);
    setRechargeFormErrors({});
    setRechargeRequestError("");
    setRechargeSuccessMessage("");
  };

  const handleRechargeInputChange = (event) => {
    const { name, value } = event.target;

    setRechargeForm((currentState) => ({
      ...currentState,
      [name]: value
    }));
    setRechargeFormErrors((currentErrors) => ({
      ...currentErrors,
      [name]: ""
    }));
    setRechargeRequestError("");
    setRechargeSuccessMessage("");
  };

  const handleRechargeFilterChange = (event) => {
    const { name, value } = event.target;

    setRechargeFilterForm((currentState) => ({
      ...currentState,
      [name]: value
    }));
  };

  const handleRechargeSubmit = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;

    const validationErrors = validateRechargeForm(rechargeForm);
    if (Object.keys(validationErrors).length > 0) {
      setRechargeFormErrors(validationErrors);
      window.setTimeout(() => revealFeedbackInContainer(formElement), 0);
      return;
    }

    setIsCreatingRecharge(true);
    setRechargeRequestError("");
    setRechargeSuccessMessage("");

    try {
      await createRechargeRecord(
        {
          walletId: rechargeForm.walletId,
          amount: Number(rechargeForm.amount),
          paymentMode: rechargeForm.paymentMode,
          notes: rechargeForm.notes.trim()
        },
        authToken
      );

      resetRechargeForm();
      setRechargeSuccessMessage("Recharge created successfully.");
      setRechargeReloadToken((currentValue) => currentValue + 1);
      window.setTimeout(() => scrollElementBelowHeader(rechargeListSectionRef.current), 150);
    } catch (error) {
      setRechargeRequestError(getApiErrorMessage(error));
      window.setTimeout(() => revealFeedbackInContainer(formElement), 0);
    } finally {
      setIsCreatingRecharge(false);
    }
  };

  const handleRechargeFilterSubmit = (event) => {
    event.preventDefault();
    setAppliedRechargeFilters({
      search: rechargeFilterForm.search.trim(),
      date: rechargeFilterForm.date,
      paymentMode: rechargeFilterForm.paymentMode,
      cashierId: rechargeFilterForm.cashierId
    });
  };

  const resetRechargeFilters = () => {
    const initialFilters = createRechargeInitialFilters();

    setRechargeFilterForm(initialFilters);
    setAppliedRechargeFilters(initialFilters);
  };

  return (
    <>
      <SectionCard title="Create Recharge">
        <form className="form-grid" onSubmit={handleRechargeSubmit} autoComplete="off">
          <label className="field-group field-group--wide">
            <span>Wallet</span>
            <SearchableSelect
              value={rechargeForm.walletId}
              onChange={(nextWalletId, wallet) => {
                setRechargeForm((currentState) => ({
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
                setRechargeFormErrors((currentErrors) => ({
                  ...currentErrors,
                  walletId: ""
                }));
                setRechargeRequestError("");
                setRechargeSuccessMessage("");
              }}
              loadOptions={loadRechargeWalletSearchOptions}
              getOptionValue={(wallet) => wallet.id}
              getOptionLabel={(wallet) => `${wallet.member?.fullName || "-"} (${wallet.member?.mobileNumber || "-"})`}
              getOptionMeta={(wallet) => `Card ${wallet.card?.cardNumber || "-"} · Bal ${formatCurrency(wallet.balance)}`}
              placeholder={isLoadingWallets ? "Loading wallets..." : "Search member, mobile, or card"}
              disabled={isLoadingWallets}
            />
            {rechargeFormErrors.walletId ? (
              <small className="field-error">{rechargeFormErrors.walletId}</small>
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
              value={rechargeForm.amount}
              onChange={handleRechargeInputChange}
              onWheel={preventNumberInputWheel}
              placeholder="Enter amount"
              min="0.01"
              step="0.01"
              autoComplete="off"
            />
            {rechargeFormErrors.amount ? (
              <small className="field-error">{rechargeFormErrors.amount}</small>
            ) : null}
          </label>

          <label className="field-group">
            <span>Payment Mode</span>
            <select
              name="paymentMode"
              value={rechargeForm.paymentMode}
              onChange={handleRechargeInputChange}
              autoComplete="off"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
            </select>
            {rechargeFormErrors.paymentMode ? (
              <small className="field-error">{rechargeFormErrors.paymentMode}</small>
            ) : null}
          </label>

          <label className="field-group field-group--wide">
            <span>Notes</span>
            <textarea
              rows="3"
              name="notes"
              value={rechargeForm.notes}
              onChange={handleRechargeInputChange}
              placeholder="Enter notes"
              autoComplete="off"
            />
            {rechargeFormErrors.notes ? (
              <small className="field-error">{rechargeFormErrors.notes}</small>
            ) : null}
          </label>

          {rechargeRequestError ? <div className="form-message form-message--error">{rechargeRequestError}</div> : null}
          {rechargeSuccessMessage ? <div className="form-message">{rechargeSuccessMessage}</div> : null}

          <div className="form-actions form-actions--full">
            <button type="submit" className="primary-button" disabled={isCreatingRecharge || isLoadingWallets}>
              {isCreatingRecharge ? "Creating..." : "Create Recharge"}
            </button>
            <button type="button" className="secondary-button" onClick={resetRechargeForm}>
              Reset
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Filters">
        <form className="filter-grid" onSubmit={handleRechargeFilterSubmit} autoComplete="off">
          <label className="field-group field-group--wide">
            <span>Search Recharges</span>
            <input
              type="search"
              name="search"
              value={rechargeFilterForm.search}
              onChange={handleRechargeFilterChange}
              placeholder="Search by member, mobile number, or card number"
              autoComplete="off"
            />
          </label>

          <label className="field-group">
            <span>Date</span>
            <input
              type="date"
              name="date"
              value={rechargeFilterForm.date}
              onChange={handleRechargeFilterChange}
              autoComplete="off"
            />
          </label>

          <label className="field-group">
            <span>Payment Mode</span>
            <select
              name="paymentMode"
              value={rechargeFilterForm.paymentMode}
              onChange={handleRechargeFilterChange}
              autoComplete="off"
            >
              <option value="">All</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
            </select>
          </label>

          <label className="field-group">
            <span>Cashier</span>
            <select
              name="cashierId"
              value={rechargeFilterForm.cashierId}
              onChange={handleRechargeFilterChange}
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
            <button type="button" className="secondary-button" onClick={resetRechargeFilters}>
              Reset
            </button>
          </div>
        </form>
      </SectionCard>

      <div ref={rechargeListSectionRef}>
        <SectionCard
          title="Recharges List"
          actions={
          <IconButton
            icon="refresh"
            label="Refresh recharges"
            text="Refresh"
            onClick={() => setRechargeReloadToken((currentValue) => currentValue + 1)}
          />
          }
        >
          {rechargeSuccessMessage ? <div className="form-message">{rechargeSuccessMessage}</div> : null}
          {isLoadingRecharges ? <LoadingState message="Loading recharges..." /> : null}
          <div className="table-wrapper">
          <table className="data-table data-table--dense">
            <thead>
              <tr>
                <th>Member</th>
                <th>Card</th>
                <th>Amount</th>
                <th>Payment Mode</th>
                <th>Cashier</th>
                <th>Balance After</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rechargeRecords.length === 0 && !isLoadingRecharges ? (
                  <TableEmptyState
                    colSpan={8}
                    title="No recharge records found"
                    message="Create a recharge or adjust the current filters."
                  />
              ) : (
                rechargeRecords.map((recharge) => (
                  <tr key={recharge.id}>
                    <td>{recharge.member?.fullName || "-"}</td>
                    <td>{recharge.card?.cardNumber || "-"}</td>
                    <td>{formatCurrency(recharge.amount)}</td>
                    <td>{recharge.paymentMode}</td>
                    <td>{recharge.createdBy?.fullName || "System"}</td>
                    <td>{formatCurrency(recharge.balanceAfter)}</td>
                    <td>{formatDateTime(recharge.createdAt)}</td>
                    <td>
                      <div className="table-row-actions">
                        <IconButton
                          icon="view"
                          label={`View recharge for ${recharge.member?.fullName || "member"}`}
                          title="View details"
                          onClick={() => setSelectedRechargeRecord(recharge)}
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
        isOpen={Boolean(selectedRechargeRecord)}
        title="Recharge Details"
        onClose={() => setSelectedRechargeRecord(null)}
        footer={(
          <button type="button" className="secondary-button" onClick={() => setSelectedRechargeRecord(null)}>
            Close
          </button>
        )}
        width="620px"
      >
        {selectedRechargeRecord ? (
          <div className="details-grid">
            <div className="details-grid__item">
              <span>Member</span>
              <strong>{selectedRechargeRecord.member?.fullName || "-"}</strong>
            </div>
            <div className="details-grid__item">
              <span>Card</span>
              <strong>{selectedRechargeRecord.card?.cardNumber || "-"}</strong>
            </div>
            <div className="details-grid__item">
              <span>Amount</span>
              <strong>{formatCurrency(selectedRechargeRecord.amount)}</strong>
            </div>
            <div className="details-grid__item">
              <span>Payment Mode</span>
              <strong>{selectedRechargeRecord.paymentMode}</strong>
            </div>
            <div className="details-grid__item">
              <span>Balance Before</span>
              <strong>{formatCurrency(selectedRechargeRecord.balanceBefore)}</strong>
            </div>
            <div className="details-grid__item">
              <span>Balance After</span>
              <strong>{formatCurrency(selectedRechargeRecord.balanceAfter)}</strong>
            </div>
            <div className="details-grid__item details-grid__item--wide">
              <span>Notes</span>
              <strong>{selectedRechargeRecord.notes || "-"}</strong>
            </div>
          </div>
        ) : null}
      </ModalDialog>
    </>
  );
}

export default RechargesModule;
