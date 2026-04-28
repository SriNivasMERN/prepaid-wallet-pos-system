/**
 * Module: Cards Module UI
 * File: CardsModule.jsx
 * Purpose: Provides the Cards module assignment form, filters, and list connected to backend APIs.
 */

import { useEffect, useRef, useState } from "react";

import IconButton from "../../../components/common/IconButton";
import ModalDialog from "../../../components/common/ModalDialog";
import SectionCard from "../../../components/common/SectionCard";
import StatusChip from "../../../components/common/StatusChip";
import {
  getOneYearLaterInputDateValue,
  getTodayInputDateValue
} from "../../../utils/dateFieldDefaults";
import { getApiErrorMessage } from "../../../utils/getApiErrorMessage";
import { revealFeedbackInContainer } from "../../../utils/revealFeedbackInContainer";
import { scrollElementBelowHeader } from "../../../utils/scrollElementBelowHeader";
import { fetchMemberList } from "../../members/api/memberApi";
import {
  assignCardToMember,
  fetchCardOperationalProfile,
  fetchCardList,
  replaceCardRecord
} from "../api/cardApi";

const createCardInitialForm = () => {
  const today = getTodayInputDateValue();

  return {
    cardNumber: "",
    memberId: "",
    activatedAt: today,
    expiresAt: getOneYearLaterInputDateValue(today)
  };
};

const cardInitialFilters = {
  search: "",
  status: "",
  memberId: ""
};

