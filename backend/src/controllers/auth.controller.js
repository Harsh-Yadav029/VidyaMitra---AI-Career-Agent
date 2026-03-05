// ============================================================
//  VidyaMitra — controllers/auth.controller.js
//  Handles: register, login, getMe, logout
// ============================================================

const jwt    = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User   = require("../models/User.model");
const logger = require("../config/logger");
const { sendWelcomeEmail } = require("../services/email/emailService");

// ── Helper: generate signed JWT ──────────────────────────────
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// ── Helper: safe public user object (no password) ────────────
// FIX 1: replaced user.toPublicJSON() — that method doesn't exist
//         now we build the object inline so nothing can crash
const publicUser = (user) => ({
  _id:          user._id,
  name:         user.name,
  email:        user.email,
  role:         user.role,
  avatar:       user.avatar        || "",
  authProvider: user.authProvider  || "local",
  isActive:     user.isActive,
  isVerified:   user.isVerified,
  lastLoginAt:  user.lastLoginAt,
  loginCount:   user.loginCount    || 0,
  phone:        user.phone         || "",
  location:     user.location      || "",
  bio:          user.bio           || "",
  targetRole:   user.targetRole    || "",
  skills:       user.skills        || [],
  experience:   user.experience    || "",
  education:    user.education     || "",
  linkedin:     user.linkedin      || "",
  github:       user.github        || "",
  portfolio:    user.portfolio     || "",
  createdAt:    user.createdAt,
});

// ── Helper: send token response ──────────────────────────────
const sendTokenResponse = (user, statusCode, res, message = "Success") => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: publicUser(user),   // ← uses publicUser() not toPublicJSON()
  });
};

// ── POST /api/auth/register ───────────────────────────────────
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors:  errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }

    const { name, email, password, targetRole } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const user = await User.create({ name, email, password, targetRole });

    // Fire-and-forget welcome email
    sendWelcomeEmail(user).catch((err) =>
      logger.warn(`Welcome email failed for ${email}: ${err.message}`)
    );

    logger.info(`New user registered: ${email}`);
    sendTokenResponse(user, 201, res, "Account created successfully!");
  } catch (error) {
    next(error);
  }
};

// ── POST /api/auth/login ──────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors:  errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }

    const { email, password } = req.body;

    // +password because select:false in schema
    const user = await User.findOne({ email }).select("+password");

    // FIX 2: use comparePassword (defined in User.model.js)
    //         matchPassword was the old name — both exist now as aliases
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated. Please contact support.",
      });
    }

    // FIX 3: single save only — old code saved twice and incremented loginCount by 2
    user.lastLoginAt = new Date();
    user.loginCount  = (user.loginCount || 0) + 1;
    await user.save({ validateBeforeSave: false });

    logger.info(`User logged in: ${email}`);
    sendTokenResponse(user, 200, res, "Login successful!");
  } catch (error) {
    next(error);
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    // FIX 4: removed .populate("resumes") — User has no resumes ref
    //         also replaced toPublicJSON() with publicUser()
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    res.status(200).json({ success: true, user: publicUser(user) });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/auth/logout ─────────────────────────────────────
const logout = async (req, res) => {
  logger.info(`User logged out: ${req.user.email}`);
  res.status(200).json({ success: true, message: "Logged out successfully." });
};

module.exports = { register, login, getMe, logout };