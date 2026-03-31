/**
 * Module: Public Layout
 * File: PublicLayout.jsx
 * Purpose: Wraps public-access pages like login and first-time setup.
 */

import { Link, Outlet, useLocation } from "react-router-dom";

import { APP_NAME } from "../constants/appConstants";

/**
 * Builds a consistent frame for authentication-related pages.
 */
function PublicLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <div className="public-shell">
      <aside className="public-shell__aside">
        <span className="brand-badge">POS</span>
        <h1>{APP_NAME}</h1>
        <div className="public-shell__switcher">
          <Link
            className={`switcher-link ${isLoginPage ? "is-active" : ""}`}
            to="/login"
          >
            Login
          </Link>
          <Link
            className={`switcher-link ${!isLoginPage ? "is-active" : ""}`}
            to="/setup"
          >
            First-Time Setup
          </Link>
        </div>
      </aside>

      <main className="public-shell__content">
        <Outlet />
      </main>
    </div>
  );
}

export default PublicLayout;