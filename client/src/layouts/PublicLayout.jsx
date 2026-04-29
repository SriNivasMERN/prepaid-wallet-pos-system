/**
 * Module: Public Layout
 * File: PublicLayout.jsx
 * Purpose: Wraps public-access pages like login and first-time setup.
 */

import { Outlet, useLocation } from "react-router-dom";

/**
 * Builds a consistent frame for authentication-related pages.
 */
function PublicLayout() {
  const location = useLocation();
  const usesCenteredAuthCard = ["/login", "/setup"].includes(location.pathname);

  return (
    <div className={`public-shell ${usesCenteredAuthCard ? "public-shell--login" : ""}`.trim()}>
      <main className="public-shell__content">
        <Outlet />
      </main>
    </div>
  );
}

export default PublicLayout;
