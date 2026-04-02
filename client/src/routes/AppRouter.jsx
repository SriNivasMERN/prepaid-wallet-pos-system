/**
 * Module: App Router
 * File: AppRouter.jsx
 * Purpose: Defines the visible route map for the client application.
 */

import { Navigate, Route, Routes } from "react-router-dom";

import { hasRecognizedRole } from "../constants/accessControl";
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
 * Redirects authenticated users away from the login screen.
 */
function LoginRedirectGuard({ isAuthenticated, children }) {
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
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
 * Protects app routes until the logged-in role is recognized by access rules.
 */
function AuthorizationGuard({ currentStaff, children }) {
  if (!hasRecognizedRole(currentStaff?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

/**
 * Displays a minimal loading state while auth state is being fetched.
 */
function AppLoader() {
  return <div className="app-loader">Loading</div>;
}

/**
 * Declares the route structure used by the app.
 */
function AppRouter() {
  const {
    isLoading: isSetupLoading,
    isSetupComplete,
    refreshSetupStatus
  } = useSetupStatus();
  const {
    session,
    isLoading: isAuthLoading,
    isAuthenticated,
    updateSession,
    removeSession
  } = useAuthSession({
    isSetupReady: !isSetupLoading,
    isSetupComplete
  });

  if (isSetupLoading || isAuthLoading) {
    return <AppLoader />;
  }

  return (
    <Routes>
      <Route element={<PublicLayout isSetupComplete={isSetupComplete} />}>
        <Route
          path="/login"
          element={
            <SetupGuard isSetupComplete={isSetupComplete} allowWhenSetupComplete>
              <LoginRedirectGuard isAuthenticated={isAuthenticated}>
                <LoginPage onLogin={updateSession} />
              </LoginRedirectGuard>
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
              <AuthorizationGuard currentStaff={session?.staff}>
                <DashboardPage currentStaff={session?.staff} onLogout={removeSession} />
              </AuthorizationGuard>
            </AuthGuard>
          </SetupCompletionGuard>
        }
      />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route
        path="/"
        element={
          <Navigate
            to={
              isSetupComplete ? (isAuthenticated ? "/dashboard" : "/login") : "/setup"
            }
            replace
          />
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRouter;
