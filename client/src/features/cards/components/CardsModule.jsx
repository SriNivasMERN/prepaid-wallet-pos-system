/**
 * Module: Cards Module UI
 * File: CardsModule.jsx
 * Purpose: Provides the Cards module assignment form, filters, and list connected to backend APIs.
 */

import { useEffect, useState } from "react";

import SectionCard from "../../../components/common/SectionCard";
import { getApiErrorMessage } from "../../../utils/getApiErrorMessage";
import { fetchMemberList } from "../../members/api/memberApi";
import { assignCardToMember, fetchCardList } from "../api/cardApi";

const cardInitialForm = {
  cardNumber: "",
  memberId: "",
  activatedAt: "",
  expiresAt: ""
};

const cardInitialFilters = {
  search: "",
  status: "",
  memberId: ""
};

function validateCardForm(formData) {
  const nextErrors = {};

  if (!formData.cardNumber.trim()) {
    nextErrors.cardNumber = "Card number is required.";
  }

  if (!formData.memberId) {
    nextErrors.memberId = "Member is required.";
  }

  if (!formData.activatedAt) {
    nextErrors.activatedAt = "Activated date is required.";
  }

  if (!formData.expiresAt) {
    nextErrors.expiresAt = "Expiry date is required.";
  }

  if (formData.activatedAt && formData.expiresAt) {
    const activatedAt = new Date(formData.activatedAt);
    const expiresAt = new Date(formData.expiresAt);

    if (Number.isNaN(activatedAt.getTime())) {
      nextErrors.activatedAt = "Activated date is not valid.";
    }

    if (Number.isNaN(expiresAt.getTime())) {
      nextErrors.expiresAt = "Expiry date is not valid.";
    }

    if (
      !Number.isNaN(activatedAt.getTime()) &&
      !Number.isNaN(expiresAt.getTime()) &&
      expiresAt <= activatedAt
    ) {
      nextErrors.expiresAt = "Expiry date must be later than activated date.";
    }
  }

  return nextErrors;
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

function CardsModule({ authToken, onMetricsChange }) {
  const [cardForm, setCardForm] = useState(cardInitialForm);
  const [cardFormErrors, setCardFormErrors] = useState({});
  const [cardRequestError, setCardRequestError] = useState("");
  const [cardSuccessMessage, setCardSuccessMessage] = useState("");
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [cardRecords, setCardRecords] = useState([]);
  const [memberOptions, setMemberOptions] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [cardFilterForm, setCardFilterForm] = useState(cardInitialFilters);
  const [appliedCardFilters, setAppliedCardFilters] = useState(cardInitialFilters);
  const [cardReloadToken, setCardReloadToken] = useState(0);

  useEffect(() => {
    const loadMembers = async () => {
      if (!authToken) {
        return;
      }

      setIsLoadingMembers(true);

      try {
        const response = await fetchMemberList(authToken, { status: "Active" });
        const nextMembers = response.data || [];

        setMemberOptions(nextMembers);
        setCardForm((currentState) => ({
          ...currentState,
          memberId:
            currentState.memberId &&
            nextMembers.some((member) => member.id === currentState.memberId)
              ? currentState.memberId
              : ""
        }));
      } catch (error) {
        setCardRequestError(getApiErrorMessage(error));
      } finally {
        setIsLoadingMembers(false);
      }
    };

    loadMembers();
  }, [authToken, cardReloadToken]);

  useEffect(() => {
    const loadCards = async () => {
      if (!authToken) {
        return;
      }

      setIsLoadingCards(true);
      setCardRequestError("");

      try {
        const response = await fetchCardList(authToken, appliedCardFilters);
        const nextRecords = response.data || [];
        const todayValue = new Date();

        todayValue.setHours(0, 0, 0, 0);

        setCardRecords(nextRecords);
        onMetricsChange?.({
          active: nextRecords.filter((card) => card.status === "Active").length,
          expired: nextRecords.filter((card) => {
            const expiresAt = new Date(card.expiresAt);

            return (
              card.status === "Active" &&
              !Number.isNaN(expiresAt.getTime()) &&
              expiresAt < todayValue
            );
          }).length,
          replaced: nextRecords.filter((card) => card.status === "Inactive").length
        });
      } catch (error) {
        setCardRequestError(getApiErrorMessage(error));
      } finally {
        setIsLoadingCards(false);
      }
    };

    loadCards();
  }, [authToken, appliedCardFilters, cardReloadToken, onMetricsChange]);

  const resetCardForm = () => {
    setCardForm(cardInitialForm);
    setCardFormErrors({});
    setCardRequestError("");
    setCardSuccessMessage("");
  };

  const handleCardInputChange = (event) => {
    const { name, value } = event.target;

    setCardForm((currentState) => ({
      ...currentState,
      [name]: value
    }));
    setCardFormErrors((currentErrors) => ({
      ...currentErrors,
      [name]: ""
    }));
    setCardRequestError("");
    setCardSuccessMessage("");
  };

  const handleCardFilterChange = (event) => {
    const { name, value } = event.target;

    setCardFilterForm((currentState) => ({
      ...currentState,
      [name]: value
    }));
  };

  const handleCardSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateCardForm(cardForm);
    if (Object.keys(validationErrors).length > 0) {
      setCardFormErrors(validationErrors);
      return;
    }

    setIsCreatingCard(true);
    setCardRequestError("");
    setCardSuccessMessage("");

    try {
      await assignCardToMember(
        {
          cardNumber: cardForm.cardNumber.trim(),
          memberId: cardForm.memberId,
          activatedAt: cardForm.activatedAt,
          expiresAt: cardForm.expiresAt
        },
        authToken
      );

      resetCardForm();
      setCardSuccessMessage("Card assigned successfully.");
      setCardReloadToken((currentValue) => currentValue + 1);
    } catch (error) {
      setCardRequestError(getApiErrorMessage(error));
    } finally {
      setIsCreatingCard(false);
    }
  };

  const handleCardFilterSubmit = (event) => {
    event.preventDefault();
    setAppliedCardFilters({
      search: cardFilterForm.search.trim(),
      status: cardFilterForm.status,
      memberId: cardFilterForm.memberId
    });
  };

  const resetCardFilters = () => {
    setCardFilterForm(cardInitialFilters);
    setAppliedCardFilters(cardInitialFilters);
  };

  return (
    <>
      <SectionCard title="Assign Card">
        <form className="form-grid" onSubmit={handleCardSubmit} autoComplete="off">
          <label className="field-group">
            <span>Card Number</span>
            <input
              type="text"
              name="cardNumber"
              value={cardForm.cardNumber}
              onChange={handleCardInputChange}
              placeholder="Enter card number"
              autoComplete="off"
            />
            {cardFormErrors.cardNumber ? (
              <small className="field-error">{cardFormErrors.cardNumber}</small>
            ) : null}
          </label>

          <label className="field-group">
            <span>Member</span>
            <select
              name="memberId"
              value={cardForm.memberId}
              onChange={handleCardInputChange}
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
            {cardFormErrors.memberId ? (
              <small className="field-error">{cardFormErrors.memberId}</small>
            ) : null}
          </label>

          <label className="field-group">
            <span>Activated At</span>
            <input
              type="date"
              name="activatedAt"
              value={cardForm.activatedAt}
              onChange={handleCardInputChange}
              autoComplete="off"
            />
            {cardFormErrors.activatedAt ? (
              <small className="field-error">{cardFormErrors.activatedAt}</small>
            ) : null}
          </label>

          <label className="field-group">
            <span>Expires At</span>
            <input
              type="date"
              name="expiresAt"
              value={cardForm.expiresAt}
              onChange={handleCardInputChange}
              autoComplete="off"
            />
            {cardFormErrors.expiresAt ? (
              <small className="field-error">{cardFormErrors.expiresAt}</small>
            ) : null}
          </label>

          {cardRequestError ? <div className="form-message form-message--error">{cardRequestError}</div> : null}
          {cardSuccessMessage ? <div className="form-message">{cardSuccessMessage}</div> : null}

          <div className="form-actions form-actions--full">
            <button type="submit" className="primary-button" disabled={isCreatingCard || isLoadingMembers}>
              {isCreatingCard ? "Assigning..." : "Assign Card"}
            </button>
            <button type="button" className="secondary-button" onClick={resetCardForm}>
              Reset
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Filters">
        <form className="filter-grid" onSubmit={handleCardFilterSubmit} autoComplete="off">
          <label className="field-group field-group--wide">
            <span>Search Cards</span>
            <input
              type="search"
              name="search"
              value={cardFilterForm.search}
              onChange={handleCardFilterChange}
              placeholder="Search by card number, member name, or mobile number"
              autoComplete="off"
            />
          </label>

          <label className="field-group">
            <span>Status</span>
            <select
              name="status"
              value={cardFilterForm.status}
              onChange={handleCardFilterChange}
              autoComplete="off"
            >
              <option value="">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>

          <label className="field-group">
            <span>Member</span>
            <select
              name="memberId"
              value={cardFilterForm.memberId}
              onChange={handleCardFilterChange}
              autoComplete="off"
              disabled={isLoadingMembers}
            >
              <option value="">All</option>
              {memberOptions.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.fullName}
                </option>
              ))}
            </select>
          </label>

          <div className="form-actions form-actions--full">
            <button type="submit" className="primary-button">
              Apply Filters
            </button>
            <button type="button" className="secondary-button" onClick={resetCardFilters}>
              Reset
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard
        title="Cards List"
        actions={
          <button
            type="button"
            className="secondary-button"
            onClick={() => setCardReloadToken((currentValue) => currentValue + 1)}
          >
            Refresh
          </button>
        }
      >
        {isLoadingCards ? <div className="feedback-actions">Loading cards...</div> : null}
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Card Number</th>
                <th>Member</th>
                <th>Mobile Number</th>
                <th>Status</th>
                <th>Activated At</th>
                <th>Expires At</th>
              </tr>
            </thead>
            <tbody>
              {cardRecords.length === 0 && !isLoadingCards ? (
                <tr>
                  <td colSpan="6">No card records found.</td>
                </tr>
              ) : (
                cardRecords.map((card) => (
                  <tr key={card.id}>
                    <td>{card.cardNumber}</td>
                    <td>{card.member?.fullName || "-"}</td>
                    <td>{card.member?.mobileNumber || "-"}</td>
                    <td>
                      <span className="status-badge">{card.status}</span>
                    </td>
                    <td>{formatDate(card.activatedAt)}</td>
                    <td>{formatDate(card.expiresAt)}</td>
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

export default CardsModule;
