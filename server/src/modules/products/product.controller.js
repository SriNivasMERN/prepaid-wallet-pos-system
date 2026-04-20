/**
 * Module: Product Controller
 * File: product.controller.js
 * Purpose: Handles product create and product list responses.
 */

const { buildApiResponse } = require("../../utils/apiResponse");
const { createProduct, getProductList } = require("./product.service");

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

module.exports = {
  getProductListHandler,
  createProductHandler
};
