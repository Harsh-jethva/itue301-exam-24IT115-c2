const express = require("express");
const router = express.Router();
const authGuard = require("../middleware/authGuard");
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus
} = require("../controllers/bookingController");

// All booking routes require authentication
router.use(authGuard);

// Route for customer's own bookings (/api/v1/bookings/my)
// IMPORTANT: Defined before /:id routes to avoid route collision
router.get("/my", getMyBookings);

// Route to get all bookings (for AdminPanel)
router.get("/", getAllBookings);

// Route to create a new booking (/api/v1/bookings)
router.post("/", createBooking);

// Route to update booking status (/api/v1/bookings/:id/status)
router.patch("/:id/status", updateBookingStatus);

module.exports = router;
