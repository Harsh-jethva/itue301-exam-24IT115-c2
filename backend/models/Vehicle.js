const mongoose = require("mongoose");

// Vehicle Schema - Practical Exam Set E
const vehicleSchema = new mongoose.Schema(
  {
    model: {
      type: String,
      required: [true, "Vehicle model is required"],
      trim: true
    },
    type: {
      type: String,
      required: [true, "Vehicle type is required"],
      enum: {
        values: ["Hatchback", "Sedan", "SUV"],
        message: "Vehicle type must be Hatchback, Sedan, or SUV"
      }
    },
    pricePerDay: {
      type: Number,
      required: [true, "Price per day is required"],
      min: [0, "Price per day cannot be negative"]
    },
    available: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
