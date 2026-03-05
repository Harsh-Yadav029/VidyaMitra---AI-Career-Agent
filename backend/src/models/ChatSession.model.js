// ============================================================
//  VidyaMitra — models/ChatSession.model.js
//  Stores career agent conversation sessions & history
// ============================================================

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    // Optional metadata per message
    meta: {
      tokensUsed: { type: Number, default: null },
      isAIGenerated: { type: Boolean, default: true },
      intent: { type: String, default: null }, // e.g. "skill_gap", "interview_prep"
    },
  },
  { _id: false }
);

const chatSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ── Active resume context ──────────────────────────────
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      default: null,
    },

    // ── Session info ───────────────────────────────────────
    title: {
      type: String,
      default: "Career Chat",
      maxlength: 100,
    },
    sessionType: {
      type: String,
      enum: ["general", "skill_gap", "interview_prep", "career_path", "resume_review"],
      default: "general",
    },

    // ── Conversation history ───────────────────────────────
    messages: [messageSchema],

    // ── Context summary (for long conversations) ──────────
    contextSummary: {
      type: String,
      default: null, // AI-generated summary of conversation so far
    },

    // ── User's career context snapshot ────────────────────
    userContext: {
      targetRole: { type: String, default: null },
      currentSkills: [{ type: String }],
      yearsOfExperience: { type: Number, default: 0 },
      overallScore: { type: Number, default: null },
    },

    // ── Session stats ──────────────────────────────────────
    messageCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    lastMessageAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
  }
);

chatSessionSchema.index({ userId: 1, createdAt: -1 });
chatSessionSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model("ChatSession", chatSessionSchema);
