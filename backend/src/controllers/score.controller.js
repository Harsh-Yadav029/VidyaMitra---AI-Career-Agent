// ============================================================
//  VidyaMitra — controllers/score.controller.js
//  Handles: score resume, get score, compare resumes
// ============================================================

const Resume = require("../models/Resume.model");
const { scoreResume } = require("../services/scorer/resumeScorer");
const logger = require("../config/logger");
const { sendScoreReportEmail } = require("../services/email/emailService");

// ── POST /api/scores/:resumeId ────────────────────────────────
const scoreResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.resumeId,
      userId: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found." });
    }

    if (!resume.isParsed) {
      return res.status(400).json({
        success: false,
        message: "Resume has not been parsed yet. Please wait a moment and try again.",
      });
    }

    const jobDescription = req.body.jobDescription || null;

    logger.info(`Scoring resume ${resume._id} for user ${req.user._id}`);

    const scoreReport = await scoreResume(resume.parsedData, jobDescription);

    await Resume.findByIdAndUpdate(resume._id, {
      "scores.overall": scoreReport.scores.overall,
      "scores.ats": scoreReport.scores.ats,
      "scores.impact": scoreReport.scores.impact,
      "scores.completeness": scoreReport.scores.completeness,
      "scores.readability": scoreReport.scores.readability,
      "scores.skillMatch": scoreReport.scores.skillMatch,
      "scores.lastScoredAt": new Date(),
      isScored: true,
      ...(jobDescription && { targetJobDescription: jobDescription }),
    });

    // Fire-and-forget score report email
    sendScoreReportEmail(req.user, resume.label, scoreReport.scores).catch((err) =>
      logger.warn(`Score email failed for user ${req.user._id}: ${err.message}`)
    );

    res.status(200).json({
      success: true,
      message: "Resume scored successfully!",
      resumeId: resume._id,
      candidateName: resume.parsedData?.fullName,
      scoreReport,
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/scores/:resumeId ─────────────────────────────────
const getScore = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.resumeId,
      userId: req.user._id,
    }).select("scores label parsedData.fullName parsedData.skills isScored");

    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found." });
    }

    if (!resume.isScored) {
      return res.status(400).json({
        success: false,
        message: "This resume has not been scored yet. POST to /api/scores/:resumeId to score it.",
      });
    }

    res.status(200).json({ success: true, scores: resume.scores, label: resume.label });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/scores/compare ──────────────────────────────────
const compareResumes = async (req, res, next) => {
  try {
    const { resumeId1, resumeId2, jobDescription } = req.body;

    if (!resumeId1 || !resumeId2) {
      return res.status(400).json({ success: false, message: "Both resumeId1 and resumeId2 are required." });
    }

    const [resume1, resume2] = await Promise.all([
      Resume.findOne({ _id: resumeId1, userId: req.user._id }),
      Resume.findOne({ _id: resumeId2, userId: req.user._id }),
    ]);

    if (!resume1 || !resume2) {
      return res.status(404).json({ success: false, message: "One or both resumes not found." });
    }

    if (!resume1.isParsed || !resume2.isParsed) {
      return res.status(400).json({ success: false, message: "Both resumes must be parsed before comparing." });
    }

    const [score1, score2] = await Promise.all([
      scoreResume(resume1.parsedData, jobDescription),
      scoreResume(resume2.parsedData, jobDescription),
    ]);

    const winner = score1.scores.overall >= score2.scores.overall ? resumeId1 : resumeId2;

    res.status(200).json({
      success: true,
      comparison: {
        resume1: { id: resumeId1, label: resume1.label, scores: score1.scores, labels: score1.labels },
        resume2: { id: resumeId2, label: resume2.label, scores: score2.scores, labels: score2.labels },
        winner,
        difference: {
          overall: score1.scores.overall - score2.scores.overall,
          ats: score1.scores.ats - score2.scores.ats,
          impact: score1.scores.impact - score2.scores.impact,
          completeness: score1.scores.completeness - score2.scores.completeness,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/scores/:resumeId/tips ────────────────────────────
const getQuickTips = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.resumeId, userId: req.user._id });
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found." });
    if (!resume.isParsed) return res.status(400).json({ success: false, message: "Resume not parsed yet." });

    const scoreReport = await scoreResume(resume.parsedData, null);

    res.status(200).json({
      success: true,
      overallScore: scoreReport.scores.overall,
      topTips: scoreReport.allTips.slice(0, 5),
      topIssues: scoreReport.allIssues.slice(0, 5),
      encouragement: scoreReport.aiFeedback?.encouragement,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { scoreResumeById, getScore, compareResumes, getQuickTips };