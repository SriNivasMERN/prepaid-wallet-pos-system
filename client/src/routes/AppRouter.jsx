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

function SetupGuard({ isSetupComplete, allowWhenSetupComplete, children }) {
  if (allowWhenSetupComplete && !isSetupComplete) {
    return <Navigate to="/setup" replace />;
  }

  if (!allowWhenSetupComplete && isSetupComplete) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function LoginRedirectGuard({ isAuthenticated, children }) {
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function SetupCompletionGuard({ isSetupComplete, children }) {
  if (!isSetupComplete) {
    return <Navigate to="/setup" replace />;
  }

  return children;
}

function AuthGuard({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AuthorizationGuard({ currentStaff, children }) {
  if (!hasRecognizedRole(currentStaff?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

function AppLoader() {
  return <div className="app-loader">Loading</div>;
}

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
                <DashboardPage
                  currentStaff={session?.staff}
                  authToken={session?.token}
                  onLogout={removeSession}
                  onSessionUpdate={updateSession}
                />
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
