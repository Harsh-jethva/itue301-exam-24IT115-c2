import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const { token, customer } = useAuth();

  const fetchMyBookings = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/v1/bookings/my", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch your bookings");
      }

      setBookings(result.data || []);
    } catch (err) {
      setError(err.message || "Unable to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMyBookings();
    }
  }, [token]);

  // Handle cancelling a booking via PATCH /api/v1/bookings/:id/status
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/v1/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: "cancelled" })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to cancel booking");
      }

      setActionMessage("Booking cancelled successfully.");
      setTimeout(() => setActionMessage(""), 4000);
      fetchMyBookings();
    } catch (err) {
      alert(err.message || "Failed to cancel booking");
    }
  };

  return (
    <div className="page-container bookings-page">
      <div className="page-header">
        <h2>My Bookings</h2>
        <p>
          Viewing reservation history for <strong>{customer?.name || "Customer"}</strong> (
          {customer?.email})
        </p>
      </div>

      {actionMessage && <div className="alert alert-success">{actionMessage}</div>}

      {loading && (
        <div className="state-container loading-state">
          <p>Loading your reservations...</p>
        </div>
      )}

      {error && !loading && (
        <div className="state-container error-state">
          <p>{error}</p>
          <button onClick={fetchMyBookings} className="btn btn-secondary">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="bookings-list">
          {bookings.length === 0 ? (
            <div className="no-data-card">
              <p>You do not have any active bookings yet.</p>
              <a href="/fleet" className="btn btn-primary">
                Browse Fleet
              </a>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Type</th>
                    <th>Pickup Date</th>
                    <th>Return Date</th>
                    <th>Status</th>
                    <th>Customer Info</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => {
                    const vehicle = booking.vehicleId || {};
                    const cust = booking.customerId || {};
                    const isCancellable =
                      booking.status === "reserved" || booking.status === "ongoing";

                    return (
                      <tr key={booking._id}>
                        <td>
                          <strong>{vehicle.model || "Unknown Model"}</strong>
                        </td>
                        <td>
                          <span className="badge-type">{vehicle.type || "N/A"}</span>
                        </td>
                        <td>{new Date(booking.pickupDate).toLocaleDateString()}</td>
                        <td>{new Date(booking.returnDate).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge status-${booking.status}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td>
                          <small>
                            {cust.name} ({cust.email})
                          </small>
                        </td>
                        <td>
                          {isCancellable ? (
                            <button
                              onClick={() => handleCancelBooking(booking._id)}
                              className="btn btn-sm btn-danger"
                            >
                              Cancel
                            </button>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
