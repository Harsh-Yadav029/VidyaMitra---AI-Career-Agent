// ============================================================
//  VidyaMitra — services/parser/extractors/contactExtractor.js
//  Extracts: name, email, phone, location, LinkedIn, GitHub
// ============================================================

/**
 * Extract email addresses from text
 */
const extractEmail = (text) => {
  const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex) || [];
  // Filter out common false positives
  const filtered = matches.filter(
    (e) => !e.includes("example.com") && !e.includes("youremail")
  );
  return filtered[0] || null;
};

/**
 * Extract phone numbers (handles Indian and international formats)
 */
const extractPhone = (text) => {
  const phonePatterns = [
    /(?:\+91[\s\-]?)?[6-9]\d{9}/,                        // Indian mobile
    /(?:\+1[\s\-]?)?\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4}/, // US format
    /(?:\+\d{1,3}[\s\-]?)?\d{10,12}/,                     // Generic international
  ];

  for (const pattern of phonePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].replace(/\s+/g, " ").trim();
    }
  }
  return null;
};

/**
 * Extract LinkedIn profile URL
 */
const extractLinkedIn = (text) => {
  const patterns = [
    /linkedin\.com\/in\/([a-zA-Z0-9\-_%]+)/i,
    /linkedin\.com\/pub\/([a-zA-Z0-9\-_%/]+)/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return `https://www.linkedin.com/in/${match[1]}`;
  }
  return null;
};

/**
 * Extract GitHub profile URL
 */
const extractGitHub = (text) => {
  const pattern = /github\.com\/([a-zA-Z0-9\-_]+)(?!\/[a-zA-Z0-9])/i;
  const match = text.match(pattern);
  if (match) return `https://github.com/${match[1]}`;
  return null;
};

/**
 * Extract portfolio / personal website URL
 */
const extractPortfolio = (text) => {
  // Match URLs that are NOT LinkedIn/GitHub/email domains
  const pattern = /https?:\/\/(?!.*linkedin)(?!.*github)(?!.*gmail)(?!.*yahoo)[a-zA-Z0-9\-.]+\.[a-zA-Z]{2,}(?:\/[^\s]*)*/gi;
  const matches = text.match(pattern) || [];
  return matches[0] || null;
};

/**
 * Extract candidate name — tries multiple heuristics
 * Approach: name is usually in the first 5 lines, before email/phone
 */
const extractName = (text) => {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 8); // check first 8 lines only

  for (const line of lines) {
    // Skip lines that look like emails, phones, URLs, or section headers
    if (
      line.includes("@") ||
      line.includes("http") ||
      line.includes("linkedin") ||
      line.includes("github") ||
      /^\d/.test(line) ||          // starts with digit
      /[|•|]/u.test(line) ||       // separator chars
      line.split(" ").length > 6 || // too many words for a name
      line.length < 3 ||
      isAllCaps(line) && line.split(" ").length > 3 // ALL CAPS header
    ) {
      continue;
    }

    // A name typically: 2-4 words, each capitalized, no special chars
    const namePattern = /^[A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+){1,3}$/;
    if (namePattern.test(line)) {
      return line;
    }
  }

  // Fallback: return first clean line that looks like words
  const fallback = lines.find(
    (l) =>
      l.split(" ").length >= 2 &&
      l.split(" ").length <= 5 &&
      /^[A-Za-z\s]+$/.test(l)
  );

  return fallback || null;
};

const isAllCaps = (str) => str === str.toUpperCase() && /[A-Z]/.test(str);

/**
 * Extract location (city, state, country)
 */
const extractLocation = (text) => {
  // Look for patterns like "Bangalore, Karnataka" / "New York, NY" / "London, UK"
  const patterns = [
    /([A-Z][a-z]+(?:\s[A-Z][a-z]+)?),\s*([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/,
    /([A-Z][a-z]+),\s*([A-Z]{2})\b/,                  // City, ST
    /([A-Z][a-z]+(?:\s[A-Z][a-z]+)?),\s*India/i,
    /([A-Z][a-z]+(?:\s[A-Z][a-z]+)?),\s*USA/i,
    /([A-Z][a-z]+(?:\s[A-Z][a-z]+)?),\s*UK/i,
  ];

  const first300 = text.slice(0, 500); // location usually near the top
  for (const pattern of patterns) {
    const match = first300.match(pattern);
    if (match) return match[0].trim();
  }
  return null;
};

/**
 * Master contact extractor
 */
const extractContactInfo = (text) => {
  return {
    fullName: extractName(text),
    email: extractEmail(text),
    phone: extractPhone(text),
    location: extractLocation(text),
    linkedinUrl: extractLinkedIn(text),
    githubUrl: extractGitHub(text),
    portfolioUrl: extractPortfolio(text),
  };
};

module.exports = { extractContactInfo, extractEmail, extractPhone, extractName };
