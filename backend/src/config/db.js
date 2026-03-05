// ============================================================
//  VidyaMitra — config/db.js
//  MongoDB connection using Mongoose
// ============================================================

const mongoose = require("mongoose");
const logger = require("./logger");

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/vidyamitra";

  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("MongoDB reconnected.");
    });

  } catch (error) {
    logger.error(`❌ MongoDB connection failed: ${error.message}`);
    logger.error("Make sure MongoDB is running: mongod --dbpath /data/db");
    process.exit(1);
  }
};

module.exports = connectDB;