const createReplaceCardInitialForm = () => {
  const today = getTodayInputDateValue();

  return {
    cardNumber: "",
    activatedAt: today,
    expiresAt: getOneYearLaterInputDateValue(today)
  };
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

function CardsModule({ authToken, onMetricsChange, onRecordsChange }) {
  const cardListSectionRef = useRef(null);
  const [cardForm, setCardForm] = useState(createCardInitialForm);
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
  const [selectedCardRecord, setSelectedCardRecord] = useState(null);
  const [replacingCard, setReplacingCard] = useState(null);
  const [replaceCardForm, setReplaceCardForm] = useState(createReplaceCardInitialForm);
  const [replaceCardFormErrors, setReplaceCardFormErrors] = useState({});
  const [replaceCardRequestError, setReplaceCardRequestError] = useState("");
  const [isReplacingCard, setIsReplacingCard] = useState(false);
  const [cardProfileRecord, setCardProfileRecord] = useState(null);
  const [isLoadingCardProfile, setIsLoadingCardProfile] = useState(false);
  const [cardProfileRequestError, setCardProfileRequestError] = useState("");

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
        onRecordsChange?.(nextRecords);
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
  }, [authToken, appliedCardFilters, cardReloadToken, onMetricsChange, onRecordsChange]);

  const resetCardForm = () => {
    setCardForm(createCardInitialForm());
    setCardFormErrors({});
    setCardRequestError("");
    setCardSuccessMessage("");
  };

  const closeReplaceCardModal = () => {
    setReplacingCard(null);
    setReplaceCardForm(createReplaceCardInitialForm());
    setReplaceCardFormErrors({});
    setReplaceCardRequestError("");
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

  const handleReplaceCardInputChange = (event) => {
    const { name, value } = event.target;

    setReplaceCardForm((currentState) => ({
      ...currentState,
      [name]: value
    }));
    setReplaceCardFormErrors((currentErrors) => ({
      ...currentErrors,
      [name]: ""
    }));
    setReplaceCardRequestError("");
  };

  const handleCardSubmit = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;

    const validationErrors = validateCardForm(cardForm);
    if (Object.keys(validationErrors).length > 0) {
      setCardFormErrors(validationErrors);
      window.setTimeout(() => revealFeedbackInContainer(formElement), 0);
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
      window.setTimeout(() => scrollElementBelowHeader(cardListSectionRef.current), 150);
    } catch (error) {
      setCardRequestError(getApiErrorMessage(error));
      window.setTimeout(() => revealFeedbackInContainer(formElement), 0);
    } finally {
      setIsCreatingCard(false);
    }
  };

  const openReplaceCardModal = (card) => {
    const today = getTodayInputDateValue();

    setReplacingCard(card);
    setReplaceCardForm({
      cardNumber: "",
      activatedAt: today,
      expiresAt: getOneYearLaterInputDateValue(today)
    });
    setReplaceCardFormErrors({});
    setReplaceCardRequestError("");
  };

  const handleReplaceCardSubmit = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;

    const validationErrors = validateCardForm({
      ...replaceCardForm,
      memberId: replacingCard?.member?.id || "linked-member"
    });

    delete validationErrors.memberId;

    if (Object.keys(validationErrors).length > 0) {
      setReplaceCardFormErrors(validationErrors);
      window.setTimeout(() => revealFeedbackInContainer(formElement), 0);
      return;
    }

    setIsReplacingCard(true);
    setReplaceCardRequestError("");

    try {
      await replaceCardRecord(
        replacingCard.id,
        {
          cardNumber: replaceCardForm.cardNumber.trim(),
          activatedAt: replaceCardForm.activatedAt,
          expiresAt: replaceCardForm.expiresAt
        },
        authToken
      );

      closeReplaceCardModal();
      setCardSuccessMessage("Card replaced successfully.");
      setCardReloadToken((currentValue) => currentValue + 1);
    } catch (error) {
      setReplaceCardRequestError(getApiErrorMessage(error));
      window.setTimeout(() => revealFeedbackInContainer(formElement), 0);
    } finally {
      setIsReplacingCard(false);
    }
  };

  const openCardDetailsModal = async (card) => {
    setSelectedCardRecord(card);
    setCardProfileRecord(null);
    setCardProfileRequestError("");
    setIsLoadingCardProfile(true);

    try {
      const response = await fetchCardOperationalProfile(card.id, authToken);
      setCardProfileRecord(response.data || null);
    } catch (error) {
      setCardProfileRequestError(getApiErrorMessage(error));
    } finally {
      setIsLoadingCardProfile(false);
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

      <div ref={cardListSectionRef}>
        <SectionCard
          title="Cards List"
          actions={
          <IconButton
            icon="refresh"
            label="Refresh cards"
            text="Refresh"
            onClick={() => setCardReloadToken((currentValue) => currentValue + 1)}
          />
          }
        >
          {cardSuccessMessage ? <div className="form-message">{cardSuccessMessage}</div> : null}
          {isLoadingCards ? <div className="feedback-actions">Loading cards...</div> : null}
          <div className="table-wrapper">
          <table className="data-table data-table--dense">
            <thead>
              <tr>
                <th>Card Number</th>
                <th>Member</th>
                <th>Mobile Number</th>
                <th>Status</th>
                <th>Activated At</th>
                <th>Expires At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cardRecords.length === 0 && !isLoadingCards ? (
                <tr>
                  <td colSpan="7">No card records found.</td>
                </tr>
              ) : (
                cardRecords.map((card) => (
                  <tr key={card.id}>
                    <td>{card.cardNumber}</td>
                    <td>{card.member?.fullName || "-"}</td>
                    <td>{card.member?.mobileNumber || "-"}</td>
                    <td>
                      <StatusChip value={card.status} />
                    </td>
                    <td>{formatDate(card.activatedAt)}</td>
                    <td>{formatDate(card.expiresAt)}</td>
                    <td>
                      <div className="table-row-actions">
                        <IconButton
                          icon="view"
                          label={`View ${card.cardNumber}`}
                          title="View details"
                          onClick={() => openCardDetailsModal(card)}
                        />
                        <IconButton
                          icon="edit"
                          label={`Replace ${card.cardNumber}`}
                          title="Replace card"
                          onClick={() => openReplaceCardModal(card)}
                          disabled={card.status !== "Active"}
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
        isOpen={Boolean(selectedCardRecord)}
        title="Card Details"
        onClose={() => {
          setSelectedCardRecord(null);
          setCardProfileRecord(null);
          setCardProfileRequestError("");
        }}
        footer={(
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              setSelectedCardRecord(null);
              setCardProfileRecord(null);
              setCardProfileRequestError("");
            }}
          >
            Close
          </button>
        )}
        width="620px"
      >
        {selectedCardRecord ? (
          <div className="details-grid">
            <div className="details-grid__item">
              <span>Card Number</span>
              <strong>{selectedCardRecord.cardNumber}</strong>
            </div>
            <div className="details-grid__item">
              <span>Status</span>
              <strong><StatusChip value={selectedCardRecord.status} /></strong>
            </div>
            <div className="details-grid__item">
              <span>Member</span>
              <strong>{selectedCardRecord.member?.fullName || "-"}</strong>
            </div>
            <div className="details-grid__item">
              <span>Mobile Number</span>
              <strong>{selectedCardRecord.member?.mobileNumber || "-"}</strong>
            </div>
            <div className="details-grid__item">
              <span>Activated At</span>
              <strong>{formatDate(selectedCardRecord.activatedAt)}</strong>
            </div>
            <div className="details-grid__item">
              <span>Expires At</span>
              <strong>{formatDate(selectedCardRecord.expiresAt)}</strong>
            </div>
            <div className="details-grid__item details-grid__item--wide">
              <span>Operational Note</span>
              <strong>{selectedCardRecord.operationalProfile?.blockingReason || "Card is operationally ready."}</strong>
            </div>
            {isLoadingCardProfile ? (
              <div className="details-grid__item details-grid__item--wide">
                <span>Operational Readiness</span>
                <strong>Loading operational profile...</strong>
              </div>
            ) : null}
            {cardProfileRequestError ? (
              <div className="details-grid__item details-grid__item--wide">
                <span>Operational Readiness</span>
                <strong>{cardProfileRequestError}</strong>
              </div>
            ) : null}
            {cardProfileRecord?.operationalProfile ? (
              <>
                <div className="details-grid__item">
                  <span>Active Member</span>
                  <strong>{cardProfileRecord.operationalProfile.activeMember ? "Yes" : "No"}</strong>
                </div>
                <div className="details-grid__item">
                  <span>Expired</span>
                  <strong>{cardProfileRecord.operationalProfile.expired ? "Yes" : "No"}</strong>
                </div>
                <div className="details-grid__item">
                  <span>Operations Ready</span>
                  <strong>{cardProfileRecord.operationalProfile.canUseInOperations ? "Yes" : "No"}</strong>
                </div>
                <div className="details-grid__item details-grid__item--wide">
                  <span>Blocking Reason</span>
                  <strong>{cardProfileRecord.operationalProfile.blockingReason || "Card is operationally ready."}</strong>
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </ModalDialog>

      <ModalDialog
        isOpen={Boolean(replacingCard)}
        title="Replace Card"
        onClose={closeReplaceCardModal}
        footer={(
          <>
            <button
              type="button"
              className="secondary-button"
              onClick={closeReplaceCardModal}
              disabled={isReplacingCard}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="replace-card-form"
              className="primary-button"
              disabled={isReplacingCard}
            >
              {isReplacingCard ? "Saving..." : "Replace Card"}
            </button>
          </>
        )}
        width="620px"
      >
        {replacingCard ? (
          <form id="replace-card-form" className="form-grid" onSubmit={handleReplaceCardSubmit} autoComplete="off">
            <label className="field-group">
              <span>Current Card</span>
              <input type="text" value={replacingCard.cardNumber} readOnly />
            </label>
            <label className="field-group">
              <span>Member</span>
              <input type="text" value={replacingCard.member?.fullName || ""} readOnly />
            </label>
            <label className="field-group">
              <span>New Card Number</span>
              <input
                type="text"
                name="cardNumber"
                value={replaceCardForm.cardNumber}
                onChange={handleReplaceCardInputChange}
                autoComplete="off"
              />
              {replaceCardFormErrors.cardNumber ? (
                <small className="field-error">{replaceCardFormErrors.cardNumber}</small>
              ) : null}
            </label>
            <label className="field-group">
              <span>Activated At</span>
              <input
                type="date"
                name="activatedAt"
                value={replaceCardForm.activatedAt}
                onChange={handleReplaceCardInputChange}
                autoComplete="off"
              />
              {replaceCardFormErrors.activatedAt ? (
                <small className="field-error">{replaceCardFormErrors.activatedAt}</small>
              ) : null}
            </label>
            <label className="field-group">
              <span>Expires At</span>
              <input
                type="date"
                name="expiresAt"
                value={replaceCardForm.expiresAt}
                onChange={handleReplaceCardInputChange}
                autoComplete="off"
              />
              {replaceCardFormErrors.expiresAt ? (
                <small className="field-error">{replaceCardFormErrors.expiresAt}</small>
              ) : null}
            </label>
            {replaceCardRequestError ? (
              <div className="form-message form-message--error">{replaceCardRequestError}</div>
            ) : null}
          </form>
        ) : null}
      </ModalDialog>
    </>
  );
}

export default CardsModule;
