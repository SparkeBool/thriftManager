import { useState } from "react";
import { motion } from "framer-motion";
import api from "../services/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await api.post("/auth/register", { name, email, password });

      toast.success("Registration successful");
      setSuccess(true);
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="login-container"
      style={{ minHeight: "70vh" }} // adjust if needed
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="login-card">
        <header className="auth-header">
          <div className="logo-container">
            <div className="app-logo">T</div>
          </div>
          <h3 className="auth-title">Register</h3>
          <p className="auth-subtitle">Create your account</p>
        </header>

        {error && (
          <div className="error-message" role="alert">
            <svg
              className="error-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
              />
            </svg>
            {error}
          </div>
        )}
        {success && (
          <div
            className="alert alert-success"
            style={{ margin: "0 2rem 1rem" }}
          >
            Registration successful! You can log in now.
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ position: "relative" }}>
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? (
              <>
                <svg className="spinner" viewBox="0 0 50 50">
                  <circle
                    className="spinner-track"
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    strokeWidth="5"
                  />
                  <circle
                    className="spinner-path"
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    strokeWidth="5"
                  />
                </svg>
                Registering...
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>

        <footer className="auth-footer">
          <p className="footer-text">
            Already have an account?{" "}
            <a href="/login" className="footer-link">
              Log in
            </a>
          </p>
        </footer>
      </div>
    </motion.div>
  );
};

export default Register;
