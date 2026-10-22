import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

// Lazy-Loaded AdminPanel Component (Exam Section 9)
const AdminPanel = () => {
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // New vehicle form state
  const [newModel, setNewModel] = useState("");
  const [newType, setNewType] = useState("Sedan");
  const [newPrice, setNewPrice] = useState("");

  const { token } = useAuth();

  const loadData = async () => {
    setLoading(true);
    try {
      // Load all vehicles
      const vRes = await fetch("http://localhost:5000/api/v1/vehicles");
      const vData = await vRes.json();
      setVehicles(Array.isArray(vData) ? vData : vData.data || []);

      // Load all bookings (if authenticated)
      if (token) {
        const bRes = await fetch("http://localhost:5000/api/v1/bookings", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (bRes.ok) {
          const bData = await bRes.json();
          setBookings(bData.data || []);
        }
      }
    } catch (err) {
      console.error("Admin load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  // Update booking status
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setMessage(`Booking status updated to ${newStatus}`);
        setTimeout(() => setMessage(""), 3000);
        loadData();
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  // Add new vehicle
  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!newModel || !newPrice) return;

    try {
      const response = await fetch("http://localhost:5000/api/v1/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: newModel,
          type: newType,
          pricePerDay: Number(newPrice),
          available: true
        })
      });

      if (response.ok) {
        setMessage(`Vehicle "${newModel}" added to fleet!`);
        setNewModel("");
        setNewPrice("");
        setTimeout(() => setMessage(""), 3000);
        loadData();
      }
    } catch (err) {
      alert("Failed to add vehicle");
    }
  };

  return (
    <div className="page-container admin-page">
      <div className="page-header">
        <h2>Fleet Manager & Admin Panel</h2>
        <p>Manage fleet inventory, view all system reservations, and adjust booking statuses</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      <div className="admin-grid">
        {/* Add Vehicle Section */}
        <div className="admin-card">
          <h3>Add New Vehicle to Fleet</h3>
          <form onSubmit={handleAddVehicle} className="admin-form">
            <div className="form-group">
              <label>Model Name:</label>
              <input
                type="text"
                required
                placeholder="e.g. Mahindra Thar"
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Vehicle Type:</label>
              <select value={newType} onChange={(e) => setNewType(e.target.value)}>
                <option value="Hatchback">Hatchback</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
              </select>
            </div>

            <div className="form-group">
              <label>Price Per Day (₹):</label>
              <input
                type="number"
                min="0"
                required
                placeholder="e.g. 3500"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Add Vehicle
            </button>
          </form>
        </div>

        {/* Fleet Overview */}
        <div className="admin-card">
          <h3>Current Fleet Status ({vehicles.length})</h3>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Type</th>
                  <th>Price/Day</th>
                  <th>Availability</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v._id}>
                    <td><strong>{v.model}</strong></td>
                    <td>{v.type}</td>
                    <td>₹{v.pricePerDay}</td>
                    <td>
                      <span className={v.available ? "status-available" : "status-unavailable"}>
                        {v.available ? "● Available" : "○ Booked"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* All Bookings Table */}
      <div className="admin-card full-width">
        <h3>All Customer Reservations ({bookings.length})</h3>
        {loading ? (
          <p>Loading records...</p>
        ) : !token ? (
          <p className="text-muted">Log in as a customer or manager to view system bookings.</p>
        ) : bookings.length === 0 ? (
          <p className="no-data">No bookings recorded yet.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Vehicle</th>
                  <th>Dates</th>
                  <th>Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <strong>{b.customerId?.name || "N/A"}</strong>
                      <br />
                      <small>{b.customerId?.email}</small>
                    </td>
                    <td>
                      <small>Lic: {b.customerId?.licenseNumber || "N/A"}</small>
                      <br />
                      <small>Ph: {b.customerId?.phone || "N/A"}</small>
                    </td>
                    <td>
                      <strong>{b.vehicleId?.model || "N/A"}</strong> ({b.vehicleId?.type})
                    </td>
                    <td>
                      <small>From: {new Date(b.pickupDate).toLocaleDateString()}</small>
                      <br />
                      <small>To: {new Date(b.returnDate).toLocaleDateString()}</small>
                    </td>
                    <td>
                      <span className={`status-badge status-${b.status}`}>{b.status}</span>
                    </td>
                    <td>
                      <select
                        value={b.status}
                        onChange={(e) => handleStatusChange(b._id, e.target.value)}
                        className="select-status"
                      >
                        <option value="reserved">reserved</option>
                        <option value="ongoing">ongoing</option>
                        <option value="completed">completed</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
