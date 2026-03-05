// ============================================================
//  VidyaMitra — controllers/jobApplication.controller.js
// ============================================================

const JobApplication = require("../models/JobApplication.model");
const logger = require("../config/logger");

// ── GET /api/applications ─────────────────────────────────────
const listApplications = async (req, res, next) => {
  try {
    const { status, priority, search, sort = "createdAt", order = "desc" } = req.query;

    const filter = { userId: req.user._id };
    if (status)   filter.status   = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { company: { $regex: search, $options: "i" } },
        { role:    { $regex: search, $options: "i" } },
      ];
    }

    const sortObj = { [sort]: order === "asc" ? 1 : -1 };

    const applications = await JobApplication.find(filter)
      .select("-jobDescription -coverLetter -timeline -interviewRounds")
      .sort(sortObj)
      .limit(100);

    // Stats summary
    const all = await JobApplication.find({ userId: req.user._id }).select("status");
    const stats = {
      total:      all.length,
      saved:      all.filter(a => a.status === "saved").length,
      applied:    all.filter(a => a.status === "applied").length,
      screening:  all.filter(a => a.status === "screening").length,
      interview:  all.filter(a => a.status === "interview").length,
      offer:      all.filter(a => a.status === "offer").length,
      rejected:   all.filter(a => a.status === "rejected").length,
      accepted:   all.filter(a => a.status === "accepted").length,
    };

    res.status(200).json({ success: true, count: applications.length, applications, stats });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/applications ────────────────────────────────────
const createApplication = async (req, res, next) => {
  try {
    const {
      company, role, location, jobType, salary, jobUrl,
      jobDescription, source, status, appliedDate, deadlineDate,
      nextFollowUp, contactName, contactEmail, resumeUsed,
      coverLetter, notes, priority, isFavorite,
    } = req.body;

    if (!company || !role) {
      return res.status(400).json({ success: false, message: "Company and role are required." });
    }

    const application = await JobApplication.create({
      userId: req.user._id,
      company, role, location, jobType, salary, jobUrl,
      jobDescription, source, priority, isFavorite, coverLetter, notes,
      contactName, contactEmail, resumeUsed: resumeUsed || null,
      status: status || "saved",
      appliedDate:  appliedDate  ? new Date(appliedDate)  : null,
      deadlineDate: deadlineDate ? new Date(deadlineDate) : null,
      nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null,
      timeline: [{ status: status || "saved", note: "Application created", date: new Date() }],
    });

    logger.info(`Application created: ${company} — ${role} for user ${req.user._id}`);
    res.status(201).json({ success: true, message: "Application added!", application });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/applications/:id ─────────────────────────────────
const getApplication = async (req, res, next) => {
  try {
    const application = await JobApplication.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("resumeUsed", "label originalName");

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }

    res.status(200).json({ success: true, application });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/applications/:id ─────────────────────────────────
const updateApplication = async (req, res, next) => {
  try {
    const existing = await JobApplication.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }

    const {
      company, role, location, jobType, salary, jobUrl,
      jobDescription, source, status, appliedDate, deadlineDate,
      nextFollowUp, contactName, contactEmail, resumeUsed,
      coverLetter, notes, priority, isFavorite,
    } = req.body;

    // If status changed, append to timeline
    if (status && status !== existing.status) {
      existing.timeline.push({
        status,
        note: req.body.statusNote || `Moved to ${status}`,
        date: new Date(),
      });
    }

    // Apply updates
    const fields = {
      company, role, location, jobType, salary, jobUrl,
      jobDescription, source, priority, isFavorite, coverLetter, notes,
      contactName, contactEmail,
    };
    Object.entries(fields).forEach(([k, v]) => { if (v !== undefined) existing[k] = v; });

    if (status)       existing.status      = status;
    if (resumeUsed)   existing.resumeUsed  = resumeUsed;
    if (appliedDate)  existing.appliedDate  = new Date(appliedDate);
    if (deadlineDate) existing.deadlineDate = new Date(deadlineDate);
    if (nextFollowUp) existing.nextFollowUp = new Date(nextFollowUp);

    await existing.save();

    res.status(200).json({ success: true, message: "Updated!", application: existing });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/applications/:id ──────────────────────────────
const deleteApplication = async (req, res, next) => {
  try {
    const application = await JobApplication.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }

    res.status(200).json({ success: true, message: "Application deleted." });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/applications/:id/status ───────────────────────
const updateStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required." });
    }

    const application = await JobApplication.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }

    application.timeline.push({ status, note: note || `Moved to ${status}`, date: new Date() });
    application.status = status;
    if (status === "applied" && !application.appliedDate) {
      application.appliedDate = new Date();
    }

    await application.save();
    res.status(200).json({ success: true, message: "Status updated!", application });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/applications/:id/interviews ────────────────────
const addInterviewRound = async (req, res, next) => {
  try {
    const { round, date, mode, notes, outcome } = req.body;

    const application = await JobApplication.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }

    application.interviewRounds.push({
      round: round || "Interview",
      date: date ? new Date(date) : null,
      mode: mode || "",
      notes: notes || "",
      outcome: outcome || "Pending",
    });

    // Auto-update status to interview
    if (application.status === "applied" || application.status === "screening") {
      application.status = "interview";
      application.timeline.push({ status: "interview", note: `${round || "Interview"} scheduled`, date: new Date() });
    }

    await application.save();
    res.status(201).json({ success: true, message: "Interview round added!", application });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/applications/stats ───────────────────────────────
const getStats = async (req, res, next) => {
  try {
    const all = await JobApplication.find({ userId: req.user._id })
      .select("status priority appliedDate createdAt company");

    const total = all.length;
    const byStatus = {};
    const byPriority = { low: 0, medium: 0, high: 0 };

    all.forEach(a => {
      byStatus[a.status] = (byStatus[a.status] || 0) + 1;
      if (a.priority) byPriority[a.priority]++;
    });

    const responseRate = total > 0
      ? Math.round(((byStatus.screening || 0) + (byStatus.interview || 0) + (byStatus.offer || 0) + (byStatus.accepted || 0)) / total * 100)
      : 0;

    const offerRate = total > 0
      ? Math.round(((byStatus.offer || 0) + (byStatus.accepted || 0)) / total * 100)
      : 0;

    // Applications per week (last 8 weeks)
    const now = new Date();
    const weeklyData = Array.from({ length: 8 }, (_, i) => {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (7 * (7 - i)));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      return {
        week: `W${i + 1}`,
        count: all.filter(a => a.createdAt >= weekStart && a.createdAt < weekEnd).length,
      };
    });

    res.status(200).json({
      success: true,
      stats: { total, byStatus, byPriority, responseRate, offerRate, weeklyData },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listApplications,
  createApplication,
  getApplication,
  updateApplication,
  deleteApplication,
  updateStatus,
  addInterviewRound,
  getStats,
};