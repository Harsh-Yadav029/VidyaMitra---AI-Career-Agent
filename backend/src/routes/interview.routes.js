// ============================================================
//  VidyaMitra — routes/interview.routes.js
// ============================================================

const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth.middleware");
const {
  createSession,
  submitQuestionAnswer,
  completeSession,       // FIX: new endpoint the frontend calls after all answers
  getSessionStatus,
  getResults,
  listSessions,
  previewQuestions,
  getRoles,
} = require("../controllers/interview.controller");

router.use(protect);

router.get("/roles",                    getRoles);
router.get("/questions/preview",        previewQuestions);
router.get("/sessions",                 listSessions);
router.post("/sessions",                createSession);
router.get("/sessions/:id",             getSessionStatus);
router.post("/sessions/:id/answer",     submitQuestionAnswer);
router.post("/sessions/:id/complete",   completeSession);   // FIX: was missing → caused 404 on finish
router.get("/sessions/:id/results",     getResults);

module.exports = router;