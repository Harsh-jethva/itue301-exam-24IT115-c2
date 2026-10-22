const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");

// Auth Guard Middleware - Practical Exam Set E
const authGuard = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists and starts with Bearer
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No Bearer token provided."
      });
    }

    // Extract the token
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Malformed authorization token."
      });
    }

    // Verify token using JWT secret
    const secret = process.env.JWT_SECRET || "driveeasy_exam_secret_key_2026";
    const decoded = jwt.verify(token, secret);

    // Find customer in database to ensure they still exist
    const customer = await Customer.findById(decoded.id).select("-password");
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Customer not found."
      });
    }

    // Attach customer to request object for downstream controllers
    req.customer = customer;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed. Invalid or expired token."
    });
  }
};

module.exports = authGuard;
