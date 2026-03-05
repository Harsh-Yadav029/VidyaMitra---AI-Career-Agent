// ============================================================
// VidyaMitra — routes/googleAuth.routes.js
// POST /api/auth/google
// ============================================================
const express = require("express");
const { googleLogin } = require("../controllers/googleAuth.controller");

const router = express.Router();

router.post("/google", googleLogin);

module.exports = router;