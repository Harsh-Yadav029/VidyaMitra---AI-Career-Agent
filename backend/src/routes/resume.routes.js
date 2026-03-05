// ============================================================
//  VidyaMitra — routes/resume.routes.js  (Phase 2 updated)
// ============================================================

const express = require("express");
const {
  uploadResume, reparseResume, getResumes, getResume, deleteResume
} = require("../controllers/resume.controller");
const { protect } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const router = express.Router();
router.use(protect);

router.post("/upload", upload.single("resume"), uploadResume);
router.post("/:id/reparse", reparseResume);
router.get("/", getResumes);
router.get("/:id", getResume);
router.delete("/:id", deleteResume);

module.exports = router;
