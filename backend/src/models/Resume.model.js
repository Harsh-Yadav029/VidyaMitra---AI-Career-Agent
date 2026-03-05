// ============================================================
//  VidyaMitra — models/Resume.model.js
//  Mongoose schema for uploaded and parsed resumes
// ============================================================

const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ── File Info ──────────────────────────────────────────
    originalName: { type: String, required: true },
    fileName: { type: String, required: true },      // stored file name (uuid)
    fileSize: { type: Number },                       // bytes
    mimeType: { type: String },                       // application/pdf etc.
    fileUrl: { type: String, default: null },         // S3 or local path

    // ── Parsed Data (filled by AI parser in Phase 2) ───────
    parsedData: {
      fullName: { type: String, default: null },
      email: { type: String, default: null },
      phone: { type: String, default: null },
      location: { type: String, default: null },
      linkedinUrl: { type: String, default: null },
      githubUrl: { type: String, default: null },
      summary: { type: String, default: null },
      skills: [{ type: String }],
      experience: [
        {
          company: String,
          role: String,
          duration: String,
          description: String,
          startDate: Date,
          endDate: Date,
          isCurrent: Boolean,
        },
      ],
      education: [
        {
          institution: String,
          degree: String,
          field: String,
          year: String,
          gpa: String,
        },
      ],
      certifications: [{ name: String, issuer: String, year: String }],
      projects: [{ name: String, description: String, techStack: [String], url: String }],
      languages: [{ language: String, proficiency: String }],
      rawText: { type: String, default: null },       // full extracted text
    },

    // ── Score Data (filled by AI scorer in Phase 3) ────────
    scores: {
      overall: { type: Number, default: null },
      ats: { type: Number, default: null },
      skillMatch: { type: Number, default: null },
      impact: { type: Number, default: null },
      completeness: { type: Number, default: null },
      readability: { type: Number, default: null },
      lastScoredAt: { type: Date, default: null },
    },

    // ── Meta ───────────────────────────────────────────────
    label: { type: String, default: "Untitled Resume" },  // user-given label
    version: { type: Number, default: 1 },
    isParsed: { type: Boolean, default: false },
    isScored: { type: Boolean, default: false },
    targetJobDescription: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
  }
);

resumeSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Resume", resumeSchema);
