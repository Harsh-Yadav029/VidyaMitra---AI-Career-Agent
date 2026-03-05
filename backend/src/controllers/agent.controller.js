// ============================================================
//  VidyaMitra — controllers/agent.controller.js
//  Handles: create session, send message, get history, delete
// ============================================================

const ChatSession = require("../models/ChatSession.model");
const Resume = require("../models/Resume.model");
const User = require("../models/User.model");
const { processMessage } = require("../services/agent/careerAgent");
const { getSkillGap, getLearningRoadmap } = require("../services/agent/careerKnowledge");
const logger = require("../config/logger");

// ── POST /api/agent/sessions ───────────────────────────────────
// Create a new chat session
const createSession = async (req, res, next) => {
  try {
    const { sessionType, resumeId } = req.body;
    const user = await User.findById(req.user._id);

    // Get resume context if provided
    let resumeContext = {};
    let activeResumeId = resumeId || user.activeResumeId;

    if (activeResumeId) {
      const resume = await Resume.findOne({
        _id: activeResumeId,
        userId: req.user._id,
      });
      if (resume?.parsedData) {
        resumeContext = {
          currentSkills: resume.parsedData.skills || [],
          yearsOfExperience: resume.parsedData.yearsOfExperience || 0,
          education: resume.parsedData.education?.[0]?.degree || null,
          overallScore: resume.scores?.overall || null,
        };
      }
    }

    // Build user context snapshot
    const userContext = {
      userName: user.name,
      targetRole: user.targetRole,
      currentSkills: resumeContext.currentSkills || user.currentSkills || [],
      yearsOfExperience: resumeContext.yearsOfExperience || 0,
      education: resumeContext.education,
      overallScore: resumeContext.overallScore,
      topMissingSkills: [],
    };

    // Pre-calculate skill gap if role is set
    if (user.targetRole && userContext.currentSkills.length > 0) {
      const gap = getSkillGap(userContext.currentSkills, user.targetRole);
      if (gap) userContext.topMissingSkills = gap.missingCore.slice(0, 5);
    }

    // Generate welcome message
    const welcomeResult = await processMessage("hi", [], userContext);

    const session = await ChatSession.create({
      userId: req.user._id,
      resumeId: activeResumeId || null,
      sessionType: sessionType || "general",
      title: `Career Chat — ${new Date().toLocaleDateString()}`,
      userContext,
      messages: [
        {
          role: "assistant",
          content: welcomeResult.reply,
          meta: { intent: "greeting", isAIGenerated: true },
        },
      ],
      messageCount: 1,
      lastMessageAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Chat session started!",
      session: {
        _id: session._id,
        title: session.title,
        sessionType: session.sessionType,
        messages: session.messages,
        suggestedFollowUps: welcomeResult.suggestedFollowUps,
        userContext: {
          targetRole: userContext.targetRole,
          skillCount: userContext.currentSkills.length,
          resumeScore: userContext.overallScore,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/agent/sessions/:sessionId/message ───────────────
// Send a message and get AI response
const sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Message cannot be empty." });
    }

    if (message.length > 1000) {
      return res.status(400).json({ success: false, message: "Message too long. Max 1000 characters." });
    }

    const session = await ChatSession.findOne({
      _id: req.params.sessionId,
      userId: req.user._id,
      isActive: true,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Chat session not found." });
    }

    // Add user message
    session.messages.push({
      role: "user",
      content: message.trim(),
      meta: { isAIGenerated: false },
    });

    // Build conversation history for AI context (last 10 exchanges)
    const history = session.messages
      .slice(-20)
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role, content: m.content }));

    // Process message through agent
    const { reply, intent, suggestedFollowUps } = await processMessage(
      message.trim(),
      history.slice(0, -1), // exclude current message (already passed separately)
      session.userContext
    );

    // Add assistant response
    session.messages.push({
      role: "assistant",
      content: reply,
      meta: { intent, isAIGenerated: true },
    });

    session.messageCount = session.messages.length;
    session.lastMessageAt = new Date();

    // Summarize if conversation gets long (every 20 messages)
    if (session.messages.length > 20 && session.messages.length % 20 === 0) {
      session.contextSummary = `Conversation about ${session.sessionType} for ${session.userContext.targetRole || "career development"}. ${session.messages.length} messages exchanged.`;
    }

    await session.save();

    logger.info(`Agent message processed: session ${session._id}, intent: ${intent}`);

    res.status(200).json({
      success: true,
      userMessage: message.trim(),
      reply,
      intent,
      suggestedFollowUps,
      messageCount: session.messageCount,
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/agent/sessions ────────────────────────────────────
// Get all sessions for the user
const getSessions = async (req, res, next) => {
  try {
    const sessions = await ChatSession.find({
      userId: req.user._id,
      isActive: true,
    })
      .select("title sessionType messageCount lastMessageAt userContext.targetRole createdAt")
      .sort({ lastMessageAt: -1 })
      .limit(20);

    res.status(200).json({ success: true, count: sessions.length, sessions });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/agent/sessions/:sessionId ────────────────────────
// Get full session with message history
const getSession = async (req, res, next) => {
  try {
    const session = await ChatSession.findOne({
      _id: req.params.sessionId,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found." });
    }

    res.status(200).json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

// ── DELETE /api/agent/sessions/:sessionId ─────────────────────
const deleteSession = async (req, res, next) => {
  try {
    await ChatSession.findOneAndUpdate(
      { _id: req.params.sessionId, userId: req.user._id },
      { isActive: false }
    );
    res.status(200).json({ success: true, message: "Session deleted." });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/agent/skill-gap ───────────────────────────────────
// Direct skill gap analysis endpoint
const getSkillGapAnalysis = async (req, res, next) => {
  try {
    const { targetRole } = req.query;
    const user = await User.findById(req.user._id);

    const role = targetRole || user.targetRole;
    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Please provide a targetRole query param or set it in your profile.",
      });
    }

    // Get skills from active resume or profile
    let skills = user.currentSkills || [];
    if (user.activeResumeId) {
      const resume = await Resume.findById(user.activeResumeId);
      if (resume?.parsedData?.skills?.length) skills = resume.parsedData.skills;
    }

    const gap = getSkillGap(skills, role);
    if (!gap) {
      return res.status(404).json({
        success: false,
        message: `No data found for role: "${role}". Try: Full Stack Developer, Backend Developer, Frontend Developer, Data Scientist, DevOps Engineer, AI/ML Engineer`,
      });
    }

    const roadmap = getLearningRoadmap(gap.missingCore.slice(0, 6));

    res.status(200).json({
      success: true,
      skillGap: gap,
      learningRoadmap: roadmap,
      summary: `You match ${gap.matchPercentage}% of ${role} requirements. Focus on: ${gap.missingCore.slice(0, 3).join(", ")}`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSession,
  sendMessage,
  getSessions,
  getSession,
  deleteSession,
  getSkillGapAnalysis,
};
