/**
 * Module: Stocks Module UI
 * File: StocksModule.jsx
 * Purpose: Provides the Stocks module movement form, filters, and stock list connected to backend APIs.
 */

import { useEffect, useState } from "react";

import SectionCard from "../../../components/common/SectionCard";
import { getApiErrorMessage } from "../../../utils/getApiErrorMessage";
import {
  createStockMovementRecord,
  fetchActiveProductOptions,
  fetchStockList
} from "../api/stockApi";

const stockInitialForm = {
  productId: "",
  quantityChange: "",
  movementType: "Opening",
  notes: ""
};

const stockInitialFilters = {
  search: "",
  stockStatus: "",
  movementType: ""
};

function validateStockForm(formData) {
  const nextErrors = {};

  if (!formData.productId) {
    nextErrors.productId = "Product is required.";
  }

  if (formData.quantityChange === "" || formData.quantityChange === null) {
    nextErrors.quantityChange = "Quantity change is required.";
  } else if (!Number.isFinite(Number(formData.quantityChange))) {
    nextErrors.quantityChange = "Quantity change must be a valid number.";
  } else if (Number(formData.quantityChange) === 0) {
    nextErrors.quantityChange = "Quantity change must not be zero.";
  } else if (
    formData.movementType === "Opening" &&
    Number(formData.quantityChange) <= 0
  ) {
    nextErrors.quantityChange = "Opening quantity must be greater than zero.";
  }

  if (!formData.movementType) {
    nextErrors.movementType = "Movement type is required.";
  }

  return nextErrors;
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

function formatQuantity(value) {
  const quantity = Number(value);

  if (!Number.isFinite(quantity)) {
    return "0";
  }

  return String(quantity);
}

function formatQuantityChange(value) {
  const quantity = Number(value);

  if (!Number.isFinite(quantity) || quantity === 0) {
    return "0";
  }

  return quantity > 0 ? `+${quantity}` : String(quantity);
}

function StocksModule({ authToken, onMetricsChange }) {
  const [stockForm, setStockForm] = useState(stockInitialForm);
  const [stockFormErrors, setStockFormErrors] = useState({});
  const [stockRequestError, setStockRequestError] = useState("");
  const [stockSuccessMessage, setStockSuccessMessage] = useState("");
  const [isSavingStockMovement, setIsSavingStockMovement] = useState(false);
  const [isLoadingStocks, setIsLoadingStocks] = useState(false);
  const [stockRecords, setStockRecords] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [stockFilterForm, setStockFilterForm] = useState(stockInitialFilters);
  const [appliedStockFilters, setAppliedStockFilters] = useState(stockInitialFilters);
  const [stockReloadToken, setStockReloadToken] = useState(0);

  useEffect(() => {
    const loadProductOptions = async () => {
      if (!authToken) {
        return;
      }

      try {
        const response = await fetchActiveProductOptions(authToken);
        const nextProducts = response.data || [];

        setProductOptions(nextProducts);
        setStockForm((currentState) => ({
          ...currentState,
          productId:
            currentState.productId ||
            nextProducts[0]?.id ||
            ""
        }));
      } catch (error) {
        setStockRequestError(getApiErrorMessage(error));
      }
    };

    loadProductOptions();
  }, [authToken]);

  useEffect(() => {
    const loadStocks = async () => {
      if (!authToken) {
        return;
      }

      setIsLoadingStocks(true);
      setStockRequestError("");

      try {
        const response = await fetchStockList(authToken, appliedStockFilters);
        const nextRecords = response.data || [];

        setStockRecords(nextRecords);
        onMetricsChange?.({
          available: nextRecords.filter((stock) => stock.stockStatus === "Available").length,
          lowStock: nextRecords.filter((stock) => stock.stockStatus === "Low Stock").length,
          negative: nextRecords.filter((stock) => stock.stockStatus === "Negative Stock").length
        });
      } catch (error) {
        setStockRequestError(getApiErrorMessage(error));
      } finally {
        setIsLoadingStocks(false);
      }
    };

    loadStocks();
  }, [authToken, appliedStockFilters, stockReloadToken, onMetricsChange]);

  const selectedStockRecord = stockRecords.find(
    (stock) => stock.product?.id === stockForm.productId
  );

  const resetStockForm = () => {
    setStockForm({
      ...stockInitialForm,
      productId: productOptions[0]?.id || ""
    });
    setStockFormErrors({});
    setStockRequestError("");
    setStockSuccessMessage("");
  };

  const handleStockInputChange = (event) => {
    const { name, value } = event.target;

    setStockForm((currentState) => ({
      ...currentState,
      [name]: value
    }));
    setStockFormErrors((currentErrors) => ({
      ...currentErrors,
      [name]: ""
    }));
    setStockRequestError("");
    setStockSuccessMessage("");
  };

  const handleStockFilterChange = (event) => {
    const { name, value } = event.target;

    setStockFilterForm((currentState) => ({
      ...currentState,
      [name]: value
    }));
  };

  const handleStockSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateStockForm(stockForm);
    if (Object.keys(validationErrors).length > 0) {
      setStockFormErrors(validationErrors);
      return;
    }

    setIsSavingStockMovement(true);
    setStockRequestError("");
    setStockSuccessMessage("");

    try {
      await createStockMovementRecord(
        {
          productId: stockForm.productId,
          quantityChange: Number(stockForm.quantityChange),
          movementType: stockForm.movementType,
          notes: stockForm.notes.trim()
        },
        authToken
      );

      resetStockForm();
      setStockSuccessMessage("Stock movement saved successfully.");
      setStockReloadToken((currentValue) => currentValue + 1);
    } catch (error) {
      setStockRequestError(getApiErrorMessage(error));
    } finally {
      setIsSavingStockMovement(false);
    }
  };

  const handleStockFilterSubmit = (event) => {
    event.preventDefault();
    setAppliedStockFilters({
      search: stockFilterForm.search.trim(),
      stockStatus: stockFilterForm.stockStatus,
      movementType: stockFilterForm.movementType
    });
  };

  const resetStockFilters = () => {
    setStockFilterForm(stockInitialFilters);
    setAppliedStockFilters(stockInitialFilters);
  };

  return (
    <>
      <SectionCard title="Record Stock Movement">
        <form className="form-grid" onSubmit={handleStockSubmit} autoComplete="off">
          <label className="field-group">
            <span>Product</span>
            <select
              name="productId"
              value={stockForm.productId}
              onChange={handleStockInputChange}
              autoComplete="off"
            >
              <option value="">Select product</option>
              {productOptions.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.productName} ({product.productCode})
                </option>
              ))}
            </select>
            {stockFormErrors.productId ? (
              <small className="field-error">{stockFormErrors.productId}</small>
            ) : null}
          </label>

          <label className="field-group">
            <span>Current Qty</span>
            <input
              type="number"
              value={selectedStockRecord?.currentQuantity ?? 0}
              readOnly
            />
          </label>

          <label className="field-group">
            <span>Quantity Change</span>
            <input
              type="number"
              name="quantityChange"
              value={stockForm.quantityChange}
              onChange={handleStockInputChange}
              placeholder="Enter quantity change"
              autoComplete="off"
            />
            {stockFormErrors.quantityChange ? (
              <small className="field-error">{stockFormErrors.quantityChange}</small>
            ) : null}
          </label>

          <label className="field-group">
            <span>Movement Type</span>
            <select
              name="movementType"
              value={stockForm.movementType}
              onChange={handleStockInputChange}
              autoComplete="off"
            >
              <option value="Opening">Opening</option>
              <option value="Manual Update">Manual Update</option>
            </select>
            {stockFormErrors.movementType ? (
              <small className="field-error">{stockFormErrors.movementType}</small>
            ) : null}
          </label>

          <label className="field-group field-group--wide">
            <span>Notes</span>
            <textarea
              rows="3"
              name="notes"
              value={stockForm.notes}
              onChange={handleStockInputChange}
              placeholder="Enter movement notes"
              autoComplete="off"
            />
          </label>

          {stockRequestError ? <div className="form-message form-message--error">{stockRequestError}</div> : null}
          {stockSuccessMessage ? <div className="form-message">{stockSuccessMessage}</div> : null}

          <div className="form-actions form-actions--full">
            <button type="submit" className="primary-button" disabled={isSavingStockMovement}>
              {isSavingStockMovement ? "Saving..." : "Save Stock Movement"}
            </button>
            <button type="button" className="secondary-button" onClick={resetStockForm}>
              Reset
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Filters">
        <form className="filter-grid" onSubmit={handleStockFilterSubmit} autoComplete="off">
          <label className="field-group field-group--wide">
            <span>Search Product</span>
            <input
              type="search"
              name="search"
              value={stockFilterForm.search}
              onChange={handleStockFilterChange}
              placeholder="Search by product name or product code"
              autoComplete="off"
            />
          </label>

          <label className="field-group">
            <span>Stock Status</span>
            <select
              name="stockStatus"
              value={stockFilterForm.stockStatus}
              onChange={handleStockFilterChange}
              autoComplete="off"
            >
              <option value="">All</option>
              <option value="Available">Available</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Negative Stock">Negative Stock</option>
            </select>
          </label>

          <label className="field-group">
            <span>Movement Type</span>
            <select
              name="movementType"
              value={stockFilterForm.movementType}
              onChange={handleStockFilterChange}
              autoComplete="off"
            >
              <option value="">All</option>
              <option value="Opening">Opening</option>
              <option value="Manual Update">Manual Update</option>
            </select>
          </label>

          <div className="form-actions form-actions--full">
            <button type="submit" className="primary-button">
              Apply Filters
            </button>
            <button type="button" className="secondary-button" onClick={resetStockFilters}>
              Reset
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard
        title="Stock List"
        actions={
          <button
            type="button"
            className="secondary-button"
            onClick={() => setStockReloadToken((currentValue) => currentValue + 1)}
          >
            Refresh
          </button>
        }
      >
        {isLoadingStocks ? <div className="feedback-actions">Loading stock...</div> : null}
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Code</th>
                <th>Current Qty</th>
                <th>Last Change</th>
                <th>Movement Type</th>
                <th>Stock Status</th>
                <th>Updated At</th>
              </tr>
            </thead>
            <tbody>
              {stockRecords.length === 0 && !isLoadingStocks ? (
                <tr>
                  <td colSpan="7">No stock records found.</td>
                </tr>
              ) : (
                stockRecords.map((stock) => (
                  <tr key={stock.id}>
                    <td>{stock.product?.productName || "-"}</td>
                    <td>{stock.product?.productCode || "-"}</td>
                    <td>{formatQuantity(stock.currentQuantity)}</td>
                    <td>{formatQuantityChange(stock.lastChange)}</td>
                    <td>{stock.movementType || "-"}</td>
                    <td>
                      <span className="status-badge">{stock.stockStatus}</span>
                    </td>
                    <td>{formatDateTime(stock.lastMovementAt || stock.updatedAt)}</td>
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

export default StocksModule;
