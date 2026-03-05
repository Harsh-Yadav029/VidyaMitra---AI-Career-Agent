// ============================================================
//  VidyaMitra — routes/profile.routes.js
//
//  Mounted at /api/auth in app.js, full paths:
//    GET   /api/auth/profile               → getProfile
//    PUT   /api/auth/profile               → updateProfile
//    PUT   /api/auth/change-password       → changePassword
//    PUT   /api/auth/notifications         → updateNotifications
//    GET   /api/auth/profile/suggest-role  → suggestTargetRole
// ============================================================

const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth.middleware");
const {
  getProfile,
  updateProfile,
  changePassword,
  updateNotifications,
  suggestTargetRole,
} = require("../controllers/profile.controller");

router.get("/profile/suggest-role", protect, suggestTargetRole);  // must be before /profile/:id
router.get("/profile",              protect, getProfile);
router.put("/profile",              protect, updateProfile);
router.put("/change-password",      protect, changePassword);
router.put("/notifications",        protect, updateNotifications);

module.exports = router;