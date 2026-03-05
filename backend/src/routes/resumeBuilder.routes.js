// ============================================================
//  VidyaMitra — routes/resumeBuilder.routes.js
// ============================================================

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const {
  listBuiltResumes,
  createBuiltResume,
  getBuiltResume,
  saveBuiltResume,
  deleteBuiltResume,
  duplicateBuiltResume,
} = require("../controllers/resumeBuilder.controller");

router.get("/",                    protect, listBuiltResumes);
router.post("/",                   protect, createBuiltResume);
router.get("/:id",                 protect, getBuiltResume);
router.put("/:id",                 protect, saveBuiltResume);
router.delete("/:id",              protect, deleteBuiltResume);
router.patch("/:id/duplicate",     protect, duplicateBuiltResume);

module.exports = router;