/**
 * Module: First-Time Setup Page
 * File: FirstTimeSetupPage.jsx
 * Purpose: Displays the initial Super Admin creation form structure.
 */

import SectionCard from "../components/common/SectionCard";

/**
 * Renders the first-time setup fields for the initial account.
 */
function FirstTimeSetupPage() {
  return (
    <div className="auth-page">
      <SectionCard title="First-Time Setup">
        <form className="form-grid" onSubmit={(event) => event.preventDefault()}>
          <label className="field-group">
            <span>Full Name</span>
            <input type="text" name="fullName" placeholder="Enter full name" />
          </label>

          <label className="field-group">
            <span>Username</span>
            <input type="text" name="username" placeholder="Enter username" />
          </label>

          <label className="field-group">
            <span>Password</span>
            <input type="password" name="password" placeholder="Create password" />
          </label>

          <label className="field-group">
            <span>Confirm Password</span>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
            />
          </label>

          <div className="form-actions">
            <button type="submit" className="primary-button">
              Create Account
            </button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}

export default FirstTimeSetupPage;