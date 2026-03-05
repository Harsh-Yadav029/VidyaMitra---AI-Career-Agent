// ============================================================
//  VidyaMitra — middleware/upload.middleware.js
//  Multer config for resume file uploads (PDF, DOCX)
// ============================================================

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// ── Ensure upload directory exists ────────────────────────────
const UPLOAD_DIR = path.join(__dirname, "../../uploads/resumes");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ── Storage config: save to disk with UUID filename ───────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

// ── File type filter: only PDF and DOCX ───────────────────────
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
  ];
  const allowedExts = [".pdf", ".docx", ".doc"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and Word documents (.pdf, .docx) are allowed."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,   // 5 MB max
    files: 1,
  },
});

module.exports = upload;
