import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Navigation Component - Uses React Router NavLink for seamless internal routing
const Navigation = () => {
  const { customer, token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <NavLink to={token ? "/fleet" : "/"} className="brand-logo">
          🚗 DriveEasy
        </NavLink>

        <div className="nav-links">
          {!token && (
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              Login
            </NavLink>
          )}

          <NavLink
            to="/fleet"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            Fleet
          </NavLink>

          <NavLink
            to="/my-bookings"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            My Bookings
          </NavLink>

          <NavLink
            to="/admin"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            Admin
          </NavLink>

          {token && customer && (
            <div className="nav-user">
              <span className="user-badge">👤 {customer.name}</span>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
