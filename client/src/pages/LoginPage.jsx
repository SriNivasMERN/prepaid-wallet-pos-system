/**
 * Module: Login Page
 * File: LoginPage.jsx
 * Purpose: Displays the staff login form and session entry actions.
 */

import { Link } from "react-router-dom";

import SectionCard from "../components/common/SectionCard";

/**
 * Renders the login screen fields and actions.
 */
function LoginPage() {
  return (
    <div className="auth-page">
      <SectionCard title="Login">
        <form className="form-grid" onSubmit={(event) => event.preventDefault()}>
          <label className="field-group">
            <span>Username</span>
            <input type="text" name="username" placeholder="Enter username" />
          </label>

          <label className="field-group">
            <span>Password</span>
            <input type="password" name="password" placeholder="Enter password" />
          </label>

          <div className="form-actions">
            <button type="submit" className="primary-button">
              Sign In
            </button>
            <Link to="/dashboard" className="secondary-button">
              Open Dashboard
            </Link>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}

export default LoginPage;