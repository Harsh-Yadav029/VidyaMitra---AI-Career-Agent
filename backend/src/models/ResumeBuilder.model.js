// ============================================================
//  VidyaMitra — models/ResumeBuilder.model.js
//  Stores user-built resumes (created from scratch in the UI)
// ============================================================

const mongoose = require("mongoose");

const resumeBuilderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: { type: String, default: "My Resume" },
    template: {
      type: String,
      enum: ["modern", "classic", "minimal", "bold"],
      default: "modern",
    },

    // ── Sections ───────────────────────────────────────────
    personalInfo: {
      fullName:   { type: String, default: "" },
      email:      { type: String, default: "" },
      phone:      { type: String, default: "" },
      location:   { type: String, default: "" },
      linkedin:   { type: String, default: "" },
      github:     { type: String, default: "" },
      portfolio:  { type: String, default: "" },
      summary:    { type: String, default: "" },
    },

    experience: [
      {
        company:     { type: String, default: "" },
        role:        { type: String, default: "" },
        location:    { type: String, default: "" },
        startDate:   { type: String, default: "" },
        endDate:     { type: String, default: "" },
        isCurrent:   { type: Boolean, default: false },
        description: { type: String, default: "" },
        bullets:     [{ type: String }],
      },
    ],

    education: [
      {
        institution: { type: String, default: "" },
        degree:      { type: String, default: "" },
        field:       { type: String, default: "" },
        startDate:   { type: String, default: "" },
        endDate:     { type: String, default: "" },
        gpa:         { type: String, default: "" },
        activities:  { type: String, default: "" },
      },
    ],

    skills: [
      {
        category: { type: String, default: "Technical" },
        items:    [{ type: String }],
      },
    ],

    projects: [
      {
        name:        { type: String, default: "" },
        description: { type: String, default: "" },
        techStack:   [{ type: String }],
        liveUrl:     { type: String, default: "" },
        githubUrl:   { type: String, default: "" },
        startDate:   { type: String, default: "" },
        endDate:     { type: String, default: "" },
      },
    ],

    certifications: [
      {
        name:   { type: String, default: "" },
        issuer: { type: String, default: "" },
        date:   { type: String, default: "" },
        url:    { type: String, default: "" },
      },
    ],

    languages: [
      {
        language:    { type: String, default: "" },
        proficiency: { type: String, default: "Intermediate" },
      },
    ],

    // ── Meta ───────────────────────────────────────────────
    isPublished: { type: Boolean, default: false },
    lastEditedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
  }
);

resumeBuilderSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("ResumeBuilder", resumeBuilderSchema);