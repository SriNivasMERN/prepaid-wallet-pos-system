/**
 * Module: Database Configuration
 * File: db.js
 * Purpose: Connects Mongoose to the configured MongoDB instance.
 */

const mongoose = require("mongoose");

const { DATABASE_URI } = require("../constants/appConstants");

/**
 * Establishes the database connection before the server starts.
 */
const connectDatabase = async () => {
  await mongoose.connect(DATABASE_URI);
  console.log("Database connection established");
};

module.exports = {
  connectDatabase
};