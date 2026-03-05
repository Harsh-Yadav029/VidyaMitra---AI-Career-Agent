// ============================================================
//  VidyaMitra — routes/auth.routes.js
// ============================================================

const express = require("express");
const { body } = require("express-validator");
const { register, login, getMe, logout } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// ── Validation Rules ──────────────────────────────────────────
const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 60 }).withMessage("Name must be 2–60 characters"),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage("Password must include uppercase, lowercase, and number"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

// ── Routes ────────────────────────────────────────────────────
// POST /api/auth/register
router.post("/register", registerValidation, register);

// POST /api/auth/login
router.post("/login", loginValidation, login);

// GET /api/auth/me  (protected)
router.get("/me", protect, getMe);

// POST /api/auth/logout  (protected)
router.post("/logout", protect, logout);

module.exports = router;
