import React, { useState, useEffect } from "react";
import {
    PlusCircle,
    Search,
    DollarSign,
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    ChevronLeft,
    ChevronRight,
} from "react-feather";
import api from "../services/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "animate.css";

const Contributions = () => {
    // State for main data and loading/error
    const [contributions, setContributions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalContributions, setTotalContributions] = useState(0);
    const itemsPerPage = 20; // Hardcode the limit on the frontend to match the backend default

    // State for "Add Contribution" modal
    const [showAddContributionModal, setShowAddContributionModal] = useState(false);
    const [newContribution, setNewContribution] = useState({
        memberId: "",
        thriftId: "",
        amount: "",
        date: new Date().toISOString().slice(0, 10),
    });

    // States for dropdown data in the modal
    const [members, setMembers] = useState([]);
    const [thrifts, setThrifts] = useState([]);

    // States for filtering and searching
    const [filterStatus, setFilterStatus] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");

    // --- Data Fetching ---

    // Fetches all contributions from backend with pagination
    const fetchContributions = async (page) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get("/contributions/all", {
                params: {
                    page: page,
                    limit: itemsPerPage,
                },
            });
            // Update all contributions and pagination states
            setContributions(res.data.contributions);
            setTotalPages(res.data.totalPages);
            setTotalContributions(res.data.totalContributions);
            setCurrentPage(res.data.currentPage); // Make sure this state is in sync
            toast.success("Contributions loaded!", { autoClose: 1000 });
        } catch (err) {
            console.error("Error fetching contributions:", err);
            setError("Failed to fetch contributions.");
            toast.error("Failed to load contributions. " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    // Fetches members and thrifts for dropdowns in the "Add Contribution" modal
    const fetchDropdownData = async () => {
        try {
            const membersRes = await api.get("/members/all");
            setMembers(membersRes.data);

            const thriftsRes = await api.get("/thrifts/all");
            setThrifts(thriftsRes.data.thrifts);
        } catch (err) {
            console.error("Error fetching dropdown data:", err);
            toast.error("Failed to load necessary data for forms.");
        }
    };

    // --- Effects ---

    // Initial data load on component mount and on page change
    useEffect(() => {
        fetchContributions(currentPage);
        fetchDropdownData();
    }, [currentPage]); // Re-run effect when currentPage changes

    // --- Utility Functions ---

    // Filters contributions based on status and search term
    const filteredContributions = contributions.filter((contribution) => {
        const matchesStatus = filterStatus === "All" || contribution.status === filterStatus;
        const memberName = contribution.memberId?.name || "";
        const thriftName = contribution.thrift?.name || "";
        const transactionRef = contribution.transactionRef || "";

        const matchesSearch =
            memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            thriftName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transactionRef.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesStatus && matchesSearch;
    });

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case "Paid": return "bg-success-subtle text-success";
            case "Pending": return "bg-warning-subtle text-warning";
            case "Overdue": return "bg-danger-subtle text-danger";
            case "Refunded": return "bg-info-subtle text-info";
            default: return "bg-secondary-subtle text-secondary";
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
        }).format(amount);
    };

    // --- Pagination Handlers ---
    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // --- Event Handlers for Modal ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewContribution((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddContribution = async (e) => {
        e.preventDefault();
        const { memberId, thriftId, amount, date } = newContribution;
        if (!memberId || !thriftId || !amount || !date || parseFloat(amount) <= 0) {
            toast.error("Please fill in all required fields correctly.");
            return;
        }

        try {
            await api.post("/contributions/create", {
                memberId,
                thriftId,
                amount: parseFloat(amount),
                date,
            });
            toast.success("Contribution added successfully!");
            setShowAddContributionModal(false);
            setNewContribution({
                memberId: "",
                thriftId: "",
                amount: "",
                date: new Date().toISOString().slice(0, 10),
            });
            fetchContributions(1); // Re-fetch from page 1 after adding a new contribution
        } catch (err) {
            console.error("Error adding contribution:", err);
            toast.error(err.response?.data?.message || "Failed to add contribution.");
        }
    };

    // --- Render Logic for Loading/Error States ---
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="ms-2 text-primary">Loading contributions...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-5">
                <h4 className="text-danger mb-3">{error}</h4>
                <button className="btn btn-primary" onClick={() => fetchContributions(1)}>Retry</button>
            </div>
        );
    }

    // --- Main Component Render ---
    return (
        <div className="bg-light min-vh-100 py-4">
            <div className="container-fluid px-3 px-md-4 px-lg-5">
                <div className="d-flex justify-content-between align-items-center mb-4 animate__animated animate__fadeInDown">
                    <h2 className="h4 fw-bold text-primary mb-0">Your Contributions</h2>
                    <button
                        onClick={() => setShowAddContributionModal(true)}
                        className="btn btn-primary btn-sm rounded-pill shadow-sm d-inline-flex align-items-center"
                    >
                        <PlusCircle size={16} className="me-2" />
                        Add New
                    </button>
                </div>

                <div className="row mb-4 justify-content-center">
                    <div className="col-lg-8 col-md-10">
                        <div className="input-group shadow-sm rounded-pill overflow-hidden animate__animated animate__fadeIn">
                            <span className="input-group-text bg-white border-0 ps-4">
                                <Search size={20} className="text-muted" />
                            </span>
                            <input
                                type="text"
                                className="form-control border-0 py-3 ps-2"
                                placeholder="Search by member, thrift, or reference..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <select
                                className="form-select border-0 bg-white pe-4"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                style={{ maxWidth: "150px" }}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Paid">Paid</option>
                                <option value="Pending">Pending</option>
                                <option value="Overdue">Overdue</option>
                                <option value="Refunded">Refunded</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="row justify-content-center animate__animated animate__fadeInUp">
                    <div className="col-lg-8 col-md-10 col-sm-12">
                        {filteredContributions.length > 0 ? (
                            <div className="list-group rounded-4 shadow-lg overflow-hidden">
                                {filteredContributions.map((contribution, index) => (
                                    <div
                                        key={contribution._id}
                                        className="list-group-item list-group-item-action py-3 px-4 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <div className="flex-grow-1 mb-2 mb-md-0">
                                            <h6 className="fw-bold text-dark mb-1">
                                                {contribution.memberId?.name || "N/A Member"} (Thrift:{" "}
                                                {contribution.thrift?.name || "N/A Thrift"})
                                            </h6>
                                            <small className="text-muted d-block d-md-inline-block me-md-3">
                                                Ref: {contribution.transactionRef || "N/A"}
                                            </small>
                                            <small className="text-muted d-flex align-items-center">
                                                <Calendar size={14} className="me-1" />
                                                {new Date(contribution.date).toLocaleDateString()}
                                            </small>
                                        </div>
                                        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center">
                                            <p className="mb-0 fs-5 fw-bold text-success me-md-3">
                                                {formatCurrency(contribution.amount)}
                                            </p>
                                            <span
                                                className={`badge ${getStatusBadgeClass(contribution.status)} rounded-pill px-3 py-2 fw-bold text-uppercase me-md-3 mb-2 mb-md-0`}
                                            >
                                                {contribution.status}
                                            </span>
                                            {/* Action Buttons */}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="col-12 text-center py-5">
                                <h4 className="text-muted mb-3">No contributions found.</h4>
                                <p className="text-muted">
                                    Try adjusting your filters or add a new contribution!
                                </p>
                                <button
                                    onClick={() => setShowAddContributionModal(true)}
                                    className="btn btn-outline-primary rounded-pill mt-3"
                                >
                                    <PlusCircle size={16} className="me-2" /> Add Your First
                                    Contribution
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pagination Controls */}
                {totalContributions > itemsPerPage && (
                    <div className="d-flex justify-content-center mt-4">
                        <nav>
                            <ul className="pagination rounded-pill shadow-sm">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link rounded-start-pill"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        aria-label="Previous"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                </li>
                                {[...Array(totalPages)].map((_, index) => (
                                    <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => handlePageChange(index + 1)}
                                        >
                                            {index + 1}
                                        </button>
                                    </li>
                                ))}
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link rounded-end-pill"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        aria-label="Next"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>

            {/* Add New Contribution Modal */}
            {showAddContributionModal && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content rounded-4 shadow-lg animate__animated animate__zoomIn animate__faster">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold text-primary">Add New Contribution</h5>
                                <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowAddContributionModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <form onSubmit={handleAddContribution}>
                                    <div className="mb-3">
                                        <label htmlFor="memberId" className="form-label">Associated Member</label>
                                        <select className="form-select rounded-pill" id="memberId" name="memberId" value={newContribution.memberId} onChange={handleInputChange} required>
                                            <option value="">Select a Member</option>
                                            {members.map((member) => (<option key={member._id} value={member._id}>{member.name}</option>))}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="thriftId" className="form-label">Associated Thrift</label>
                                        <select className="form-select rounded-pill" id="thriftId" name="thriftId" value={newContribution.thriftId} onChange={handleInputChange} required>
                                            <option value="">Select a Thrift</option>
                                            {thrifts.map((thrift) => (<option key={thrift._id} value={thrift._id}>{thrift.name}</option>))}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="amount" className="form-label">Amount (₦)</label>
                                        <div className="input-group">
                                            <span className="input-group-text rounded-start-pill bg-light text-muted border-end-0"><DollarSign size={18} /></span>
                                            <input type="number" className="form-control rounded-end-pill" id="amount" name="amount" value={newContribution.amount} onChange={handleInputChange} placeholder="e.g., 5000" min="0" required />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="date" className="form-label">Date</label>
                                        <input type="date" className="form-control rounded-pill" id="date" name="date" value={newContribution.date} onChange={handleInputChange} required />
                                    </div>
                                    <div className="modal-footer border-0 pt-4 d-flex justify-content-between">
                                        <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowAddContributionModal(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary rounded-pill px-4">Add Contribution</button>
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

export default Contributions;