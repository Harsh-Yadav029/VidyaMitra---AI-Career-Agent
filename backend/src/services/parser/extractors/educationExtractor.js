// ============================================================
//  VidyaMitra — services/parser/extractors/educationExtractor.js
//  Extracts education entries from resume text
// ============================================================

const EDUCATION_HEADERS = [
  "education", "academic background", "academic qualifications",
  "educational background", "qualifications", "academics",
];

const NEXT_SECTION_KEYWORDS = [
  "experience", "skills", "projects", "certifications", "awards",
  "publications", "interests", "work history", "employment",
];

const DEGREE_PATTERNS = [
  /b\.?tech|bachelor of technology/i,
  /m\.?tech|master of technology/i,
  /b\.?e\.?|bachelor of engineering/i,
  /b\.?sc\.?|bachelor of science/i,
  /m\.?sc\.?|master of science/i,
  /b\.?c\.?a\.?|bachelor of computer application/i,
  /m\.?c\.?a\.?|master of computer application/i,
  /b\.?b\.?a\.?|bachelor of business administration/i,
  /m\.?b\.?a\.?|master of business administration/i,
  /b\.?com|bachelor of commerce/i,
  /ph\.?d\.?|doctor of philosophy/i,
  /high school|12th|hsc|ssc|10th|intermediate/i,
  /diploma/i,
];

/**
 * Extract education entries
 */
const extractEducation = (text) => {
  const sectionText = extractSection(text, EDUCATION_HEADERS, NEXT_SECTION_KEYWORDS);
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
      if (startHeaders.some((h) => lineLower === h || lineLower.startsWith(h))) {
        inSection = true;
        continue;
      }
    } else {
      if (endHeaders.some((h) => lineLower === h || lineLower.startsWith(h)) && sectionLines.length > 1) {
        break;
      }
      sectionLines.push(line);
    }
  }

  return sectionLines.join("\n").trim();
};

const splitIntoEntries = (sectionText) => {
  const lines = sectionText.split("\n").map((l) => l.trim()).filter(Boolean);
  const entries = [];
  let current = [];

  for (const line of lines) {
    const hasDegree = DEGREE_PATTERNS.some((p) => p.test(line));
    const hasYear = /\b(19|20)\d{2}\b/.test(line);

    if ((hasDegree || (hasYear && current.length > 1)) && current.length > 0) {
      entries.push(current.join("\n"));
      current = [line];
    } else {
      current.push(line);
    }
  }

  if (current.length > 0) entries.push(current.join("\n"));
  return entries.filter((e) => e.length > 5);
};

const parseEntry = (entryText) => {
  const lines = entryText.split("\n").map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return null;

  // Extract year
  const yearMatch = entryText.match(/\b(19|20)(\d{2})\b(?:\s*[-–]\s*\b(19|20)(\d{2})\b)?/);
  const year = yearMatch ? yearMatch[0] : null;

  // Extract GPA / CGPA / percentage
  const gpaMatch = entryText.match(/(?:cgpa|gpa|percentage|marks)[:\s]*([0-9.]+\s*(?:\/\s*[0-9.]+)?%?)/i);
  const gpa = gpaMatch ? gpaMatch[1].trim() : null;

  // Detect degree
  let degree = null;
  let field = null;

  for (const line of lines) {
    for (const pattern of DEGREE_PATTERNS) {
      if (pattern.test(line)) {
        degree = line.replace(/[,–—|•]/g, " ").trim();
        break;
      }
    }
    if (degree) break;
  }

  // Institution: look for line with "University", "College", "Institute", "School"
  const institutionLine = lines.find((l) =>
    /university|college|institute|school|iit|nit|bits|iisc/i.test(l)
  );

  // Field of study: look for common fields
  const fieldMatch = entryText.match(
    /(?:computer science|information technology|electronics|mechanical|civil|electrical|data science|mathematics|physics|commerce|arts|management)/i
  );
  if (fieldMatch) field = fieldMatch[0];

  return {
    institution: institutionLine ? institutionLine.replace(/[|•·]/g, "").trim() : lines[0],
    degree: degree || lines[0],
    field: field || null,
    year: year || null,
    gpa: gpa || null,
  };
};

module.exports = { extractEducation };
