const express = require("express");
const router = express.Router();
const {
  getVehicles,
  getVehicleById,
  createVehicle
} = require("../controllers/vehicleController");

// Public route: Get all vehicles
router.get("/", getVehicles);

// Public route: Get vehicle by ID
router.get("/:id", getVehicleById);

// Optional helper route: Add vehicle (can be public or admin-used)
router.post("/", createVehicle);

module.exports = router;
