import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const ThriftDetailsModal = ({ show, onClose, thrift, onUpdateSuccess }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debugging: Log isEditing state
  useEffect(() => {
    console.log("ThriftDetailsModal: isEditing state changed to:", isEditing);
  }, [isEditing]);

  // Initialize form data when thrift prop changes or modal opens
  useEffect(() => {
    if (thrift) {
      setFormData({
        name: thrift.name || '',
        startDate: thrift.startDate ? new Date(thrift.startDate).toISOString().split('T')[0] : '',
        endDate: thrift.endDate ? new Date(thrift.endDate).toISOString().split('T')[0] : '',
        amountPerCycle: thrift.amountPerCycle || 0,
        frequency: thrift.frequency || '',
        status: thrift.status || 'pending',
        maxMembers: thrift.maxMembers || '',
        description: thrift.description || '',
        isPublic: typeof thrift.isPublic === 'boolean' ? thrift.isPublic : true,
      });
      console.log("ThriftDetailsModal: Initialized formData:", thrift); // Debugging
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thrift, show]); // Re-initialize when thrift changes or modal opens/closes

  // Effect to manage the `modal-open` class on the body to prevent scrolling
  useEffect(() => {
    if (show) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
      setIsEditing(false); // Reset to view mode when closing
      setError(null); // Clear any previous errors
      console.log("ThriftDetailsModal: Modal closed, resetting isEditing."); // Debugging
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [show]);

  if (!show || !thrift) {
    return null;
  }

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
    console.log(`ThriftDetailsModal: handleChange - Name: ${name}, Value: ${type === 'checkbox' ? checked : value}`); // Debugging
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // IMPORTANT: Prevent default form submission
    console.log("ThriftDetailsModal: handleSubmit CALLED!"); // Confirm handleSubmit is being called
    setLoading(true);
    setError(null);
    console.log("ThriftDetailsModal: Submitting form data:", formData); // Debugging

    try {
      if (!formData.name || !formData.startDate || !formData.amountPerCycle || !formData.frequency) {
        throw new Error('Please fill all required fields: Thrift Name, Start Date, Amount per Cycle, Frequency.');
      }
      if (formData.amountPerCycle <= 0) {
          throw new Error('Amount per Cycle must be a positive number.');
      }
      if (formData.maxMembers && formData.maxMembers < 2) {
          throw new Error('Maximum members must be at least 2.');
      }

      const dataToSend = {
          ...formData,
          amountPerCycle: Number(formData.amountPerCycle),
          maxMembers: formData.maxMembers ? Number(formData.maxMembers) : undefined
      };

      const response = await api.put(`/thrifts/${thrift._id}`, dataToSend);
      toast.success('Thrift updated successfully!');
      onUpdateSuccess(response.data); // Update parent's state
      setIsEditing(false); // Switch back to view mode
      console.log("ThriftDetailsModal: Update successful!"); // Debugging
      // Only close modal here if you explicitly want it to close after a successful update
      // If you want it to stay open in view mode, remove or comment out the onClose call below
      // onClose(); // <-- Comment this out if you want it to stay open after save

    } catch (err) {
      console.error('Error updating thrift:', err); // Debugging
      const errorMessage = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : err.message || 'Failed to update thrift.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      aria-labelledby="thriftDetailsModalLabel"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className="modal-dialog modal-md modal-dialog-centered modal-dialog-scrollable" role="document">
        <div className="modal-content rounded-4 shadow-lg animate__animated animate__fadeInDown">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold text-dark" id="thriftDetailsModalLabel">
              {isEditing ? 'Edit Thrift' : 'Thrift Details'}: {thrift.name}
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>

          <div className="modal-body p-4 p-md-5">
            {error && (
              <div className="alert alert-danger text-center" role="alert">
                {error}
              </div>
            )}
            {/* The form element now wraps only the content inside the body */}
            <form id="thriftDetailsForm" onSubmit={handleSubmit}>
              {/* Thrift Name */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Thrift Name:</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                ) : (
                  <p className="form-control-plaintext">{thrift.name}</p>
                )}
              </div>

              {/* Amount per Cycle */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Amount per Contribution:</label>
                {isEditing ? (
                  <input
                    type="number"
                    className="form-control"
                    name="amountPerCycle"
                    value={formData.amountPerCycle}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                ) : (
                  <p className="form-control-plaintext">₦{thrift.amountPerCycle.toLocaleString()}</p>
                )}
              </div>

              {/* Frequency */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Frequency:</label>
                {isEditing ? (
                  <select
                    className="form-select"
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Frequency</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                ) : (
                  <p className="form-control-plaintext">{thrift.frequency}</p>
                )}
              </div>

              {/* Start Date */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Start Date:</label>
                {isEditing ? (
                  <input
                    type="date"
                    className="form-control"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                ) : (
                  <p className="form-control-plaintext">{formatDateForDisplay(thrift.startDate)}</p>
                )}
              </div>

              {/* End Date (Optional) */}
              <div className="mb-3">
                <label className="form-label fw-semibold">End Date:</label>
                {isEditing ? (
                  <input
                    type="date"
                    className="form-control"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    />
                ) : (
                  <p className="form-control-plaintext">{formatDateForDisplay(thrift.endDate)}</p>
                )}
              </div>

              {/* Max Members (Optional) */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Maximum Members:</label>
                {isEditing ? (
                  <input
                    type="number"
                    className="form-control"
                    name="maxMembers"
                    value={formData.maxMembers}
                    onChange={handleChange}
                    min="2"
                    placeholder="e.g., 5"
                  />
                ) : (
                  <p className="form-control-plaintext">{thrift.maxMembers ? thrift.maxMembers : 'Unlimited'}</p>
                )}
              </div>

              {/* Description (Optional) */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Description:</label>
                {isEditing ? (
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                  ></textarea>
                ) : (
                  <p className="form-control-plaintext">{thrift.description || 'No description provided.'}</p>
                )}
              </div>

              {/* Status (Optional, maybe restricted later) */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Status:</label>
                {isEditing ? (
                  <select
                    className="form-select"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                ) : (
                  <p className="form-control-plaintext">
                    <span className={`badge bg-${
                      thrift.status === 'active' ? 'success' :
                      thrift.status === 'pending' ? 'warning' :
                      'secondary'
                    }`}>
                      {thrift.status}
                    </span>
                  </p>
                )}
              </div>

              {/* Is Public (Optional) */}
              <div className="mb-3 form-check">
                {isEditing ? (
                  <>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="isPublic"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleChange}
                    />
                    <label className="form-check-label fw-semibold" htmlFor="isPublic">Make Public</label>
                  </>
                ) : (
                  <p className="form-control-plaintext">{thrift.isPublic ? 'Public' : 'Private'}</p>
                )}
              </div>
            </form>
          </div> {/* Close modal-body */}

          {/* Modal footer is now OUTSIDE the form, as a direct sibling to modal-body */}
          <div className="modal-footer justify-content-center border-0 pt-0">
            {isEditing ? (
              <>
                <button
                  type="submit" // This button explicitly submits the form
                  className="btn btn-primary rounded-pill px-4"
                  disabled={loading}
                  form="thriftDetailsForm" // Link button to the form using its ID
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary rounded-pill px-4"
                  onClick={() => {
                    setIsEditing(false); // Cancel edit mode
                    setError(null); // Clear error on cancel
                    // Reset formData to original thrift data if user cancels
                    if (thrift) {
                        setFormData({
                            name: thrift.name || '',
                            startDate: thrift.startDate ? new Date(thrift.startDate).toISOString().split('T')[0] : '',
                            endDate: thrift.endDate ? new Date(thrift.endDate).toISOString().split('T')[0] : '',
                            amountPerCycle: thrift.amountPerCycle || 0,
                            frequency: thrift.frequency || '',
                            status: thrift.status || 'pending',
                            maxMembers: thrift.maxMembers || '',
                            description: thrift.description || '',
                            isPublic: typeof thrift.isPublic === 'boolean' ? thrift.isPublic : true,
                        });
                    }
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  type="button" // IMPORTANT: Keep this as type="button"
                  className="btn btn-primary rounded-pill px-4"
                  onClick={(e) => {
                    e.preventDefault(); // SUPER IMPORTANT: Prevent any default form submission behavior
                    console.log("--- DEBUG: Edit Thrift button was clicked! ---");
                    // debugger; // Remove debugger once the issue is resolved
                    setIsEditing(true); // This is the ONLY thing this button should do
                  }}
                >
                  Edit Thrift
                </button>
                <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={onClose}>
                  Close
                </button>
              </>
            )}
          </div> {/* Close modal-footer */}
        </div>
      </div>
    </div>
  );
};

export default ThriftDetailsModal;