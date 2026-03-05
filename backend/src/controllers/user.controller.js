// ============================================================
//  VidyaMitra — controllers/user.controller.js
//  Handles: getProfile, updateProfile, updateSkills, deleteAccount
// ============================================================

const { validationResult } = require("express-validator");
const User = require("../models/User.model");
const Resume = require("../models/Resume.model");
const logger = require("../config/logger");

// ── GET /api/users/profile ────────────────────────────────────
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("resumes", "label scores isParsed isScored createdAt");

    res.status(200).json({
      success: true,
      user: {
        ...user.toPublicJSON(),
        profileCompleteness: user.profileCompleteness,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── PATCH /api/users/profile ──────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }

    const allowedFields = [
      "name", "phone", "location", "linkedinUrl", "githubUrl",
      "portfolioUrl", "targetRole", "targetIndustry", "experienceLevel", "careerSummary",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    logger.info(`Profile updated: ${user.email}`);
    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// ── PATCH /api/users/skills ───────────────────────────────────
const updateSkills = async (req, res, next) => {
  try {
    const { skills } = req.body;

    if (!Array.isArray(skills)) {
      return res.status(400).json({ success: false, message: "Skills must be an array." });
    }

    // Clean and deduplicate
    const cleanedSkills = [...new Set(skills.map((s) => s.trim()).filter(Boolean))];

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { currentSkills: cleanedSkills } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Skills updated. ${cleanedSkills.length} skill(s) saved.`,
      skills: user.currentSkills,
    });
  } catch (error) {
    next(error);
  }
};

// ── DELETE /api/users/account ─────────────────────────────────
const deleteAccount = async (req, res, next) => {
  try {
    // Soft delete: mark inactive
    await User.findByIdAndUpdate(req.user._id, { isActive: false });
    // Also delete all resumes
    await Resume.deleteMany({ userId: req.user._id });

    logger.info(`Account deactivated: ${req.user.email}`);
    res.status(200).json({
      success: true,
      message: "Account has been deactivated. Your data will be removed within 30 days.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, updateSkills, deleteAccount };
