// ============================================================
//  VidyaMitra — services/scorer/resumeScorer.js
//  MASTER SCORER: orchestrates all scoring modules
//  Input:  parsedData + optional jobDescription
//  Output: full ScoreReport with AI feedback
// ============================================================

const { calculateATSScore } = require("./atsScorer");
const { calculateImpactScore } = require("./impactScorer");
const { calculateCompletenessScore } = require("./completenessScorer");
const { calculateReadabilityScore } = require("./readabilityScorer");
const { calculateSkillMatchScore } = require("./skillMatchScorer");
const { generateAIFeedback } = require("../ai/feedbackGenerator");
const logger = require("../../config/logger");

// Weights for overall score calculation
const SCORE_WEIGHTS = {
  ats: 0.25,          // 25% — ATS compatibility
  impact: 0.25,       // 25% — impact & achievements
  completeness: 0.20, // 20% — all sections present
  readability: 0.15,  // 15% — clear, concise writing
  skillMatch: 0.15,   // 15% — skill relevance
};

/**
 * Score a resume across all dimensions and generate AI feedback
 * @param {object} parsedData - output from resumeParser.js
 * @param {string} jobDescription - optional job description text
 * @returns {Promise<ScoreReport>}
 */
const scoreResume = async (parsedData, jobDescription = null) => {
  const startTime = Date.now();
  logger.info(`📊 Starting resume scoring for: ${parsedData.fullName || "Unknown"}`);

  const rawText = parsedData.rawText || "";

  // ── Run all scorers in parallel ────────────────────────────
  const [atsResult, impactResult, completenessResult, readabilityResult, skillMatchResult] =
    await Promise.all([
      Promise.resolve(calculateATSScore(parsedData, rawText)),
      Promise.resolve(calculateImpactScore(parsedData, rawText)),
      Promise.resolve(calculateCompletenessScore(parsedData)),
      Promise.resolve(calculateReadabilityScore(rawText)),
      Promise.resolve(calculateSkillMatchScore(parsedData, jobDescription)),
    ]);

  // ── Calculate weighted overall score ──────────────────────
  const overallScore = Math.round(
    atsResult.score * SCORE_WEIGHTS.ats +
    impactResult.score * SCORE_WEIGHTS.impact +
    completenessResult.score * SCORE_WEIGHTS.completeness +
    readabilityResult.score * SCORE_WEIGHTS.readability +
    skillMatchResult.score * SCORE_WEIGHTS.skillMatch
  );

  // ── Collect all issues across all scorers ─────────────────
  const allIssues = [
    ...atsResult.issues,
    ...impactResult.issues,
    ...completenessResult.issues,
    ...readabilityResult.issues,
    ...skillMatchResult.issues,
  ];

  const allTips = [
    ...atsResult.tips,
    ...impactResult.tips,
    ...completenessResult.tips,
    ...readabilityResult.tips,
    ...skillMatchResult.tips,
  ];

  // ── Build score report ────────────────────────────────────
  const scoreReport = {
    scores: {
      overall: overallScore,
      ats: atsResult.score,
      impact: impactResult.score,
      completeness: completenessResult.score,
      readability: readabilityResult.score,
      skillMatch: skillMatchResult.score,
    },
    labels: {
      overall: getOverallLabel(overallScore),
      ats: atsResult.label,
      impact: impactResult.label,
      completeness: completenessResult.label,
      readability: readabilityResult.label,
      skillMatch: skillMatchResult.label,
    },
    details: {
      ats: atsResult,
      impact: impactResult,
      completeness: completenessResult,
      readability: readabilityResult,
      skillMatch: skillMatchResult,
    },
    allIssues,
    allTips,
    hasJobDescription: !!jobDescription,
    scoredAt: new Date().toISOString(),
  };

  // ── Generate AI feedback ───────────────────────────────────
  logger.info("🤖 Generating AI feedback...");
  const aiFeedback = await generateAIFeedback(parsedData, scoreReport, jobDescription);

  const elapsed = Date.now() - startTime;
  logger.info(`✅ Scoring complete in ${elapsed}ms — Overall: ${overallScore}/100`);

  return {
    ...scoreReport,
    aiFeedback,
    meta: {
      scoringTimeMs: elapsed,
      weights: SCORE_WEIGHTS,
      candidateName: parsedData.fullName,
      totalSkills: parsedData.skills?.length || 0,
      totalExperience: parsedData.yearsOfExperience || 0,
    },
  };
};

const getOverallLabel = (score) => {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 55) return "Average";
  if (score >= 40) return "Needs Work";
  return "Poor";
};

module.exports = { scoreResume, SCORE_WEIGHTS };
