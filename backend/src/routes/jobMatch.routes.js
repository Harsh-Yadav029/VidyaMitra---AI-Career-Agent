// ============================================================
//  VidyaMitra — routes/jobMatch.routes.js
// ============================================================

const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth.middleware");
const { matchJobs, getJobs, getJob } = require("../controllers/jobMatch.controller");

router.use(protect);

// FIX: /match/:resumeId MUST be registered before /:id
// Without this, Express matches "match" as the :id param and
// calls getJob("match") which returns 404 — matchJobs never runs.
router.get("/match/:resumeId", matchJobs);   // ← must be first
router.get("/",                getJobs);
router.get("/:id",             getJob);      // ← must be last (catches everything)

module.exports = router;