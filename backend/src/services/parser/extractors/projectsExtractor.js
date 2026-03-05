// ============================================================
//  VidyaMitra — services/parser/extractors/projectsExtractor.js
//  Extracts project entries from resume text
// ============================================================

const { SKILLS_MAP } = require("../skillsDatabase");

const PROJECT_HEADERS = [
  "projects", "personal projects", "academic projects", "key projects",
  "notable projects", "project work", "project experience",
];

const NEXT_SECTION_KEYWORDS = [
  "education", "skills", "certifications", "awards", "experience",
  "work history", "publications", "interests", "achievements",
];

/**
 * Extract project entries
 */
const extractProjects = (text) => {
  const sectionText = extractSection(text, PROJECT_HEADERS, NEXT_SECTION_KEYWORDS);
  if (!sectionText) return [];

  const entries = splitIntoEntries(sectionText);
  return entries.map(parseEntry).filter(Boolean);
};

const extractSection = (text, startHeaders, endHeaders) => {
  const lines = text.split("\n");
  let inSection = false;
  let sectionLines = [];

  for (const line of lines) {
    const lineLower = line.trim().toLowerCase();
    if (!inSection) {
      if (startHeaders.some((h) => lineLower === h || lineLower.startsWith(h + ":"))) {
        inSection = true;
        continue;
      }
    } else {
      if (endHeaders.some((h) => lineLower === h || lineLower.startsWith(h)) && sectionLines.length > 1) break;
      sectionLines.push(line);
      if (sectionLines.length > 60) break;
    }
  }

  return sectionLines.join("\n").trim();
};

const splitIntoEntries = (sectionText) => {
  const lines = sectionText.split("\n").map((l) => l.trim()).filter(Boolean);
  const entries = [];
  let current = [];

  for (const line of lines) {
    // New project: short line that doesn't start with a bullet/dash
    const isBullet = /^[•\-–*]/.test(line);
    const isShort = line.length < 60;
    const noVerb = !/^(developed|built|created|implemented|designed|worked|used|integrated)/i.test(line);

    if (!isBullet && isShort && noVerb && current.length > 0) {
      entries.push(current.join("\n"));
      current = [line];
    } else {
      current.push(line);
    }
  }

  if (current.length > 0) entries.push(current.join("\n"));
  return entries.filter((e) => e.length > 10);
};

const parseEntry = (entryText) => {
  const lines = entryText.split("\n").map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return null;

  const name = lines[0].replace(/^[•\-–*]\s*/, "").trim();

  // Extract URL if present
  const urlMatch = entryText.match(/https?:\/\/[^\s]+/);
  const url = urlMatch ? urlMatch[0] : null;

  // Extract tech stack (look for parentheses like "(React, Node.js, MongoDB)")
  const techStackMatch = entryText.match(/\(([^)]+)\)/);
  let techStack = [];
  if (techStackMatch) {
    techStack = techStackMatch[1]
      .split(/[,|\/]/)
      .map((s) => s.trim())
      .filter((s) => SKILLS_MAP.has(s.toLowerCase()));
  }

  // Description: remaining lines
  const description = lines
    .slice(1)
    .filter((l) => !l.startsWith("http"))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    name,
    description: description || null,
    techStack,
    url,
  };
};

module.exports = { extractProjects };
