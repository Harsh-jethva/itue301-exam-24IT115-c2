import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // Registration fields if user wants to create a new customer
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isRegistering ? "/api/v1/auth/register" : "/api/v1/auth/login";
      const payload = isRegistering
        ? { name, email, phone, licenseNumber, password }
        : { email, password };

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      // Save customer and token to AuthContext
      login(data.customer, data.token);

      // Navigate to FleetPage upon successful login
      navigate("/fleet");
    } catch (err) {
      setError(err.message || "Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to fill demo account
  const fillDemoAccount = () => {
    setEmail("rahul@example.com");
    setPassword("password123");
    setIsRegistering(false);
    setError("");
  };

  return (
    <div className="page-container auth-page">
      <div className="auth-card">
        <h2>{isRegistering ? "Customer Registration" : "Customer Login"}</h2>
        <p className="auth-subtitle">
          {isRegistering
            ? "Create an account to book self-drive vehicles"
            : "Sign in to access fleet and manage your bookings"}
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegistering && (
            <>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Driving License Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DL-1420110012345"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              required
              placeholder="e.g. rahul@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Processing..." : isRegistering ? "Register Customer" : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          <button
            type="button"
            className="btn-link"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError("");
            }}
          >
            {isRegistering
              ? "Already have an account? Login here"
              : "Need a new account? Register here"}
          </button>

          {!isRegistering && (
            <button type="button" onClick={fillDemoAccount} className="btn-demo">
              Fill Demo Credentials (rahul@example.com)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
