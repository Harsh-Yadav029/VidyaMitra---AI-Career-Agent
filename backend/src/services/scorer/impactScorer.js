// ============================================================
//  VidyaMitra — services/scorer/impactScorer.js
//  Impact Score: measures how results-driven the resume is
//  Checks: action verbs, quantified achievements, weak language
// ============================================================

// Strong action verbs that signal impact
const ACTION_VERBS = [
  // Leadership
  "led", "managed", "directed", "spearheaded", "oversaw", "mentored",
  "coached", "supervised", "coordinated", "orchestrated",
  // Achievement
  "achieved", "delivered", "exceeded", "surpassed", "accomplished",
  "attained", "earned", "won", "secured", "generated",
  // Building
  "built", "developed", "created", "designed", "architected", "engineered",
  "launched", "established", "founded", "initiated", "implemented",
  // Improvement
  "improved", "optimized", "enhanced", "streamlined", "automated",
  "reduced", "increased", "accelerated", "boosted", "transformed",
  // Collaboration
  "collaborated", "partnered", "contributed", "supported", "facilitated",
  // Analysis
  "analyzed", "researched", "evaluated", "assessed", "identified",
  "diagnosed", "solved", "resolved", "troubleshot",
  // Technical
  "integrated", "deployed", "migrated", "refactored", "scaled",
  "configured", "maintained", "monitored", "tested", "validated",
];

// Weak / passive phrases to penalize
const WEAK_PHRASES = [
  "responsible for", "worked on", "helped with", "assisted in",
  "involved in", "participated in", "duties included", "tasks included",
  "was in charge of", "had experience with", "familiar with",
  "exposure to", "knowledge of",
];

// Quantification patterns (numbers signal impact)
const QUANTIFICATION_PATTERNS = [
  /\d+\s*%/,                          // percentages: 40%, 3%
  /\$\s*\d+/,                         // dollar amounts: $50K
  /\d+\s*(?:million|billion|k|m)\b/i, // scale: 1M users, 500K records
  /\d+\s*(?:users|customers|clients|members|employees|developers|engineers)/i,
  /\d+\s*(?:times|x)\s*(?:faster|better|more)/i, // 3x faster
  /(?:increased|reduced|improved|decreased|grew|saved)\s+(?:by\s+)?\d+/i,
  /\d+\s*(?:projects|features|services|APIs|microservices|applications)/i,
  /(?:within|in)\s+\d+\s*(?:days|weeks|months|hours)/i,
  /\d+\s*(?:years?|yrs?)\s+(?:of\s+)?experience/i,
];

/**
 * Calculate impact score (0-100)
 */
const calculateImpactScore = (parsedData, rawText) => {
  const textLower = rawText.toLowerCase();
  const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);
  const issues = [];
  const tips = [];
  let score = 0;

  // ── 1. Action Verb Score (max 35 pts) ─────────────────────
  const foundVerbs = ACTION_VERBS.filter((verb) => {
    const pattern = new RegExp(`\\b${verb}\\b`, "i");
    return pattern.test(rawText);
  });

  const verbScore = Math.min(35, Math.round((foundVerbs.length / 12) * 35));
  score += verbScore;

  if (foundVerbs.length < 5) {
    issues.push(`Only ${foundVerbs.length} strong action verbs found`);
    tips.push("Start each bullet point with a strong action verb like 'Built', 'Led', 'Optimized', 'Delivered'");
  }

  // ── 2. Quantification Score (max 35 pts) ──────────────────
  const quantifiedLines = lines.filter((line) =>
    QUANTIFICATION_PATTERNS.some((pattern) => pattern.test(line))
  );

  const quantScore = Math.min(35, Math.round((quantifiedLines.length / 5) * 35));
  score += quantScore;

  if (quantifiedLines.length === 0) {
    issues.push("No quantified achievements found");
    tips.push("Add numbers to your bullets: 'Improved performance by 40%', 'Served 10,000+ users', 'Reduced costs by $20K'");
  } else if (quantifiedLines.length < 3) {
    tips.push(`You have ${quantifiedLines.length} quantified achievement(s). Aim for at least 5 across your experience section.`);
  }

  // ── 3. Weak Language Penalty (max -20 pts) ────────────────
  const weakMatches = WEAK_PHRASES.filter((phrase) => textLower.includes(phrase));
  const weakPenalty = Math.min(20, weakMatches.length * 4);
  score = Math.max(0, score - weakPenalty);

  if (weakMatches.length > 0) {
    issues.push(`Weak/passive phrases detected: "${weakMatches.slice(0, 3).join('", "')}"`);
    tips.push("Replace passive phrases like 'Responsible for' with direct action verbs like 'Led' or 'Managed'");
  }

  // ── 4. Bullet Point Structure (max 15 pts) ────────────────
  const bulletLines = lines.filter((l) => /^[•\-–*▪]/.test(l));
  const bulletScore = bulletLines.length >= 8 ? 15 : Math.round((bulletLines.length / 8) * 15);
  score += bulletScore;

  if (bulletLines.length < 5) {
    tips.push("Use bullet points in your experience section to highlight individual accomplishments clearly");
  }

  // ── 5. Bonus: summary has impact language ─────────────────
  if (parsedData.summary) {
    const summaryHasImpact = ACTION_VERBS.some((v) =>
      new RegExp(`\\b${v}\\b`, "i").test(parsedData.summary)
    );
    if (summaryHasImpact) score += 5;
  }

  const finalScore = Math.min(100, Math.round(score));

  return {
    score: finalScore,
    label: getScoreLabel(finalScore),
    foundActionVerbs: foundVerbs.slice(0, 10),
    quantifiedAchievements: quantifiedLines.slice(0, 5),
    weakPhrasesFound: weakMatches,
    issues,
    tips,
  };
};

const getScoreLabel = (score) => {
  if (score >= 85) return "Highly Impactful";
  if (score >= 70) return "Good Impact";
  if (score >= 50) return "Moderate Impact";
  return "Low Impact";
};

module.exports = { calculateImpactScore };
