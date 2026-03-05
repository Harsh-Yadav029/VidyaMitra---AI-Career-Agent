// ============================================================
//  VidyaMitra — routes/score.routes.js
// ============================================================

const express = require("express");
const {
  scoreResumeById,
  getScore,
  compareResumes,
  getQuickTips,
} = require("../controllers/score.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();
router.use(protect);

// POST /api/scores/:resumeId          — score a resume (+ optional JD in body)
router.post("/:resumeId", scoreResumeById);

// GET  /api/scores/:resumeId          — get saved scores
router.get("/:resumeId", getScore);

// GET  /api/scores/:resumeId/tips     — get quick improvement tips
router.get("/:resumeId/tips", getQuickTips);

// POST /api/scores/compare            — compare two resumes
router.post("/compare", compareResumes);

module.exports = router;
