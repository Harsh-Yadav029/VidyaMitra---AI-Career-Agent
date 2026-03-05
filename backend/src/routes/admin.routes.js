// ============================================================
// VidyaMitra — routes/admin.routes.js
// All routes protected by: protect + adminOnly
// ============================================================
const express = require("express");
const {
  getStats,
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  updateAdminNotes,
  deleteUser,
  getAllResumes,
  deleteResume,       // FIX: added
} = require("../controllers/admin.controller");

const { protect, adminOnly } = require("../middleware/auth.middleware");

const router = express.Router();
router.use(protect, adminOnly);

// Stats
router.get("/stats", getStats);

// Users
router.get("/users",                  getAllUsers);
router.get("/users/:id",              getUserById);
router.patch("/users/:id/role",       updateUserRole);
router.patch("/users/:id/status",     toggleUserStatus);
router.patch("/users/:id/notes",      updateAdminNotes);
router.delete("/users/:id",           deleteUser);

// Resumes
router.get("/resumes",                getAllResumes);
router.delete("/resumes/:id",         deleteResume);   // FIX: was missing → caused 404

module.exports = router;