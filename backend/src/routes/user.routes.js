// ============================================================
//  VidyaMitra — routes/user.routes.js
// ============================================================

const express = require("express");
const { body } = require("express-validator");
const { getProfile, updateProfile, updateSkills, deleteAccount } = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// All user routes are protected
router.use(protect);

// GET  /api/users/profile
router.get("/profile", getProfile);

// PATCH /api/users/profile
router.patch(
  "/profile",
  [
    body("name").optional().trim().isLength({ min: 2, max: 60 }),
    body("targetRole").optional().trim().isLength({ max: 100 }),
    body("phone").optional().trim(),
  ],
  updateProfile
);

// PATCH /api/users/skills
router.patch("/skills", updateSkills);

// DELETE /api/users/account
router.delete("/account", deleteAccount);

module.exports = router;
