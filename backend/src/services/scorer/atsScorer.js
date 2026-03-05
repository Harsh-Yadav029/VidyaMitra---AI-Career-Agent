// ============================================================
//  VidyaMitra — services/scorer/atsScorer.js
//  ATS (Applicant Tracking System) compatibility score
//  Checks: required sections, keyword density, formatting signals
// ============================================================

// Standard section names ATS systems look for
const REQUIRED_SECTIONS = [
  { name: "contact",     keywords: ["email", "phone", "linkedin", "@"],          weight: 15 },
  { name: "summary",     keywords: ["summary", "objective", "profile", "about"], weight: 10 },
  { name: "experience",  keywords: ["experience", "employment", "work history"],  weight: 25 },
  { name: "education",   keywords: ["education", "degree", "university", "b.tech", "m.tech", "bachelor", "master"], weight: 20 },
  { name: "skills",      keywords: ["skills", "technologies", "competencies", "tech stack"], weight: 20 },
  { name: "projects",    keywords: ["projects", "project work"],                  weight: 10 },
];

// ATS-unfriendly patterns (penalize these)
const BAD_PATTERNS = [
  { pattern: /[^\x00-\x7F]/g,          label: "special unicode chars",    penalty: 3 },
  { pattern: /\|{2,}/g,                label: "table-like pipe chars",    penalty: 5 },
  { pattern: /_{5,}/g,                 label: "underline formatting",     penalty: 3 },
  { pattern: /\[image\]|\[photo\]/gi,  label: "image placeholders",       penalty: 5 },
];

// Good ATS signals (bonus points)
const GOOD_SIGNALS = [
  { test: (text) => /\d{3}[\s.-]?\d{3}[\s.-]?\d{4}|\+\d{10,}/.test(text), label: "phone number present",     bonus: 5 },
  { test: (text) => /[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}/i.test(text),label: "email present",            bonus: 5 },
  { test: (text) => /linkedin\.com/i.test(text),                            label: "linkedin URL present",     bonus: 3 },
  { test: (text) => /github\.com/i.test(text),                              label: "github URL present",       bonus: 2 },
  { test: (text) => text.split("\n").length > 30,                           label: "sufficient content length", bonus: 5 },
];

/**
 * Calculate ATS compatibility score (0-100)
 * @param {object} parsedData - parsed resume data
 * @param {string} rawText - raw resume text
 * @returns {object} { score, breakdown, issues, tips }
 */
const calculateATSScore = (parsedData, rawText) => {
  const textLower = rawText.toLowerCase();
  let score = 0;
  const breakdown = {};
  const issues = [];
  const tips = [];

  // ── 1. Check required sections ────────────────────────────
  let sectionScore = 0;
  for (const section of REQUIRED_SECTIONS) {
    const found = section.keywords.some((kw) => textLower.includes(kw));
    if (found) {
      sectionScore += section.weight;
      breakdown[section.name] = { found: true, weight: section.weight };
    } else {
      breakdown[section.name] = { found: false, weight: 0 };
      issues.push(`Missing or unrecognized "${section.name}" section`);
      tips.push(`Add a clearly labeled "${section.name.toUpperCase()}" heading so ATS systems can find it`);
    }
  }
  score += sectionScore;

  // ── 2. Penalize bad ATS patterns ──────────────────────────
  let penalties = 0;
  for (const { pattern, label, penalty } of BAD_PATTERNS) {
    const matches = rawText.match(pattern);
    if (matches && matches.length > 5) {
      penalties += penalty;
      issues.push(`Found ATS-unfriendly formatting: ${label}`);
    }
  }
  score = Math.max(0, score - penalties);

  // ── 3. Apply good signal bonuses (capped at 20 pts) ───────
  let bonusTotal = 0;
  for (const { test, label, bonus } of GOOD_SIGNALS) {
    if (test(rawText)) {
      bonusTotal += bonus;
    }
  }
  score += Math.min(20, bonusTotal);

  // ── 4. File format bonus (PDF/DOCX preferred) ─────────────
  // Already handled by upload middleware — assume clean format

  // ── Final normalization ────────────────────────────────────
  const finalScore = Math.min(100, Math.round(score));

  if (finalScore < 50) {
    tips.push("Your resume may be rejected by ATS before a human sees it. Focus on adding all standard sections.");
  } else if (finalScore < 75) {
    tips.push("Your resume passes basic ATS checks but can be improved with clearer section headings.");
  }

  return {
    score: finalScore,
    breakdown,
    issues,
    tips,
    label: getScoreLabel(finalScore),
  };
};

const getScoreLabel = (score) => {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Needs Improvement";
  return "Poor";
};

module.exports = { calculateATSScore };
