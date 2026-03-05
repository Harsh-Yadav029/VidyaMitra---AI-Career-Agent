// ============================================================
// VidyaMitra — controllers/admin.controller.js
// Admin-only endpoints: stats, user management, resumes
// ============================================================
const User   = require("../models/User.model");
const Resume = require("../models/Resume.model");
const logger = require("../config/logger");

// ── GET /api/admin/stats ──────────────────────────────────────
const getStats = async (req, res, next) => {
  try {
    const [
      totalUsers, activeUsers, adminUsers, googleUsers,
      totalResumes, newUsersToday, newUsersThisWeek,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ authProvider: "google" }),
      Resume.countDocuments(),
      User.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } }),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
    ]);

    const last7Days = await Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const date  = new Date();
        date.setDate(date.getDate() - (6 - i));
        const start = new Date(date.setHours(0,  0,  0,  0));
        const end   = new Date(date.setHours(23, 59, 59, 999));
        return User.countDocuments({ createdAt: { $gte: start, $lte: end } })
          .then(count => ({
            date:  start.toLocaleDateString("en-IN", { weekday: "short" }),
            users: count,
          }));
      })
    );

    res.status(200).json({
      success: true,
      stats: {
        totalUsers, activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        adminUsers, googleUsers,
        localUsers: totalUsers - googleUsers,
        totalResumes, newUsersToday, newUsersThisWeek,
      },
      chart: { last7Days },
    });
  } catch (error) { next(error); }
};

// ── GET /api/admin/users ──────────────────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 20, search = "",
      role = "", status = "", sortBy = "createdAt", sortOrder = "desc",
    } = req.query;

    const filter = {};
    if (search) filter.$or = [
      { name:  { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
    if (role)   filter.role     = role;
    if (status) filter.isActive = status === "active";

    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [users, total] = await Promise.all([
      User.find(filter).select("-password").sort(sort)
        .skip((page - 1) * limit).limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true, users,
      pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
    });
  } catch (error) { next(error); }
};

// ── GET /api/admin/users/:id ──────────────────────────────────
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const resumes = await Resume.find({ userId: user._id })
      .select("label isParsed createdAt").sort({ createdAt: -1 }).limit(5);

    res.status(200).json({ success: true, user, resumes });
  } catch (error) { next(error); }
};

// ── PATCH /api/admin/users/:id/role ──────────────────────────
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!["user", "admin", "moderator"].includes(role))
      return res.status(400).json({ success: false, message: "Invalid role." });
    if (req.params.id === req.user._id.toString() && role !== "admin")
      return res.status(400).json({ success: false, message: "You cannot demote yourself." });

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, select: "-password" });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    logger.info(`Admin ${req.user.email} changed role of ${user.email} to ${role}`);
    res.status(200).json({ success: true, message: `Role updated to ${role}.`, user });
  } catch (error) { next(error); }
};

// ── PATCH /api/admin/users/:id/status ────────────────────────
const toggleUserStatus = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ success: false, message: "You cannot deactivate yourself." });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    user.isActive = !user.isActive;
    await user.save();

    logger.info(`Admin ${req.user.email} ${user.isActive ? "activated" : "deactivated"} ${user.email}`);
    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? "activated" : "deactivated"} successfully.`,
      isActive: user.isActive,
    });
  } catch (error) { next(error); }
};

// ── PATCH /api/admin/users/:id/notes ─────────────────────────
const updateAdminNotes = async (req, res, next) => {
  try {
    const { adminNotes } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id, { adminNotes }, { new: true, select: "-password" }
    );
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    res.status(200).json({ success: true, message: "Notes saved.", user });
  } catch (error) { next(error); }
};

// ── DELETE /api/admin/users/:id ───────────────────────────────
const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ success: false, message: "You cannot delete yourself." });

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    await Resume.deleteMany({ userId: req.params.id });

    logger.info(`Admin ${req.user.email} deleted user ${user.email}`);
    res.status(200).json({ success: true, message: "User and their data deleted successfully." });
  } catch (error) { next(error); }
};

// ── GET /api/admin/resumes ────────────────────────────────────
const getAllResumes = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const [resumes, total] = await Promise.all([
      Resume.find()
        .populate("userId", "name email role")
        .select("label isParsed createdAt userId")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Resume.countDocuments(),
    ]);

    res.status(200).json({
      success: true, resumes,
      pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
    });
  } catch (error) { next(error); }
};

// ── DELETE /api/admin/resumes/:id ─────────────────────────────
// FIX: handler was completely missing — frontend DELETE call hit notFound middleware
const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findByIdAndDelete(req.params.id);
    if (!resume)
      return res.status(404).json({ success: false, message: "Resume not found." });

    logger.info(`Admin ${req.user.email} deleted resume ${req.params.id}`);
    res.status(200).json({ success: true, message: "Resume deleted successfully." });
  } catch (error) { next(error); }
};

module.exports = {
  getStats,
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  updateAdminNotes,
  deleteUser,
  getAllResumes,
  deleteResume,
};