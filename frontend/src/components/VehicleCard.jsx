import React from "react";

// VehicleCard Component - Practical Exam Set E Task 1
// Receives exactly: model, type, pricePerDay, available (plus optional onSelect callback)
const VehicleCard = ({ model, type, pricePerDay, available, onSelect }) => {
  return (
    <div className={`vehicle-card ${available ? "card-available" : "card-unavailable"}`}>
      <div className="card-header">
        <h3 className="vehicle-model">{model}</h3>
        <span className={`badge-type badge-${type ? type.toLowerCase() : "default"}`}>
          {type}
        </span>
      </div>

      <div className="card-body">
        <p className="price-tag">
          ₹<strong>{pricePerDay}</strong> <small>/ day</small>
        </p>

        <p className="availability-status">
          Status:{" "}
          <strong className={available ? "status-available" : "status-unavailable"}>
            {available ? "Available" : "Not Available"}
          </strong>
        </p>
      </div>

      <div className="card-footer">
        {/* Conditional rendering using ternary operator (Exam requirement) */}
        {available ? (
          <button
            type="button"
            className="btn btn-book"
            onClick={() => onSelect && onSelect(model)}
          >
            Book Now
          </button>
        ) : (
          <span className="not-available-label">Not Available</span>
        )}
      </div>
    </div>
  );
};

export default VehicleCard;
