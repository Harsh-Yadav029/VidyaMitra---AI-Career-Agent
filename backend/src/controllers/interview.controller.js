// ============================================================
//  VidyaMitra — controllers/interview.controller.js
// ============================================================

const { startSession, submitAnswer, getSession, getSessionResults } = require("../services/interview/interviewManager");
const { getQuestionsForRole, getAvailableRoles } = require("../services/interview/questionBank");
const InterviewSession = require("../models/InterviewSession.model");
const logger = require("../config/logger");
const { sendInterviewResultEmail } = require("../services/email/emailService");

// ── POST /api/interview/sessions ─────────────────────────────
const createSession = async (req, res, next) => {
  try {
    const {
      targetRole    = "Full Stack Developer",
      difficulty    = null,
      focus         = "mixed",   // FIX: was ignored; now forwarded to startSession
      questionCount = 8,
      resumeId      = null,
    } = req.body;

    const validDifficulties = ["easy", "medium", "hard", null];
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: "Invalid difficulty. Choose from: easy, medium, hard (or omit for mixed)",
      });
    }

    const count = Math.min(Math.max(parseInt(questionCount) || 8, 3), 15);

    // FIX: pass focus so interviewManager stores it and returns it
    const session = await startSession(req.user._id, {
      targetRole,
      difficulty,
      focus,
      questionCount: count,
      resumeId,
    });

    // `session` now contains a `questions` array (see interviewManager fix)
    res.status(201).json({
      success: true,
      message: `Interview session started for ${targetRole}`,
      session,
    });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/interview/sessions/:id/answer ───────────────────
const submitQuestionAnswer = async (req, res, next) => {
  try {
    const { questionIndex, answer } = req.body;

    if (questionIndex === undefined || questionIndex === null) {
      return res.status(400).json({ success: false, message: "questionIndex is required." });
    }
    if (!answer || answer.trim().length < 5) {
      return res.status(400).json({ success: false, message: "Answer is too short." });
    }

    const result = await submitAnswer(
      req.params.id,
      req.user._id,
      parseInt(questionIndex),
      answer.trim()
    );

    // Fire-and-forget email on completion
    if (result.isComplete) {
      try {
        const session = await InterviewSession.findById(req.params.id);
        if (session) {
          sendInterviewResultEmail(req.user, {
            targetRole:   session.targetRole,
            overallScore: session.overallScore,
            answers:      session.answers,
          }).catch(err =>
            logger.warn(`Interview email failed for user ${req.user._id}: ${err.message}`)
          );
        }
      } catch (emailErr) {
        logger.warn(`Could not fetch session for email: ${emailErr.message}`);
      }
    }

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message.includes("already completed") || error.message.includes("too short")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// ── POST /api/interview/sessions/:id/complete ─────────────────
// FIX: the frontend calls this endpoint after all questions are answered.
// It didn't exist in the original controller — that's why finishing a session
// threw a 404 and the results view never loaded properly.
const completeSession = async (req, res, next) => {
  try {
    const { answers } = req.body; // array of { questionIndex, answer, score, feedback }

    const session = await InterviewSession.findOne({
      _id:    req.params.id,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found." });
    }

    // If already completed just return the existing results
    if (session.status === "completed") {
      const results = await getSessionResults(req.params.id, req.user._id);
      return res.status(200).json({ success: true, session: results });
    }

    // Merge any client-side scores/feedback into the session
    if (Array.isArray(answers)) {
      answers.forEach(({ questionIndex, answer, score, feedback }) => {
        const q = session.questions[questionIndex];
        if (!q) return;
        if (answer)   q.answer    = answer;
        if (score)    q.evaluation = { ...(q.evaluation || {}), score };
        if (feedback) q.evaluation = { ...(q.evaluation || {}), feedback };
        q.isAnswered = true;
      });
    }

    // Mark session complete if not already
    const answeredCount = session.questions.filter(q => q.isAnswered).length;
    session.answeredCount = answeredCount;
    session.status        = "completed";
    session.completedAt   = new Date();

    // Calculate overall score from evaluations
    const scores = session.questions
      .map(q => q.evaluation?.score)
      .filter(s => s != null);
    session.overallScore = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;

    await session.save();

    logger.info(`Session completed via /complete endpoint: ${session._id}`);

    // Return in the shape ResultsView expects
    res.status(200).json({
      success:      true,
      overallScore: session.overallScore,
      session: {
        _id:          session._id,
        targetRole:   session.targetRole,
        difficulty:   session.difficulty,
        focus:        session.focus,
        overallScore: session.overallScore,
        questions:    session.questions.map((q, i) => ({
          index:       i,
          question:    q.questionText,
          text:        q.questionText,
          type:        q.category,
          category:    q.category,
          difficulty:  q.difficulty,
        })),
        answers: session.questions.map((q, i) => ({
          index:    i,
          answer:   q.answer   || "",
          score:    q.evaluation?.score    || null,
          feedback: q.evaluation?.feedback || q.evaluation?.comment || "",
          comment:  q.evaluation?.feedback || q.evaluation?.comment || "",
        })),
        completedAt: session.completedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/interview/sessions/:id ──────────────────────────
const getSessionStatus = async (req, res, next) => {
  try {
    const session = await getSession(req.params.id, req.user._id);
    res.status(200).json({ success: true, session });
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// ── GET /api/interview/sessions/:id/results ───────────────────
const getResults = async (req, res, next) => {
  try {
    const results = await getSessionResults(req.params.id, req.user._id);
    res.status(200).json({ success: true, results });
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message.includes("not yet completed")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// ── GET /api/interview/sessions ───────────────────────────────
const listSessions = async (req, res, next) => {
  try {
    const sessions = await InterviewSession.find({ userId: req.user._id })
      .select("targetRole difficulty focus status totalQuestions answeredCount overallScore createdAt completedAt")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/interview/questions/preview ─────────────────────
const previewQuestions = async (req, res, next) => {
  try {
    const { role = "Full Stack Developer", count = 5, difficulty } = req.query;

    const questions = getQuestionsForRole(role, {
      count:      parseInt(count),
      difficulty: difficulty || null,
    });

    res.status(200).json({
      success:   true,
      role,
      count:     questions.length,
      questions: questions.map(q => ({
        id:         q.id,
        question:   q.question,
        category:   q.category,
        difficulty: q.difficulty,
        tags:       q.tags,
        hint: q.category === "behavioral"
          ? "Use the STAR method"
          : q.category === "hr"
          ? "Be authentic and specific"
          : "Explain your reasoning step by step",
      })),
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/interview/roles ──────────────────────────────────
const getRoles = async (req, res, next) => {
  try {
    const roles = getAvailableRoles();
    res.status(200).json({ success: true, roles });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSession,
  submitQuestionAnswer,
  completeSession,
  getSessionStatus,
  getResults,
  listSessions,
  previewQuestions,
  getRoles,
};