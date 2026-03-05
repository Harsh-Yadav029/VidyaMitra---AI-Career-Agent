// ============================================================
//  VidyaMitra — controllers/jobMatch.controller.js
// ============================================================

const { matchJobsToResume, getJobById, getAllJobs } = require("../services/jobMatcher/jobMatcher");
const { sendJobMatchEmail } = require("../services/email/emailService");
const Resume = require("../models/Resume.model");
const logger = require("../config/logger");

// ── GET /api/jobs/match/:resumeId ─────────────────────────────
const matchJobs = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id:    req.params.resumeId,
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

    const { targetRole, limit = 10, minScore = 10 } = req.query;

    const results = matchJobsToResume(resume.parsedData, {
      targetRole:  targetRole || null,
      limit:       Math.min(parseInt(limit)    || 10, 20),
      minScore:    parseInt(minScore) || 10,
    });

    logger.info(`Job matching complete for resume ${resume._id}: ${results.matchesFound} matches`);

    if (results.topMatches?.length > 0) {
      sendJobMatchEmail(
        req.user,
        targetRole || resume.parsedData?.targetRole || "your profile",
        results.topMatches
      ).catch(err => logger.warn(`Job match email failed for user ${req.user._id}: ${err.message}`));
    }

    res.status(200).json({ success: true, ...results });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/jobs ──────────────────────────────────────────────
const getJobs = async (req, res, next) => {
  try {
    const { location, type, experience } = req.query;

    const jobs = getAllJobs({ location, type, experience });

    res.status(200).json({
      success: true,
      count:   jobs.length,
      jobs:    jobs.map(j => ({
        id:          j.id,
        title:       j.title,
        company:     j.company,
        location:    j.location,
        type:        j.type,
        experience:  j.experience,
        salary:      j.salary,
        skills:      j.skills,
        postedDays:  j.postedDays,
        tags:        j.tags,
        description: j.description,   // FIX: was stripped — needed for card preview
        applyUrl:    j.applyUrl,       // FIX: was stripped — caused "site can't be reached"
      })),
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/jobs/:id ─────────────────────────────────────────
const getJob = async (req, res, next) => {
  try {
    const job = getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }
    res.status(200).json({ success: true, job });
  } catch (error) {
    next(error);
  }
};

module.exports = { matchJobs, getJobs, getJob };