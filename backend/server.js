require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

// Middleware
const requestLogger = require("./middleware/requestLogger");
const errorHandler = require("./middleware/errorHandler");

// Route Handlers
const authRoutes = require("./routes/authRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

// Models for initial seeding if empty
const Vehicle = require("./models/Vehicle");
const Customer = require("./models/Customer");

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend cross-origin requests
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Apply Request Logger globally BEFORE route definitions (Exam Section 11)
app.use(requestLogger);

// Health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "DriveEasy Car Rental API is running",
    version: "1.0.0"
  });
});

// API Routes (Base path /api/v1/ - Exam Section 10)
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/vehicles", vehicleRoutes);
app.use("/api/v1/bookings", bookingRoutes);

// Register Global Error Handler as the LAST middleware (Exam Section 13)
app.use(errorHandler);

// Helper function to seed initial test data if collections are empty
async function seedDefaultDataIfEmpty() {
  try {
    const vehicleCount = await Vehicle.countDocuments();
    if (vehicleCount === 0) {
      console.log("[DB] No vehicles found. Seeding initial fleet...");
      await Vehicle.insertMany([
        { model: "Honda City", type: "Sedan", pricePerDay: 2500, available: true },
        { model: "Hyundai Creta", type: "SUV", pricePerDay: 3000, available: true },
        { model: "Maruti Swift", type: "Hatchback", pricePerDay: 1800, available: true },
        { model: "Toyota Fortuner", type: "SUV", pricePerDay: 4500, available: true }
      ]);
      console.log("[DB] Default vehicles seeded successfully.");
    }

    const customerCount = await Customer.countDocuments();
    if (customerCount === 0) {
      console.log("[DB] No customer found. Seeding default test customer...");
      await Customer.create({
        name: "Rahul Sharma",
        email: "rahul@example.com",
        phone: "9876543210",
        licenseNumber: "DL-1420110012345",
        password: "password123"
      });
      console.log("[DB] Default test customer seeded (rahul@example.com / password123).");
    }
  } catch (err) {
    console.error("[DB] Auto-seed note:", err.message);
  }
}

// Connect to MongoDB and start Express server
async function startServer() {
  let mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/driveeasy";

  try {
    // Attempt standard connection first with short timeout
    console.log(`[DB] Attempting connection to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log("[DB] Connected to local/configured MongoDB successfully.");
  } catch (initialErr) {
    console.warn(`[DB] Could not connect to local Mongo daemon (${initialErr.message}).`);
    console.log("[DB] Initializing embedded MongoDB engine (MongoMemoryServer)...");
    try {
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      await mongoose.connect(mongoUri);
      console.log(`[DB] Connected to embedded MongoDB successfully at: ${mongoUri}`);
    } catch (memErr) {
      console.error("[DB] Fatal: Failed to initialize embedded MongoDB:", memErr.message);
      process.exit(1);
    }
  }

  // Ensure default sample data exists
  await seedDefaultDataIfEmpty();

  // Start listening
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`  DriveEasy Car Rental Backend Server Running   `);
    console.log(`  PORT: http://localhost:${PORT}                 `);
    console.log(`  API Base: http://localhost:${PORT}/api/v1      `);
    console.log(`===============================================`);
  });
}

startServer();

module.exports = app;
