// ============================================================
//  VidyaMitra — middleware/auth.middleware.js
//  Verify JWT token on protected routes
// ============================================================

const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const logger = require("../config/logger");

const protect = async (req, res, next) => {
  let token;

  // Accept token from Authorization header: "Bearer <token>"
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found." });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Account is deactivated." });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.warn(`JWT verification failed: ${error.message}`);

    const message =
      error.name === "TokenExpiredError"
        ? "Token expired. Please log in again."
        : "Invalid token.";

    return res.status(401).json({ success: false, message });
  }
};

// ── Admin-only guard (use after protect) ──────────────────────
const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required.",
    });
  }
  next();
};

module.exports = { protect, adminOnly };
