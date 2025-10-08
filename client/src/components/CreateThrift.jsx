// client/src/components/CreateThrift.jsx
import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'react-feather';
import api from '../services/api';
import { ToastContainer, toast } from 'react-toastify';  
import 'react-toastify/dist/ReactToastify.css';  

const CreateThrift = ({ show, onClose, onSuccess }) => {
  // State for form fields (reset on mount or on success)
  const [thriftName, setThriftName] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');
  const [frequency, setFrequency] = useState('Weekly');  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxMembers, setMaxMembers] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);

 
  const [loading, setLoading] = useState(false);
  
  // Effect to manage the `modal-open` class on the body to prevent scrolling
  useEffect(() => {
    if (show) {
      document.body.classList.add('modal-open');
      // Optional: Focus on the first input when modal opens for accessibility
      const firstInput = document.getElementById('thriftName');
      if (firstInput) {
        firstInput.focus();
      }
    } else {
      document.body.classList.remove('modal-open');
      resetFormAndMessages();
    }
    // Cleanup function to ensure modal-open class is removed when component unmounts
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [show]); // Depend on 'show' prop

  // Function to reset form fields and messages
  const resetFormAndMessages = () => {
    setThriftName('');
    setContributionAmount('');
    setFrequency('Weekly'); // Keep this consistent with your backend enum!
    setStartDate('');
    setEndDate('');
    setMaxMembers('');
    setDescription('');
    setIsPublic(true);
    setLoading(false);
    // setError(null); // No longer needed for display via state
    // setSuccess(null); // No longer needed for display via state
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // setError(null); // Resetting these here is less critical as toasts replace them
    // setSuccess(null);

    // IMPORTANT: Fix field name to match backend: amountPerCycle
    const thriftData = {
      name: thriftName,
      amountPerCycle: parseFloat(contributionAmount), // Corrected: sending amountPerCycle
      frequency: frequency.toLowerCase(),  
      startDate: startDate,
      endDate: endDate || undefined,
      // Include these fields only if your backend schema supports them
      maxMembers: maxMembers ? parseInt(maxMembers, 10) : undefined,
      description: description || undefined,
      isPublic,
    };

    try {
      const response = await api.post('/thrifts/create', thriftData);

      toast.success('Thrift created successfully!'); // Show success toast
      setLoading(false);
      console.log('Thrift created:', response.data);

      if (onSuccess) {
        onSuccess();
      }

      // Consider adding a small delay before closing if you want the user to see the toast briefly
      setTimeout(() => {
        onClose(); // Close the modal
      }, 500); // Close after 0.5 seconds

      resetFormAndMessages(); // Reset form after successful submission and closing

    } catch (err) {
      setLoading(false);
      const errorMessage = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : err.message || 'Failed to create thrift.';
      toast.error(errorMessage); // Show error toast
      console.error('Error creating thrift:', err);
    }
  };

  // If the 'show' prop is false, render nothing (modal is hidden)
  if (!show) {
    return null;
  }

  return (
    // This is the Bootstrap modal structure
    <div
      className="modal fade show d-block" // 'd-block' and 'show' classes are critical for displaying
      tabIndex="-1"
      role="dialog"
      aria-labelledby="createThriftModalLabel"
      // Removed aria-hidden="true" to resolve accessibility warning as discussed
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} // Simple backdrop
    >
      <div className="modal-dialog modal-md modal-dialog-centered modal-dialog-scrollable" role="document">
        <div className="modal-content rounded-4 shadow-lg animate__animated animate__fadeInDown">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold text-dark" id="createThriftModalLabel">
              Create New Thrift
            </h5>
            {/* Bootstrap's default close button */}
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose} // Call onClose prop when close button is clicked
            ></button>
          </div>
          <div className="modal-body p-4 p-md-5">
            <p className="text-center text-muted mb-4">
              Set up the details for your new thrift group.
            </p>

           
            <form onSubmit={handleSubmit}>
              {/* Form fields */}
              <div className="mb-4">
                <label htmlFor="thriftName" className="form-label fw-semibold">Thrift Name</label>
                <input
                  type="text"
                  className="form-control form-control-lg rounded-pill"
                  id="thriftName"
                  placeholder="e.g., Monthly Savings Circle, Vacation Fund"
                  value={thriftName}
                  onChange={(e) => setThriftName(e.target.value)}
                  required
                />
                <div className="form-text text-muted">A catchy name for your thrift.</div>
              </div>

              <div className="mb-4">
                <label htmlFor="contributionAmount" className="form-label fw-semibold">Amount per Contribution (₦)</label>
                <input
                  type="number"
                  className="form-control form-control-lg rounded-pill"
                  id="contributionAmount"
                  placeholder="e.g., 5000"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  min="100"
                  required
                />
                <div className="form-text text-muted">The amount each member contributes per cycle.</div>
              </div>

              <div className="mb-4">
                <label htmlFor="frequency" className="form-label fw-semibold">Contribution Frequency</label>
                <select
                  className="form-select form-select-lg rounded-pill"
                  id="frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  required
                >
                  {/* IMPORTANT: Ensure these values match your backend enum (e.g., lowercase) */}
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Bi-Weekly">Bi-weekly (Every 2 weeks)</option>
                  <option value="Monthly">Monthly</option>
                </select>
                <div className="form-text text-muted">How often contributions are made.</div>
              </div>

              <div className="mb-4">
                <label htmlFor="startDate" className="form-label fw-semibold">Start Date</label>
                <input
                  type="date"
                  className="form-control form-control-lg rounded-pill"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
                <div className="form-text text-muted">When the thrift cycle begins.</div>
              </div>

              <div className="mb-4">
                <label htmlFor="endDate" className="form-label fw-semibold">Expected End Date (Optional)</label>
                <input
                  type="date"
                  className="form-control form-control-lg rounded-pill"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <div className="form-text text-muted">If you have a fixed end date in mind.</div>
              </div>

              <div className="mb-4">
                <label htmlFor="maxMembers" className="form-label fw-semibold">Maximum Number of Members</label>
                <input
                  type="number"
                  className="form-control form-control-lg rounded-pill"
                  id="maxMembers"
                  placeholder="e.g., 10"
                  value={maxMembers}
                  onChange={(e) => setMaxMembers(e.target.value)}
                  min="2"
                />
                <div className="form-text text-muted">Leave blank for unlimited members.</div>
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="form-label fw-semibold">Description</label>
                <textarea
                  className="form-control rounded-4"
                  id="description"
                  rows="4"
                  placeholder="Tell us more about this thrift, its purpose, or any specific rules..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
                <div className="form-text text-muted">A brief overview of your thrift.</div>
              </div>

              <div className="form-check form-switch mb-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isPublicSwitch"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                <label className="form-check-label fw-semibold" htmlFor="isPublicSwitch">
                  Make Thrift Public
                </label>
                <div className="form-text text-muted">
                  Public thrifts can be discovered by other users. Private thrifts require invites.
                </div>
              </div>

              <div className="d-grid mt-5">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg rounded-pill shadow-lg d-flex align-items-center justify-content-center"
                  disabled={loading} // Disable button while loading
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <PlusCircle size={20} className="me-2" />
                      Create Thrift
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* ToastContainer should ideally be placed high up in your app component tree (e.g., App.jsx),
          but for simplicity, placing it here will also work. */}
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default CreateThrift;