/**
 * Module: Client Bootstrap
 * File: main.jsx
 * Purpose: Mounts the React application into the browser.
 */

import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";

/**
 * Renders the root application.
 */
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);