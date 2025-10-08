import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Pages
import Dashboard from "./pages/Dashboard";
import ThriftList from "./pages/ThriftList";
import Profile from "./pages/Profile";
import Contributions from "./pages/Contributions";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Members from "./pages/Members"; // Already imported
// // New page imports (assuming these will be created for the links)
// import AddContribution from "./pages/AddContribution"; // Placeholder for adding contributions
// import AddMember from "./pages/AddMember"; // Placeholder for adding members

// Components
import Navbar from "./components/Navbar";
import LoadingSpinner from "./components/LoadingSpinner";
import Footer from "./components/Footer";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        setIsAuthenticated(res.status === 200);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar when navigating on mobile (if sidebar is implemented)
  useEffect(() => {
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isSidebarOpen]); // Added isSidebarOpen to dependency array

  const logout = async () => {
    // Optionally call a backend logout endpoint to clear cookie
    setIsAuthenticated(false);
    // Optionally redirect to login page after logout
    // navigate('/login'); // If you have useNavigate hook
  };

  const PrivateRoute = ({ children }) => {
    if (isLoading) {
      return (
        <div className="d-flex align-items-center justify-content-center min-vh-100">
          {" "}
          {/* Bootstrap classes for centering */}
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    return isAuthenticated ? (
      children
    ) : (
      <Navigate to="/login" state={{ from: location }} replace />
    );
  };

  const AuthRoute = ({ children }) => {
    if (isLoading) {
      return (
        <div className="d-flex align-items-center justify-content-center min-vh-100">
          {" "}
          {/* Bootstrap classes for centering */}
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
  };

  const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: "easeInOut" },
  };

  // const isAuthPage = ["/login", "/register"].includes(location.pathname); // This variable is not used

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {" "}
      {/* Using Bootstrap flex classes */}
      {/* Navbar - fixed-top handles the spacing automatically */}
      <Navbar
        isAuthenticated={isAuthenticated}
        toggleSidebar={toggleSidebar} // Passed for potential future sidebar
        logout={logout}
      />
      {/* Main content area, ensure padding top for fixed navbar */}
      {/* Added pt-5 to main to account for fixed navbar height */}
      <main className="flex-grow-1 pt-5">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Redirect root to dashboard if authenticated, otherwise to login */}
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <motion.div {...pageTransition}>
                    <Dashboard />
                  </motion.div>
                </PrivateRoute>
              }
            />

            {/* <Route
              path="/create-thrift"
              element={
                <PrivateRoute>
                  <motion.div {...pageTransition}>
                    <CreateThrift />
                  </motion.div>
                </PrivateRoute>
              }
            /> */}

            <Route
              path="/thrifts"
              element={
                <PrivateRoute>
                  <motion.div {...pageTransition}>
                    <ThriftList />
                  </motion.div>
                </PrivateRoute>
              }
            />

            <Route
              path="/contributions"
              element={
                <PrivateRoute>
                  <motion.div {...pageTransition}>
                    <Contributions />
                  </motion.div>
                </PrivateRoute>
              }
            />

            {/* NEW ROUTE: Add Contribution */}
            {/* <Route
              path="/add-contribution"
              element={
                <PrivateRoute>
                  <motion.div {...pageTransition}>
                    <AddContribution />
                  </motion.div>
                </PrivateRoute>
              }
            /> */}

            <Route
              path="/members"
              element={
                <PrivateRoute>
                  <motion.div {...pageTransition}>
                    <Members />
                  </motion.div>
                </PrivateRoute>
              }
            />

            {/* NEW ROUTE: Add Member */}
            {/* <Route
              path="/add-member"
              element={
                <PrivateRoute>
                  <motion.div {...pageTransition}>
                    <AddMember />
                  </motion.div>
                </PrivateRoute>
              }
            /> */}

            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <motion.div {...pageTransition}>
                    <Profile />
                  </motion.div>
                </PrivateRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <motion.div {...pageTransition}>
                    <Settings />
                  </motion.div>
                </PrivateRoute>
              }
            />

            <Route
              path="/login"
              element={
                <AuthRoute>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Login setAuth={setIsAuthenticated} />
                  </motion.div>
                </AuthRoute>
              }
            />

            <Route
              path="/register"
              element={
                <AuthRoute>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Register setAuth={setIsAuthenticated} />
                  </motion.div>
                </AuthRoute>
              }
            />

            {/* Catch-all for undefined routes */}
            <Route
              path="*"
              element={
                <Navigate
                  to={isAuthenticated ? "/dashboard" : "/login"}
                  replace
                />
              }
            />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        toastStyle={{
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      />
    </div>
  );
};

export default App;
