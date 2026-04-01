/**
 * Module: Login Page
 * File: LoginPage.jsx
 * Purpose: Displays the staff login form and authenticates the session.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import SectionCard from "../components/common/SectionCard";
import { loginStaff } from "../features/auth/api/authApi";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

const initialFormState = {
  username: "",
  password: ""
};

/**
 * Validates the login form before submission.
 */
function validateLoginForm(formData) {
  const nextErrors = {};

  if (!formData.username.trim()) {
    nextErrors.username = "Username is required.";
  }

  if (!formData.password) {
    nextErrors.password = "Password is required.";
  }

  return nextErrors;
}

/**
 * Renders the login screen fields and actions.
 */
function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [requestError, setRequestError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Updates login form values and clears old messages.
   */
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentState) => ({
      ...currentState,
      [name]: value
    }));
    setFormErrors((currentErrors) => ({
      ...currentErrors,
      [name]: ""
    }));
    setRequestError("");
  };

  /**
   * Authenticates the staff user and opens the dashboard.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateLoginForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setRequestError("");

    try {
      const response = await loginStaff({
        username: formData.username.trim(),
        password: formData.password
      });

      onLogin?.(response.data);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setRequestError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <SectionCard title="Login">
        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field-group">
            <span>Username</span>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter username"
            />
            {formErrors.username ? <small className="field-error">{formErrors.username}</small> : null}
          </label>

          <label className="field-group">
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter password"
            />
            {formErrors.password ? <small className="field-error">{formErrors.password}</small> : null}
          </label>

          {requestError ? <div className="form-message form-message--error">{requestError}</div> : null}

          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}

export default LoginPage;