/**
 * Module: Products Module UI
 * File: ProductsModule.jsx
 * Purpose: Provides the Products module create form, filters, and list connected to backend APIs.
 */

import { useEffect, useState } from "react";

import IconButton from "../../../components/common/IconButton";
import ModalDialog from "../../../components/common/ModalDialog";
import SectionCard from "../../../components/common/SectionCard";
import StatusChip from "../../../components/common/StatusChip";
import { getApiErrorMessage } from "../../../utils/getApiErrorMessage";
import {
  createProductRecord,
  fetchProductList,
  updateProductRecord,
  updateProductStatusRecord
} from "../api/productApi";

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

function ProductsModule({ authToken, onMetricsChange, onRecordsChange }) {
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
  const [selectedProductRecord, setSelectedProductRecord] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProductForm, setEditProductForm] = useState(productInitialForm);
  const [editProductFormErrors, setEditProductFormErrors] = useState({});
  const [editProductRequestError, setEditProductRequestError] = useState("");
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
  const [productPendingStatusChange, setProductPendingStatusChange] = useState(null);
  const [isUpdatingProductStatus, setIsUpdatingProductStatus] = useState(false);

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
        onRecordsChange?.(nextRecords);
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
  }, [authToken, appliedProductFilters, productReloadToken, onMetricsChange, onRecordsChange]);

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

  const handleEditProductInputChange = (event) => {
    const { name, value } = event.target;

    setEditProductForm((currentState) => ({
      ...currentState,
      [name]: value
    }));
    setEditProductFormErrors((currentErrors) => ({
      ...currentErrors,
      [name]: ""
    }));
    setEditProductRequestError("");
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

  const openEditProductModal = (product) => {
    setEditingProduct(product);
    setEditProductForm({
      productName: product.productName || "",
      productCode: product.productCode || "",
      sellingPrice: String(product.sellingPrice ?? ""),
      unit: product.unit || "Piece",
      status: product.status || "Active"
    });
    setEditProductFormErrors({});
    setEditProductRequestError("");
  };

  const closeEditProductModal = () => {
    setEditingProduct(null);
    setEditProductForm(productInitialForm);
    setEditProductFormErrors({});
    setEditProductRequestError("");
  };

  const handleEditProductSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateProductForm(editProductForm);

    if (Object.keys(validationErrors).length > 0) {
      setEditProductFormErrors(validationErrors);
      return;
    }

    setIsUpdatingProduct(true);
    setEditProductRequestError("");

    try {
      const response = await updateProductRecord(
        editingProduct.id,
        {
          productName: editProductForm.productName.trim(),
          productCode: editProductForm.productCode.trim(),
          sellingPrice: Number(editProductForm.sellingPrice),
          unit: editProductForm.unit,
          status: editProductForm.status
        },
        authToken
      );

      const updatedProduct = response.data;

      setProductRecords((currentList) =>
        currentList.map((product) => (product.id === updatedProduct.id ? updatedProduct : product))
      );
      closeEditProductModal();
      setProductSuccessMessage("Product updated successfully.");
      setProductReloadToken((currentValue) => currentValue + 1);
    } catch (error) {
      setEditProductRequestError(getApiErrorMessage(error));
    } finally {
      setIsUpdatingProduct(false);
    }
  };

  const handleProductStatusChange = async () => {
    if (!productPendingStatusChange) {
      return;
    }

    setIsUpdatingProductStatus(true);
    setProductRequestError("");

    try {
      const response = await updateProductStatusRecord(
        productPendingStatusChange.id,
        productPendingStatusChange.nextStatus,
        authToken
      );
      const updatedProduct = response.data;

      setProductRecords((currentList) =>
        currentList.map((product) => (product.id === updatedProduct.id ? updatedProduct : product))
      );

      setProductSuccessMessage(
        updatedProduct.status === "Inactive"
          ? "Product marked as inactive successfully."
          : "Product activated successfully."
      );

      setProductPendingStatusChange(null);
      setProductReloadToken((currentValue) => currentValue + 1);
    } catch (error) {
      setProductRequestError(getApiErrorMessage(error));
    } finally {
      setIsUpdatingProductStatus(false);
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
          <IconButton
            icon="refresh"
            label="Refresh products"
            text="Refresh"
            onClick={() => setProductReloadToken((currentValue) => currentValue + 1)}
          />
        }
      >
        {isLoadingProducts ? <div className="feedback-actions">Loading products...</div> : null}
        <div className="table-wrapper">
          <table className="data-table data-table--dense">
            <thead>
              <tr>
                <th>Product</th>
                <th>Code</th>
                <th>Price</th>
                <th>Unit</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {productRecords.length === 0 && !isLoadingProducts ? (
                <tr>
                  <td colSpan="7">No product records found.</td>
                </tr>
              ) : (
                productRecords.map((product) => (
                  <tr key={product.id}>
                    <td>{product.productName}</td>
                    <td>{product.productCode}</td>
                    <td>{formatCurrency(product.sellingPrice)}</td>
                    <td>{product.unit}</td>
                    <td>
                      <StatusChip value={product.status} />
                    </td>
                    <td>{product.createdBy?.fullName || "System"}</td>
                    <td>
                      <div className="table-row-actions">
                        <IconButton
                          icon="view"
                          label={`View ${product.productName}`}
                          title="View details"
                          onClick={() => setSelectedProductRecord(product)}
                        />
                        <IconButton
                          icon="edit"
                          label={`Edit ${product.productName}`}
                          title="Edit product"
                          onClick={() => openEditProductModal(product)}
                        />
                        <IconButton
                          icon={product.status === "Active" ? "close" : "add"}
                          label={`${product.status === "Active" ? "Mark inactive" : "Activate"} ${product.productName}`}
                          title={product.status === "Active" ? "Mark inactive" : "Activate"}
                          onClick={() =>
                            setProductPendingStatusChange({
                              id: product.id,
                              productName: product.productName,
                              currentStatus: product.status,
                              nextStatus: product.status === "Active" ? "Inactive" : "Active"
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

      <ModalDialog
        isOpen={Boolean(selectedProductRecord)}
        title="Product Details"
        onClose={() => setSelectedProductRecord(null)}
        footer={(
          <button type="button" className="secondary-button" onClick={() => setSelectedProductRecord(null)}>
            Close
          </button>
        )}
        width="620px"
      >
        {selectedProductRecord ? (
          <div className="details-grid">
            <div className="details-grid__item">
              <span>Product Name</span>
              <strong>{selectedProductRecord.productName}</strong>
            </div>
            <div className="details-grid__item">
              <span>Product Code</span>
              <strong>{selectedProductRecord.productCode}</strong>
            </div>
            <div className="details-grid__item">
              <span>Selling Price</span>
              <strong>{formatCurrency(selectedProductRecord.sellingPrice)}</strong>
            </div>
            <div className="details-grid__item">
              <span>Unit</span>
              <strong>{selectedProductRecord.unit}</strong>
            </div>
            <div className="details-grid__item">
              <span>Status</span>
              <strong><StatusChip value={selectedProductRecord.status} /></strong>
            </div>
            <div className="details-grid__item details-grid__item--wide">
              <span>Created By</span>
              <strong>{selectedProductRecord.createdBy?.fullName || "System"}</strong>
            </div>
          </div>
        ) : null}
      </ModalDialog>

      <ModalDialog
        isOpen={Boolean(editingProduct)}
        title="Edit Product"
        onClose={closeEditProductModal}
        footer={(
          <>
            <button type="button" className="secondary-button" onClick={closeEditProductModal}>
              Cancel
            </button>
            <button type="submit" form="edit-product-form" className="primary-button" disabled={isUpdatingProduct}>
              {isUpdatingProduct ? "Saving..." : "Save Changes"}
            </button>
          </>
        )}
        width="720px"
      >
        <form id="edit-product-form" className="form-grid" onSubmit={handleEditProductSubmit} autoComplete="off">
          <label className="field-group">
            <span>Product Name</span>
            <input
              type="text"
              name="productName"
              value={editProductForm.productName}
              onChange={handleEditProductInputChange}
              placeholder="Enter product name"
              autoComplete="off"
            />
            {editProductFormErrors.productName ? (
              <small className="field-error">{editProductFormErrors.productName}</small>
            ) : null}
          </label>

          <label className="field-group">
            <span>Product Code</span>
            <input
              type="text"
              name="productCode"
              value={editProductForm.productCode}
              onChange={handleEditProductInputChange}
              placeholder="Enter product code"
              autoComplete="off"
            />
            {editProductFormErrors.productCode ? (
              <small className="field-error">{editProductFormErrors.productCode}</small>
            ) : null}
          </label>

          <label className="field-group">
            <span>Selling Price</span>
            <input
              type="number"
              name="sellingPrice"
              value={editProductForm.sellingPrice}
              onChange={handleEditProductInputChange}
              min="0.01"
              step="0.01"
              autoComplete="off"
            />
            {editProductFormErrors.sellingPrice ? (
              <small className="field-error">{editProductFormErrors.sellingPrice}</small>
            ) : null}
          </label>

          <label className="field-group">
            <span>Unit</span>
            <select
              name="unit"
              value={editProductForm.unit}
              onChange={handleEditProductInputChange}
              autoComplete="off"
            >
              <option value="Piece">Piece</option>
              <option value="Bottle">Bottle</option>
              <option value="Pack">Pack</option>
            </select>
            {editProductFormErrors.unit ? (
              <small className="field-error">{editProductFormErrors.unit}</small>
            ) : null}
          </label>

          <label className="field-group">
            <span>Status</span>
            <select
              name="status"
              value={editProductForm.status}
              onChange={handleEditProductInputChange}
              autoComplete="off"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            {editProductFormErrors.status ? (
              <small className="field-error">{editProductFormErrors.status}</small>
            ) : null}
          </label>

          {editProductRequestError ? (
            <div className="form-message form-message--error">{editProductRequestError}</div>
          ) : null}
        </form>
      </ModalDialog>

      <ModalDialog
        isOpen={Boolean(productPendingStatusChange)}
        title={productPendingStatusChange?.nextStatus === "Inactive" ? "Mark Product Inactive" : "Activate Product"}
        onClose={() => setProductPendingStatusChange(null)}
        footer={(
          <>
            <button type="button" className="secondary-button" onClick={() => setProductPendingStatusChange(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={handleProductStatusChange}
              disabled={isUpdatingProductStatus}
            >
              {isUpdatingProductStatus ? "Saving..." : "Confirm"}
            </button>
          </>
        )}
        width="620px"
      >
        {productPendingStatusChange ? (
          <div className="dialog-note">
            <span>
              This action will change <strong>{productPendingStatusChange.productName}</strong> to{" "}
              <strong>{productPendingStatusChange.nextStatus}</strong>. The product will remain visible in the
              Products list and can be managed again later.
            </span>
          </div>
        ) : null}
      </ModalDialog>
    </>
  );
}

export default ProductsModule;
