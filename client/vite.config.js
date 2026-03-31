/**
 * Module: Vite Configuration
 * File: vite.config.js
 * Purpose: Configures the Vite development and build setup for React.
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
});