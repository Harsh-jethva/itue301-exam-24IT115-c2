const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");

// @desc    Create new booking with Double-Booking Prevention
// @route   POST /api/v1/bookings
// @access  Protected (authGuard)
exports.createBooking = async (req, res, next) => {
  try {
    const { vehicleId, pickupDate, returnDate } = req.body;

    // Validate required fields
    if (!vehicleId || !pickupDate || !returnDate) {
      return res.status(400).json({
        success: false,
        message: "vehicleId, pickupDate, and returnDate are required"
      });
    }

    // Date validation
    const pDate = new Date(pickupDate);
    const rDate = new Date(returnDate);
    if (rDate < pDate) {
      return res.status(400).json({
        success: false,
        message: "Return date cannot be earlier than pickup date"
      });
    }

    // Step 1: Find requested vehicle
    const vehicle = await Vehicle.findById(vehicleId);

    // Step 2: Check whether vehicle exists
    if (!vehicle) {
      return res.status(400).json({
        success: false,
        message: "Vehicle not found"
      });
    }

    // Step 3 & 4: Check availability and prevent double-booking
    if (vehicle.available !== true) {
      return res.status(400).json({
        success: false,
        message: "Vehicle is not available"
      });
    }

    // Step 5: If available, create booking and update vehicle status
    const booking = await Booking.create({
      customerId: req.customer._id,
      vehicleId: vehicle._id,
      pickupDate: pDate,
      returnDate: rDate,
      status: "reserved"
    });

    // Mark vehicle as unavailable to prevent double bookings
    vehicle.available = false;
    await vehicle.save();

    // Populate customer and vehicle information for the response
    const populatedBooking = await Booking.findById(booking._id)
      .populate("customerId", "name email")
      .populate("vehicleId", "model type pricePerDay");

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: populatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookings belonging to authenticated customer
// @route   GET /api/v1/bookings/my
// @access  Protected (authGuard)
exports.getMyBookings = async (req, res, next) => {
  try {
    // Only return the authenticated customer's bookings
    const bookings = await Booking.find({ customerId: req.customer._id })
      .populate("customerId", "name email")
      .populate("vehicleId", "model type pricePerDay")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin Panel helper)
// @route   GET /api/v1/bookings
// @access  Protected (authGuard)
exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate("customerId", "name email phone licenseNumber")
      .populate("vehicleId", "model type pricePerDay available")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status
// @route   PATCH /api/v1/bookings/:id/status
// @access  Protected (authGuard)
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ["reserved", "ongoing", "completed", "cancelled"];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}`
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    booking.status = status;
    await booking.save();

    // If booking is completed or cancelled, make vehicle available again
    if (status === "completed" || status === "cancelled") {
      await Vehicle.findByIdAndUpdate(booking.vehicleId, { available: true });
    }

    const updatedBooking = await Booking.findById(booking._id)
      .populate("customerId", "name email")
      .populate("vehicleId", "model type");

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};
