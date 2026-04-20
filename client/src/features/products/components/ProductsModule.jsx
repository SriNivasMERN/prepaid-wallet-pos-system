/**
 * Module: Products Module UI
 * File: ProductsModule.jsx
 * Purpose: Provides the Products module create form, filters, and list connected to backend APIs.
 */

import { useEffect, useState } from "react";

import SectionCard from "../../../components/common/SectionCard";
import { getApiErrorMessage } from "../../../utils/getApiErrorMessage";
import { createProductRecord, fetchProductList } from "../api/productApi";

const productInitialForm = {
  productName: "",
  productCode: "",
  sellingPrice: "",
  unit: "Piece",
  status: "Active"
};

const productInitialFilters = {
  search: "",
  status: "",
  unit: ""
};

function validateProductForm(formData) {
  const nextErrors = {};

  if (!formData.productName.trim()) {
    nextErrors.productName = "Product name is required.";
  } else if (formData.productName.trim().length < 2) {
    nextErrors.productName = "Minimum 2 characters required.";
  }

  if (!formData.productCode.trim()) {
    nextErrors.productCode = "Product code is required.";
  }

  if (!formData.sellingPrice) {
    nextErrors.sellingPrice = "Selling price is required.";
  } else if (
    !Number.isFinite(Number(formData.sellingPrice)) ||
    Number(formData.sellingPrice) <= 0
  ) {
    nextErrors.sellingPrice = "Selling price must be greater than zero.";
  }

  if (!formData.unit) {
    nextErrors.unit = "Unit is required.";
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

function ProductsModule({ authToken, onMetricsChange }) {
  const [productForm, setProductForm] = useState(productInitialForm);
  const [productFormErrors, setProductFormErrors] = useState({});
  const [productRequestError, setProductRequestError] = useState("");
  const [productSuccessMessage, setProductSuccessMessage] = useState("");
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productRecords, setProductRecords] = useState([]);
  const [productFilterForm, setProductFilterForm] = useState(productInitialFilters);
  const [appliedProductFilters, setAppliedProductFilters] = useState(productInitialFilters);
  const [productReloadToken, setProductReloadToken] = useState(0);

  useEffect(() => {
    const loadProducts = async () => {
      if (!authToken) {
        return;
      }

      setIsLoadingProducts(true);
      setProductRequestError("");

      try {
        const response = await fetchProductList(authToken, appliedProductFilters);
        const nextRecords = response.data || [];

        setProductRecords(nextRecords);
        onMetricsChange?.({
          active: nextRecords.filter((product) => product.status === "Active").length,
          inactive: nextRecords.filter((product) => product.status === "Inactive").length,
          stockAlerts: 0
        });
      } catch (error) {
        setProductRequestError(getApiErrorMessage(error));
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadProducts();
  }, [authToken, appliedProductFilters, productReloadToken, onMetricsChange]);

  const resetProductForm = () => {
    setProductForm(productInitialForm);
    setProductFormErrors({});
    setProductRequestError("");
    setProductSuccessMessage("");
  };

  const handleProductInputChange = (event) => {
    const { name, value } = event.target;

    setProductForm((currentState) => ({
      ...currentState,
      [name]: value
    }));
    setProductFormErrors((currentErrors) => ({
      ...currentErrors,
      [name]: ""
    }));
    setProductRequestError("");
    setProductSuccessMessage("");
  };

  const handleProductFilterChange = (event) => {
    const { name, value } = event.target;

    setProductFilterForm((currentState) => ({
      ...currentState,
      [name]: value
    }));
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateProductForm(productForm);
    if (Object.keys(validationErrors).length > 0) {
      setProductFormErrors(validationErrors);
      return;
    }

    setIsCreatingProduct(true);
    setProductRequestError("");
    setProductSuccessMessage("");

    try {
      await createProductRecord(
        {
          productName: productForm.productName.trim(),
          productCode: productForm.productCode.trim(),
          sellingPrice: Number(productForm.sellingPrice),
          unit: productForm.unit,
          status: productForm.status
        },
        authToken
      );

      resetProductForm();
      setProductSuccessMessage("Product created successfully.");
      setProductReloadToken((currentValue) => currentValue + 1);
    } catch (error) {
      setProductRequestError(getApiErrorMessage(error));
    } finally {
      setIsCreatingProduct(false);
    }
  };

  const handleProductFilterSubmit = (event) => {
    event.preventDefault();
    setAppliedProductFilters({
      search: productFilterForm.search.trim(),
      status: productFilterForm.status,
      unit: productFilterForm.unit
    });
  };

  const resetProductFilters = () => {
    setProductFilterForm(productInitialFilters);
    setAppliedProductFilters(productInitialFilters);
  };

  return (
    <>
      <SectionCard title="Create Product">
        <form className="form-grid" onSubmit={handleProductSubmit} autoComplete="off">
          <label className="field-group">
            <span>Product Name</span>
            <input
              type="text"
              name="productName"
              value={productForm.productName}
              onChange={handleProductInputChange}
              placeholder="Enter product name"
              autoComplete="off"
            />
            {productFormErrors.productName ? (
              <small className="field-error">{productFormErrors.productName}</small>
            ) : null}
          </label>

          <label className="field-group">
            <span>Product Code</span>
            <input
              type="text"
              name="productCode"
              value={productForm.productCode}
              onChange={handleProductInputChange}
              placeholder="Enter product code"
              autoComplete="off"
            />
            {productFormErrors.productCode ? (
              <small className="field-error">{productFormErrors.productCode}</small>
            ) : null}
          </label>

          <label className="field-group">
            <span>Selling Price</span>
            <input
              type="number"
              name="sellingPrice"
              value={productForm.sellingPrice}
              onChange={handleProductInputChange}
              placeholder="Enter selling price"
              min="0.01"
              step="0.01"
              autoComplete="off"
            />
            {productFormErrors.sellingPrice ? (
              <small className="field-error">{productFormErrors.sellingPrice}</small>
            ) : null}
          </label>

          <label className="field-group">
            <span>Unit</span>
            <select
              name="unit"
              value={productForm.unit}
              onChange={handleProductInputChange}
              autoComplete="off"
            >
              <option value="Piece">Piece</option>
              <option value="Bottle">Bottle</option>
              <option value="Pack">Pack</option>
            </select>
            {productFormErrors.unit ? (
              <small className="field-error">{productFormErrors.unit}</small>
            ) : null}
          </label>

          <label className="field-group">
            <span>Status</span>
            <select
              name="status"
              value={productForm.status}
              onChange={handleProductInputChange}
              autoComplete="off"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            {productFormErrors.status ? (
              <small className="field-error">{productFormErrors.status}</small>
            ) : null}
          </label>

          {productRequestError ? <div className="form-message form-message--error">{productRequestError}</div> : null}
          {productSuccessMessage ? <div className="form-message">{productSuccessMessage}</div> : null}

          <div className="form-actions form-actions--full">
            <button type="submit" className="primary-button" disabled={isCreatingProduct}>
              {isCreatingProduct ? "Creating..." : "Create Product"}
            </button>
            <button type="button" className="secondary-button" onClick={resetProductForm}>
              Reset
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Filters">
        <form className="filter-grid" onSubmit={handleProductFilterSubmit} autoComplete="off">
          <label className="field-group field-group--wide">
            <span>Search Product</span>
            <input
              type="search"
              name="search"
              value={productFilterForm.search}
              onChange={handleProductFilterChange}
              placeholder="Search by product name or product code"
              autoComplete="off"
            />
          </label>

          <label className="field-group">
            <span>Unit</span>
            <select
              name="unit"
              value={productFilterForm.unit}
              onChange={handleProductFilterChange}
              autoComplete="off"
            >
              <option value="">All</option>
              <option value="Piece">Piece</option>
              <option value="Bottle">Bottle</option>
              <option value="Pack">Pack</option>
            </select>
          </label>

          <label className="field-group">
            <span>Status</span>
            <select
              name="status"
              value={productFilterForm.status}
              onChange={handleProductFilterChange}
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
            <button type="button" className="secondary-button" onClick={resetProductFilters}>
              Reset
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard
        title="Products List"
        actions={
          <button
            type="button"
            className="secondary-button"
            onClick={() => setProductReloadToken((currentValue) => currentValue + 1)}
          >
            Refresh
          </button>
        }
      >
        {isLoadingProducts ? <div className="feedback-actions">Loading products...</div> : null}
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Code</th>
                <th>Price</th>
                <th>Unit</th>
                <th>Status</th>
                <th>Created By</th>
              </tr>
            </thead>
            <tbody>
              {productRecords.length === 0 && !isLoadingProducts ? (
                <tr>
                  <td colSpan="6">No product records found.</td>
                </tr>
              ) : (
                productRecords.map((product) => (
                  <tr key={product.id}>
                    <td>{product.productName}</td>
                    <td>{product.productCode}</td>
                    <td>{formatCurrency(product.sellingPrice)}</td>
                    <td>{product.unit}</td>
                    <td>
                      <span className="status-badge">{product.status}</span>
                    </td>
                    <td>{product.createdBy?.fullName || "System"}</td>
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

export default ProductsModule;
