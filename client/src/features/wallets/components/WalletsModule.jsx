/**
 * Module: Wallets Module UI
 * File: WalletsModule.jsx
 * Purpose: Provides the Wallets module create form, filters, and list connected to backend APIs.
 */

import { useCallback, useEffect, useRef, useState } from "react";

import IconButton from "../../../components/common/IconButton";
import ModalDialog from "../../../components/common/ModalDialog";
import SectionCard from "../../../components/common/SectionCard";
import SearchableSelect from "../../../components/common/SearchableSelect";
import StatusChip from "../../../components/common/StatusChip";
import { LoadingState, TableEmptyState } from "../../../components/common/VisualStates";
import { getApiErrorMessage } from "../../../utils/getApiErrorMessage";
import { revealFeedbackInContainer } from "../../../utils/revealFeedbackInContainer";
import { scrollElementBelowHeader } from "../../../utils/scrollElementBelowHeader";
import { fetchCardList } from "../../cards/api/cardApi";
import {
  createWalletRecord,
  fetchWalletList,
  updateWalletRecord
} from "../api/walletApi";

const walletInitialForm = {
  memberId: "",
  status: "Active"
};

const walletInitialFilters = {
  search: "",
  status: ""
};

const walletEditInitialForm = {
  status: "Active"
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

function WalletsModule({ authToken, onMetricsChange, onRecordsChange }) {
  const walletListSectionRef = useRef(null);
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
  const [selectedWalletRecord, setSelectedWalletRecord] = useState(null);
  const [editingWallet, setEditingWallet] = useState(null);
  const [editWalletForm, setEditWalletForm] = useState(walletEditInitialForm);
  const [editWalletFormErrors, setEditWalletFormErrors] = useState({});
  const [editWalletRequestError, setEditWalletRequestError] = useState("");
  const [isUpdatingWallet, setIsUpdatingWallet] = useState(false);
  const [walletPendingStatusChange, setWalletPendingStatusChange] = useState(null);
  const [isUpdatingWalletStatus, setIsUpdatingWalletStatus] = useState(false);

  useEffect(() => {
    const loadMembers = async () => {
      if (!authToken) {
        return;
      }

      setIsLoadingMembers(true);

      try {
        const cardResponse = await fetchCardList(authToken, {
          status: "Active",
          limit: "12"
        });
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
        const nextMembers = nextCards
          .map((card) => card.member)
          .filter((member) => member && !member.linkedWalletId && eligibleMemberIds.has(member.id));

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
        onRecordsChange?.(nextRecords);
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
  }, [authToken, appliedWalletFilters, walletReloadToken, onMetricsChange, onRecordsChange]);

  const resetWalletForm = () => {
    setWalletForm(walletInitialForm);
    setWalletFormErrors({});
    setWalletRequestError("");
    setWalletSuccessMessage("");
  };

  const loadWalletMemberSearchOptions = useCallback(async (search) => {
    if (!authToken) {
      return [];
    }

    const response = await fetchCardList(authToken, {
      search,
      status: "Active",
      limit: "12"
    });
    const activeCards = response.data || [];

    setCardNumberByMemberId((currentMap) => ({
      ...currentMap,
      ...activeCards.reduce((result, card) => {
        if (card.member?.id && card.cardNumber) {
          result[card.member.id] = card.cardNumber;
        }

        return result;
      }, {})
    }));

    return activeCards
      .filter((card) => card.operationalProfile?.canUseInOperations && card.member && !card.member.linkedWalletId)
      .map((card) => card.member);
  }, [authToken]);

  const closeEditWalletModal = () => {
    setEditingWallet(null);
    setEditWalletForm(walletEditInitialForm);
    setEditWalletFormErrors({});
    setEditWalletRequestError("");
  };

  const openEditWalletModal = (wallet) => {
    setEditingWallet(wallet);
    setEditWalletForm({
      status: wallet.status || "Active"
    });
    setEditWalletFormErrors({});
    setEditWalletRequestError("");
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

  const handleEditWalletInputChange = (event) => {
    const { name, value } = event.target;

    setEditWalletForm((currentState) => ({
      ...currentState,
      [name]: value
    }));
    setEditWalletFormErrors((currentErrors) => ({
      ...currentErrors,
      [name]: ""
    }));
    setEditWalletRequestError("");
  };

  const handleWalletSubmit = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;

    const validationErrors = validateWalletForm(walletForm);
    if (Object.keys(validationErrors).length > 0) {
      setWalletFormErrors(validationErrors);
      window.setTimeout(() => revealFeedbackInContainer(formElement), 0);
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
      window.setTimeout(() => scrollElementBelowHeader(walletListSectionRef.current), 150);
    } catch (error) {
      setWalletRequestError(getApiErrorMessage(error));
      window.setTimeout(() => revealFeedbackInContainer(formElement), 0);
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

  const handleEditWalletSubmit = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;

    const validationErrors = {};

    if (!editWalletForm.status) {
      validationErrors.status = "Status is required.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setEditWalletFormErrors(validationErrors);
      window.setTimeout(() => revealFeedbackInContainer(formElement), 0);
      return;
    }

    setIsUpdatingWallet(true);
    setEditWalletRequestError("");

    try {
      const response = await updateWalletRecord(
        editingWallet.id,
        {
          status: editWalletForm.status
        },
        authToken
      );
      const updatedWallet = response.data;

      setWalletRecords((currentList) =>
        currentList.map((wallet) => (wallet.id === updatedWallet.id ? updatedWallet : wallet))
      );
      closeEditWalletModal();
      setWalletSuccessMessage("Wallet updated successfully.");
      setWalletReloadToken((currentValue) => currentValue + 1);
    } catch (error) {
      setEditWalletRequestError(getApiErrorMessage(error));
      window.setTimeout(() => revealFeedbackInContainer(formElement), 0);
    } finally {
      setIsUpdatingWallet(false);
    }
  };

  const handleWalletStatusChange = async () => {
    if (!walletPendingStatusChange) {
      return;
    }

    setIsUpdatingWalletStatus(true);
    setWalletRequestError("");

    try {
      const response = await updateWalletRecord(
        walletPendingStatusChange.id,
        {
          status: walletPendingStatusChange.nextStatus
        },
        authToken
      );
      const updatedWallet = response.data;

      setWalletRecords((currentList) =>
        currentList.map((wallet) => (wallet.id === updatedWallet.id ? updatedWallet : wallet))
      );
      setWalletSuccessMessage(
        updatedWallet.status === "Inactive"
          ? "Wallet marked as inactive successfully."
          : "Wallet activated successfully."
      );
      setWalletPendingStatusChange(null);
      setWalletReloadToken((currentValue) => currentValue + 1);
    } catch (error) {
      setWalletRequestError(getApiErrorMessage(error));
    } finally {
      setIsUpdatingWalletStatus(false);
    }
  };

  return (
    <>
      <SectionCard title="Create Wallet">
        <form className="form-grid" onSubmit={handleWalletSubmit} autoComplete="off">
          <label className="field-group">
            <span>Member</span>
            <SearchableSelect
              value={walletForm.memberId}
              onChange={(nextMemberId, member) => {
                setWalletForm((currentState) => ({
                  ...currentState,
                  memberId: nextMemberId
                }));
                if (member) {
                  setMemberOptions((currentMembers) =>
                    currentMembers.some((currentMember) => currentMember.id === member.id)
                      ? currentMembers
                      : [member, ...currentMembers]
                  );
                }
                setWalletFormErrors((currentErrors) => ({
                  ...currentErrors,
                  memberId: ""
                }));
                setWalletRequestError("");
                setWalletSuccessMessage("");
              }}
              loadOptions={loadWalletMemberSearchOptions}
              getOptionValue={(member) => member.id}
              getOptionLabel={(member) => `${member.fullName} (${member.mobileNumber})`}
              getOptionMeta={(member) => `Card ${cardNumberByMemberId[member.id] || "-"}`}
              placeholder={isLoadingMembers ? "Loading members..." : "Search eligible member"}
              disabled={isLoadingMembers}
            />
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

      <div ref={walletListSectionRef}>
        <SectionCard
          title="Wallets List"
          actions={
          <IconButton
            icon="refresh"
            label="Refresh wallets"
            text="Refresh"
            onClick={() => setWalletReloadToken((currentValue) => currentValue + 1)}
          />
          }
        >
          {walletSuccessMessage ? <div className="form-message">{walletSuccessMessage}</div> : null}
          {isLoadingWallets ? <LoadingState message="Loading wallets..." /> : null}
          <div className="table-wrapper">
          <table className="data-table data-table--dense">
            <thead>
              <tr>
                <th>Member</th>
                <th>Mobile Number</th>
                <th>Linked Card</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Updated At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {walletRecords.length === 0 && !isLoadingWallets ? (
                  <TableEmptyState
                    colSpan={7}
                    title="No wallet records found"
                    message="Create a wallet or change the current filters."
                  />
              ) : (
                walletRecords.map((wallet) => (
                  <tr key={wallet.id}>
                    <td>{wallet.member?.fullName || "-"}</td>
                    <td>{wallet.member?.mobileNumber || "-"}</td>
                    <td>{cardNumberByMemberId[wallet.member?.id] || "-"}</td>
                    <td>{formatCurrency(wallet.balance)}</td>
                    <td>
                      <StatusChip value={wallet.status} />
                    </td>
                    <td>{formatDate(wallet.updatedAt)}</td>
                    <td>
                      <div className="table-row-actions">
                        <IconButton
                          icon="view"
                          label={`View wallet of ${wallet.member?.fullName || "member"}`}
                          title="View details"
                          onClick={() => setSelectedWalletRecord(wallet)}
                        />
                        <IconButton
                          icon="edit"
                          label={`Edit wallet of ${wallet.member?.fullName || "member"}`}
                          title="Edit wallet"
                          onClick={() => openEditWalletModal(wallet)}
                        />
                        <IconButton
                          icon={wallet.status === "Active" ? "close" : "add"}
                          label={`${wallet.status === "Active" ? "Mark inactive" : "Activate"} wallet of ${wallet.member?.fullName || "member"}`}
                          title={wallet.status === "Active" ? "Mark inactive" : "Activate"}
                          onClick={() =>
                            setWalletPendingStatusChange({
                              id: wallet.id,
                              memberName: wallet.member?.fullName || "Member",
                              currentStatus: wallet.status,
                              nextStatus:
                                wallet.status === "Active" ? "Inactive" : "Active"
                            })
                          }
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
        isOpen={Boolean(selectedWalletRecord)}
        title="Wallet Details"
        onClose={() => setSelectedWalletRecord(null)}
        footer={(
          <button
            type="button"
            className="secondary-button"
            onClick={() => setSelectedWalletRecord(null)}
          >
            Close
          </button>
        )}
        width="620px"
      >
        {selectedWalletRecord ? (
          <div className="details-grid">
            <div className="details-grid__item">
              <span>Member</span>
              <strong>{selectedWalletRecord.member?.fullName || "-"}</strong>
            </div>
            <div className="details-grid__item">
              <span>Mobile Number</span>
              <strong>{selectedWalletRecord.member?.mobileNumber || "-"}</strong>
            </div>
            <div className="details-grid__item">
              <span>Linked Card</span>
              <strong>{cardNumberByMemberId[selectedWalletRecord.member?.id] || "-"}</strong>
            </div>
            <div className="details-grid__item">
              <span>Balance</span>
              <strong>{formatCurrency(selectedWalletRecord.balance)}</strong>
            </div>
            <div className="details-grid__item">
              <span>Status</span>
              <strong><StatusChip value={selectedWalletRecord.status} /></strong>
            </div>
            <div className="details-grid__item">
              <span>Updated At</span>
              <strong>{formatDate(selectedWalletRecord.updatedAt)}</strong>
            </div>
          </div>
        ) : null}
      </ModalDialog>

      <ModalDialog
        isOpen={Boolean(editingWallet)}
        title="Edit Wallet"
        onClose={closeEditWalletModal}
        footer={(
          <>
            <button
              type="button"
              className="secondary-button"
              onClick={closeEditWalletModal}
              disabled={isUpdatingWallet}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-wallet-form"
              className="primary-button"
              disabled={isUpdatingWallet}
            >
              {isUpdatingWallet ? "Saving..." : "Save Changes"}
            </button>
          </>
        )}
        width="560px"
      >
        {editingWallet ? (
          <form id="edit-wallet-form" className="form-grid" onSubmit={handleEditWalletSubmit} autoComplete="off">
            <label className="field-group">
              <span>Member</span>
              <input type="text" value={editingWallet.member?.fullName || ""} readOnly />
            </label>
            <label className="field-group">
              <span>Balance</span>
              <input type="text" value={formatCurrency(editingWallet.balance)} readOnly />
            </label>
            <label className="field-group">
              <span>Status</span>
              <select
                name="status"
                value={editWalletForm.status}
                onChange={handleEditWalletInputChange}
                autoComplete="off"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              {editWalletFormErrors.status ? (
                <small className="field-error">{editWalletFormErrors.status}</small>
              ) : null}
            </label>
            {editWalletRequestError ? (
              <div className="form-message form-message--error">{editWalletRequestError}</div>
            ) : null}
          </form>
        ) : null}
      </ModalDialog>

      <ModalDialog
        isOpen={Boolean(walletPendingStatusChange)}
        title={walletPendingStatusChange?.nextStatus === "Inactive" ? "Mark Wallet Inactive" : "Activate Wallet"}
        onClose={() => setWalletPendingStatusChange(null)}
        footer={(
          <>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setWalletPendingStatusChange(null)}
              disabled={isUpdatingWalletStatus}
            >
              Cancel
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={handleWalletStatusChange}
              disabled={isUpdatingWalletStatus}
            >
              {isUpdatingWalletStatus ? "Saving..." : "Confirm"}
            </button>
          </>
        )}
        width="520px"
      >
        {walletPendingStatusChange ? (
          <div className="dialog-note">
            <span>
              This action will change <strong>{walletPendingStatusChange.memberName}</strong>&apos;s wallet to{" "}
              <strong>{walletPendingStatusChange.nextStatus}</strong>. Wallet status updates are administrative only,
              and balance history remains unchanged.
            </span>
          </div>
        ) : null}
      </ModalDialog>
    </>
  );
}

export default WalletsModule;
