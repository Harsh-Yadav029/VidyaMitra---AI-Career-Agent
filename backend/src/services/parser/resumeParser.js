// ============================================================
//  VidyaMitra — services/parser/resumeParser.js
//  MASTER PARSER: orchestrates all extractors into one pipeline
//  Input:  file path (PDF or DOCX)
//  Output: structured JSON resume object
// ============================================================

const path = require("path");
const { extractFromPDF } = require("../extractor/pdfExtractor");
const { extractFromDOCX } = require("../extractor/docxExtractor");
const { extractContactInfo } = require("./extractors/contactExtractor");
const { extractSkills } = require("./extractors/skillsExtractor");
const { extractExperience } = require("./extractors/experienceExtractor");
const { extractEducation } = require("./extractors/educationExtractor");
const { extractSummary } = require("./extractors/summaryExtractor");
const { extractProjects } = require("./extractors/projectsExtractor");
const { extractCertifications } = require("./extractors/certificationExtractor");
const logger = require("../../config/logger");

/**
 * Main resume parsing pipeline
 * @param {string} filePath - Absolute path to resume file
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<ParsedResume>}
 */
const parseResume = async (filePath, mimeType) => {
  const startTime = Date.now();
  logger.info(`🔍 Starting resume parse: ${path.basename(filePath)}`);

  // ── Step 1: Extract raw text based on file type ────────────
  let rawText = "";
  let metadata = {};

  const isPDF =
    mimeType === "application/pdf" ||
    filePath.toLowerCase().endsWith(".pdf");

  const isDOCX =
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    filePath.toLowerCase().endsWith(".docx") ||
    filePath.toLowerCase().endsWith(".doc");

  if (isPDF) {
    const result = await extractFromPDF(filePath);
    rawText = result.text;
    metadata = { numPages: result.numPages };
  } else if (isDOCX) {
    const result = await extractFromDOCX(filePath);
    rawText = result.text;
  } else {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }

  if (!rawText || rawText.trim().length < 50) {
    throw new Error("Could not extract sufficient text from the resume. The file may be image-based or corrupted.");
  }

  // ── Step 2: Run all extractors in parallel ─────────────────
  logger.info("📋 Running extraction pipeline...");

  const [
    contactInfo,
    skillsResult,
    experience,
    education,
    summary,
    projects,
    certifications,
  ] = await Promise.all([
    Promise.resolve(extractContactInfo(rawText)),
    Promise.resolve(extractSkills(rawText)),
    Promise.resolve(extractExperience(rawText)),
    Promise.resolve(extractEducation(rawText)),
    Promise.resolve(extractSummary(rawText)),
    Promise.resolve(extractProjects(rawText)),
    Promise.resolve(extractCertifications(rawText)),
  ]);

  // ── Step 3: Calculate years of experience ─────────────────
  const yearsOfExperience = calculateYearsOfExperience(experience);

  // ── Step 4: Build structured output ───────────────────────
  const parsedData = {
    // Contact info
    fullName: contactInfo.fullName,
    email: contactInfo.email,
    phone: contactInfo.phone,
    location: contactInfo.location,
    linkedinUrl: contactInfo.linkedinUrl,
    githubUrl: contactInfo.githubUrl,
    portfolioUrl: contactInfo.portfolioUrl,

    // Professional content
    summary,
    skills: skillsResult.skills,
    skillsByCategory: skillsResult.categorized,
    experience,
    education,
    projects,
    certifications,

    // Meta
    yearsOfExperience,
    totalSkillsFound: skillsResult.count,
    rawText,  // stored for AI scoring later
  };

  const elapsed = Date.now() - startTime;
  logger.info(`✅ Resume parsed in ${elapsed}ms — found ${skillsResult.count} skills, ${experience.length} jobs, ${education.length} degrees`);

  return {
    parsedData,
    metadata: {
      ...metadata,
      parsingTimeMs: elapsed,
      textLength: rawText.length,
    },
  };
};

/**
 * Calculate total years of experience from work history
 */
const calculateYearsOfExperience = (experience) => {
  if (!experience.length) return 0;

  let totalMonths = 0;

  for (const job of experience) {
    const start = job.startDate ? new Date(job.startDate) : null;
    const end = job.isCurrent ? new Date() : job.endDate ? new Date(job.endDate) : null;

    if (start && end && end >= start) {
      const months =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth());
      totalMonths += Math.max(0, months);
    }
  }

  return Math.round(totalMonths / 12 * 10) / 10; // round to 1 decimal
};

module.exports = { parseResume };
