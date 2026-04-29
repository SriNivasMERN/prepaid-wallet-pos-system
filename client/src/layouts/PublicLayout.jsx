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
function PublicLayout({ isSetupComplete = false }) {
  const location = useLocation();
  const isLoginRoute = location.pathname === "/login";

  return (
    <div className={`public-shell ${isLoginRoute ? "public-shell--login" : ""}`.trim()}>
      {!isLoginRoute ? (
        <aside className="public-shell__aside">
          <div className="public-brand">
            <span className="brand-badge">POS</span>
            <h1>{APP_NAME}</h1>
          </div>
          <div className="public-shell__switcher">
            {!isSetupComplete ? (
              <Link className="switcher-link is-active" to="/setup">
                First-Time Setup
              </Link>
            ) : null}
          </div>
        </aside>
      ) : null}

      <main className="public-shell__content">
        <Outlet />
      </main>
    </div>
  );
}

export default PublicLayout;
