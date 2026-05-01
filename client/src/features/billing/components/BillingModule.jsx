/**
 * Module: Billing Module UI
 * File: BillingModule.jsx
 * Purpose: Provides the Billing module bill form, filters, and recent bill list connected to backend APIs.
 */

import { useCallback, useEffect, useRef, useState } from "react";

import IconButton from "../../../components/common/IconButton";
import ModalDialog from "../../../components/common/ModalDialog";
import SectionCard from "../../../components/common/SectionCard";
import SearchableSelect from "../../../components/common/SearchableSelect";
import StatusChip from "../../../components/common/StatusChip";
import { LoadingState, TableEmptyState } from "../../../components/common/VisualStates";
import { getTodayInputDateValue } from "../../../utils/dateFieldDefaults";
import { getApiErrorMessage } from "../../../utils/getApiErrorMessage";
import { revealFeedbackInContainer } from "../../../utils/revealFeedbackInContainer";
import { scrollElementBelowHeader } from "../../../utils/scrollElementBelowHeader";
import { fetchCardList } from "../../cards/api/cardApi";
import { fetchProductList } from "../../products/api/productApi";
import {
  createBillRecord,
  fetchBillingPrecheck,
  fetchBillList
} from "../api/billingApi";

const billingInitialForm = {
  cardNumber: "",
  productId: "",
  quantity: "1",
  notes: ""
};

const createBillingInitialFilters = () => ({
  search: "",
  status: "",
  date: getTodayInputDateValue()
});

function validateBillingForm({ cardNumber, items }) {
  const nextErrors = {};

  if (!cardNumber.trim()) {
    nextErrors.cardNumber = "Card number is required.";
  }

  if (!Array.isArray(items) || items.length === 0) {
    nextErrors.items = "Add at least one product to the bill.";
  }

  return nextErrors;
}

