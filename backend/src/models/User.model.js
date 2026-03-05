const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // ── Basic Info ───────────────────────────────────────────
    name: {
      type:      String,
      required:  [true, "Name is required"],
      trim:      true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type:     String,
      required: [true, "Email is required"],
      unique:   true,
      trim:     true,
      lowercase: true,
      match:    [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"],
    },
    password: {
      type:     String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select:   false, // never returned in queries by default
    },

    // ── Role & Permissions ───────────────────────────────────
    role: {
      type:    String,
      enum:    ["user", "admin", "moderator"],
      default: "user",
    },

    // ── Auth Provider (local or Google) ──────────────────────
    authProvider: {
      type:    String,
      enum:    ["local", "google"],
      default: "local",
    },
    googleId: {
      type:    String,
      default: null,
    },
    avatar: {
      type:    String,
      default: "",
    },

    // ── Account Status ───────────────────────────────────────
    isActive: {
      type:    Boolean,
      default: true,
    },
    isVerified: {
      type:    Boolean,
      default: false,
    },

    // ── Activity Tracking (for admin panel) ──────────────────
    lastLoginAt: {
      type:    Date,
      default: null,
    },
    loginCount: {
      type:    Number,
      default: 0,
    },

    // ── Profile extras ───────────────────────────────────────
    phone: {
      type:    String,
      default: "",
    },
    location: {
      type:    String,
      default: "",
    },
    bio: {
      type:    String,
      default: "",
      maxlength: [300, "Bio cannot exceed 300 characters"],
    },
    targetRole: {
      type:    String,
      default: "",
    },
    skills: {
      type:    [String],
      default: [],
    },
    experience: {
      type:    String,
      enum:    ["", "fresher", "0-1", "1-3", "3-5", "5-10", "10+"],
      default: "",
    },
    education: {
      type:    String,
      default: "",
    },
    linkedin: {
      type:    String,
      default: "",
    },
    github: {
      type:    String,
      default: "",
    },
    portfolio: {
      type:    String,
      default: "",
    },

    // ── Admin notes (only admins can set this) ───────────────
    adminNotes: {
      type:    String,
      default: "",
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// ── Hash password before saving ───────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Compare password method ───────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Update lastLoginAt helper ─────────────────────────────────
userSchema.methods.recordLogin = async function () {
  this.lastLoginAt = new Date();
  this.loginCount  = (this.loginCount || 0) + 1;
  await this.save();
};

// ── Virtual: isAdmin ──────────────────────────────────────────
userSchema.virtual("isAdmin").get(function () {
  return this.role === "admin";
});

const User = mongoose.model("User", userSchema);
module.exports = User;