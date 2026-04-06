/**
 * Module: Members Module UI
 * File: MembersModule.jsx
 * Purpose: Provides the Members module create form, filters, and list connected to backend APIs.
 */

import { useEffect, useState } from "react";

import SectionCard from "../../../components/common/SectionCard";
import { createMemberRecord, fetchMemberList } from "../api/memberApi";
import { getApiErrorMessage } from "../../../utils/getApiErrorMessage";

const memberInitialForm = {
  fullName: "",
  mobileNumber: "",
  referenceDetails: "",
  status: "Active"
};

const memberInitialFilters = {
  search: "",
  status: ""
};

function validateMemberForm(formData) {
  const nextErrors = {};

  if (!formData.fullName.trim()) {
    nextErrors.fullName = "Full name is required.";
  } else if (formData.fullName.trim().length < 2) {
    nextErrors.fullName = "Minimum 2 characters required.";
  }

  if (!formData.mobileNumber.trim()) {
    nextErrors.mobileNumber = "Mobile number is required.";
  } else if (!/^\d{10,15}$/.test(formData.mobileNumber.trim())) {
    nextErrors.mobileNumber = "Enter 10 to 15 digits.";
  }

  if (!formData.status) {
    nextErrors.status = "Status is required.";
  }

  return nextErrors;
}