function validatePendingItem(formData) {
  const nextErrors = {};

  if (!formData.productId) {
    nextErrors.productId = "Product is required.";
  }

  if (!formData.quantity) {
    nextErrors.quantity = "Quantity is required.";
  } else if (!Number.isFinite(Number(formData.quantity))) {
    nextErrors.quantity = "Quantity must be a valid number.";
  } else if (Number(formData.quantity) <= 0) {
    nextErrors.quantity = "Quantity must be greater than zero.";
  } else if (!Number.isInteger(Number(formData.quantity))) {
    nextErrors.quantity = "Quantity must be a whole number.";
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

function BillingModule({ authToken, onMetricsChange, onRecordsChange }) {
  const billListSectionRef = useRef(null);
  const [billingForm, setBillingForm] = useState(billingInitialForm);
  const [billingItems, setBillingItems] = useState([]);
  const [billingFormErrors, setBillingFormErrors] = useState({});
  const [billingRequestError, setBillingRequestError] = useState("");
  const [billingSuccessMessage, setBillingSuccessMessage] = useState("");
  const [isCreatingBill, setIsCreatingBill] = useState(false);
  const [isLoadingBills, setIsLoadingBills] = useState(false);
  const [billRecords, setBillRecords] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [billFilterForm, setBillFilterForm] = useState(createBillingInitialFilters);
  const [appliedBillFilters, setAppliedBillFilters] = useState(createBillingInitialFilters);
  const [billReloadToken, setBillReloadToken] = useState(0);
  const [selectedBillRecord, setSelectedBillRecord] = useState(null);
  const [billingPrecheck, setBillingPrecheck] = useState(null);
  const [isLoadingBillingPrecheck, setIsLoadingBillingPrecheck] = useState(false);
  const [billingPrecheckError, setBillingPrecheckError] = useState("");
  const [cardSuggestions, setCardSuggestions] = useState([]);
  const [isLoadingCardSuggestions, setIsLoadingCardSuggestions] = useState(false);
  const [showCardSuggestions, setShowCardSuggestions] = useState(false);

  useEffect(() => {
    const loadProductOptions = async () => {
      if (!authToken) {
        return;
      }

      try {
        const response = await fetchProductList(authToken, {
          status: "Active",
          limit: "12"
        });
        const nextProducts = response.data || [];

        setProductOptions(nextProducts);
      } catch (error) {
        setBillingRequestError(getApiErrorMessage(error));
      }
    };

    loadProductOptions();
  }, [authToken]);

  useEffect(() => {
    const loadBills = async () => {
      if (!authToken) {
        return;
      }

      setIsLoadingBills(true);
      setBillingRequestError("");

      try {
        const response = await fetchBillList(authToken, appliedBillFilters);
        const nextRecords = response.data || [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        setBillRecords(nextRecords);
        onRecordsChange?.(nextRecords);
        onMetricsChange?.({
          todayCount: nextRecords.filter((bill) => {
            const createdAt = new Date(bill.createdAt);

            if (Number.isNaN(createdAt.getTime())) {
              return false;
            }

            createdAt.setHours(0, 0, 0, 0);
            return createdAt.getTime() === today.getTime();
          }).length,
          collectedAmount: nextRecords.reduce(
            (sum, bill) => sum + Number(bill.totalAmount || 0),
            0
          ),
          stockWarnings: 0
        });
      } catch (error) {
        setBillingRequestError(getApiErrorMessage(error));
      } finally {
        setIsLoadingBills(false);
      }
    };

    loadBills();
  }, [authToken, appliedBillFilters, billReloadToken, onMetricsChange, onRecordsChange]);

  useEffect(() => {
    const searchTerm = billingForm.cardNumber.trim();

    if (!authToken || searchTerm.length < 1) {
      setCardSuggestions([]);
      setIsLoadingCardSuggestions(false);
      return undefined;
    }

    const suggestionTimer = window.setTimeout(async () => {
      setIsLoadingCardSuggestions(true);

      try {
        const response = await fetchCardList(authToken, {
          search: searchTerm,
          status: "Active",
          limit: "8"
        });

        setCardSuggestions(response.data || []);
      } catch (error) {
        setCardSuggestions([]);
      } finally {
        setIsLoadingCardSuggestions(false);
      }
    }, 250);

    return () => window.clearTimeout(suggestionTimer);
  }, [authToken, billingForm.cardNumber]);

  const pendingProduct = productOptions.find(
    (product) => product.id === billingForm.productId
  );

  const loadBillingProductSearchOptions = useCallback(async (search) => {
    if (!authToken) {
      return [];
    }

    const response = await fetchProductList(authToken, {
      search,
      status: "Active",
      limit: "12"
    });

    return response.data || [];
  }, [authToken]);

  const computedTotal = billingItems.reduce(
    (sum, item) => sum + Number(item.lineTotal || 0),
    0
  );

  const resetBillingForm = () => {
    setBillingForm({
      ...billingInitialForm,
      productId: ""
    });
    setBillingItems([]);
    setBillingFormErrors({});
    setBillingRequestError("");
    setBillingSuccessMessage("");
    setBillingPrecheck(null);
    setBillingPrecheckError("");
  };

  const handleBillingInputChange = (event) => {
    const { name, value } = event.target;

    setBillingForm((currentState) => ({
      ...currentState,
      [name]: value
    }));
    setBillingFormErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
      items: ""
    }));
    setBillingRequestError("");
    setBillingSuccessMessage("");

    if (name === "cardNumber") {
      setBillingPrecheck(null);
      setBillingPrecheckError("");
      setShowCardSuggestions(true);
    }
  };

  const handleCardSuggestionSelect = (card) => {
    setBillingForm((currentState) => ({
      ...currentState,
      cardNumber: card.cardNumber || currentState.cardNumber
    }));
    setBillingFormErrors((currentErrors) => ({
      ...currentErrors,
      cardNumber: ""
    }));
    setBillingPrecheck(null);
    setBillingPrecheckError("");
    setShowCardSuggestions(false);
  };

  const handleBillFilterChange = (event) => {
    const { name, value } = event.target;

    setBillFilterForm((currentState) => ({
      ...currentState,
      [name]: value
    }));
  };

  const handleAddBillItem = () => {
    const formElement = document.querySelector('.section-card form');
    const itemErrors = validatePendingItem(billingForm);

    if (Object.keys(itemErrors).length > 0) {
      setBillingFormErrors((currentErrors) => ({
        ...currentErrors,
        ...itemErrors
      }));
      window.setTimeout(() => revealFeedbackInContainer(formElement), 0);
      return;
    }

    if (!pendingProduct) {
      setBillingFormErrors((currentErrors) => ({
        ...currentErrors,
        productId: "Selected product is not available."
      }));
      window.setTimeout(() => revealFeedbackInContainer(formElement), 0);
      return;
    }

    const duplicateItem = billingItems.find(
      (item) => item.productId === billingForm.productId
    );

    if (duplicateItem) {
      setBillingFormErrors((currentErrors) => ({
        ...currentErrors,
        productId: "Product is already added to the bill."
      }));
      window.setTimeout(() => revealFeedbackInContainer(formElement), 0);
      return;
    }

    const quantity = Number(billingForm.quantity);

    setBillingItems((currentItems) => [
      ...currentItems,
      {
        productId: pendingProduct.id,
        productName: pendingProduct.productName,
        productCode: pendingProduct.productCode,
        unit: pendingProduct.unit,
        unitPrice: Number(pendingProduct.sellingPrice || 0),
        quantity,
        lineTotal: Number(pendingProduct.sellingPrice || 0) * quantity
      }
    ]);

    setBillingForm((currentState) => ({
      ...currentState,
      productId: "",
      quantity: "1"
    }));
    setBillingFormErrors((currentErrors) => ({
      ...currentErrors,
      productId: "",
      quantity: "",
      items: ""
    }));
  };

  const handleRemoveBillItem = (productId) => {
    setBillingItems((currentItems) =>
      currentItems.filter((item) => item.productId !== productId)
    );
  };

  const handleBillingSubmit = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;

    const validationErrors = validateBillingForm({
      cardNumber: billingForm.cardNumber,
      items: billingItems
    });

    if (Object.keys(validationErrors).length > 0) {
      setBillingFormErrors((currentErrors) => ({
        ...currentErrors,
        ...validationErrors
      }));
      window.setTimeout(() => revealFeedbackInContainer(formElement), 0);
      return;
    }

    if (billingPrecheck && !billingPrecheck.canBill) {
      setBillingRequestError(
        billingPrecheck.blockingReason || "Billing is not allowed for the supplied card."
      );
      window.setTimeout(() => revealFeedbackInContainer(formElement), 0);
      return;
    }

    setIsCreatingBill(true);
    setBillingRequestError("");
    setBillingSuccessMessage("");

    try {
      await createBillRecord(
        {
          cardNumber: billingForm.cardNumber.trim(),
          items: billingItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity
          })),
          notes: billingForm.notes.trim()
        },
        authToken
      );

      resetBillingForm();
      setBillingSuccessMessage("Bill created successfully.");
      setBillReloadToken((currentValue) => currentValue + 1);
      window.setTimeout(() => scrollElementBelowHeader(billListSectionRef.current), 150);
    } catch (error) {
      setBillingRequestError(getApiErrorMessage(error));
      window.setTimeout(() => revealFeedbackInContainer(formElement), 0);
    } finally {
      setIsCreatingBill(false);
    }
  };

  const handleBillFilterSubmit = (event) => {
    event.preventDefault();
    setAppliedBillFilters({
      search: billFilterForm.search.trim(),
      status: billFilterForm.status,
      date: billFilterForm.date
    });
  };

  const resetBillFilters = () => {
    const initialFilters = createBillingInitialFilters();

    setBillFilterForm(initialFilters);
    setAppliedBillFilters(initialFilters);
  };

  const handleBillingPrecheck = async () => {
    const formElement = document.querySelector('.section-card form');
    const trimmedCardNumber = billingForm.cardNumber.trim();

    if (!trimmedCardNumber) {
      setBillingFormErrors((currentErrors) => ({
        ...currentErrors,
        cardNumber: "Card number is required."
      }));
      window.setTimeout(() => revealFeedbackInContainer(formElement), 0);
      return;
    }

    setIsLoadingBillingPrecheck(true);
    setBillingPrecheck(null);
    setBillingPrecheckError("");
    setBillingRequestError("");

    try {
      const response = await fetchBillingPrecheck(trimmedCardNumber, authToken);
      setBillingPrecheck(response.data || null);
    } catch (error) {
      setBillingPrecheckError(getApiErrorMessage(error));
      window.setTimeout(() => revealFeedbackInContainer(formElement), 0);
    } finally {
      setIsLoadingBillingPrecheck(false);
    }
  };

  return (
    <>
      <SectionCard title="Create Bill">
        <form className="form-grid" onSubmit={handleBillingSubmit} autoComplete="off">
          <label className="field-group">
            <span>Card Number</span>
            <div className="autocomplete-field">
              <input
                type="text"
                name="cardNumber"
                value={billingForm.cardNumber}
                onChange={handleBillingInputChange}
                onFocus={() => setShowCardSuggestions(true)}
                onBlur={() => window.setTimeout(() => setShowCardSuggestions(false), 120)}
                placeholder="Search or enter linked card number"
                autoComplete="off"
              />
              {showCardSuggestions && billingForm.cardNumber.trim() ? (
                <div className="autocomplete-panel" role="listbox">
                  {isLoadingCardSuggestions ? (
                    <div className="autocomplete-panel__empty">Searching cards...</div>
                  ) : cardSuggestions.length > 0 ? (
                    cardSuggestions.map((card) => (
                      <button
                        key={card.id}
                        type="button"
                        className="autocomplete-option"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleCardSuggestionSelect(card)}
                      >
                        <strong>{card.cardNumber}</strong>
                        <span>
                          {card.member?.fullName || "No member"} · {card.member?.mobileNumber || "-"}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="autocomplete-panel__empty">No active card found.</div>
                  )}
                </div>
              ) : null}
            </div>
            {billingFormErrors.cardNumber ? (
              <small className="field-error">{billingFormErrors.cardNumber}</small>
            ) : null}
          </label>

          <label className="field-group">
            <span>Product</span>
            <SearchableSelect
              value={billingForm.productId}
              onChange={(nextProductId, product) => {
                setBillingForm((currentState) => ({
                  ...currentState,
                  productId: nextProductId
                }));
                if (product) {
                  setProductOptions((currentProducts) =>
                    currentProducts.some((currentProduct) => currentProduct.id === product.id)
                      ? currentProducts
                      : [product, ...currentProducts]
                  );
                }
                setBillingFormErrors((currentErrors) => ({
                  ...currentErrors,
                  productId: "",
                  items: ""
                }));
              }}
              loadOptions={loadBillingProductSearchOptions}
              getOptionValue={(product) => product.id}
              getOptionLabel={(product) => `${product.productName} (${product.productCode})`}
              getOptionMeta={(product) => `${formatCurrency(product.sellingPrice)} · ${product.unit}`}
              placeholder="Search product name or code"
            />
            {billingFormErrors.productId ? (
              <small className="field-error">{billingFormErrors.productId}</small>
            ) : null}
          </label>

          <label className="field-group">
            <span>Unit Price</span>
            <input
              type="text"
              value={formatCurrency(pendingProduct?.sellingPrice || 0)}
              readOnly
            />
          </label>

          <label className="field-group">
            <span>Quantity</span>
            <input
              type="number"
              name="quantity"
              value={billingForm.quantity}
              onChange={handleBillingInputChange}
              min="1"
              step="1"
              autoComplete="off"
            />
            {billingFormErrors.quantity ? (
              <small className="field-error">{billingFormErrors.quantity}</small>
            ) : null}
          </label>

          <label className="field-group field-group--wide">
            <span>Notes</span>
            <textarea
              rows="3"
              name="notes"
              value={billingForm.notes}
              onChange={handleBillingInputChange}
              placeholder="Enter bill notes"
              autoComplete="off"
            />
          </label>

          <div className="form-actions form-actions--full">
            <button
              type="button"
              className="secondary-button"
              onClick={handleBillingPrecheck}
              disabled={isLoadingBillingPrecheck}
            >
              {isLoadingBillingPrecheck ? "Checking..." : "Check Card"}
            </button>
            <button type="button" className="secondary-button" onClick={handleAddBillItem}>
              Add Item
            </button>
          </div>

          {billingPrecheckError ? (
            <div className="form-message form-message--error">{billingPrecheckError}</div>
          ) : null}

          {billingPrecheck ? (
            <div className="details-grid details-grid--compact">
              <div className="details-grid__item">
                <span>Member</span>
                <strong>{billingPrecheck.member?.fullName || "-"}</strong>
              </div>
              <div className="details-grid__item">
                <span>Mobile Number</span>
                <strong>{billingPrecheck.member?.mobileNumber || "-"}</strong>
              </div>
              <div className="details-grid__item">
                <span>Card Status</span>
                <strong>{billingPrecheck.card?.status || "-"}</strong>
              </div>
              <div className="details-grid__item">
                <span>Wallet Balance</span>
                <strong>{formatCurrency(billingPrecheck.wallet?.balance || 0)}</strong>
              </div>
              <div className="details-grid__item">
                <span>Wallet Status</span>
                <strong>{billingPrecheck.wallet?.status || "-"}</strong>
              </div>
              <div className="details-grid__item">
                <span>Billing Ready</span>
                <strong>{billingPrecheck.canBill ? "Yes" : "No"}</strong>
              </div>
              <div className="details-grid__item details-grid__item--wide">
                <span>Blocking Reason</span>
                <strong>{billingPrecheck.blockingReason || "Card is ready for billing."}</strong>
              </div>
            </div>
          ) : null}

          {billingFormErrors.items ? (
            <div className="form-message form-message--error">{billingFormErrors.items}</div>
          ) : null}
          {billingRequestError ? <div className="form-message form-message--error">{billingRequestError}</div> : null}
          {billingSuccessMessage ? <div className="form-message">{billingSuccessMessage}</div> : null}

          <div className="table-wrapper form-actions--full">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Code</th>
                  <th>Unit Price</th>
                  <th>Qty</th>
                  <th>Line Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {billingItems.length === 0 ? (
                  <tr>
                    <td colSpan="6">No items added to this bill yet.</td>
                  </tr>
                ) : (
                  billingItems.map((item) => (
                    <tr key={item.productId}>
                      <td>{item.productName}</td>
                      <td>{item.productCode}</td>
                      <td>{formatCurrency(item.unitPrice)}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.lineTotal)}</td>
                      <td>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => handleRemoveBillItem(item.productId)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="inline-summary form-actions--full">
            <span>Total Amount</span>
            <strong>{formatCurrency(computedTotal)}</strong>
          </div>

          <div className="form-actions form-actions--full">
            <button
              type="submit"
              className="primary-button"
              disabled={isCreatingBill || isLoadingBillingPrecheck || (billingPrecheck && !billingPrecheck.canBill)}
            >
              {isCreatingBill ? "Creating..." : "Create Bill"}
            </button>
            <button type="button" className="secondary-button" onClick={resetBillingForm}>
              Reset
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Filters">
        <form className="filter-grid" onSubmit={handleBillFilterSubmit} autoComplete="off">
          <label className="field-group field-group--wide">
            <span>Search Bill</span>
            <input
              type="search"
              name="search"
              value={billFilterForm.search}
              onChange={handleBillFilterChange}
              placeholder="Search by bill number, member name, or card number"
              autoComplete="off"
            />
          </label>

          <label className="field-group">
            <span>Status</span>
            <select
              name="status"
              value={billFilterForm.status}
              onChange={handleBillFilterChange}
              autoComplete="off"
            >
              <option value="">All</option>
              <option value="Completed">Completed</option>
            </select>
          </label>

          <label className="field-group">
            <span>Date</span>
            <input
              type="date"
              name="date"
              value={billFilterForm.date}
              onChange={handleBillFilterChange}
              autoComplete="off"
            />
          </label>

          <div className="form-actions form-actions--full">
            <button type="submit" className="primary-button">
              Apply Filters
            </button>
            <button type="button" className="secondary-button" onClick={resetBillFilters}>
              Reset
            </button>
          </div>
        </form>
      </SectionCard>

      <div ref={billListSectionRef}>
        <SectionCard
          title="Bills List"
          actions={
          <IconButton
            icon="refresh"
            label="Refresh bills"
            text="Refresh"
            onClick={() => setBillReloadToken((currentValue) => currentValue + 1)}
          />
          }
        >
          {billingSuccessMessage ? <div className="form-message">{billingSuccessMessage}</div> : null}
          {isLoadingBills ? <LoadingState message="Loading bills..." /> : null}
          <div className="table-wrapper">
          <table className="data-table data-table--dense">
            <thead>
              <tr>
                <th>Bill Number</th>
                <th>Member</th>
                <th>Card</th>
                <th>Total</th>
                <th>Items</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {billRecords.length === 0 && !isLoadingBills ? (
                  <TableEmptyState
                    colSpan={8}
                    title="No bill records found"
                    message="Create a bill or adjust the billing filters."
                  />
              ) : (
                billRecords.map((bill) => (
                  <tr key={bill.id}>
                    <td>{bill.billNumber}</td>
                    <td>{bill.member?.fullName || "-"}</td>
                    <td>{bill.card?.cardNumber || "-"}</td>
                    <td>{formatCurrency(bill.totalAmount)}</td>
                    <td>{bill.itemCount}</td>
                    <td>
                      <StatusChip value={bill.status} />
                    </td>
                    <td>{formatDateTime(bill.createdAt)}</td>
                    <td>
                      <div className="table-row-actions">
                        <IconButton
                          icon="view"
                          label={`View ${bill.billNumber}`}
                          title="View details"
                          onClick={() => setSelectedBillRecord(bill)}
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
        isOpen={Boolean(selectedBillRecord)}
        title="Bill Details"
        onClose={() => setSelectedBillRecord(null)}
        footer={(
          <button type="button" className="secondary-button" onClick={() => setSelectedBillRecord(null)}>
            Close
          </button>
        )}
        width="760px"
      >
        {selectedBillRecord ? (
          <>
            <div className="details-grid">
              <div className="details-grid__item">
                <span>Bill Number</span>
                <strong>{selectedBillRecord.billNumber}</strong>
              </div>
              <div className="details-grid__item">
                <span>Status</span>
                <strong><StatusChip value={selectedBillRecord.status} /></strong>
              </div>
              <div className="details-grid__item">
                <span>Member</span>
                <strong>{selectedBillRecord.member?.fullName || "-"}</strong>
              </div>
              <div className="details-grid__item">
                <span>Card</span>
                <strong>{selectedBillRecord.card?.cardNumber || "-"}</strong>
              </div>
              <div className="details-grid__item">
                <span>Balance Before</span>
                <strong>{formatCurrency(selectedBillRecord.balanceBefore)}</strong>
              </div>
              <div className="details-grid__item">
                <span>Balance After</span>
                <strong>{formatCurrency(selectedBillRecord.balanceAfter)}</strong>
              </div>
            </div>
            <div className="table-wrapper">
              <table className="data-table data-table--dense">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Code</th>
                    <th>Unit</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedBillRecord.items || []).map((item, index) => (
                    <tr key={`${item.productId || item.productCode}-${index}`}>
                      <td>{item.productName}</td>
                      <td>{item.productCode}</td>
                      <td>{item.unit}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.unitPrice)}</td>
                      <td>{formatCurrency(item.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </ModalDialog>
    </>
  );
}

export default BillingModule;
