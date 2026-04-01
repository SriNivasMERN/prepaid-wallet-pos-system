/**
 * Module: Server Bootstrap
 * File: server.js
 * Purpose: Connects the database and starts the backend HTTP server.
 */

const app = require("./src/app");
const { connectDatabase } = require("./src/config/db");
const { APP_NAME, SERVER_PORT } = require("./src/constants/appConstants");

/**
 * Connects infrastructure services and starts the server.
 */
const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(SERVER_PORT, () => {
      console.log(`${APP_NAME} server running on port ${SERVER_PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();