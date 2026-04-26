/**
 * Module: Members Module UI
 * File: MembersModule.jsx
 * Purpose: Provides the Members module create form, filters, and list connected to backend APIs.
 */

import { useEffect, useState } from "react";

import IconButton from "../../../components/common/IconButton";
import ModalDialog from "../../../components/common/ModalDialog";
import SectionCard from "../../../components/common/SectionCard";
import StatusChip from "../../../components/common/StatusChip";
import {
  createMemberRecord,
  fetchMemberOperationalProfile,
  fetchMemberList,
  updateMemberRecord
} from "../api/memberApi";
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
  const [selectedMemberRecord, setSelectedMemberRecord] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [editMemberForm, setEditMemberForm] = useState(memberInitialForm);
  const [editMemberFormErrors, setEditMemberFormErrors] = useState({});
  const [editMemberRequestError, setEditMemberRequestError] = useState("");
  const [isUpdatingMember, setIsUpdatingMember] = useState(false);
  const [memberPendingStatusChange, setMemberPendingStatusChange] = useState(null);
  const [isUpdatingMemberStatus, setIsUpdatingMemberStatus] = useState(false);
  const [memberProfileRecord, setMemberProfileRecord] = useState(null);
  const [isLoadingMemberProfile, setIsLoadingMemberProfile] = useState(false);
  const [memberProfileRequestError, setMemberProfileRequestError] = useState("");

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

  const handleEditMemberInputChange = (event) => {
    const { name, value } = event.target;

    setEditMemberForm((currentState) => ({
      ...currentState,
      [name]: value
    }));
    setEditMemberFormErrors((currentErrors) => ({
      ...currentErrors,
      [name]: ""
    }));
    setEditMemberRequestError("");
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

  const openEditMemberModal = (member) => {
    setEditingMember(member);
    setEditMemberForm({
      fullName: member.fullName || "",
      mobileNumber: member.mobileNumber || "",
      referenceDetails: member.referenceDetails || "",
      status: member.status || "Active"
    });
    setEditMemberFormErrors({});
    setEditMemberRequestError("");
  };

  const closeEditMemberModal = () => {
    setEditingMember(null);
    setEditMemberForm(memberInitialForm);
    setEditMemberFormErrors({});
    setEditMemberRequestError("");
  };

  const handleEditMemberSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateMemberForm(editMemberForm);

    if (Object.keys(validationErrors).length > 0) {
      setEditMemberFormErrors(validationErrors);
      return;
    }

    setIsUpdatingMember(true);
    setEditMemberRequestError("");

    try {
      const response = await updateMemberRecord(
        editingMember.id,
        {
          fullName: editMemberForm.fullName.trim(),
          mobileNumber: editMemberForm.mobileNumber.trim(),
          referenceDetails: editMemberForm.referenceDetails.trim(),
          status: editMemberForm.status
        },
        authToken
      );
      const updatedMember = response.data;

      setMemberRecords((currentList) =>
        currentList.map((member) => (member.id === updatedMember.id ? updatedMember : member))
      );
      closeEditMemberModal();
      setMemberSuccessMessage("Member updated successfully.");
      setMemberReloadToken((currentValue) => currentValue + 1);
    } catch (error) {
      setEditMemberRequestError(getApiErrorMessage(error));
    } finally {
      setIsUpdatingMember(false);
    }
  };

  const handleMemberStatusChange = async () => {
    if (!memberPendingStatusChange) {
      return;
    }

    setIsUpdatingMemberStatus(true);
    setMemberRequestError("");

    try {
      const response = await updateMemberRecord(
        memberPendingStatusChange.id,
        {
          status: memberPendingStatusChange.nextStatus
        },
        authToken
      );
      const updatedMember = response.data;

      setMemberRecords((currentList) =>
        currentList.map((member) => (member.id === updatedMember.id ? updatedMember : member))
      );
      setMemberSuccessMessage(
        updatedMember.status === "Inactive"
          ? "Member marked as inactive successfully."
          : "Member activated successfully."
      );
      setMemberPendingStatusChange(null);
      setMemberReloadToken((currentValue) => currentValue + 1);
    } catch (error) {
      setMemberRequestError(getApiErrorMessage(error));
    } finally {
      setIsUpdatingMemberStatus(false);
    }
  };

  const openMemberDetailsModal = async (member) => {
    setSelectedMemberRecord(member);
    setMemberProfileRecord(null);
    setMemberProfileRequestError("");
    setIsLoadingMemberProfile(true);

    try {
      const response = await fetchMemberOperationalProfile(member.id, authToken);
      setMemberProfileRecord(response.data || null);
    } catch (error) {
      setMemberProfileRequestError(getApiErrorMessage(error));
    } finally {
      setIsLoadingMemberProfile(false);
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
        actions={(
          <IconButton
            icon="refresh"
            label="Refresh members"
            text="Refresh"
            onClick={() => setMemberReloadToken((currentValue) => currentValue + 1)}
          />
        )}
      >
        {isLoadingMembers ? <div className="feedback-actions">Loading members...</div> : null}
        <div className="table-wrapper">
          <table className="data-table data-table--dense">
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile Number</th>
                <th>Reference Details</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {memberRecords.length === 0 && !isLoadingMembers ? (
                <tr>
                  <td colSpan="6">No member records found.</td>
                </tr>
              ) : (
                memberRecords.map((member) => (
                  <tr key={member.id}>
                    <td>{member.fullName}</td>
                    <td>{member.mobileNumber}</td>
                    <td>{member.referenceDetails || "-"}</td>
                    <td>
                      <StatusChip value={member.status} />
                    </td>
                    <td>{member.createdBy?.fullName || "System"}</td>
                    <td>
                      <div className="table-row-actions">
                        <IconButton
                          icon="view"
                          label={`View ${member.fullName}`}
                          title="View details"
                          onClick={() => openMemberDetailsModal(member)}
                        />
                        <IconButton
                          icon="edit"
                          label={`Edit ${member.fullName}`}
                          title="Edit member"
                          onClick={() => openEditMemberModal(member)}
                        />
                        <IconButton
                          icon={member.status === "Active" ? "close" : "add"}
                          label={`${member.status === "Active" ? "Mark inactive" : "Activate"} ${member.fullName}`}
                          title={member.status === "Active" ? "Mark inactive" : "Activate"}
                          onClick={() =>
                            setMemberPendingStatusChange({
                              id: member.id,
                              memberName: member.fullName,
                              currentStatus: member.status,
                              nextStatus: member.status === "Active" ? "Inactive" : "Active"
                            })
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <ModalDialog
        isOpen={Boolean(selectedMemberRecord)}
        title="Member Details"
        onClose={() => {
          setSelectedMemberRecord(null);
          setMemberProfileRecord(null);
          setMemberProfileRequestError("");
        }}
        footer={(
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              setSelectedMemberRecord(null);
              setMemberProfileRecord(null);
              setMemberProfileRequestError("");
            }}
          >
            Close
          </button>
        )}
        width="620px"
      >
        {selectedMemberRecord ? (
          <div className="details-grid">
            <div className="details-grid__item">
              <span>Full Name</span>
              <strong>{selectedMemberRecord.fullName}</strong>
            </div>
            <div className="details-grid__item">
              <span>Mobile Number</span>
              <strong>{selectedMemberRecord.mobileNumber}</strong>
            </div>
            <div className="details-grid__item">
              <span>Status</span>
              <strong><StatusChip value={selectedMemberRecord.status} /></strong>
            </div>
            <div className="details-grid__item details-grid__item--wide">
              <span>Reference Details</span>
              <strong>{selectedMemberRecord.referenceDetails || "-"}</strong>
            </div>
            <div className="details-grid__item details-grid__item--wide">
              <span>Created By</span>
              <strong>{selectedMemberRecord.createdBy?.fullName || "System"}</strong>
            </div>
            {isLoadingMemberProfile ? (
              <div className="details-grid__item details-grid__item--wide">
                <span>Operational Readiness</span>
                <strong>Loading operational profile...</strong>
              </div>
            ) : null}
            {memberProfileRequestError ? (
              <div className="details-grid__item details-grid__item--wide">
                <span>Operational Readiness</span>
                <strong>{memberProfileRequestError}</strong>
              </div>
            ) : null}
            {memberProfileRecord?.operationalProfile ? (
              <>
                <div className="details-grid__item">
                  <span>Linked Card</span>
                  <strong>{memberProfileRecord.operationalProfile.linkedCardNumber || "No linked card"}</strong>
                </div>
                <div className="details-grid__item">
                  <span>Linked Card Status</span>
                  <strong>{memberProfileRecord.operationalProfile.linkedCardStatus || "-"}</strong>
                </div>
                <div className="details-grid__item">
                  <span>Can Assign New Card</span>
                  <strong>{memberProfileRecord.operationalProfile.canAssignNewCard ? "Yes" : "No"}</strong>
                </div>
                <div className="details-grid__item">
                  <span>Can Replace Card</span>
                  <strong>{memberProfileRecord.operationalProfile.canReplaceCard ? "Yes" : "No"}</strong>
                </div>
                <div className="details-grid__item">
                  <span>Card Operations Ready</span>
                  <strong>{memberProfileRecord.operationalProfile.canUseCardOperations ? "Yes" : "No"}</strong>
                </div>
                <div className="details-grid__item">
                  <span>Card Expired</span>
                  <strong>{memberProfileRecord.operationalProfile.linkedCardExpired ? "Yes" : "No"}</strong>
                </div>
                <div className="details-grid__item details-grid__item--wide">
                  <span>Blocking Reason</span>
                  <strong>{memberProfileRecord.operationalProfile.blockingReason || "Member is operationally ready."}</strong>
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </ModalDialog>

      <ModalDialog
        isOpen={Boolean(editingMember)}
        title="Edit Member"
        onClose={closeEditMemberModal}
        footer={(
          <>
            <button type="button" className="secondary-button" onClick={closeEditMemberModal}>
              Cancel
            </button>
            <button type="submit" form="edit-member-form" className="primary-button" disabled={isUpdatingMember}>
              {isUpdatingMember ? "Saving..." : "Save Changes"}
            </button>
          </>
        )}
        width="720px"
      >
        <form id="edit-member-form" className="form-grid" onSubmit={handleEditMemberSubmit} autoComplete="off">
          <label className="field-group">
            <span>Full Name</span>
            <input
              type="text"
              name="fullName"
              value={editMemberForm.fullName}
              onChange={handleEditMemberInputChange}
              placeholder="Enter full name"
              autoComplete="off"
            />
            {editMemberFormErrors.fullName ? (
              <small className="field-error">{editMemberFormErrors.fullName}</small>
            ) : null}
          </label>

          <label className="field-group">
            <span>Mobile Number</span>
            <input
              type="text"
              name="mobileNumber"
              value={editMemberForm.mobileNumber}
              onChange={handleEditMemberInputChange}
              placeholder="Enter mobile number"
              autoComplete="off"
            />
            {editMemberFormErrors.mobileNumber ? (
              <small className="field-error">{editMemberFormErrors.mobileNumber}</small>
            ) : null}
          </label>

          <label className="field-group field-group--wide">
            <span>Reference Details</span>
            <textarea
              rows="3"
              name="referenceDetails"
              value={editMemberForm.referenceDetails}
              onChange={handleEditMemberInputChange}
              placeholder="Enter reference details"
              autoComplete="off"
            />
          </label>

          <label className="field-group">
            <span>Status</span>
            <select
              name="status"
              value={editMemberForm.status}
              onChange={handleEditMemberInputChange}
              autoComplete="off"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            {editMemberFormErrors.status ? (
              <small className="field-error">{editMemberFormErrors.status}</small>
            ) : null}
          </label>

          {editMemberRequestError ? (
            <div className="form-message form-message--error">{editMemberRequestError}</div>
          ) : null}
        </form>
      </ModalDialog>

      <ModalDialog
        isOpen={Boolean(memberPendingStatusChange)}
        title={memberPendingStatusChange?.nextStatus === "Inactive" ? "Mark Member Inactive" : "Activate Member"}
        onClose={() => setMemberPendingStatusChange(null)}
        footer={(
          <>
            <button type="button" className="secondary-button" onClick={() => setMemberPendingStatusChange(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={handleMemberStatusChange}
              disabled={isUpdatingMemberStatus}
            >
              {isUpdatingMemberStatus ? "Saving..." : "Confirm"}
            </button>
          </>
        )}
        width="620px"
      >
        {memberPendingStatusChange ? (
          <div className="dialog-note">
            <span>
              This action will change <strong>{memberPendingStatusChange.memberName}</strong> to{" "}
              <strong>{memberPendingStatusChange.nextStatus}</strong>. If an active card is linked, the backend will
              also protect operational readiness by inactivating that linked card when the member is marked inactive.
            </span>
          </div>
        ) : null}
      </ModalDialog>
    </>
  );
}

export default MembersModule;
