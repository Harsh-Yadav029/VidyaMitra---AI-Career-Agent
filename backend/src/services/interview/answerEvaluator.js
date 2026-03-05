// ============================================================
//  VidyaMitra — services/interview/answerEvaluator.js
//  Evaluates interview answers using STAR method + NLP signals
// ============================================================

const logger = require("../../config/logger");

// ── STAR Method Keyword Signals ───────────────────────────────
const STAR_SIGNALS = {
  situation: [
    "was working", "i was", "we were", "at my", "in my", "during", "when i",
    "our team", "the project", "the company", "i worked", "situation was",
    "context was", "background", "last year", "previously", "at the time",
  ],
  task: [
    "my responsibility", "i needed to", "i had to", "my role was", "i was responsible",
    "my job was", "i was tasked", "the goal was", "objective was", "i was asked",
    "the requirement", "my task", "needed me to", "i was expected",
  ],
  action: [
    "i decided", "i implemented", "i built", "i created", "i developed",
    "i started", "i proposed", "i led", "i collaborated", "i worked with",
    "i reached out", "i designed", "i wrote", "i fixed", "i resolved",
    "i approached", "what i did", "my approach", "i took", "i used",
    "i applied", "i refactored", "i communicated", "i escalated",
  ],
  result: [
    "as a result", "the result was", "this led to", "we achieved", "i achieved",
    "the outcome", "reduced by", "increased by", "improved by", "saved",
    "the team", "successfully", "we delivered", "met the deadline",
    "the project", "the client", "feedback was", "performance improved",
    "%", "percent", "times faster", "within budget", "on time",
  ],
};

// ── Positive quality signals ──────────────────────────────────
const QUALITY_SIGNALS = {
  quantified: [
    /\d+%/, /\d+ percent/, /\d+x faster/, /\d+ users/, /\d+ hours/,
    /\d+ days/, /\$\d+/, /\d+ million/, /\d+ thousand/, /reduced.*\d+/,
    /increased.*\d+/, /improved.*\d+/, /saved.*\d+/,
  ],
  specific: [
    /for example/i, /specifically/i, /in particular/i, /such as/i,
    /including/i, /the reason/i, /because/i, /therefore/i,
  ],
  reflection: [
    /i learned/i, /i realized/i, /in hindsight/i, /looking back/i,
    /what i would do differently/i, /next time/i, /this taught me/i,
    /i now understand/i, /i improved/i,
  ],
  collaboration: [
    /team/i, /colleague/i, /stakeholder/i, /manager/i, /worked with/i,
    /together/i, /we decided/i, /collaborated/i,
  ],
};

