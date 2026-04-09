/**
 * Module: Wallets Module UI
 * File: WalletsModule.jsx
 * Purpose: Provides the Wallets module create form, filters, and list connected to backend APIs.
 */

import { useEffect, useState } from "react";

import SectionCard from "../../../components/common/SectionCard";
import { getApiErrorMessage } from "../../../utils/getApiErrorMessage";
import { fetchCardList } from "../../cards/api/cardApi";
import { fetchMemberList } from "../../members/api/memberApi";
import { createWalletRecord, fetchWalletList } from "../api/walletApi";

const walletInitialForm = {
  memberId: "",
  status: "Active"
};

const walletInitialFilters = {
  search: "",
  status: ""
};

function validateWalletForm(formData) {
  const nextErrors = {};

  if (!formData.memberId) {
    nextErrors.memberId = "Member is required.";
  }

  if (!formData.status) {
    nextErrors.status = "Status is required.";
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

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function WalletsModule({ authToken, onMetricsChange }) {
  const [cardNumberByMemberId, setCardNumberByMemberId] = useState({});
  const [walletForm, setWalletForm] = useState(walletInitialForm);
  const [walletFormErrors, setWalletFormErrors] = useState({});
  const [walletRequestError, setWalletRequestError] = useState("");
  const [walletSuccessMessage, setWalletSuccessMessage] = useState("");
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [isLoadingWallets, setIsLoadingWallets] = useState(false);
  const [walletRecords, setWalletRecords] = useState([]);
  const [memberOptions, setMemberOptions] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [walletFilterForm, setWalletFilterForm] = useState(walletInitialFilters);
  const [appliedWalletFilters, setAppliedWalletFilters] = useState(walletInitialFilters);
  const [walletReloadToken, setWalletReloadToken] = useState(0);

  useEffect(() => {
    const loadMembers = async () => {
      if (!authToken) {
        return;
      }

      setIsLoadingMembers(true);

      try {
        const [memberResponse, cardResponse] = await Promise.all([
          fetchMemberList(authToken, { status: "Active" }),
          fetchCardList(authToken)
        ]);
        const nextCards = cardResponse.data || [];
        const nextCardNumberMap = nextCards.reduce((result, card) => {
          if (card.member?.id && card.cardNumber) {
            result[card.member.id] = card.cardNumber;
          }

          return result;
        }, {});
        const eligibleMemberIds = new Set(
          nextCards
            .filter((card) => card.operationalProfile?.canUseInOperations)
            .map((card) => card.member?.id)
            .filter(Boolean)
        );
        const nextMembers = (memberResponse.data || []).filter(
          (member) => !member.linkedWalletId && eligibleMemberIds.has(member.id)
        );

        setCardNumberByMemberId(nextCardNumberMap);
        setMemberOptions(nextMembers);
        setWalletForm((currentState) => ({
          ...currentState,
          memberId:
            currentState.memberId &&
            nextMembers.some((member) => member.id === currentState.memberId)
              ? currentState.memberId
              : ""
        }));
      } catch (error) {
        setCardNumberByMemberId({});
        setWalletRequestError(getApiErrorMessage(error));
      } finally {
        setIsLoadingMembers(false);
      }
    };

    loadMembers();
  }, [authToken, walletReloadToken]);

  useEffect(() => {
    const loadWallets = async () => {
      if (!authToken) {
        return;
      }

      setIsLoadingWallets(true);
      setWalletRequestError("");

      try {
        const response = await fetchWalletList(authToken, appliedWalletFilters);
        const nextRecords = response.data || [];

        setWalletRecords(nextRecords);
        onMetricsChange?.({
          active: nextRecords.filter((wallet) => wallet.status === "Active").length,
          lowBalance: nextRecords.filter(
            (wallet) => wallet.status === "Active" && Number(wallet.balance || 0) <= 100
          ).length,
          inactive: nextRecords.filter((wallet) => wallet.status === "Inactive").length
        });
      } catch (error) {
        setWalletRequestError(getApiErrorMessage(error));
      } finally {
        setIsLoadingWallets(false);
      }
    };

    loadWallets();
  }, [authToken, appliedWalletFilters, walletReloadToken, onMetricsChange]);

  const resetWalletForm = () => {
    setWalletForm(walletInitialForm);
    setWalletFormErrors({});
    setWalletRequestError("");
    setWalletSuccessMessage("");
  };

  const handleWalletInputChange = (event) => {
    const { name, value } = event.target;

    setWalletForm((currentState) => ({
      ...currentState,
      [name]: value
    }));
    setWalletFormErrors((currentErrors) => ({
      ...currentErrors,
      [name]: ""
    }));
    setWalletRequestError("");
    setWalletSuccessMessage("");
  };

  const handleWalletFilterChange = (event) => {
    const { name, value } = event.target;

    setWalletFilterForm((currentState) => ({
      ...currentState,
      [name]: value
    }));
  };

  const handleWalletSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateWalletForm(walletForm);
    if (Object.keys(validationErrors).length > 0) {
      setWalletFormErrors(validationErrors);
      return;
    }

    setIsCreatingWallet(true);
    setWalletRequestError("");
    setWalletSuccessMessage("");

    try {
      await createWalletRecord(
        {
          memberId: walletForm.memberId,
          status: walletForm.status
        },
        authToken
      );

      resetWalletForm();
      setWalletSuccessMessage("Wallet created successfully.");
      setWalletReloadToken((currentValue) => currentValue + 1);
    } catch (error) {
      setWalletRequestError(getApiErrorMessage(error));
    } finally {
      setIsCreatingWallet(false);
    }
  };

  const handleWalletFilterSubmit = (event) => {
    event.preventDefault();
    setAppliedWalletFilters({
      search: walletFilterForm.search.trim(),
      status: walletFilterForm.status
    });
  };

  const resetWalletFilters = () => {
    setWalletFilterForm(walletInitialFilters);
    setAppliedWalletFilters(walletInitialFilters);
  };

  return (
    <>
      <SectionCard title="Create Wallet">
        <form className="form-grid" onSubmit={handleWalletSubmit} autoComplete="off">
          <label className="field-group">
            <span>Member</span>
            <select
              name="memberId"
              value={walletForm.memberId}
              onChange={handleWalletInputChange}
              autoComplete="off"
              disabled={isLoadingMembers}
            >
              <option value="">
                {isLoadingMembers ? "Loading members..." : "Select member"}
              </option>
              {memberOptions.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.fullName} ({member.mobileNumber})
                </option>
              ))}
            </select>
            {walletFormErrors.memberId ? (
              <small className="field-error">{walletFormErrors.memberId}</small>
            ) : null}
          </label>

          <label className="field-group">
            <span>Wallet Status</span>
            <select
              name="status"
              value={walletForm.status}
              onChange={handleWalletInputChange}
              autoComplete="off"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            {walletFormErrors.status ? (
              <small className="field-error">{walletFormErrors.status}</small>
            ) : null}
          </label>

          {walletRequestError ? <div className="form-message form-message--error">{walletRequestError}</div> : null}
          {walletSuccessMessage ? <div className="form-message">{walletSuccessMessage}</div> : null}

          <div className="form-actions form-actions--full">
            <button type="submit" className="primary-button" disabled={isCreatingWallet || isLoadingMembers}>
              {isCreatingWallet ? "Creating..." : "Create Wallet"}
            </button>
            <button type="button" className="secondary-button" onClick={resetWalletForm}>
              Reset
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Filters">
        <form className="filter-grid" onSubmit={handleWalletFilterSubmit} autoComplete="off">
          <label className="field-group field-group--wide">
            <span>Search Wallets</span>
            <input
              type="search"
              name="search"
              value={walletFilterForm.search}
              onChange={handleWalletFilterChange}
              placeholder="Search by member name or mobile number"
              autoComplete="off"
            />
          </label>

          <label className="field-group">
            <span>Status</span>
            <select
              name="status"
              value={walletFilterForm.status}
              onChange={handleWalletFilterChange}
              autoComplete="off"
            >
              <option value="">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>

          <div className="form-actions form-actions--full">
            <button type="submit" className="primary-button">
              Apply Filters
            </button>
            <button type="button" className="secondary-button" onClick={resetWalletFilters}>
              Reset
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard
        title="Wallets List"
        actions={
          <button
            type="button"
            className="secondary-button"
            onClick={() => setWalletReloadToken((currentValue) => currentValue + 1)}
          >
            Refresh
          </button>
        }
      >
        {isLoadingWallets ? <div className="feedback-actions">Loading wallets...</div> : null}
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Mobile Number</th>
                <th>Linked Card</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Updated At</th>
              </tr>
            </thead>
            <tbody>
              {walletRecords.length === 0 && !isLoadingWallets ? (
                <tr>
                  <td colSpan="6">No wallet records found.</td>
                </tr>
              ) : (
                walletRecords.map((wallet) => (
                  <tr key={wallet.id}>
                    <td>{wallet.member?.fullName || "-"}</td>
                    <td>{wallet.member?.mobileNumber || "-"}</td>
                    <td>{cardNumberByMemberId[wallet.member?.id] || "-"}</td>
                    <td>{formatCurrency(wallet.balance)}</td>
                    <td>
                      <span className="status-badge">{wallet.status}</span>
                    </td>
                    <td>{formatDate(wallet.updatedAt)}</td>
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

export default WalletsModule;
