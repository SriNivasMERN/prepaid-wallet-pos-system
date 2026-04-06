/**
 * Module: Public Layout
 * File: PublicLayout.jsx
 * Purpose: Wraps public-access pages like login and first-time setup.
 */

import { Link, Outlet } from "react-router-dom";

import { APP_NAME } from "../constants/appConstants";

/**
 * Builds a consistent frame for authentication-related pages.
 */
function PublicLayout({ isSetupComplete = false }) {
  return (
    <div className="public-shell">
      <aside className="public-shell__aside">
        <span className="brand-badge">POS</span>
        <h1>{APP_NAME}</h1>
        <div className="public-shell__switcher">
          {!isSetupComplete ? (
            <Link className="switcher-link is-active" to="/setup">
              First-Time Setup
            </Link>
          ) : null}
        </div>
      </aside>

      <main className="public-shell__content">
        <Outlet />
      </main>
    </div>
  );
}

export default PublicLayout;