// ── Weak answer signals ───────────────────────────────────────
const WEAK_SIGNALS = [
  { pattern: /i (always|never|usually|typically)/i, message: "Avoid generalizations — use a specific example" },
  { pattern: /i don'?t know/i, message: "Avoid saying you don't know — reframe as a learning opportunity" },
  { pattern: /i can'?t think of/i, message: "Prepare examples in advance for common questions" },
  { pattern: /it (was|is) complicated/i, message: "Simplify your explanation — interviewers want clarity" },
  { pattern: /^.{0,80}$/m, message: "Answer is too short — provide more detail and context" },
  { pattern: /we (did|built|made)/i, message: "Use 'I' not 'we' — be specific about your personal contribution" },
];

// ── Core Evaluator ────────────────────────────────────────────

/**
 * Evaluate a single interview answer
 * @param {string} answer - The candidate's answer text
 * @param {object} question - The question object from questionBank
 * @returns {object} Evaluation result with score, feedback, improvements
 */
const evaluateAnswer = (answer, question) => {
  if (!answer || answer.trim().length < 10) {
    return {
      score: 0,
      grade: "F",
      starAnalysis: null,
      feedback: "No answer provided.",
      strengths: [],
      improvements: ["Please provide a detailed answer."],
      wordCount: 0,
    };
  }

  const lowerAnswer = answer.toLowerCase();
  const wordCount = answer.split(/\s+/).filter(Boolean).length;

  // ── 1. STAR Method Analysis (for behavioral/situational) ───
  let starScore = 0;
  let starAnalysis = null;

  if (
    question.category === "behavioral" ||
    question.category === "situational"
  ) {
    starAnalysis = {};
    let starComponentsFound = 0;

    for (const [component, signals] of Object.entries(STAR_SIGNALS)) {
      const found = signals.some((signal) => lowerAnswer.includes(signal));
      starAnalysis[component] = found;
      if (found) starComponentsFound++;
    }

    starScore = Math.round((starComponentsFound / 4) * 35); // max 35 points
  } else {
    starScore = 20; // technical questions don't need STAR
  }

  // ── 2. Quality Signals Score (max 30 points) ──────────────
  let qualityScore = 0;
  const strengthsFound = [];

  if (QUALITY_SIGNALS.quantified.some((r) => r.test(answer))) {
    qualityScore += 10;
    strengthsFound.push("Includes specific numbers/metrics — excellent!");
  }

  if (QUALITY_SIGNALS.specific.some((r) => r.test(answer))) {
    qualityScore += 8;
    strengthsFound.push("Uses specific examples — good detail level");
  }

  if (QUALITY_SIGNALS.reflection.some((r) => r.test(answer))) {
    qualityScore += 7;
    strengthsFound.push("Shows self-reflection and growth mindset");
  }

  if (QUALITY_SIGNALS.collaboration.some((r) => r.test(answer))) {
    qualityScore += 5;
    strengthsFound.push("Mentions teamwork and collaboration");
  }

  // ── 3. Length Score (max 20 points) ──────────────────────
  let lengthScore = 0;
  if (wordCount >= 150 && wordCount <= 400) {
    lengthScore = 20; // ideal length
    strengthsFound.push("Answer length is ideal (150–400 words)");
  } else if (wordCount >= 80 && wordCount < 150) {
    lengthScore = 12;
  } else if (wordCount > 400 && wordCount <= 600) {
    lengthScore = 14;
  } else if (wordCount < 80) {
    lengthScore = 5;
  } else {
    lengthScore = 8; // too long
  }

  // ── 4. Weak Signal Penalties (max -15) ───────────────────
  const weaknesses = [];
  let penalty = 0;

  for (const { pattern, message } of WEAK_SIGNALS) {
    if (pattern.test(answer)) {
      weaknesses.push(message);
      penalty += 3;
    }
  }
  penalty = Math.min(penalty, 15);

  // ── 5. Technical accuracy placeholder (max 15 points) ────
  // In rule-based mode: give partial credit based on answer length + keywords
  let technicalScore = 0;
  if (question.category === "technical" && question.keyPoints) {
    const mentionedKeyPoints = question.keyPoints.filter((kp) =>
      lowerAnswer.includes(kp.toLowerCase().split(" ")[0])
    );
    technicalScore = Math.round(
      (mentionedKeyPoints.length / question.keyPoints.length) * 15
    );
    if (mentionedKeyPoints.length > 0) {
      strengthsFound.push(
        `Covered ${mentionedKeyPoints.length}/${question.keyPoints.length} key technical points`
      );
    }
  } else {
    technicalScore = 10; // non-technical question
  }

  // ── Final Score ───────────────────────────────────────────
  const rawScore = starScore + qualityScore + lengthScore + technicalScore - penalty;
  const score = Math.max(0, Math.min(100, rawScore));

  // ── Generate Improvements ─────────────────────────────────
  const improvements = [...weaknesses];

  if (starAnalysis) {
    if (!starAnalysis.situation) improvements.push("Add context: Where/when did this happen? Set the scene first.");
    if (!starAnalysis.task) improvements.push("Clarify your specific role and responsibility in the situation.");
    if (!starAnalysis.action) improvements.push("Use more 'I did...' statements — describe your specific actions.");
    if (!starAnalysis.result) improvements.push("Always end with the outcome — what changed as a result of your actions?");
  }

  if (!QUALITY_SIGNALS.quantified.some((r) => r.test(answer))) {
    improvements.push("Add numbers/metrics to make your impact tangible (e.g., 'reduced load time by 40%').");
  }

  if (wordCount < 100) {
    improvements.push("Expand your answer — aim for at least 150 words with specific details.");
  }

  // ── Grade ─────────────────────────────────────────────────
  const grade =
    score >= 85 ? "A" :
    score >= 70 ? "B" :
    score >= 55 ? "C" :
    score >= 40 ? "D" : "F";

  // ── Sample improved answer structure ──────────────────────
  let modelStructure = null;
  if (starAnalysis && question.starGuide) {
    modelStructure = {
      tip: "Structure your answer using STAR:",
      steps: [
        `Situation: ${question.starGuide.situation}`,
        `Task: ${question.starGuide.task}`,
        `Action: ${question.starGuide.action}`,
        `Result: ${question.starGuide.result}`,
      ],
    };
  }

  return {
    score,
    grade,
    wordCount,
    starAnalysis,
    strengths: strengthsFound.slice(0, 4),
    improvements: improvements.slice(0, 5),
    modelStructure,
    breakdown: {
      starMethodScore: starScore,
      qualityScore,
      lengthScore,
      technicalScore,
      penalty: -penalty,
    },
  };
};

/**
 * Evaluate all answers in a session and produce summary
 */
const evaluateSession = (answers) => {
  if (!answers || answers.length === 0) {
    return { averageScore: 0, grade: "F", breakdown: [] };
  }

  const evaluated = answers.map((a) => ({
    questionId: a.questionId,
    question: a.questionText,
    answer: a.answer,
    evaluation: evaluateAnswer(a.answer, a.question || { category: "behavioral" }),
  }));

  const totalScore = evaluated.reduce((sum, e) => sum + e.evaluation.score, 0);
  const averageScore = Math.round(totalScore / evaluated.length);

  const grade =
    averageScore >= 85 ? "A" :
    averageScore >= 70 ? "B" :
    averageScore >= 55 ? "C" :
    averageScore >= 40 ? "D" : "F";

  // Top strengths and improvements across session
  const allStrengths = evaluated.flatMap((e) => e.evaluation.strengths);
  const allImprovements = evaluated.flatMap((e) => e.evaluation.improvements);

  // Deduplicate
  const uniqueImprovements = [...new Set(allImprovements)].slice(0, 6);
  const uniqueStrengths = [...new Set(allStrengths)].slice(0, 4);

  return {
    averageScore,
    grade,
    totalQuestions: evaluated.length,
    breakdown: evaluated,
    sessionStrengths: uniqueStrengths,
    sessionImprovements: uniqueImprovements,
    readyForInterview: averageScore >= 70,
    recommendation:
      averageScore >= 85 ? "Excellent! You are well prepared for interviews." :
      averageScore >= 70 ? "Good preparation. Practice a few more answers to build confidence." :
      averageScore >= 55 ? "Fair preparation. Focus on adding specific examples and metrics." :
      "Needs improvement. Study the STAR method and practice with more examples.",
  };
};

module.exports = { evaluateAnswer, evaluateSession };
