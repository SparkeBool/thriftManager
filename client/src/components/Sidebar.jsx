import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, PieChart, DollarSign, Users, Settings, LogOut } from "react-feather";
import { useAuth } from "../hooks/useAuth"; // Assuming this hook provides logout

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { logout } = useAuth(); // Destructure logout from useAuth
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", name: "Dashboard", icon: <Home size={18} /> },
    { path: "/thrifts", name: "Thrifts", icon: <PieChart size={18} /> },
    { path: "/contributions", name: "Contributions", icon: <DollarSign size={18} /> },
    { path: "/members", name: "Members", icon: <Users size={18} /> },
    { path: "/settings", name: "Settings", icon: <Settings size={18} /> },
  ];

  // Sidebar variants for animation
  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  };

  return (
    <>
      {/* Animated Sidebar for mobile and tablet (d-md-none effectively) */}
      <motion.aside
        className="sidebar bg-dark text-white d-flex flex-column p-3 position-fixed top-0 start-0 h-100 md:d-none" // Hide this on md and up
        style={{ width: 250, zIndex: 1050 }}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ type: "tween", duration: 0.3 }}
      >
        {/* Logo */}
        <div className="d-flex align-items-center mb-4 px-2">
          <Link to="/dashboard" className="d-flex align-items-center text-decoration-none text-white" onClick={closeSidebar}>
            <span className="fs-4 fw-bold">ThriftApp</span>
          </Link>
        </div>

        {/* Navigation */}
        <ul className="nav nav-pills flex-column mb-auto">
          {navItems.map((item) => (
            <li key={item.path} className="nav-item mb-2">
              <Link
                to={item.path}
                onClick={closeSidebar}
                className={`nav-link d-flex align-items-center ${
                  location.pathname.includes(item.path) ? "active bg-primary text-white" : "text-white"
                }`}
              >
                <span className="me-3">{item.icon}</span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Logout */}
        <div className="border-top border-secondary pt-3 mt-auto">
          <button
            onClick={() => {
              logout();
              closeSidebar();
            }}
            className="btn btn-outline-light d-flex align-items-center w-100"
          >
            <LogOut size={18} className="me-3" />
            Logout
          </button>
        </div>
      </motion.aside>

      {/* Fixed sidebar for md+ screens (always visible) */}
      <aside
        className="sidebar d-none d-md-flex flex-column bg-dark text-white p-3 position-fixed top-0 start-0 h-100"
        style={{ width: 250, zIndex: 1050 }}
      >
        {/* Logo */}
        <div className="d-flex align-items-center mb-4 px-2">
          <Link to="/dashboard" className="d-flex align-items-center text-decoration-none text-white">
            <span className="fs-4 fw-bold">ThriftApp</span>
          </Link>
        </div>

        {/* Navigation */}
        <ul className="nav nav-pills flex-column mb-auto">
          {navItems.map((item) => (
            <li key={item.path} className="nav-item mb-2">
              <Link
                to={item.path}
                className={`nav-link d-flex align-items-center ${
                  location.pathname.includes(item.path) ? "active bg-primary text-white" : "text-white"
                }`}
              >
                <span className="me-3">{item.icon}</span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Logout */}
        <div className="border-top border-secondary pt-3 mt-auto">
          <button onClick={logout} className="btn btn-outline-light d-flex align-items-center w-100">
            <LogOut size={18} className="me-3" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;