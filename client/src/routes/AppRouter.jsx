/**
 * Module: App Router
 * File: AppRouter.jsx
 * Purpose: Defines the visible route map for the client application.
 */

import { Navigate, Route, Routes } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import DashboardPage from "../pages/DashboardPage";
import FirstTimeSetupPage from "../pages/FirstTimeSetupPage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";

/**
 * Declares the route structure used by the app.
 */
function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/setup" element={<FirstTimeSetupPage />} />
      </Route>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRouter;