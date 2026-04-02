/**
 * Module: Unauthorized Page
 * File: UnauthorizedPage.jsx
 * Purpose: Shows the access denial screen for restricted routes.
 */

import { Link } from "react-router-dom";

import SectionCard from "../components/common/SectionCard";

/**
 * Renders the unauthorized access page.
 */
function UnauthorizedPage() {
  return (
    <div className="feedback-page">
      <SectionCard title="Unauthorized Access">
        <div className="feedback-actions">
          <Link to="/dashboard" className="secondary-button">
            Back to Dashboard
          </Link>
          <Link to="/login" className="primary-button">
            Return to Login
          </Link>
        </div>
      </SectionCard>
    </div>
  );
}

export default UnauthorizedPage;
