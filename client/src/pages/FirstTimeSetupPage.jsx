/**
 * Module: First-Time Setup Page
 * File: FirstTimeSetupPage.jsx
 * Purpose: Displays the initial Super Admin creation form structure.
 */

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import SectionCard from "../components/common/SectionCard";
import { createInitialSuperAdmin } from "../features/auth/api/authApi";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

const initialFormState = {
  fullName: "",
  username: "",
  password: "",
  confirmPassword: ""
};

/**
 * Validates the setup form before submission.
 */
function validateSetupForm(formData) {
  const nextErrors = {};

  if (!formData.fullName.trim()) {
    nextErrors.fullName = "Full name is required.";
  }

  if (!formData.username.trim()) {
    nextErrors.username = "Username is required.";
  } else if (formData.username.trim().length < 3) {
    nextErrors.username = "Minimum 3 characters required.";
  }

  if (!formData.password) {
    nextErrors.password = "Password is required.";
  } else if (formData.password.length < 8) {
    nextErrors.password = "Minimum 8 characters required.";
  }

  if (!formData.confirmPassword) {
    nextErrors.confirmPassword = "Confirm password is required.";
  } else if (formData.password !== formData.confirmPassword) {
    nextErrors.confirmPassword = "Passwords do not match.";
  }

  return nextErrors;
}

/**
 * Renders the first-time setup fields for the initial account.
 */
function FirstTimeSetupPage({ onSetupComplete }) {
  const navigate = useNavigate();
  const fullNameInputRef = useRef(null);
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [requestError, setRequestError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fullNameInputRef.current?.focus({ preventScroll: true });
  }, []);

  /**
   * Updates local form state as fields change.
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
   * Submits the first-time setup form to create the initial Super Admin.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateSetupForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setRequestError("");

    try {
      await createInitialSuperAdmin({
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      await onSetupComplete?.();
      navigate("/login", { replace: true });
    } catch (error) {
      setRequestError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <SectionCard className="login-card login-card--auth setup-card">
        <form className="form-grid login-form" onSubmit={handleSubmit}>
          <div className="login-form__branding">
            <span className="brand-badge login-form__badge">PWP</span>
            <h1>Prepaid Wallet POS System</h1>
          </div>

          <div className="auth-form__title">First-Time Setup</div>

          <label className="field-group">
            <span>Full Name</span>
            <input
              ref={fullNameInputRef}
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter full name"
            />
            {formErrors.fullName ? <small className="field-error">{formErrors.fullName}</small> : null}
          </label>

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
              placeholder="Create password"
            />
            {formErrors.password ? <small className="field-error">{formErrors.password}</small> : null}
          </label>

          <label className="field-group">
            <span>Confirm Password</span>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm password"
            />
            {formErrors.confirmPassword ? (
              <small className="field-error">{formErrors.confirmPassword}</small>
            ) : null}
          </label>

          {requestError ? <div className="form-message form-message--error">{requestError}</div> : null}

          <div className="form-actions login-form__actions">
            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}

export default FirstTimeSetupPage;
