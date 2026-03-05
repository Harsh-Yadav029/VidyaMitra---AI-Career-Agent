// ============================================================
// VidyaMitra — controllers/googleAuth.controller.js
// Verify Firebase ID token → create/find user → return JWT
// ============================================================
const admin   = require("../config/firebaseAdmin");
const User    = require("../models/User.model");
const jwt     = require("jsonwebtoken");
const logger  = require("../config/logger");
const { sendWelcomeEmail } = require("../services/email/emailService");

const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, message: "Firebase ID token is required." });
    }

    // 1 — Verify token with Firebase Admin SDK
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch {
      return res.status(401).json({ success: false, message: "Invalid or expired Firebase token." });
    }

    const { uid, email, name, picture } = decoded;

    if (!email) {
      return res.status(400).json({ success: false, message: "No email found in Google account." });
    }

    // 2 — Find or create user
    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      user = await User.create({
        name:          name || email.split("@")[0],
        email,
        password:      uid,          // Firebase UID as placeholder (won't be used for login)
        googleId:      uid,
        avatar:        picture || "",
        isVerified:    true,
        authProvider:  "google",
      });
      isNewUser = true;
      sendWelcomeEmail(user).catch(() => {});
      logger.info(`New Google user created: ${email}`);
    } else if (!user.googleId) {
      // Existing email account — link Google to it
      user.googleId     = uid;
      user.authProvider = "google";
      if (picture && !user.avatar) user.avatar = picture;
      await user.save();
      logger.info(`Google linked to existing account: ${email}`);
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Account is deactivated." });
    }

    // 3 — Issue JWT (same as regular login)
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.status(200).json({
      success:  true,
      token,
      isNewUser,
      user: {
        _id:          user._id,
        name:         user.name,
        email:        user.email,
        avatar:       user.avatar,
        role:         user.role,
        authProvider: user.authProvider,
      },
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { googleLogin };