// ============================================================
//  VidyaMitra — services/extractor/pdfExtractor.js
//  Fixed import for pdf-parse on Windows + Node.js 22
// ============================================================

const fs = require("fs");
const path = require("path");
const logger = require("../../config/logger");

/**
 * Extract raw text from a PDF file
 */
const extractFromPDF = async (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`PDF file not found: ${filePath}`);
    }

    // ── Fix: handle both default and named exports ──────────
    let pdfParse;
    const pdfParseModule = require("pdf-parse");
    if (typeof pdfParseModule === "function") {
      pdfParse = pdfParseModule;
    } else if (typeof pdfParseModule.default === "function") {
      pdfParse = pdfParseModule.default;
    } else {
      // Last resort: find the function inside the module
      pdfParse = Object.values(pdfParseModule).find(
        (v) => typeof v === "function"
      );
    }

    if (!pdfParse) {
      throw new Error("pdf-parse module loaded but no callable function found. Try: npm install pdf-parse@1.1.1");
    }

    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    const cleanedText = cleanRawText(data.text);

    logger.info(`PDF extracted: ${data.numpages} pages, ${cleanedText.length} chars`);

    return {
      text: cleanedText,
      numPages: data.numpages,
      info: data.info || {},
    };
  } catch (error) {
    logger.error(`PDF extraction failed: ${error.message}`);
    throw new Error(`Failed to extract PDF content: ${error.message}`);
  }
};

const cleanRawText = (rawText) => {
  return rawText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\f/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

module.exports = { extractFromPDF };