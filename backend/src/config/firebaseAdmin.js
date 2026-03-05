// ============================================================
// VidyaMitra — config/firebaseAdmin.js
// Initialize Firebase Admin SDK for token verification
// ============================================================
const admin = require("firebase-admin");

if (!admin.apps.length) {
  const projectId   = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey  = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  // Warn loudly if any required env var is missing
  if (!projectId || !clientEmail || !privateKey) {
    console.error("❌ Firebase Admin — missing env vars:");
    console.error("   FIREBASE_PROJECT_ID  :", projectId   ? "✅ set" : "❌ MISSING");
    console.error("   FIREBASE_CLIENT_EMAIL:", clientEmail ? "✅ set" : "❌ MISSING");
    console.error("   FIREBASE_PRIVATE_KEY :", privateKey  ? "✅ set" : "❌ MISSING");
  } else {
    console.log("🔵 Firebase Admin initializing with project:", projectId);
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
    console.log("✅ Firebase Admin initialized successfully");
  } catch (err) {
    console.error("❌ Firebase Admin initializeApp failed:", err.message);
  }
}

module.exports = admin;