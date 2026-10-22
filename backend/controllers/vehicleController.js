const Vehicle = require("../models/Vehicle");

// @desc    Get all vehicles
// @route   GET /api/v1/vehicles
// @access  Public
exports.getVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single vehicle by ID
// @route   GET /api/v1/vehicles/:id
// @access  Public
exports.getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new vehicle (Admin / Seeding helper)
// @route   POST /api/v1/vehicles
// @access  Public (or Admin protected)
exports.createVehicle = async (req, res, next) => {
  try {
    const { model, type, pricePerDay, available } = req.body;

    const vehicle = await Vehicle.create({
      model,
      type,
      pricePerDay,
      available: available !== undefined ? available : true
    });

    return res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
};