function MembersModule({ authToken, onMetricsChange }) {
  const [memberForm, setMemberForm] = useState(memberInitialForm);
  const [memberFormErrors, setMemberFormErrors] = useState({});
  const [memberRequestError, setMemberRequestError] = useState("");
  const [memberSuccessMessage, setMemberSuccessMessage] = useState("");
  const [isCreatingMember, setIsCreatingMember] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [memberRecords, setMemberRecords] = useState([]);
  const [memberFilterForm, setMemberFilterForm] = useState(memberInitialFilters);
  const [appliedMemberFilters, setAppliedMemberFilters] = useState(memberInitialFilters);
  const [memberReloadToken, setMemberReloadToken] = useState(0);

  useEffect(() => {
    const loadMembers = async () => {
      if (!authToken) {
        return;
      }

      setIsLoadingMembers(true);
      setMemberRequestError("");

      try {
        const response = await fetchMemberList(authToken, appliedMemberFilters);
        const nextRecords = response.data || [];

        setMemberRecords(nextRecords);
        onMetricsChange?.({
          total: nextRecords.length,
          active: nextRecords.filter((member) => member.status === "Active").length,
          inactive: nextRecords.filter((member) => member.status === "Inactive").length
        });
      } catch (error) {
        setMemberRequestError(getApiErrorMessage(error));
      } finally {
        setIsLoadingMembers(false);
      }
    };

    loadMembers();
  }, [authToken, appliedMemberFilters, memberReloadToken, onMetricsChange]);

  const resetMemberForm = () => {
    setMemberForm(memberInitialForm);
    setMemberFormErrors({});
    setMemberRequestError("");
    setMemberSuccessMessage("");
  };

  const handleMemberInputChange = (event) => {
    const { name, value } = event.target;

    setMemberForm((currentState) => ({
      ...currentState,
      [name]: value
    }));
    setMemberFormErrors((currentErrors) => ({
      ...currentErrors,
      [name]: ""
    }));
    setMemberRequestError("");
    setMemberSuccessMessage("");
  };

  const handleMemberFilterChange = (event) => {
    const { name, value } = event.target;

    setMemberFilterForm((currentState) => ({
      ...currentState,
      [name]: value
    }));
  };

  const handleMemberSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateMemberForm(memberForm);
    if (Object.keys(validationErrors).length > 0) {
      setMemberFormErrors(validationErrors);
      return;
    }

    setIsCreatingMember(true);
    setMemberRequestError("");
    setMemberSuccessMessage("");

    try {
      await createMemberRecord(
        {
          fullName: memberForm.fullName.trim(),
          mobileNumber: memberForm.mobileNumber.trim(),
          referenceDetails: memberForm.referenceDetails.trim(),
          status: memberForm.status
        },
        authToken
      );

      resetMemberForm();
      setMemberSuccessMessage("Member created successfully.");
      setMemberReloadToken((currentValue) => currentValue + 1);
    } catch (error) {
      setMemberRequestError(getApiErrorMessage(error));
    } finally {
      setIsCreatingMember(false);
    }
  };

  const handleMemberFilterSubmit = (event) => {
    event.preventDefault();
    setAppliedMemberFilters({
      search: memberFilterForm.search.trim(),
      status: memberFilterForm.status
    });
  };

  const resetMemberFilters = () => {
    setMemberFilterForm(memberInitialFilters);
    setAppliedMemberFilters(memberInitialFilters);
  };

  return (
    <>
      <SectionCard title="Create Member">
        <form className="form-grid" onSubmit={handleMemberSubmit} autoComplete="off">
          <label className="field-group">
            <span>Full Name</span>
            <input
              type="text"
              name="fullName"
              value={memberForm.fullName}
              onChange={handleMemberInputChange}
              placeholder="Enter full name"
              autoComplete="off"
            />
            {memberFormErrors.fullName ? (
              <small className="field-error">{memberFormErrors.fullName}</small>
            ) : null}
          </label>

          <label className="field-group">
            <span>Mobile Number</span>
            <input
              type="text"
              name="mobileNumber"
              value={memberForm.mobileNumber}
              onChange={handleMemberInputChange}
              placeholder="Enter mobile number"
              autoComplete="off"
            />
            {memberFormErrors.mobileNumber ? (
              <small className="field-error">{memberFormErrors.mobileNumber}</small>
            ) : null}
          </label>

          <label className="field-group field-group--wide">
            <span>Reference Details</span>
            <textarea
              rows="3"
              name="referenceDetails"
              value={memberForm.referenceDetails}
              onChange={handleMemberInputChange}
              placeholder="Enter reference details"
              autoComplete="off"
            />
          </label>

          <label className="field-group">
            <span>Status</span>
            <select name="status" value={memberForm.status} onChange={handleMemberInputChange} autoComplete="off">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            {memberFormErrors.status ? (
              <small className="field-error">{memberFormErrors.status}</small>
            ) : null}
          </label>

          {memberRequestError ? <div className="form-message form-message--error">{memberRequestError}</div> : null}
          {memberSuccessMessage ? <div className="form-message">{memberSuccessMessage}</div> : null}

          <div className="form-actions form-actions--full">
            <button type="submit" className="primary-button" disabled={isCreatingMember}>
              {isCreatingMember ? "Creating..." : "Create Member"}
            </button>
            <button type="button" className="secondary-button" onClick={resetMemberForm}>
              Reset
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Filters">
        <form className="filter-grid" onSubmit={handleMemberFilterSubmit} autoComplete="off">
          <label className="field-group field-group--wide">
            <span>Search Members</span>
            <input
              type="search"
              name="search"
              value={memberFilterForm.search}
              onChange={handleMemberFilterChange}
              placeholder="Search by name or mobile number"
              autoComplete="off"
            />
          </label>

          <label className="field-group">
            <span>Status</span>
            <select name="status" value={memberFilterForm.status} onChange={handleMemberFilterChange} autoComplete="off">
              <option value="">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>

          <div className="form-actions form-actions--full">
            <button type="submit" className="primary-button">
              Apply Filters
            </button>
            <button type="button" className="secondary-button" onClick={resetMemberFilters}>
              Reset
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard
        title="Members List"
        actions={<button type="button" className="secondary-button" onClick={() => setMemberReloadToken((currentValue) => currentValue + 1)}>Refresh</button>}
      >
        {isLoadingMembers ? <div className="feedback-actions">Loading members...</div> : null}
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile Number</th>
                <th>Reference Details</th>
                <th>Status</th>
                <th>Created By</th>
              </tr>
            </thead>
            <tbody>
              {memberRecords.length === 0 && !isLoadingMembers ? (
                <tr>
                  <td colSpan="5">No member records found.</td>
                </tr>
              ) : (
                memberRecords.map((member) => (
                  <tr key={member.id}>
                    <td>{member.fullName}</td>
                    <td>{member.mobileNumber}</td>
                    <td>{member.referenceDetails || "-"}</td>
                    <td>
                      <span className="status-badge">{member.status}</span>
                    </td>
                    <td>{member.createdBy?.fullName || "System"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </>
  );
}

export default MembersModule;
