// ============================================================
//  VidyaMitra — services/parser/extractors/experienceExtractor.js
//  Extracts work experience entries from resume text
// ============================================================

const EXPERIENCE_HEADERS = [
  "work experience", "professional experience", "experience",
  "employment history", "work history", "career history",
  "positions held", "professional background",
];

const NEXT_SECTION_KEYWORDS = [
  "education", "skills", "projects", "certifications", "awards",
  "publications", "languages", "interests", "achievements",
  "volunteer", "activities", "references",
];

/**
 * Extract work experience section and parse individual entries
 */
const extractExperience = (text) => {
  const sectionText = extractSection(text, EXPERIENCE_HEADERS, NEXT_SECTION_KEYWORDS);
  if (!sectionText) return [];

  const entries = splitIntoEntries(sectionText);
  return entries.map(parseEntry).filter(Boolean);
};

/**
 * Extract a section from the resume by header name
 */
const extractSection = (text, startHeaders, endHeaders) => {
  const lines = text.split("\n");
  let inSection = false;
  let sectionLines = [];

  for (const line of lines) {
    const lineLower = line.trim().toLowerCase();

    if (!inSection) {
      if (startHeaders.some((h) => lineLower === h || lineLower.startsWith(h))) {
        inSection = true;
        continue;
      }
    } else {
      if (endHeaders.some((h) => lineLower === h || lineLower.startsWith(h)) && sectionLines.length > 2) {
        break;
      }
      sectionLines.push(line);
    }
  }

  return sectionLines.join("\n").trim();
};

/**
 * Split section text into individual experience blocks
 * Each block typically starts with a company name or job title
 */
const splitIntoEntries = (sectionText) => {
  const lines = sectionText.split("\n").map((l) => l.trim()).filter(Boolean);
  const entries = [];
  let current = [];

  for (const line of lines) {
    // A new entry usually starts with a date-like pattern or a bold/standalone title
    if (looksLikeEntryStart(line) && current.length > 0) {
      entries.push(current.join("\n"));
      current = [line];
    } else {
      current.push(line);
    }
  }

  if (current.length > 0) entries.push(current.join("\n"));
  return entries.filter((e) => e.length > 20);
};

/**
 * Determine if a line looks like the start of a new experience entry
 */
const looksLikeEntryStart = (line) => {
  // Lines with date ranges: Jan 2020 - Dec 2022 / 2020 - Present
  const datePattern = /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})/i;
  if (datePattern.test(line) && line.length < 80) return true;

  // ALL CAPS company/role names
  if (line === line.toUpperCase() && line.length > 4 && line.length < 60) return true;

  return false;
};

/**
 * Parse a single experience entry block into structured data
 */
const parseEntry = (entryText) => {
  const lines = entryText.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return null;

  // Extract duration from any line
  const duration = extractDuration(entryText);
  const { startDate, endDate, isCurrent } = parseDuration(duration);

  // First line is usually the company or role
  const firstLine = lines[0];
  const secondLine = lines[1] || "";

  // Heuristic: if first line has "Inc", "Ltd", "Technologies", "Solutions" etc → company first
  const companyKeywords = ["inc", "ltd", "llc", "technologies", "solutions", "systems",
    "consulting", "services", "corp", "company", "pvt"];

  let company = null;
  let role = null;

  const isCompanyFirst = companyKeywords.some((k) =>
    firstLine.toLowerCase().includes(k)
  );

  if (isCompanyFirst) {
    company = firstLine;
    role = secondLine;
  } else {
    role = firstLine;
    company = secondLine;
  }

  // Description: remaining lines after company/role/date, joined
  const descLines = lines.slice(2).filter((l) => !extractDuration(l));
  const description = descLines.join(" ").trim();

  return {
    company: cleanLine(company),
    role: cleanLine(role),
    duration: duration || "",
    description: description || "",
    startDate,
    endDate,
    isCurrent,
  };
};

/**
 * Extract a date range string from text
 */
const extractDuration = (text) => {
  const patterns = [
    // Jan 2020 – Present / Jan 2020 - Dec 2022
    /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{4}\s*[-–—]\s*(?:present|current|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{0,4}/i,
    // 2020 – 2022 / 2020 - Present
    /\d{4}\s*[-–—]\s*(?:present|current|\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[0].trim();
  }
  return null;
};

/**
 * Parse a duration string into start/end dates
 */
const parseDuration = (duration) => {
  if (!duration) return { startDate: null, endDate: null, isCurrent: false };

  const isCurrent =
    /present|current/i.test(duration);

  const yearMatches = duration.match(/\d{4}/g) || [];
  const startYear = yearMatches[0] ? parseInt(yearMatches[0]) : null;
  const endYear = !isCurrent && yearMatches[1] ? parseInt(yearMatches[1]) : null;

  return {
    startDate: startYear ? new Date(startYear, 0) : null,
    endDate: isCurrent ? null : endYear ? new Date(endYear, 11) : null,
    isCurrent,
  };
};

const cleanLine = (str) => {
  if (!str) return null;
  return str.replace(/[|•·–—]/g, "").replace(/\s+/g, " ").trim() || null;
};

module.exports = { extractExperience };
