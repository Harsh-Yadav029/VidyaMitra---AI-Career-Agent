// ============================================================
//  VidyaMitra — routes/agent.routes.js
// ============================================================

const express = require("express");
const {
  createSession,
  sendMessage,
  getSessions,
  getSession,
  deleteSession,
  getSkillGapAnalysis,
} = require("../controllers/agent.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();
router.use(protect);

// ── Chat Sessions ──────────────────────────────────────────────
// POST   /api/agent/sessions              — create new session
router.post("/sessions", createSession);

// GET    /api/agent/sessions              — list all sessions
router.get("/sessions", getSessions);

// GET    /api/agent/sessions/:id          — get session + history
router.get("/sessions/:sessionId", getSession);

// POST   /api/agent/sessions/:id/message  — send message, get reply
router.post("/sessions/:sessionId/message", sendMessage);

// DELETE /api/agent/sessions/:id          — delete session
router.delete("/sessions/:sessionId", deleteSession);

// ── Direct Tools ───────────────────────────────────────────────
// GET    /api/agent/skill-gap?targetRole=X — skill gap analysis
router.get("/skill-gap", getSkillGapAnalysis);

module.exports = router;
