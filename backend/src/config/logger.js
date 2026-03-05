// ============================================================
//  VidyaMitra — config/logger.js
//  Winston logger: colorful console + rotating file logs
// ============================================================

const { createLogger, format, transports } = require("winston");
const path = require("path");
const fs = require("fs");

// Ensure logs directory exists
const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const { combine, timestamp, colorize, printf, errors, json } = format;

// Custom console format: [2024-01-15 10:30:00] INFO: message
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `[${timestamp}] ${level}: ${stack || message}`;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" })
  ),
  transports: [
    // ── Console (colorful in dev) ────────────────────────────
    new transports.Console({
      format: combine(colorize({ all: true }), consoleFormat),
      silent: process.env.NODE_ENV === "test",
    }),
    // ── Error log file ───────────────────────────────────────
    new transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      format: combine(json()),
      maxsize: 5 * 1024 * 1024,   // 5MB
      maxFiles: 5,
    }),
    // ── Combined log file ────────────────────────────────────
    new transports.File({
      filename: path.join(logsDir, "combined.log"),
      format: combine(json()),
      maxsize: 10 * 1024 * 1024,  // 10MB
      maxFiles: 5,
    }),
  ],
});

module.exports = logger;
