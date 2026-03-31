/**
 * Module: Server Bootstrap
 * File: server.js
 * Purpose: Starts the backend HTTP server for the application.
 */

const app = require("./src/app");
const { APP_NAME, SERVER_PORT } = require("./src/constants/appConstants");

/**
 * Starts the Express server on the configured port.
 */
const startServer = () => {
  app.listen(SERVER_PORT, () => {
    console.log(`${APP_NAME} server running on port ${SERVER_PORT}`);
  });
};

startServer();