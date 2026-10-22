const mongoose = require("mongoose");

// Customer Schema - Practical Exam Set E
const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Customer email is required"],
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    licenseNumber: {
      type: String,
      required: [true, "Driving license number is required"],
      unique: true,
      trim: true
    },
    password: {
      type: String,
      default: "password123"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Customer", customerSchema);
