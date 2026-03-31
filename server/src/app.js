/**
 * Module: App Configuration
 * File: app.js
 * Purpose: Configures the Express app, shared middlewares, and base routes.
 */

const cors = require("cors");
const express = require("express");
const helmet = require("helmet");

const {
  API_PREFIX,
  APP_NAME,
  CLIENT_ORIGIN_FALLBACK,
  REQUEST_BODY_LIMIT
} = require("./constants/appConstants");
const { buildApiResponse } = require("./utils/apiResponse");
const { notFoundHandler } = require("./middlewares/notFoundHandler");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();
const allowCredentials = CLIENT_ORIGIN_FALLBACK !== "*";

app.use(
  cors({
    origin: CLIENT_ORIGIN_FALLBACK,
    credentials: allowCredentials
  })
);
app.use(helmet());
app.use(express.json({ limit: REQUEST_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: REQUEST_BODY_LIMIT }));

/**
 * Returns a simple service status response for quick verification.
 */
app.get(`${API_PREFIX}/health`, (request, response) => {
  response.status(200).json(
    buildApiResponse({
      message: `${APP_NAME} API is running.`,
      data: {
        status: "ok"
      }
    })
  );
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;