// ============================================================
//  VidyaMitra — controllers/resume.controller.js
//  Phase 2 Update: triggers parser after upload
// ============================================================

const path = require("path");
const fs = require("fs");
const Resume = require("../models/Resume.model");
const User = require("../models/User.model");
const { parseResume } = require("../services/parser/resumeParser");
const logger = require("../config/logger");

const UPLOAD_DIR = path.join(__dirname, "../../uploads/resumes");

// ── POST /api/resumes/upload ──────────────────────────────────
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Please attach a PDF or DOCX file.",
      });
    }

    const { originalname, filename, size, mimetype } = req.file;
    const label = req.body.label || path.parse(originalname).name;
    const filePath = path.join(UPLOAD_DIR, filename);

    // ── Step 1: Save resume record immediately ───────────────
    const resume = await Resume.create({
      userId: req.user._id,
      originalName: originalname,
      fileName: filename,
      fileSize: size,
      mimeType: mimetype,
      fileUrl: `/uploads/resumes/${filename}`,
      label,
    });

    await User.findByIdAndUpdate(req.user._id, {
      $push: { resumes: resume._id },
    });

    // ── Step 2: Parse resume (async, non-blocking response) ───
    res.status(201).json({
      success: true,
      message: "Resume uploaded! Parsing in progress...",
      resume: {
        _id: resume._id,
        label: resume.label,
        originalName: resume.originalName,
        fileSize: resume.fileSize,
        isParsed: false,
        createdAt: resume.createdAt,
      },
    });

    // ── Step 3: Run parser and update record ──────────────────
    try {
      const { parsedData } = await parseResume(filePath, mimetype);

      // ✅ FIX: Single $set update — no conflict between parsedData and parsedData.rawText
      await Resume.findByIdAndUpdate(resume._id, {
        $set: {
          parsedData,
          isParsed: true,
        },
      });

      // Auto-fill user profile if fields are empty
      const user = await User.findById(req.user._id);
      const updates = {};
      if (!user.phone && parsedData.phone) updates.phone = parsedData.phone;
      if (!user.location && parsedData.location) updates.location = parsedData.location;
      if (!user.currentSkills?.length && parsedData.skills?.length) {
        updates.currentSkills = parsedData.skills.slice(0, 20);
      }
      if (Object.keys(updates).length > 0) {
        await User.findByIdAndUpdate(req.user._id, { $set: updates });
      }

      logger.info(`✅ Resume parsed and saved: ${resume._id}`);
    } catch (parseError) {
      logger.error(`Resume parsing failed for ${resume._id}: ${parseError.message}`);
      await Resume.findByIdAndUpdate(resume._id, {
        $set: {
          isParsed: false,
          "parsedData.rawText": `PARSE_ERROR: ${parseError.message}`,
        },
      });
    }

  } catch (error) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(error);
  }
};

// ── POST /api/resumes/:id/reparse ─────────────────────────────
const reparseResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found." });

    const filePath = path.join(UPLOAD_DIR, resume.fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "Resume file not found on server." });
    }

    const { parsedData } = await parseResume(filePath, resume.mimeType);

    // ✅ FIX: Use $set consistently
    await Resume.findByIdAndUpdate(resume._id, {
      $set: { parsedData, isParsed: true },
    });

    const updated = await Resume.findById(resume._id);
    res.status(200).json({ success: true, message: "Resume re-parsed successfully.", resume: updated });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/resumes ──────────────────────────────────────────
const getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .select("-parsedData.rawText")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: resumes.length, resumes });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/resumes/:id ──────────────────────────────────────
const getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found." });
    res.status(200).json({ success: true, resume });
  } catch (error) {
    next(error);
  }
};

// ── DELETE /api/resumes/:id ───────────────────────────────────
const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found." });

    const filePath = path.join(UPLOAD_DIR, resume.fileName);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await resume.deleteOne();
    await User.findByIdAndUpdate(req.user._id, { $pull: { resumes: resume._id } });

    res.status(200).json({ success: true, message: "Resume deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadResume, reparseResume, getResumes, getResume, deleteResume };