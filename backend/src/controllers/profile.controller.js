// ============================================================
//  VidyaMitra — controllers/profile.controller.js
//  Profile: get + update user profile, change password, notifications
// ============================================================

const User    = require("../models/User.model");
const Resume  = require("../models/Resume.model");
const logger  = require("../config/logger");

// ── GET /api/auth/profile ────────────────────────────────────
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const resumes = await Resume.find({ userId: req.user._id }).select("label isParsed parsedData createdAt");

    res.status(200).json({
      success: true,
      user,
      stats: { resumeCount: resumes.length },
    });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/auth/profile ─────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const allowed = [
      "name", "phone", "location", "bio",
      "targetRole", "experienceLevel",
      "linkedinUrl", "githubUrl", "portfolioUrl",
      "currentSkills", "preferredJobTypes", "preferredLocations",
      // aliases sent by ProfilePage.jsx
      "linkedin", "github", "website", "skills",
    ];

    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    // Map frontend aliases → schema field names
    if (updates.linkedin !== undefined) { updates.linkedinUrl  = updates.linkedin; delete updates.linkedin; }
    if (updates.github   !== undefined) { updates.githubUrl    = updates.github;   delete updates.github;   }
    if (updates.website  !== undefined) { updates.portfolioUrl = updates.website;  delete updates.website;  }
    if (updates.skills   !== undefined) { updates.currentSkills = updates.skills;  delete updates.skills;   }

    // Validate skills array
    if (updates.currentSkills !== undefined) {
      if (!Array.isArray(updates.currentSkills)) {
        return res.status(400).json({ success: false, message: "Skills must be an array." });
      }
      updates.currentSkills = updates.currentSkills
        .map(s => String(s).trim())
        .filter(Boolean)
        .slice(0, 50);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields to update." });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    logger.info(`Profile updated for user: ${req.user._id}`);
    res.status(200).json({ success: true, message: "Profile updated successfully.", user });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/auth/change-password ─────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both currentPassword and newPassword are required.",
      });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters.",
      });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    if (user.authProvider && user.authProvider !== "local") {
      return res.status(400).json({
        success: false,
        message: "Google accounts cannot use password change. Manage your password via Google.",
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect." });
    }

    user.password = newPassword;
    await user.save();

    logger.info(`Password changed for user: ${req.user._id}`);
    res.status(200).json({ success: true, message: "Password changed successfully." });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/auth/notifications ───────────────────────────────
const updateNotifications = async (req, res, next) => {
  try {
    const { preferences } = req.body;

    if (!preferences || typeof preferences !== "object") {
      return res.status(400).json({
        success: false,
        message: "preferences object is required.",
      });
    }

    const ALLOWED_KEYS = ["emailJobs", "emailScore", "emailInterview", "emailMarketing", "pushAll"];
    const sanitized = {};
    ALLOWED_KEYS.forEach((key) => {
      if (key in preferences) sanitized[key] = Boolean(preferences[key]);
    });

    await User.findByIdAndUpdate(
      req.user._id,
      { $set: { notificationPrefs: sanitized } },
      { new: true, runValidators: false }
    );

    logger.info(`Notification prefs updated for user: ${req.user._id}`);
    res.status(200).json({
      success: true,
      message: "Notification preferences saved.",
      preferences: sanitized,
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/auth/profile/suggest-role ───────────────────────
const suggestTargetRole = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id, isParsed: true })
      .select("label parsedData score")
      .sort({ createdAt: -1 });

    if (!resumes.length) {
      return res.status(200).json({ success: true, suggestion: null, message: "No parsed resumes found." });
    }

    const best = resumes.find(r => r.score) || resumes[0];
    const skills = best?.parsedData?.skills || [];
    const normalizedSkills = skills.map(s =>
      (typeof s === "string" ? s : s.name || "").toLowerCase()
    );

    const roleSignals = {
      "Full Stack Developer":  ["react","node","nodejs","mongodb","express","javascript","fullstack","mern"],
      "Frontend Developer":    ["react","vue","angular","html","css","typescript","redux","figma","ui"],
      "Backend Developer":     ["node","nodejs","express","java","python","django","postgresql","redis","api","microservices"],
      "Data Scientist":        ["python","machine learning","tensorflow","pytorch","pandas","numpy","sql","statistics","ml"],
      "DevOps Engineer":       ["docker","kubernetes","aws","ci/cd","linux","terraform","jenkins","devops","cloud"],
      "React Developer":       ["react","redux","hooks","jsx","webpack","nextjs","typescript"],
      "MERN Stack Developer":  ["mongodb","express","react","node","javascript","mern"],
      "Android Developer":     ["android","kotlin","java","android studio","firebase","mobile"],
      "iOS Developer":         ["swift","ios","xcode","objective-c","cocoa","apple"],
      "UI/UX Designer":        ["figma","sketch","adobe xd","wireframing","prototyping","user research","ui","ux"],
    };

    const scores = {};
    Object.entries(roleSignals).forEach(([role, signals]) => {
      scores[role] = signals.filter(sig =>
        normalizedSkills.some(sk => sk.includes(sig) || sig.includes(sk))
      ).length;
    });

    const topRole = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .find(([, score]) => score > 0);

    if (!topRole) {
      return res.status(200).json({ success: true, suggestion: null });
    }

    res.status(200).json({
      success: true,
      suggestion: {
        role: topRole[0],
        confidence: Math.min(100, Math.round((topRole[1] / roleSignals[topRole[0]].length) * 100)),
        basedOn: best.label || "Your resume",
        topSkills: skills.slice(0, 5).map(s => typeof s === "string" ? s : s.name),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  updateNotifications,
  suggestTargetRole,
};