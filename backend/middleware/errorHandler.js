// Global Error Handler Middleware - Practical Exam Set E
// Must be registered as the LAST middleware in server.js
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle Mongoose Validation Error (HTTP 400)
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // Handle Mongoose CastError / Invalid ObjectId (HTTP 400)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid format for field: ${err.path}`;
  }

  // Handle Mongoose Duplicate Key Error (HTTP 400)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `Duplicate value entered for ${field}. Please use another value.`;
  }

  // Never expose raw stack trace or internal database internals to client
  return res.status(statusCode).json({
    success: false,
    message: message
  });
};

module.exports = errorHandler;
