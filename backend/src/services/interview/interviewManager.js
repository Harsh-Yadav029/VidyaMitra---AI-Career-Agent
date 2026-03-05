// ============================================================
//  VidyaMitra — services/interview/interviewManager.js
// ============================================================

const { getQuestionsForRole, getQuestionById } = require("./questionBank");
const { evaluateAnswer, evaluateSession } = require("./answerEvaluator");
const InterviewSession = require("../../models/InterviewSession.model");
const logger = require("../../config/logger");

/**
 * Start a new interview session.
 *
 * FIX: the original return value had no `questions` array.
 * The frontend reads `session.questions` to render every question card.
 * Without it every card shows "Loading…" forever.
 * We now include a normalised `questions` array + keep all original fields.
 */
const startSession = async (userId, options = {}) => {
  const {
    targetRole    = "Full Stack Developer",
    difficulty    = null,
    focus         = "mixed",   // accepted but questionBank handles filtering internally
    questionCount = 8,
    resumeId      = null,
  } = options;

  const rawQuestions = getQuestionsForRole(targetRole, {
    count: questionCount,
    difficulty,
  });

  if (!rawQuestions.length) {
    throw new Error(`No questions found for role: ${targetRole}`);
  }

  const session = await InterviewSession.create({
    userId,
    resumeId,
    targetRole,
    difficulty: difficulty || "mixed",
    focus,
    questions: rawQuestions.map((q, index) => ({
      questionId:   q.id,
      questionText: q.question,
      category:     q.category,
      difficulty:   q.difficulty,
      tags:         q.tags || [],
      orderIndex:   index,
      starGuide:    q.starGuide || null,
      keyPoints:    q.keyPoints || [],
    })),
    totalQuestions: rawQuestions.length,
    status: "in_progress",
  });

  logger.info(`Interview session started: ${session._id} for role: ${targetRole}`);

  // ── FIX: include normalised `questions` array in the returned object ──
  // Each item uses the same shape as the frontend's SessionView expects:
  //   { question, type, hint }
  // We also keep the original fields (questionText, category, etc.) so
  // nothing else in the codebase breaks.
  const questions = session.questions.map((q, i) => ({
    // Fields the frontend reads
    question: q.questionText,
    text:     q.questionText,   // fallback alias used in some views
    type:     q.category,       // frontend uses q.type for the badge colour
    hint: q.category === "behavioral"
      ? "Use the STAR method: Situation → Task → Action → Result"
      : q.category === "hr"
      ? "Be honest and authentic. Research the company beforehand."
      : "Think out loud — explain your reasoning process.",
    // Original fields (kept for interviewManager internals)
    questionId:   q.questionId,
    questionText: q.questionText,
    category:     q.category,
    difficulty:   q.difficulty,
    tags:         q.tags,
    orderIndex:   i,
  }));

  return {
    // ── fields the frontend uses directly on `session` ──
    _id:            session._id,
    sessionId:      session._id,   // alias kept for backward compat
    targetRole,
    difficulty:     difficulty || "mixed",
    focus,
    questions,                     // ← THE FIX
    totalQuestions: questions.length,
    status:         "in_progress",

    // original helper fields (used by other parts of the app)
    currentQuestion: {
      index: 0,
      ...formatQuestion(session.questions[0]),
    },
    instructions: [
      "Answer each question as you would in a real interview.",
      "For behavioral questions, use the STAR method (Situation, Task, Action, Result).",
      "Aim for 150–300 word answers.",
      "You can skip a question and come back to it.",
    ],
  };
};

/**
 * Submit an answer for a question in a session
 */
