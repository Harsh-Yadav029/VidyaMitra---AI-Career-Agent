// ============================================================
//  VidyaMitra — controllers/resumeBuilder.controller.js
//  CRUD for user-built resumes
// ============================================================

const ResumeBuilder = require("../models/ResumeBuilder.model");
const logger = require("../config/logger");

// ── GET /api/builder ─────────────────────────────────────────
// List all built resumes for the logged-in user
const listBuiltResumes = async (req, res, next) => {
  try {
    const resumes = await ResumeBuilder.find({ userId: req.user._id })
      .select("title template isPublished lastEditedAt createdAt personalInfo.fullName")
      .sort({ lastEditedAt: -1 });

    res.status(200).json({ success: true, count: resumes.length, resumes });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/builder ────────────────────────────────────────
// Create a new blank (or pre-filled) resume
const createBuiltResume = async (req, res, next) => {
  try {
    const { title, template, personalInfo } = req.body;

    const resume = await ResumeBuilder.create({
      userId: req.user._id,
      title: title || "My Resume",
      template: template || "modern",
      personalInfo: personalInfo || {},
    });

    logger.info(`ResumeBuilder: created ${resume._id} for user ${req.user._id}`);
    res.status(201).json({ success: true, message: "Resume created!", resume });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/builder/:id ─────────────────────────────────────
// Get a single built resume (full data)
const getBuiltResume = async (req, res, next) => {
  try {
    const resume = await ResumeBuilder.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found." });
    }

    res.status(200).json({ success: true, resume });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/builder/:id ─────────────────────────────────────
// Full save / auto-save of a built resume
const saveBuiltResume = async (req, res, next) => {
  try {
    const {
      title, template, personalInfo,
      experience, education, skills,
      projects, certifications, languages,
    } = req.body;

    const resume = await ResumeBuilder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        $set: {
          ...(title        !== undefined && { title }),
          ...(template     !== undefined && { template }),
          ...(personalInfo !== undefined && { personalInfo }),
          ...(experience   !== undefined && { experience }),
          ...(education    !== undefined && { education }),
          ...(skills       !== undefined && { skills }),
          ...(projects     !== undefined && { projects }),
          ...(certifications !== undefined && { certifications }),
          ...(languages    !== undefined && { languages }),
          lastEditedAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    );

    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found." });
    }

    res.status(200).json({ success: true, message: "Saved!", resume });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/builder/:id ──────────────────────────────────
const deleteBuiltResume = async (req, res, next) => {
  try {
    const resume = await ResumeBuilder.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found." });
    }

    logger.info(`ResumeBuilder: deleted ${req.params.id} for user ${req.user._id}`);
    res.status(200).json({ success: true, message: "Resume deleted." });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/builder/:id/duplicate ────────────────────────
const duplicateBuiltResume = async (req, res, next) => {
  try {
    const original = await ResumeBuilder.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!original) {
      return res.status(404).json({ success: false, message: "Resume not found." });
    }

    const copy = await ResumeBuilder.create({
      userId: req.user._id,
      title: `${original.title} (Copy)`,
      template: original.template,
      personalInfo: original.personalInfo,
      experience: original.experience,
      education: original.education,
      skills: original.skills,
      projects: original.projects,
      certifications: original.certifications,
      languages: original.languages,
    });

    res.status(201).json({ success: true, message: "Resume duplicated!", resume: copy });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listBuiltResumes,
  createBuiltResume,
  getBuiltResume,
  saveBuiltResume,
  deleteBuiltResume,
  duplicateBuiltResume,
};