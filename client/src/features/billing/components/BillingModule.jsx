/**
 * Module: Billing Module UI
 * File: BillingModule.jsx
 * Purpose: Provides the Billing module bill form, filters, and recent bill list connected to backend APIs.
 */

import { useEffect, useState } from "react";

import SectionCard from "../../../components/common/SectionCard";
import { getApiErrorMessage } from "../../../utils/getApiErrorMessage";
import {
  createBillRecord,
  fetchBillList,
  fetchBillingProductOptions
} from "../api/billingApi";

const billingInitialForm = {
  cardNumber: "",
  productId: "",
  quantity: "1",
  notes: ""
};

const billingInitialFilters = {
  search: "",
  status: "",
  date: ""
};

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

function BillingModule({ authToken, onMetricsChange }) {
  const [billingForm, setBillingForm] = useState(billingInitialForm);
  const [billingItems, setBillingItems] = useState([]);
  const [billingFormErrors, setBillingFormErrors] = useState({});
  const [billingRequestError, setBillingRequestError] = useState("");
  const [billingSuccessMessage, setBillingSuccessMessage] = useState("");
  const [isCreatingBill, setIsCreatingBill] = useState(false);
  const [isLoadingBills, setIsLoadingBills] = useState(false);
  const [billRecords, setBillRecords] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [billFilterForm, setBillFilterForm] = useState(billingInitialFilters);
  const [appliedBillFilters, setAppliedBillFilters] = useState(billingInitialFilters);
  const [billReloadToken, setBillReloadToken] = useState(0);

  useEffect(() => {
    const loadProductOptions = async () => {
      if (!authToken) {
        return;
      }

      try {
        const response = await fetchBillingProductOptions(authToken);
        const nextProducts = response.data || [];

        setProductOptions(nextProducts);
        setBillingForm((currentState) => ({
          ...currentState,
          productId: currentState.productId || nextProducts[0]?.id || ""
        }));
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
  }, [authToken, appliedBillFilters, billReloadToken, onMetricsChange]);

  const pendingProduct = productOptions.find(
    (product) => product.id === billingForm.productId
  );

  const computedTotal = billingItems.reduce(
    (sum, item) => sum + Number(item.lineTotal || 0),
    0
  );

  const resetBillingForm = () => {
    setBillingForm({
      ...billingInitialForm,
      productId: productOptions[0]?.id || ""
    });
    setBillingItems([]);
    setBillingFormErrors({});
    setBillingRequestError("");
    setBillingSuccessMessage("");
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
  };

  const handleBillFilterChange = (event) => {
    const { name, value } = event.target;

    setBillFilterForm((currentState) => ({
      ...currentState,
      [name]: value
    }));
  };

  const handleAddBillItem = () => {
    const itemErrors = validatePendingItem(billingForm);

    if (Object.keys(itemErrors).length > 0) {
      setBillingFormErrors((currentErrors) => ({
        ...currentErrors,
        ...itemErrors
      }));
      return;
    }

    if (!pendingProduct) {
      setBillingFormErrors((currentErrors) => ({
        ...currentErrors,
        productId: "Selected product is not available."
      }));
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
      productId: productOptions[0]?.id || currentState.productId,
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

    const validationErrors = validateBillingForm({
      cardNumber: billingForm.cardNumber,
      items: billingItems
    });

    if (Object.keys(validationErrors).length > 0) {
      setBillingFormErrors((currentErrors) => ({
        ...currentErrors,
        ...validationErrors
      }));
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
    } catch (error) {
      setBillingRequestError(getApiErrorMessage(error));
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
    setBillFilterForm(billingInitialFilters);
    setAppliedBillFilters(billingInitialFilters);
  };

  return (
    <>
      <SectionCard title="Create Bill">
        <form className="form-grid" onSubmit={handleBillingSubmit} autoComplete="off">
          <label className="field-group">
            <span>Card Number</span>
            <input
              type="text"
              name="cardNumber"
              value={billingForm.cardNumber}
              onChange={handleBillingInputChange}
              placeholder="Enter linked card number"
              autoComplete="off"
            />
            {billingFormErrors.cardNumber ? (
              <small className="field-error">{billingFormErrors.cardNumber}</small>
            ) : null}
          </label>

          <label className="field-group">
            <span>Product</span>
            <select
              name="productId"
              value={billingForm.productId}
              onChange={handleBillingInputChange}
              autoComplete="off"
            >
              <option value="">Select product</option>
              {productOptions.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.productName} ({product.productCode})
                </option>
              ))}
            </select>
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
            <button type="button" className="secondary-button" onClick={handleAddBillItem}>
              Add Item
            </button>
          </div>

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

          <div className="form-actions form-actions--full">
            <strong>Total: {formatCurrency(computedTotal)}</strong>
          </div>

          <div className="form-actions form-actions--full">
            <button type="submit" className="primary-button" disabled={isCreatingBill}>
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

      <SectionCard
        title="Bills List"
        actions={
          <button
            type="button"
            className="secondary-button"
            onClick={() => setBillReloadToken((currentValue) => currentValue + 1)}
          >
            Refresh
          </button>
        }
      >
        {isLoadingBills ? <div className="feedback-actions">Loading bills...</div> : null}
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bill Number</th>
                <th>Member</th>
                <th>Card</th>
                <th>Total</th>
                <th>Items</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {billRecords.length === 0 && !isLoadingBills ? (
                <tr>
                  <td colSpan="7">No bill records found.</td>
                </tr>
              ) : (
                billRecords.map((bill) => (
                  <tr key={bill.id}>
                    <td>{bill.billNumber}</td>
                    <td>{bill.member?.fullName || "-"}</td>
                    <td>{bill.card?.cardNumber || "-"}</td>
                    <td>{formatCurrency(bill.totalAmount)}</td>
                    <td>{bill.itemCount}</td>
                    <td>
                      <span className="status-badge">{bill.status}</span>
                    </td>
                    <td>{formatDateTime(bill.createdAt)}</td>
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

export default BillingModule;
