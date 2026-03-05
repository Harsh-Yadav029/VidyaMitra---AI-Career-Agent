// ============================================================
//  VidyaMitra — models/JobApplication.model.js
//  Tracks job applications with full status history
// ============================================================

const mongoose = require("mongoose");

const timelineEventSchema = new mongoose.Schema(
  {
    status:  { type: String, required: true },
    note:    { type: String, default: "" },
    date:    { type: Date, default: Date.now },
  },
  { _id: true }
);

const jobApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ── Job Info ───────────────────────────────────────────
    company:        { type: String, required: true, trim: true },
    role:           { type: String, required: true, trim: true },
    location:       { type: String, default: "" },
    jobType:        { type: String, enum: ["full-time", "part-time", "internship", "contract", "freelance", ""], default: "" },
    salary:         { type: String, default: "" },
    jobUrl:         { type: String, default: "" },
    jobDescription: { type: String, default: "" },
    source:         { type: String, default: "" }, // LinkedIn, Naukri, Direct, etc.

    // ── Status ─────────────────────────────────────────────
    status: {
      type: String,
      enum: ["saved", "applied", "screening", "interview", "offer", "rejected", "withdrawn", "accepted"],
      default: "saved",
      index: true,
    },

    // ── Dates ──────────────────────────────────────────────
    appliedDate:    { type: Date, default: null },
    deadlineDate:   { type: Date, default: null },
    nextFollowUp:   { type: Date, default: null },

    // ── Details ────────────────────────────────────────────
    contactName:    { type: String, default: "" },
    contactEmail:   { type: String, default: "" },
    resumeUsed:     { type: mongoose.Schema.Types.ObjectId, ref: "Resume", default: null },
    coverLetter:    { type: String, default: "" },
    notes:          { type: String, default: "" },
    priority:       { type: String, enum: ["low", "medium", "high"], default: "medium" },
    isFavorite:     { type: Boolean, default: false },

    // ── Timeline ───────────────────────────────────────────
    timeline: [timelineEventSchema],

    // ── Interview details ──────────────────────────────────
    interviewRounds: [
      {
        round:    { type: String, default: "" },  // "HR Round", "Technical 1"
        date:     { type: Date, default: null },
        mode:     { type: String, default: "" },  // "Video", "Phone", "Onsite"
        notes:    { type: String, default: "" },
        outcome:  { type: String, default: "" },  // "Passed", "Pending", "Rejected"
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
  }
);

jobApplicationSchema.index({ userId: 1, status: 1 });
jobApplicationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("JobApplication", jobApplicationSchema);