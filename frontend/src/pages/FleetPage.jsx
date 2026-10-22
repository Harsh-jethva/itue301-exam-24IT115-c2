import React, { useState, useEffect } from "react";
import VehicleCard from "../components/VehicleCard";
import { useAuth } from "../context/AuthContext";

const FleetPage = () => {
  // Required API states (Exam Section 16)
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Client-side filter state (Exam Section 17)
  const [selectedType, setSelectedType] = useState("All");

  // Booking form states using useState (Exam Section 8)
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedVehicleModel, setSelectedVehicleModel] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  // Feedback states for booking submission
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState({ type: "", text: "" });

  const { token } = useAuth();

  // Fetch vehicles on component mount using useEffect (Exam Section 15)
  const fetchVehicles = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/v1/vehicles");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch vehicles");
      }

      // API returns { success: true, count, data: [...] } or array
      const vehicleList = Array.isArray(result) ? result : result.data || [];
      setVehicles(vehicleList);
    } catch (err) {
      setError("Unable to load vehicles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Client-side type filter working on already-fetched array (Exam Section 17)
  const filteredVehicles =
    selectedType === "All"
      ? vehicles
      : vehicles.filter((v) => v.type === selectedType);

  // When user clicks "Book Now" on a card or selects from dropdown
  const handleSelectVehicle = (vehicle) => {
    setSelectedVehicleId(vehicle._id);
    setSelectedVehicleModel(vehicle.model);
    setBookingMessage({ type: "", text: "" });
  };

  // Handle booking form submission (Exam Section 22)
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingMessage({ type: "", text: "" });

    if (!selectedVehicleId) {
      setBookingMessage({ type: "error", text: "Please select a vehicle to book." });
      return;
    }

    if (!pickupDate || !returnDate) {
      setBookingMessage({ type: "error", text: "Please select both pickup and return dates." });
      return;
    }

    setBookingLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/v1/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicleId: selectedVehicleId,
          pickupDate,
          returnDate
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Double-booking check or availability failure
        throw new Error(data.message || "Booking failed");
      }

      setBookingMessage({
        type: "success",
        text: `Success! Booking confirmed for ${selectedVehicleModel}.`
      });

      // Reset form states
      setSelectedVehicleId("");
      setSelectedVehicleModel("");
      setPickupDate("");
      setReturnDate("");

      // Re-fetch vehicle fleet to update availability in real-time
      fetchVehicles();
    } catch (err) {
      setBookingMessage({
        type: "error",
        text: err.message || "Failed to complete booking."
      });
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="page-container fleet-page">
      <div className="page-header">
        <h2>Available Fleet</h2>
        <p>Explore and rent premium self-drive vehicles with instant confirmation</p>
      </div>

      {/* Booking Form (Exam Section 8) */}
      <section className="booking-form-section">
        <div className="booking-card">
          <h3>Reserve Your Vehicle</h3>
          <p className="section-desc">Select dates and choose a vehicle from the fleet below</p>

          {bookingMessage.text && (
            <div className={`alert alert-${bookingMessage.type === "success" ? "success" : "error"}`}>
              {bookingMessage.text}
            </div>
          )}

          <form onSubmit={handleBookingSubmit} className="booking-form">
            <div className="form-row">
              <div className="form-group">
                <label>Selected Vehicle:</label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => {
                    const v = vehicles.find((item) => item._id === e.target.value);
                    if (v) {
                      setSelectedVehicleId(v._id);
                      setSelectedVehicleModel(v.model);
                    } else {
                      setSelectedVehicleId("");
                      setSelectedVehicleModel("");
                    }
                  }}
                >
                  <option value="">-- Choose a vehicle --</option>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id} disabled={!v.available}>
                      {v.model} ({v.type}) - ₹{v.pricePerDay}/day {v.available ? "" : "[UNAVAILABLE]"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Pickup Date:</label>
                <input
                  type="date"
                  required
                  value={pickupDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setPickupDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Return Date:</label>
                <input
                  type="date"
                  required
                  value={returnDate}
                  min={pickupDate || new Date().toISOString().split("T")[0]}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>
            </div>

            {/* Live state display showing selected vehicle and dates (Exam Section 8 requirement) */}
            <div className="booking-summary-banner">
              <strong>Selection Summary: </strong>
              <span>
                Vehicle: <em>{selectedVehicleModel || "None selected"}</em> | Pickup:{" "}
                <em>{pickupDate || "Not chosen"}</em> | Return: <em>{returnDate || "Not chosen"}</em>
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={bookingLoading || !selectedVehicleId}
            >
              {bookingLoading ? "Confirming Booking..." : "Confirm Booking"}
            </button>
          </form>
        </div>
      </section>

      {/* Vehicle Type Filter (Exam Section 17) */}
      <section className="filter-section">
        <span className="filter-label">Filter by Type:</span>
        <div className="filter-buttons">
          {["All", "Hatchback", "Sedan", "SUV"].map((type) => (
            <button
              key={type}
              type="button"
              className={`filter-btn ${selectedType === type ? "active" : ""}`}
              onClick={() => setSelectedType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </section>

      {/* API Loading State (Exam Section 16) */}
      {loading && (
        <div className="state-container loading-state">
          <p>Loading vehicles...</p>
        </div>
      )}

      {/* API Error State (Exam Section 16) */}
      {error && !loading && (
        <div className="state-container error-state">
          <p>{error}</p>
          <button onClick={fetchVehicles} className="btn btn-secondary">
            Retry
          </button>
        </div>
      )}

      {/* API Success State - Render VehicleCard components (Exam Section 16) */}
      {!loading && !error && (
        <section className="fleet-grid">
          {filteredVehicles.length === 0 ? (
            <p className="no-data">No vehicles found in category "{selectedType}".</p>
          ) : (
            filteredVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle._id}
                model={vehicle.model}
                type={vehicle.type}
                pricePerDay={vehicle.pricePerDay}
                available={vehicle.available}
                onSelect={() => handleSelectVehicle(vehicle)}
              />
            ))
          )}
        </section>
      )}
    </div>
  );
};

export default FleetPage;
