/**
 * Module: Not Found Page
 * File: NotFoundPage.jsx
 * Purpose: Shows the fallback page for unknown client routes.
 */

import { Link } from "react-router-dom";

import SectionCard from "../components/common/SectionCard";

/**
 * Renders the route fallback page.
 */
function NotFoundPage() {
  return (
    <div className="feedback-page">
      <SectionCard title="Page Not Found">
        <div className="feedback-actions">
          <Link to="/dashboard" className="primary-button">
            Open Dashboard
          </Link>
        </div>
      </SectionCard>
    </div>
  );
}

export default NotFoundPage;