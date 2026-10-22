// Request Logger Middleware - Practical Exam Set E
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${req.method}] ${req.originalUrl || req.url} [${timestamp}]`);
  next();
};

module.exports = requestLogger;
