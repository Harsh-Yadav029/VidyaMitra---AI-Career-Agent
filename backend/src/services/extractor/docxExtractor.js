// ============================================================
//  VidyaMitra — services/extractor/docxExtractor.js
//  Extracts raw text from DOCX resume files using mammoth
// ============================================================

const mammoth = require("mammoth");
const fs = require("fs");
const logger = require("../../config/logger");

/**
 * Extract raw text from a DOCX file
 * @param {string} filePath - absolute path to the DOCX file
 * @returns {Promise<{text: string, messages: array}>}
 */
const extractFromDOCX = async (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`DOCX file not found: ${filePath}`);
    }

    // Extract as plain text (better for parsing than HTML)
    const result = await mammoth.extractRawText({ path: filePath });

    const cleanedText = cleanRawText(result.value);

    if (result.messages.length > 0) {
      logger.warn(`DOCX extraction warnings for ${filePath}:`, result.messages);
    }

    logger.info(`DOCX extracted: ${cleanedText.length} chars`);

    return {
      text: cleanedText,
      messages: result.messages,
    };
  } catch (error) {
    logger.error(`DOCX extraction failed: ${error.message}`);
    throw new Error(`Failed to extract DOCX content: ${error.message}`);
  }
};

const cleanRawText = (rawText) => {
  return rawText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

module.exports = { extractFromDOCX };
