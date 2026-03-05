// ============================================================
//  VidyaMitra Backend — app.js
// ============================================================

require("dotenv").config();

const express      = require("express");
const cors         = require("cors");
const helmet       = require("helmet");
const compression  = require("compression");
const morgan       = require("morgan");
const rateLimit    = require("express-rate-limit");

const logger       = require("./config/logger");
const errorHandler = require("./middleware/errorHandler");
const notFound     = require("./middleware/notFound");

// ── Route Imports ────────────────────────────────────────────
const authRoutes             = require("./routes/auth.routes");
const googleAuthRoutes       = require("./routes/googleAuth.routes");
const userRoutes             = require("./routes/user.routes");
const resumeRoutes           = require("./routes/resume.routes");
const scoreRoutes            = require("./routes/score.routes");
const agentRoutes            = require("./routes/agent.routes");
const healthRoutes           = require("./routes/health.routes");
const interviewRoutes        = require("./routes/interview.routes");
const jobMatchRoutes         = require("./routes/jobMatch.routes");
const profileRoutes          = require("./routes/profile.routes");
const resumeBuilderRoutes    = require("./routes/resumeBuilder.routes");
const jobApplicationRoutes   = require("./routes/jobApplication.routes");
const adminRoutes            = require("./routes/admin.routes");

const app = express();

app.use(helmet());
app.use(compression());

// ── CORS ─────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Rate limiting ─────────────────────────────────────────────
// Relaxed in development so hot reloads and rapid testing don't
// hit 429 errors. Tightens automatically in production.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 100 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api/", limiter);

// Separate stricter limiter for auth endpoints (production only)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 20 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Try again in 15 minutes." },
});
app.use("/api/auth/login",    authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/google",   authLimiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(
  morgan("combined", {
    stream: { write: (msg) => logger.info(msg.trim()) },
    skip: (req) => req.url === "/api/health",
  })
);

// ── API Routes ────────────────────────────────────────────────
app.use("/api/health",               healthRoutes);
app.use("/api/auth",                 authRoutes);
app.use("/api/auth",                 googleAuthRoutes);
app.use("/api/auth",                 profileRoutes);      // PUT /api/auth/profile, /change-password, /notifications
app.use("/api/users",                userRoutes);
app.use("/api/resumes",              resumeRoutes);
app.use("/api/scores",               scoreRoutes);
app.use("/api/agent",                agentRoutes);
app.use("/api/interview",            interviewRoutes);
app.use("/api/jobs",                 jobMatchRoutes);
app.use("/api/builder",              resumeBuilderRoutes);
app.use("/api/tracker/applications", jobApplicationRoutes);  // matches frontend calls
app.use("/api/admin",                adminRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🎓 Welcome to VidyaMitra API",
    version: "1.0.0",
    docs: "/api/health",
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;