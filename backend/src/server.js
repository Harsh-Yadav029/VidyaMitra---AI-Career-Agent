// ============================================================
//  VidyaMitra Backend — server.js
//  Entry point for the Express application
// ============================================================

const app = require("./app");
const connectDB = require("./config/db");
const logger = require("./config/logger");

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    logger.info(`🚀 VidyaMitra API running on http://localhost:${PORT}`);
    logger.info(`📌 Environment: ${process.env.NODE_ENV || "development"}`);
  });
};

startServer().catch((err) => {
  logger.error("Failed to start server:", err);
  process.exit(1);
});
