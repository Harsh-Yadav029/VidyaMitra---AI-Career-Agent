// ============================================================
//  VidyaMitra — routes/health.routes.js
//  Health check endpoint for monitoring and Docker
// ============================================================

const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

router.get("/", (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStates = { 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" };

  res.status(dbStatus === 1 ? 200 : 503).json({
    success: true,
    status: "ok",
    service: "VidyaMitra API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    database: {
      status: dbStates[dbStatus] || "unknown",
      name: mongoose.connection.name || "vidyamitra",
    },
    memory: {
      used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
      total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
    },
    environment: process.env.NODE_ENV || "development",
  });
});

module.exports = router;
