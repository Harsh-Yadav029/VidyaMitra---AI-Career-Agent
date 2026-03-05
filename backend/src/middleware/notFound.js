// ============================================================
//  VidyaMitra — middleware/notFound.js
//  Catch-all 404 handler for unmatched routes
// ============================================================

const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = notFound;
