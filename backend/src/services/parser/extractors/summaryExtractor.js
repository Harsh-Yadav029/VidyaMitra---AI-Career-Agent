// ============================================================
//  VidyaMitra — services/parser/extractors/summaryExtractor.js
//  Extracts the professional summary / objective section
// ============================================================

const SUMMARY_HEADERS = [
  "summary", "professional summary", "career summary", "about me",
  "profile", "professional profile", "career objective", "objective",
  "overview", "introduction", "about",
];

const NEXT_SECTION_KEYWORDS = [
  "experience", "education", "skills", "projects", "certifications",
  "work history", "employment", "technical skills",
];

/**
 * Extract professional summary text
 */
const extractSummary = (text) => {
  const lines = text.split("\n");
  let inSection = false;
  let summaryLines = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const lineLower = trimmed.toLowerCase();

    if (!inSection) {
      if (SUMMARY_HEADERS.some((h) => lineLower === h || lineLower.startsWith(h + ":"))) {
        inSection = true;
        continue;
      }
    } else {
      // Stop at next section
      if (
        NEXT_SECTION_KEYWORDS.some((h) => lineLower === h || lineLower.startsWith(h)) &&
        summaryLines.length > 0
      ) {
        break;
      }
      if (trimmed) summaryLines.push(trimmed);
      if (summaryLines.length >= 8) break; // summary shouldn't be more than 8 lines
    }
  }

  const summary = summaryLines.join(" ").replace(/\s+/g, " ").trim();

  // Return null if too short (not a real summary)
  return summary.length > 30 ? summary : null;
};

module.exports = { extractSummary };
