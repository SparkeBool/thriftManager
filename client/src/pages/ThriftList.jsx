// client/src/pages/ThriftList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle } from 'react-feather';
import CreateThrift from '../components/CreateThrift';
import ThriftDetailsModal from '../components/ThriftDetailsModal';
import api from '../services/api';

const ThriftList = () => {
  const [showCreateThriftModal, setShowCreateThriftModal] = useState(false);
  const [showThriftDetailsModal, setShowThriftDetailsModal] = useState(false);
  const [selectedThrift, setSelectedThrift] = useState(null);

  const [thrifts, setThrifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 25;

  const fetchThrifts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/thrifts/all?page=${currentPage}&limit=${itemsPerPage}`);
      setThrifts(response.data.thrifts);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Error fetching thrifts:', err);
      const errorMessage = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : err.message || 'Failed to load thrifts.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchThrifts();
  }, [fetchThrifts]);

  const handleThriftCreationSuccess = () => {
    setShowCreateThriftModal(false);
    setCurrentPage(1);
    fetchThrifts();
  };

  // --- NEW: Handle Thrift Update Success ---
  const handleThriftUpdateSuccess = (updatedThrift) => {
    setShowThriftDetailsModal(false); // Close the modal
    setSelectedThrift(null); // Clear selected thrift
    fetchThrifts(); // Re-fetch the list to show updated data
    // Optionally, you could update the specific thrift in the 'thrifts' state
    // instead of re-fetching all, for better performance if list is large.
    // Example:
    // setThrifts(prevThrifts =>
    //   prevThrifts.map(t => (t._id === updatedThrift._id ? updatedThrift : t))
    // );
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleViewDetails = (thrift) => {
    setSelectedThrift(thrift);
    setShowThriftDetailsModal(true);
  };

  const handleCloseThriftDetailsModal = () => {
    setShowThriftDetailsModal(false);
    setSelectedThrift(null);
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>All Thrifts</h1>
        <button
          className="btn btn-primary d-flex align-items-center"
          onClick={() => setShowCreateThriftModal(true)}
        >
          <PlusCircle size={20} className="me-2" />
          Create New Thrift
        </button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading thrifts...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      )}

      {!loading && thrifts.length === 0 && !error && (
        <div className="alert alert-info text-center" role="alert">
          You haven't created any thrifts yet. Click "Create New Thrift" to get started!
        </div>
      )}

      {!loading && thrifts.length > 0 && (
        <>
          <div className="table-responsive">
            <table className="table table-hover align-middle mt-4">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Thrift Name</th>
                  <th>Amount</th>
                  <th>Frequency</th>
                  <th>Members</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {thrifts.map((thrift, index) => (
                  <tr key={thrift._id}><td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>{thrift.name}</td>
                    <td>₦{thrift.amountPerCycle.toLocaleString()}</td>
                    <td>{thrift.frequency}</td>
                    <td>{thrift.maxMembers ? thrift.maxMembers : 'Unlimited'}</td>
                    <td>
                      <span className={`badge bg-${
                        thrift.status === 'active' ? 'success' :
                        thrift.status === 'pending' ? 'warning' :
                        'secondary'
                      }`}>
                        {thrift.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-info text-white"
                        onClick={() => handleViewDetails(thrift)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <nav aria-label="Thrift pagination" className="mt-4">
            <ul className="pagination justify-content-center">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(currentPage - 1)} aria-label="Previous">
                  <span aria-hidden="true">&laquo;</span>
                </button>
              </li>
              {[...Array(totalPages)].map((_, i) => (
                <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(i + 1)}>
                    {i + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(currentPage + 1)} aria-label="Next">
                  <span aria-hidden="true">&raquo;</span>
                </button>
              </li>
            </ul>
          </nav>
        </>
      )}

      {showCreateThriftModal && (
        <CreateThrift
          show={showCreateThriftModal}
          onClose={() => setShowCreateThriftModal(false)}
          onSuccess={handleThriftCreationSuccess}
        />
      )}

      {showThriftDetailsModal && selectedThrift && (
        <ThriftDetailsModal
          show={showThriftDetailsModal}
          onClose={handleCloseThriftDetailsModal}
          thrift={selectedThrift}
          onUpdateSuccess={handleThriftUpdateSuccess} 
        />
      )}
    </div>
  );
};

export default ThriftList;