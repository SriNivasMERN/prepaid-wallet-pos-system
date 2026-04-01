/**
 * Module: App Router
 * File: AppRouter.jsx
 * Purpose: Defines the visible route map for the client application.
 */

import { Navigate, Route, Routes } from "react-router-dom";

import { useAuthSession } from "../hooks/useAuthSession";
import { useSetupStatus } from "../hooks/useSetupStatus";
import PublicLayout from "../layouts/PublicLayout";
import DashboardPage from "../pages/DashboardPage";
import FirstTimeSetupPage from "../pages/FirstTimeSetupPage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";

/**
 * Blocks or allows routes based on first-time setup completion.
 */
function SetupGuard({ isSetupComplete, allowWhenSetupComplete, children }) {
  if (allowWhenSetupComplete && !isSetupComplete) {
    return <Navigate to="/setup" replace />;
  }

  if (!allowWhenSetupComplete && isSetupComplete) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Protects app routes until first-time setup has been completed.
 */
function SetupCompletionGuard({ isSetupComplete, children }) {
  if (!isSetupComplete) {
    return <Navigate to="/setup" replace />;
  }

  return children;
}

/**
 * Protects app routes until a staff session exists.
 */
function AuthGuard({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Displays a minimal loading state while setup status is being fetched.
 */
function SetupStatusLoader() {
  return <div className="app-loader">Loading</div>;
}

/**
 * Declares the route structure used by the app.
 */
function AppRouter() {
  const { isLoading, isSetupComplete, refreshSetupStatus } = useSetupStatus();
  const { isAuthenticated, updateSession } = useAuthSession();

  if (isLoading) {
    return <SetupStatusLoader />;
  }

  return (
    <Routes>
      <Route element={<PublicLayout isSetupComplete={isSetupComplete} />}>
        <Route
          path="/login"
          element={
            <SetupGuard isSetupComplete={isSetupComplete} allowWhenSetupComplete>
              <LoginPage onLogin={updateSession} />
            </SetupGuard>
          }
        />
        <Route
          path="/setup"
          element={
            <SetupGuard isSetupComplete={isSetupComplete} allowWhenSetupComplete={false}>
              <FirstTimeSetupPage onSetupComplete={refreshSetupStatus} />
            </SetupGuard>
          }
        />
      </Route>
      <Route
        path="/dashboard"
        element={
          <SetupCompletionGuard isSetupComplete={isSetupComplete}>
            <AuthGuard isAuthenticated={isAuthenticated}>
              <DashboardPage />
            </AuthGuard>
          </SetupCompletionGuard>
        }
      />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route
        path="/"
        element={<Navigate to={isSetupComplete ? "/login" : "/setup"} replace />}
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRouter;