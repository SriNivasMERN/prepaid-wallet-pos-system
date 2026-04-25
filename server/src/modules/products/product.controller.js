/**
 * Module: Product Controller
 * File: product.controller.js
 * Purpose: Handles product create, update, status change, and list responses.
 */

const { buildApiResponse } = require("../../utils/apiResponse");
const {
  createProduct,
  getProductList,
  updateProduct,
  updateProductStatus
} = require("./product.service");

/**
 * Returns the product list for the Products module.
 */
const getProductListHandler = async (request, response, next) => {
  try {
    const data = await getProductList(request.query);

    response.status(200).json(
      buildApiResponse({
        message: "Product list fetched successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Creates a new product master record.
 */
const createProductHandler = async (request, response, next) => {
  try {
    const data = await createProduct(request.body, request.auth);

    response.status(201).json(
      buildApiResponse({
        message: "Product created successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Updates one product master record.
 */
const updateProductHandler = async (request, response, next) => {
  try {
    const data = await updateProduct(request.params.productId, request.body, request.auth);

    response.status(200).json(
      buildApiResponse({
        message: "Product updated successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Updates one product status.
 */
const updateProductStatusHandler = async (request, response, next) => {
  try {
    const data = await updateProductStatus(
      request.params.productId,
      request.body?.status,
      request.auth
    );

    response.status(200).json(
      buildApiResponse({
        message: "Product status updated successfully.",
        data
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductListHandler,
  createProductHandler,
  updateProductHandler,
  updateProductStatusHandler
};