const submitAnswer = async (sessionId, userId, questionIndex, answerText) => {
  const session = await InterviewSession.findOne({ _id: sessionId, userId });

  if (!session) throw new Error("Interview session not found.");
  if (session.status === "completed") throw new Error("Session is already completed.");
  if (questionIndex < 0 || questionIndex >= session.questions.length) {
    throw new Error("Invalid question index.");
  }
  if (!answerText || answerText.trim().length < 5) {
    throw new Error("Answer is too short. Please provide a meaningful response.");
  }

  const questionData = session.questions[questionIndex];
  const fullQuestion = getQuestionById(questionData.questionId) || {
    category:   questionData.category,
    starGuide:  questionData.starGuide,
    keyPoints:  questionData.keyPoints,
  };

  const evaluation = evaluateAnswer(answerText, fullQuestion);

  session.questions[questionIndex].answer      = answerText;
  session.questions[questionIndex].answeredAt  = new Date();
  session.questions[questionIndex].evaluation  = evaluation;
  session.questions[questionIndex].isAnswered  = true;

  const answeredCount = session.questions.filter(q => q.isAnswered).length;
  session.answeredCount = answeredCount;

  const isLastQuestion = answeredCount === session.totalQuestions;

  if (isLastQuestion) {
    session.status      = "completed";
    session.completedAt = new Date();

    const answersForEval = session.questions.map(q => ({
      questionId:   q.questionId,
      questionText: q.questionText,
      answer:       q.answer || "",
      question:     { category: q.category, keyPoints: q.keyPoints },
    }));

    const summary        = evaluateSession(answersForEval);
    session.summary      = summary;
    session.overallScore = summary.averageScore;

    logger.info(`Interview session completed: ${sessionId} — Score: ${summary.averageScore}/100`);
  }

  await session.save();

  const response = {
    questionIndex,
    evaluation,
    // ── normalise feedback shape for frontend ──
    // Frontend reads res.data?.feedback.score and .comment
    feedback: {
      score:        evaluation.score,
      comment:      evaluation.feedback || evaluation.comment || "",
      improvements: evaluation.improvements || [],
    },
    answeredCount,
    totalQuestions:    session.totalQuestions,
    isComplete:        isLastQuestion,
    isSessionComplete: isLastQuestion,
  };

  if (isLastQuestion) {
    response.sessionSummary = session.summary;
  } else {
    const nextUnanswered = session.questions.findIndex(
      (q, i) => !q.isAnswered && i > questionIndex
    );
    const nextIdx = nextUnanswered !== -1 ? nextUnanswered : null;
    if (nextIdx !== null) {
      response.nextQuestion = { index: nextIdx, ...formatQuestion(session.questions[nextIdx]) };
    }
  }

  return response;
};

/**
 * Get session status and progress
 */
const getSession = async (sessionId, userId) => {
  const session = await InterviewSession.findOne({ _id: sessionId, userId });
  if (!session) throw new Error("Session not found.");

  return {
    sessionId:   session._id,
    _id:         session._id,
    targetRole:  session.targetRole,
    difficulty:  session.difficulty,
    focus:       session.focus,
    status:      session.status,
    progress: {
      answered:   session.answeredCount,
      total:      session.totalQuestions,
      percentage: Math.round((session.answeredCount / session.totalQuestions) * 100),
    },
    questions: session.questions.map((q, i) => ({
      index:      i,
      question:   q.questionText,
      text:       q.questionText,
      type:       q.category,
      questionId: q.questionId,
      category:   q.category,
      difficulty: q.difficulty,
      isAnswered: q.isAnswered,
      score:      q.evaluation?.score || null,
      hint: q.category === "behavioral"
        ? "Use the STAR method: Situation → Task → Action → Result"
        : q.category === "hr"
        ? "Be honest and authentic. Research the company beforehand."
        : "Think out loud — explain your reasoning process.",
    })),
    summary:      session.status === "completed" ? session.summary : null,
    overallScore: session.overallScore,
    createdAt:    session.createdAt,
    completedAt:  session.completedAt,
  };
};

/**
 * Get detailed results for a completed session
 */
const getSessionResults = async (sessionId, userId) => {
  const session = await InterviewSession.findOne({ _id: sessionId, userId });
  if (!session) throw new Error("Session not found.");
  if (session.status !== "completed") throw new Error("Session is not yet completed.");

  return {
    sessionId:    session._id,
    _id:          session._id,
    targetRole:   session.targetRole,
    overallScore: session.overallScore,
    summary:      session.summary,
    questions: session.questions.map((q, i) => ({
      index:       i,
      question:    q.questionText,
      text:        q.questionText,
      type:        q.category,
      questionText: q.questionText,
      category:    q.category,
      difficulty:  q.difficulty,
      answer:      q.answer,
      evaluation:  q.evaluation,
    })),
    answers: session.questions.map((q, i) => ({
      index:    i,
      answer:   q.answer || "",
      score:    q.evaluation?.score || null,
      feedback: q.evaluation?.feedback || q.evaluation?.comment || "",
      comment:  q.evaluation?.feedback || q.evaluation?.comment || "",
    })),
    completedAt: session.completedAt,
    timeSpent:   session.completedAt
      ? Math.round((session.completedAt - session.createdAt) / 60000)
      : null,
  };
};

/**
 * Format a question for the API response
 */
const formatQuestion = (q) => ({
  questionId:   q.questionId,
  question:     q.questionText,
  questionText: q.questionText,
  text:         q.questionText,
  type:         q.category,
  category:     q.category,
  difficulty:   q.difficulty,
  tags:         q.tags,
  hint: q.category === "behavioral"
    ? "Use the STAR method: Situation → Task → Action → Result"
    : q.category === "hr"
    ? "Be honest and authentic. Research the company beforehand."
    : "Think out loud — explain your reasoning process.",
  starGuide: q.starGuide || null,
});

module.exports = {
  startSession,
  submitAnswer,
  getSession,
  getSessionResults,
};