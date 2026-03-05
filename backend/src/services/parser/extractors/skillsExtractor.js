// ============================================================
//  VidyaMitra — services/parser/extractors/skillsExtractor.js
//  Extracts skills from resume text using the skills database
// ============================================================

const { SKILLS_DATABASE, SKILLS_MAP } = require("../skillsDatabase");

/**
 * Extract skills from resume text
 * Returns both flat list and categorized map
 */
const extractSkills = (text) => {
  const normalizedText = text.toLowerCase();
  const foundSkills = new Set();
  const categorized = {};

  // ── Method 1: Direct word/phrase matching ─────────────────
  for (const [lowercase, canonical] of SKILLS_MAP.entries()) {
    // Use word boundaries to avoid partial matches (e.g., "C" matching "CSS")
    const isShort = lowercase.length <= 2;
    const pattern = isShort
      ? new RegExp(`(?<![a-zA-Z+#])${escapeRegex(lowercase)}(?![a-zA-Z+#])`, "i")
      : new RegExp(`\\b${escapeRegex(lowercase)}\\b`, "i");

    if (pattern.test(normalizedText)) {
      foundSkills.add(canonical);
    }
  }

  // ── Method 2: Look inside "Skills" section specifically ────
  const skillsSectionText = extractSkillsSection(text);
  if (skillsSectionText) {
    // Also try comma/pipe/bullet separated items in the skills section
    const items = skillsSectionText
      .split(/[,|•\n\/\\]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1 && s.length < 40);

    for (const item of items) {
      const canonical = SKILLS_MAP.get(item.toLowerCase());
      if (canonical) foundSkills.add(canonical);
    }
  }

  // ── Categorize found skills ────────────────────────────────
  for (const [category, skills] of Object.entries(SKILLS_DATABASE)) {
    const found = skills.filter((s) => foundSkills.has(s));
    if (found.length > 0) categorized[category] = found;
  }

  return {
    skills: [...foundSkills],           // flat deduplicated list
    categorized,                         // grouped by category
    count: foundSkills.size,
  };
};

/**
 * Extract the "Skills" section text from resume
 */
const extractSkillsSection = (text) => {
  const sectionHeaders = [
    "technical skills", "skills", "core competencies", "competencies",
    "technologies", "tech stack", "tools & technologies", "expertise",
    "programming languages", "languages & frameworks",
  ];

  const lines = text.split("\n");
  let inSection = false;
  let sectionLines = [];

  for (let i = 0; i < lines.length; i++) {
    const lineLower = lines[i].trim().toLowerCase();

    if (!inSection) {
      if (sectionHeaders.some((h) => lineLower.includes(h))) {
        inSection = true;
        continue;
      }
    } else {
      // Stop at next section header (all caps line or known section name)
      if (isNewSection(lines[i]) && sectionLines.length > 0) break;
      sectionLines.push(lines[i]);
      if (sectionLines.length > 20) break; // skills section shouldn't be > 20 lines
    }
  }

  return sectionLines.join("\n");
};

/**
 * Detect if a line is likely a new section header
 */
const isNewSection = (line) => {
  const trimmed = line.trim();
  if (!trimmed) return false;

  const knownHeaders = [
    "experience", "education", "projects", "certifications",
    "awards", "publications", "languages", "interests", "summary",
    "objective", "work history", "employment",
  ];

  const lowerLine = trimmed.toLowerCase();
  if (knownHeaders.some((h) => lowerLine.startsWith(h))) return true;
  if (trimmed === trimmed.toUpperCase() && trimmed.length > 3) return true;

  return false;
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = { extractSkills };
