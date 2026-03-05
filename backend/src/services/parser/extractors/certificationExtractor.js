// ============================================================
//  VidyaMitra — services/parser/extractors/certificationExtractor.js
//  Extracts certifications and licenses from resume text
// ============================================================

const CERT_HEADERS = [
  "certifications", "certificates", "licenses", "accreditations",
  "professional certifications", "courses", "training",
];

const NEXT_SECTION_KEYWORDS = [
  "experience", "education", "skills", "projects", "awards",
  "publications", "interests", "work history",
];

// Known certification issuers
const KNOWN_ISSUERS = [
  "AWS", "Amazon", "Google", "Microsoft", "Oracle", "Cisco", "CompTIA",
  "PMI", "Scrum", "Meta", "IBM", "Salesforce", "HubSpot", "Coursera",
  "Udemy", "edX", "LinkedIn Learning", "MongoDB", "HashiCorp", "Red Hat",
];

/**
 * Extract certification entries
 */
const extractCertifications = (text) => {
  const sectionText = extractSection(text, CERT_HEADERS, NEXT_SECTION_KEYWORDS);
  if (!sectionText) return [];

  return sectionText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 5)
    .map(parseCertLine)
    .filter(Boolean);
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
      if (sectionLines.length > 20) break;
    }
  }

  return sectionLines.join("\n").trim();
};

const parseCertLine = (line) => {
  const cleanLine = line.replace(/^[•\-–*]\s*/, "").trim();
  if (!cleanLine || cleanLine.length < 5) return null;

  // Extract year
  const yearMatch = cleanLine.match(/\b(20\d{2}|19\d{2})\b/);
  const year = yearMatch ? yearMatch[0] : null;

  // Extract issuer
  const issuer = KNOWN_ISSUERS.find((i) => cleanLine.toLowerCase().includes(i.toLowerCase()));

  const name = cleanLine
    .replace(/\b(20\d{2}|19\d{2})\b/, "")
    .replace(/[-–|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    name,
    issuer: issuer || null,
    year: year || null,
  };
};

module.exports = { extractCertifications };
