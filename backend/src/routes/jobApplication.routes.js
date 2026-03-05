// ============================================================
//  VidyaMitra — routes/jobApplication.routes.js
// ============================================================

const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth.middleware");
const {
  listApplications,
  createApplication,
  getApplication,
  updateApplication,
  deleteApplication,
  updateStatus,
  addInterviewRound,
  getStats,
} = require("../controllers/jobApplication.controller");

router.get("/stats",           protect, getStats);
router.get("/",                protect, listApplications);
router.post("/",               protect, createApplication);
router.get("/:id",             protect, getApplication);
router.put("/:id",             protect, updateApplication);
router.delete("/:id",          protect, deleteApplication);
router.patch("/:id/status",    protect, updateStatus);
router.post("/:id/interviews", protect, addInterviewRound);

module.exports = router;