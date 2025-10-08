import { Link, useLocation } from "react-router-dom";
import { LogOut, Settings, Home, CreditCard, Users, DollarSign } from "react-feather"; // Changed PiggyBank to DollarSign

const Navbar = ({ isAuthenticated, logout }) => {
  const location = useLocation();

  // Helper function to determine if a link is active
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm fixed-top border-bottom">
      <div className="container-fluid px-4 px-lg-5">
        {/* Brand with Icon Logo */}
        <Link className="navbar-brand fw-bold text-dark fs-4 d-flex align-items-center" to="/">
          {/* Using DollarSign icon as an alternative */}
          <DollarSign size={28} className="me-2 text-success" /> {/* You can adjust color if needed */}
          ThriftApp
        </Link>

        {/* Toggler */}
        <button
          className="navbar-toggler border-0 shadow-sm rounded-circle p-2"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Nav Content */}
        <div className="collapse navbar-collapse justify-content-end" id="navbarContent">
          <ul className="navbar-nav align-items-lg-center pt-3 pt-lg-0">
            {isAuthenticated ? (
              <>
                {/* Primary Links */}
                <li className="nav-item mb-2 mb-lg-0">
                  <Link
                    className={`nav-link text-dark py-2 px-4 rounded-pill transition-all duration-300 transform hover:scale-105 ${isActive("/dashboard") ? "fw-bold bg-dark text-white shadow-sm" : "hover:bg-light"}`}
                    to="/dashboard"
                  >
                    <Home size={18} className="me-2" />
                    Dashboard
                  </Link>
                </li>

                {/* Consolidated "Transactions" Dropdown */}
                <li className="nav-item dropdown mb-2 mb-lg-0">
                  <a
                    className={`nav-link dropdown-toggle text-dark py-2 px-4 rounded-pill transition-all duration-300 transform hover:scale-105 ${
                      ["/thrifts", "/contributions", "/members"].some(isActive) ? "fw-bold bg-dark text-white shadow-sm" : "hover:bg-light"
                    }`}
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <CreditCard size={18} className="me-2" />
                    Transactions
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-3 animate__animated animate__fadeInUp animate__faster">
                    <li>
                      <Link className="dropdown-item py-2 px-3 text-dark hover:bg-light rounded" to="/thrifts">
                        Thrifts
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <Link className="dropdown-item py-2 px-3 text-dark hover:bg-light rounded" to="/contributions">
                        Contributions
                      </Link>
                    </li>
                     <li><hr className="dropdown-divider" /></li>
                    <li>
                      <Link className="dropdown-item py-2 px-3 text-dark hover:bg-light rounded" to="/members">
                        Members
                      </Link>
                    </li>
                  </ul>
                </li>

                {/* Settings */}
                <li className="nav-item mb-2 mb-lg-0">
                  <Link
                    className={`nav-link text-dark py-2 px-4 rounded-pill transition-all duration-300 transform hover:scale-105 ${isActive("/settings") ? "fw-bold bg-dark text-white shadow-sm" : "hover:bg-light"}`}
                    to="/settings"
                  >
                    <Settings size={18} className="me-2" />
                    Settings
                  </Link>
                </li>

                {/* Logout Button */}
                <li className="nav-item ms-lg-3 mt-3 mt-lg-0">
                  <button
                    onClick={logout}
                    className="btn btn-dark btn-sm rounded-pill px-4 py-2 d-flex align-items-center justify-content-center shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                  >
                    <LogOut size={16} className="me-2" />
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                {/* Login/Register for unauthenticated users */}
                <li className="nav-item mb-2 mb-lg-0">
                  <Link
                    to="/login"
                    className={`nav-link text-dark py-2 px-4 rounded-pill transition-all duration-300 transform hover:scale-105 ${isActive("/login") ? "fw-bold bg-dark text-white shadow-sm" : "hover:bg-light"}`}
                  >
                    Login
                  </Link>
                </li>
                <li className="nav-item mt-2 mt-lg-0 ms-lg-2">
                  <Link
                    to="/register"
                    className={`nav-link btn btn-outline-dark btn-sm rounded-pill px-4 py-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${isActive("/register") ? "active bg-dark text-white shadow-sm" : ""}`}
                  >
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;