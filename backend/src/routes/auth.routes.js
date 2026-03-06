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
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 60 }).withMessage("Name must be 2–60 characters"),
  body("email")
    .isEmail().withMessage("Valid email is required")
    .normalizeEmail(),
  // FIX: removed uppercase/lowercase/number regex — frontend only enforces
  // 8-char minimum so users were getting silent 400s with no explanation.
  // Password complexity is good UX only when the frontend shows the same rules.
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
];

const loginValidation = [
  body("email")
    .isEmail().withMessage("Valid email is required")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required"),
];

// ── Routes ────────────────────────────────────────────────────
router.post("/register", registerValidation, register);
router.post("/login",    loginValidation,    login);
router.get("/me",        protect,            getMe);
router.post("/logout",   protect,            logout);

module.exports = router;