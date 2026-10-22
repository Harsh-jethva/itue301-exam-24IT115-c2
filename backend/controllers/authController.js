const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");

// Generate JWT Token for Customer
const generateToken = (customer) => {
  const secret = process.env.JWT_SECRET || "driveeasy_exam_secret_key_2026";
  return jwt.sign(
    {
      id: customer._id,
      name: customer.name,
      email: customer.email
    },
    secret,
    { expiresIn: "24h" }
  );
};

// @desc    Customer Login
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required for login"
      });
    }

    // Find customer by email
    const customer = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or credentials"
      });
    }

    // Simple credential check (exam requirement: simple & viva-friendly)
    if (password && customer.password && customer.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Generate JWT token
    const token = generateToken(customer);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        licenseNumber: customer.licenseNumber
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Customer Register (Viva convenience helper)
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, licenseNumber, password } = req.body;

    // Validate required fields
    if (!name || !email || !licenseNumber) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and licenseNumber are required"
      });
    }

    // Check if customer already exists
    const existing = await Customer.findOne({
      $or: [{ email: email.toLowerCase().trim() }, { licenseNumber: licenseNumber.trim() }]
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Customer with this email or license number already exists"
      });
    }

    const customer = await Customer.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : "",
      licenseNumber: licenseNumber.trim(),
      password: password || "password123"
    });

    const token = generateToken(customer);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        licenseNumber: customer.licenseNumber
      }
    });
  } catch (error) {
    next(error);
  }
};
