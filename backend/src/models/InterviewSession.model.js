// ============================================================
//  VidyaMitra — models/InterviewSession.model.js
//  Stores interview sessions, questions, answers, evaluations
// ============================================================

const mongoose = require("mongoose");

const evaluationSchema = new mongoose.Schema({
  score: { type: Number, min: 0, max: 100 },
  grade: { type: String, enum: ["A", "B", "C", "D", "F"] },
  wordCount: Number,
  starAnalysis: {
    situation: Boolean,
    task: Boolean,
    action: Boolean,
    result: Boolean,
  },
  strengths: [String],
  improvements: [String],
  modelStructure: mongoose.Schema.Types.Mixed,
  breakdown: {
    starMethodScore: Number,
    qualityScore: Number,
    lengthScore: Number,
    technicalScore: Number,
    penalty: Number,
  },
}, { _id: false });

const questionSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  questionText: { type: String, required: true },
  category: { type: String, enum: ["behavioral", "technical", "situational", "hr"] },
  difficulty: { type: String, enum: ["easy", "medium", "hard"] },
  tags: [String],
  orderIndex: Number,
  starGuide: mongoose.Schema.Types.Mixed,
  keyPoints: [String],
  answer: { type: String, default: null },
  answeredAt: { type: Date, default: null },
  isAnswered: { type: Boolean, default: false },
  evaluation: { type: evaluationSchema, default: null },
}, { _id: false });

const summarySchema = new mongoose.Schema({
  averageScore: Number,
  grade: String,
  totalQuestions: Number,
  sessionStrengths: [String],
  sessionImprovements: [String],
  readyForInterview: Boolean,
  recommendation: String,
}, { _id: false });

const interviewSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Resume",
    default: null,
  },
  targetRole: { type: String, required: true, default: "Full Stack Developer" },
  difficulty: { type: String, default: "mixed" },
  status: {
    type: String,
    enum: ["in_progress", "completed", "abandoned"],
    default: "in_progress",
  },
  questions: [questionSchema],
  totalQuestions: { type: Number, required: true },
  answeredCount: { type: Number, default: 0 },
  overallScore: { type: Number, default: null },
  summary: { type: summarySchema, default: null },
  completedAt: { type: Date, default: null },
}, {
  timestamps: true,
});

interviewSessionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("InterviewSession", interviewSessionSchema);
