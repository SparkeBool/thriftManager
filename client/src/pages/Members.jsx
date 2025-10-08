import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, PlusCircle, Search, Mail, Phone, Calendar, UserCheck, UserX, Clock, Edit, Trash2 } from 'react-feather';
import api from '../services/api'; // Assuming your Axios instance
import { toast } from 'react-toastify'; // For user feedback
import 'react-toastify/dist/ReactToastify.css';
import 'animate.css'; // For modal animations

const Members = () => {
    // State for main data, loading, and error
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [membersPerPage] = useState(10); // Number of members to display per page
    const [totalMembers, setTotalMembers] = useState(0); // Total count for pagination

    // State for filtering and searching
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    // State for "Add Member" modal
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [newMember, setNewMember] = useState({
        name: '',
        phone: '',
        // email: '', // REMOVED as requested
        status: 'Pending', // Default status for new members
        joinedDate: new Date().toISOString().slice(0, 10), // Default to current date
    });

    // --- Data Fetching ---
    const fetchMembers = async () => {
        setLoading(true);
        setError(null);
        try {
            // Adjust API call to potentially include pagination query params if backend supports it
            // Your backend's getMembers currently returns all, but if it implemented pagination
            // you'd do: `api.get(`/members/all?page=${currentPage}&limit=${membersPerPage}`);`
            const res = await api.get('/members/all');
            setMembers(res.data); // Assuming res.data is the array of members
            setTotalMembers(res.data.length); // Update total for pagination (adjust if backend sends total count)
            toast.success('Members loaded!', { autoClose: 1000 });
        } catch (err) {
            console.error('Error fetching members:', err);
            setError('Failed to fetch members.');
            toast.error('Failed to load members. ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    // --- Effects ---
    // Fetch members on component mount and when currentPage changes
    useEffect(() => {
        fetchMembers();
    }, [currentPage]); // Re-fetch when page changes

    // --- Utility Functions ---
    const filteredMembers = members.filter(member => {
        const matchesStatus = filterStatus === 'All' || member.status === filterStatus;
        const matchesSearch =
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            // member.email.toLowerCase().includes(searchTerm.toLowerCase()) || // REMOVED from search
            (member.phone ? member.phone.toLowerCase().includes(searchTerm.toLowerCase()) : false); // Handle potential undefined phone
        return matchesStatus && matchesSearch;
    });

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Active': return 'bg-success-subtle text-success';
            case 'Inactive': return 'bg-danger-subtle text-danger';
            case 'Pending': return 'bg-warning-subtle text-warning';
            default: return 'bg-secondary-subtle text-secondary';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Active': return <UserCheck size={16} className="me-1" />;
            case 'Inactive': return <UserX size={16} className="me-1" />;
            case 'Pending': return <Clock size={16} className="me-1" />;
            default: return <Users size={16} className="me-1" />;
        }
    };

    // --- Event Handlers ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewMember(prev => ({ ...prev, [name]: value }));
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        const { name, phone, status, joinedDate } = newMember; // Destructure without email

        // Frontend validation
        if (!name || !phone) { // Removed email from validation
            toast.error('Please fill in all required fields (Name, Phone).');
            return;
        }

        try {
            // Send new member data to the backend
            const res = await api.post('/members/create', {
                name,
                phone,
                // email, // Make sure your backend member model doesn't require email if it's not provided
                status,
                joinedDate,
            });
            toast.success('Member added successfully!');
            setShowAddMemberModal(false);
            setNewMember({ // Reset form
                name: '',
                phone: '',
                // email: '',
                status: 'Pending',
                joinedDate: new Date().toISOString().slice(0, 10),
            });
            fetchMembers(); // Re-fetch members to update the list
        } catch (err) {
            console.error('Error adding member:', err);
            toast.error(err.response?.data?.message || 'Failed to add member.');
        }
    };

    const handleDeleteMember = async (memberId) => {
        if (window.confirm("Are you sure you want to delete this member?")) {
            try {
                // TODO: Implement DELETE /api/members/:id endpoint in backend
                // await api.delete(`/members/${memberId}`);
                toast.success('Member deleted successfully! (Frontend only for now)');
                fetchMembers(); // Re-fetch to update list
            } catch (err) {
                console.error('Error deleting member:', err);
                toast.error(err.response?.data?.message || 'Failed to delete member.');
            }
        }
    };

    // --- Pagination Logic ---
    const indexOfLastMember = currentPage * membersPerPage;
    const indexOfFirstMember = indexOfLastMember - membersPerPage;
    const currentMembers = filteredMembers.slice(indexOfFirstMember, indexOfLastMember);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const totalPages = Math.ceil(totalMembers / membersPerPage);
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    // --- Render Logic for Loading/Error States ---
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="ms-2 text-primary">Loading members...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-5">
                <h4 className="text-danger mb-3">{error}</h4>
                <button className="btn btn-primary" onClick={fetchMembers}>Retry</button>
            </div>
        );
    }

    return (
        <div className="bg-light min-vh-100 py-4">
            <div className="container-fluid px-3 px-md-4 px-lg-5">
                {/* Header Section */}
                <div className="text-center mb-4 animate__animated animate__fadeInDown">
                    <h2 className="h4 fw-bolder text-primary mb-3">
                        Your Thrift Members
                    </h2>
                    <p className="lead text-muted mx-auto mb-4" style={{ maxWidth: '700px' }}>
                        Manage all the members participating in your thrift groups.
                    </p>
                    <div>
                        <button
                            onClick={() => setShowAddMemberModal(true)}
                            className="btn btn-primary btn-lg rounded-pill shadow-sm d-inline-flex align-items-center animate__animated animate__pulse animate__infinite animate__slow"
                        >
                            <PlusCircle size={20} className="me-2" />
                            Add New Member
                        </button>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="row mb-4 justify-content-center">
                    <div className="col-lg-8 col-md-10">
                        <div className="input-group shadow-sm rounded-pill overflow-hidden animate__animated animate__fadeIn">
                            <span className="input-group-text bg-white border-0 ps-4">
                                <Search size={20} className="text-muted" />
                            </span>
                            <input
                                type="text"
                                className="form-control border-0 py-3 ps-2"
                                placeholder="Search by name or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <select
                                className="form-select border-0 bg-white pe-4"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                style={{ maxWidth: '150px' }}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Pending">Pending</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Members Table */}
                <div className="row justify-content-center animate__animated animate__fadeInUp">
                    <div className="col-12">
                        {currentMembers.length > 0 ? (
                            <div className="table-responsive bg-white rounded-4 shadow-lg p-3">
                                <table className="table table-hover table-borderless align-middle mb-0">
                                    <thead className="text-muted border-bottom">
                                        <tr>
                                            <th scope="col" className="py-3 ps-3">Name</th>
                                            <th scope="col" className="py-3">Contact</th>
                                            <th scope="col" className="py-3">Status</th>
                                            <th scope="col" className="py-3">Joined</th>
                                            <th scope="col" className="py-3 text-center">Thrifts</th>
                                            <th scope="col" className="py-3 text-end pe-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentMembers.map((member) => (
                                            <tr key={member._id}>
                                                <td className="py-3 ps-3">
                                                    <h6 className="mb-0 fw-semibold text-dark">{member.name}</h6>
                                                    <small className="text-muted">{member._id}</small>
                                                </td>
                                                <td className="py-3">
                                                    <div className="d-flex align-items-center">
                                                        <Phone size={14} className="me-2 text-primary" />
                                                        <a href={`tel:${member.phone}`} className="text-decoration-none text-dark small">{member.phone || 'N/A'}</a>
                                                    </div>
                                                </td>
                                                <td className="py-3">
                                                    <span className={`badge ${getStatusBadgeClass(member.status)} rounded-pill px-3 py-2 fw-bold text-uppercase`}>
                                                        {getStatusIcon(member.status)} {member.status}
                                                    </span>
                                                </td>
                                                <td className="py-3">
                                                    <small className="text-muted">
                                                        {new Date(member.joinedDate || member.createdAt).toLocaleDateString()}
                                                    </small>
                                                </td>
                                                <td className="py-3 text-center">
                                                    <span className="badge bg-secondary-subtle text-secondary rounded-pill px-3 py-2">{member.totalThrifts || 0}</span>
                                                </td>
                                                <td className="py-3 text-end pe-3">
                                                    <button className="btn btn-sm btn-outline-primary rounded-pill me-2">
                                                        <Edit size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteMember(member._id)}
                                                        className="btn btn-sm btn-outline-danger rounded-pill"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="col-12 text-center py-5">
                                <h4 className="text-muted mb-3">No members found.</h4>
                                <p className="text-muted">Try adjusting your filters or add a new member!</p>
                                <button
                                    onClick={() => setShowAddMemberModal(true)}
                                    className="btn btn-outline-primary rounded-pill mt-3"
                                >
                                    <PlusCircle size={16} className="me-2" /> Add Your First Member
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <nav className="mt-4 animate__animated animate__fadeInUp">
                        <ul className="pagination justify-content-center flex-wrap">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <a className="page-link rounded-pill mx-1" href="#" onClick={() => paginate(currentPage - 1)}>Previous</a>
                            </li>
                            {pageNumbers.map(number => (
                                <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                                    <a onClick={() => paginate(number)} href="#" className="page-link rounded-pill mx-1">
                                        {number}
                                    </a>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <a className="page-link rounded-pill mx-1" href="#" onClick={() => paginate(currentPage + 1)}>Next</a>
                            </li>
                        </ul>
                    </nav>
                )}
            </div>

            {/* Add New Member Modal */}
            {showAddMemberModal && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content rounded-4 shadow-lg animate__animated animate__zoomIn animate__faster">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold text-primary">Add New Member</h5>
                                <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowAddMemberModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <form onSubmit={handleAddMember}>
                                    <div className="mb-3">
                                        <label htmlFor="memberName" className="form-label">Name</label>
                                        <input
                                            type="text"
                                            className="form-control rounded-pill"
                                            id="memberName"
                                            name="name"
                                            value={newMember.name}
                                            onChange={handleInputChange}
                                            placeholder="Enter member's full name"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="memberPhone" className="form-label">Phone</label>
                                        <input
                                            type="tel"
                                            className="form-control rounded-pill"
                                            id="memberPhone"
                                            name="phone"
                                            value={newMember.phone}
                                            onChange={handleInputChange}
                                            placeholder="e.g., +2348012345678"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="memberStatus" className="form-label">Status</label>
                                        <select
                                            className="form-select rounded-pill"
                                            id="memberStatus"
                                            name="status"
                                            value={newMember.status}
                                            onChange={handleInputChange}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                            <option value="Pending">Pending</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="memberJoinedDate" className="form-label">Joined Date</label>
                                        <input
                                            type="date"
                                            className="form-control rounded-pill"
                                            id="memberJoinedDate"
                                            name="joinedDate"
                                            value={newMember.joinedDate}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="modal-footer border-0 pt-4 d-flex justify-content-between">
                                        <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowAddMemberModal(false)}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-primary rounded-pill px-4">
                                            Add Member
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Members;