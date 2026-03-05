// ============================================================
//  VidyaMitra — services/scorer/skillMatchScorer.js
//  Skill Match Score: compares resume skills vs job description
//  Uses TF-IDF-like keyword overlap + skill database matching
// ============================================================

const { SKILLS_MAP } = require("../parser/skillsDatabase");

/**
 * Extract skills from a job description text
 */
const extractSkillsFromJD = (jdText) => {
  const textLower = jdText.toLowerCase();
  const found = new Set();

  for (const [lowercase, canonical] of SKILLS_MAP.entries()) {
    const isShort = lowercase.length <= 2;
    const pattern = isShort
      ? new RegExp(`(?<![a-zA-Z+#])${escapeRegex(lowercase)}(?![a-zA-Z+#])`, "i")
      : new RegExp(`\\b${escapeRegex(lowercase)}\\b`, "i");

    if (pattern.test(textLower)) found.add(canonical);
  }

  return [...found];
};

/**
 * Extract general keywords from text (non-skill terms)
 */
const extractKeywords = (text) => {
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "as", "is", "are", "was", "were", "be",
    "been", "being", "have", "has", "had", "do", "does", "did", "will",
    "would", "could", "should", "may", "might", "shall", "can", "need",
    "you", "we", "our", "your", "their", "this", "that", "these", "those",
    "experience", "work", "years", "year", "strong", "good", "excellent",
    "required", "preferred", "plus", "ability", "must", "looking",
  ]);

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w));
};

/**
 * Calculate skill match score (0-100)
 * @param {object} parsedData - parsed resume data
 * @param {string} jobDescription - job description text (optional)
 * @returns {object} score result
 */
const calculateSkillMatchScore = (parsedData, jobDescription = null) => {
  const resumeSkills = new Set(
    (parsedData.skills || []).map((s) => s.toLowerCase())
  );

  // ── No JD provided: score based on skill breadth only ─────
  if (!jobDescription || jobDescription.trim().length < 30) {
    return scoreBySkillBreadth(resumeSkills, parsedData);
  }

  // ── JD provided: do full skill match analysis ──────────────
  const jdSkills = extractSkillsFromJD(jobDescription);
  const jdKeywords = extractKeywords(jobDescription);
  const resumeKeywords = extractKeywords(
    [
      parsedData.summary || "",
      ...(parsedData.experience || []).map((e) => e.description || ""),
      (parsedData.skills || []).join(" "),
    ].join(" ")
  );

  // Matched and missing skills
  const matchedSkills = jdSkills.filter((s) => resumeSkills.has(s.toLowerCase()));
  const missingSkills = jdSkills.filter((s) => !resumeSkills.has(s.toLowerCase()));

  // Keyword overlap score
  const resumeKeywordSet = new Set(resumeKeywords);
  const matchedKeywords = jdKeywords.filter((k) => resumeKeywordSet.has(k));
  const keywordOverlap = jdKeywords.length > 0
    ? matchedKeywords.length / jdKeywords.length
    : 0;

  // Skill match ratio
  const skillMatchRatio = jdSkills.length > 0
    ? matchedSkills.length / jdSkills.length
    : 0.5;

  // Weighted score: 70% skill match + 30% keyword overlap
  const rawScore = skillMatchRatio * 70 + keywordOverlap * 30;
  const score = Math.min(100, Math.round(rawScore));

  const issues = [];
  const tips = [];

  if (missingSkills.length > 0) {
    issues.push(`Missing ${missingSkills.length} skills from the job description`);
    tips.push(`Add these missing skills if you have them: ${missingSkills.slice(0, 5).join(", ")}`);
  }

  if (score < 50) {
    tips.push("Your resume skills don't strongly match this job. Consider tailoring your resume for each application.");
  }

  return {
    score,
    label: getScoreLabel(score),
    matchedSkills,
    missingSkills: missingSkills.slice(0, 10),
    jdSkillsTotal: jdSkills.length,
    resumeSkillsTotal: resumeSkills.size,
    keywordOverlapPercent: Math.round(keywordOverlap * 100),
    issues,
    tips,
    hasJobDescription: true,
  };
};

/**
 * Fallback: score based on skill breadth when no JD is given
 */
const scoreBySkillBreadth = (resumeSkills, parsedData) => {
  const count = resumeSkills.size;

  // Score based on categories present
  const categories = Object.keys(parsedData.skillsByCategory || {}).length;

  let score = 0;
  score += Math.min(50, Math.round((count / 15) * 50));  // up to 50 for count
  score += Math.min(30, categories * 6);                  // up to 30 for variety
  score += parsedData.certifications?.length > 0 ? 10 : 0; // 10 for certs
  score += parsedData.projects?.length > 0 ? 10 : 0;       // 10 for projects

  return {
    score: Math.min(100, score),
    label: getScoreLabel(Math.min(100, score)),
    matchedSkills: [...resumeSkills].slice(0, 10),
    missingSkills: [],
    resumeSkillsTotal: count,
    keywordOverlapPercent: null,
    issues: count < 8 ? ["Too few skills listed"] : [],
    tips: count < 8
      ? ["List at least 10-15 relevant technical skills"]
      : ["Paste a job description to get a precise skill match score"],
    hasJobDescription: false,
  };
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getScoreLabel = (score) => {
  if (score >= 80) return "Strong Match";
  if (score >= 60) return "Good Match";
  if (score >= 40) return "Partial Match";
  return "Weak Match";
};

module.exports = { calculateSkillMatchScore, extractSkillsFromJD };
