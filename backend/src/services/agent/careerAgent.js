// ============================================================
//  VidyaMitra — services/agent/careerAgent.js
//  AI Career Agent using Google Gemini (free tier)
//  Falls back to rule-based if no GEMINI_API_KEY configured
// ============================================================

const { buildSystemPrompt, buildIntentPrompt } = require("./promptBuilder");
const { detectIntent, INTENTS } = require("./intentDetector");
const {
  getSkillGap,
  getLearningRoadmap,
  INTERVIEW_PATTERNS,
  JOB_SEARCH_TIPS,
  CAREER_PATHS,
  ROLE_SKILLS,
} = require("./careerKnowledge");
const logger = require("../../config/logger");

/**
 * Process a user message and generate a career agent response.
 * Uses Gemini if GEMINI_API_KEY is set, otherwise rule-based fallback.
 */
const processMessage = async (userMessage, history, userContext) => {
  const intent = detectIntent(userMessage);
  logger.info(`Agent intent detected: ${intent}`);

  let reply;

  if (process.env.GEMINI_API_KEY) {
    try {
      reply = await callGemini(userMessage, history, userContext, intent);
      logger.info("Gemini agent response generated");
    } catch (err) {
      logger.error(`Gemini agent failed: ${err.message} — using rule-based fallback`);
      reply = generateFallbackReply(userMessage, intent, userContext);
    }
  } else {
    logger.warn("No GEMINI_API_KEY configured — using rule-based fallback");
    reply = generateFallbackReply(userMessage, intent, userContext);
  }

  const suggestedFollowUps = getSuggestedFollowUps(intent, userContext);
  return { reply, intent, suggestedFollowUps };
};

// ── Google Gemini ─────────────────────────────────────────────
const callGemini = async (userMessage, history, userContext, intent) => {
  let GoogleGenerativeAI;
  try {
    ({ GoogleGenerativeAI } = require("@google/generative-ai"));
  } catch {
    throw new Error("@google/generative-ai not installed. Run: npm install @google/generative-ai");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // ── FIX: updated model name ───────────────────────────────────
  // "gemini-1.5-flash-latest" and "gemini-1.5-flash" are both removed
  // from the v1beta API. Use a specific stable version instead.
  //
  // Priority order (env var → gemini-2.0-flash → gemini-1.5-flash-002):
  //   GEMINI_MODEL=gemini-2.0-flash          ← fastest, free tier, recommended
  //   GEMINI_MODEL=gemini-1.5-flash-002      ← stable fallback
  //   GEMINI_MODEL=gemini-1.5-pro-002        ← higher quality, slower
  //
  // Set GEMINI_MODEL in your .env to override, otherwise defaults to
  // gemini-2.0-flash which is available on the free tier.
  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  const model = genAI.getGenerativeModel({ model: modelName });

  const systemPrompt    = buildSystemPrompt(userContext);
  const intentAddition  = buildIntentPrompt(intent, userContext);

  const historyText = history
    .slice(-6)
    .map(m => `${m.role === "user" ? "User" : "VidyaMitra"}: ${m.content}`)
    .join("\n");

  const fullPrompt = `${systemPrompt}
${intentAddition ? `\nFOCUS FOR THIS RESPONSE:\n${intentAddition}` : ""}
${historyText ? `\nCONVERSATION SO FAR:\n${historyText}\n` : ""}
User: ${userMessage}
VidyaMitra:`;

  const result = await model.generateContent(fullPrompt);
  const text   = result.response.text().trim();
  if (!text) throw new Error("Empty response from Gemini");
  return text;
};

// ── Rule-based fallback (no API key required) ─────────────────
const generateFallbackReply = (userMessage, intent, userContext) => {
  const name   = userContext.userName?.split(" ")[0] || "there";
  const role   = userContext.targetRole;
  const skills = userContext.currentSkills || [];
  const score  = userContext.overallScore;

  switch (intent) {
    case INTENTS.GREETING:
      return `Hi ${name}! 👋 I'm VidyaMitra, your AI Career Coach. I can help you with:

• **Skill gap analysis** — find out what skills you need for your target role
• **Career path guidance** — plan your next career move
• **Interview preparation** — practice common questions
• **Resume improvement** — act on your score of ${score ? `${score}/100` : "N/A"}
• **Learning roadmap** — get a structured plan to level up

${role ? `I see you're targeting **${role}**. What would you like to work on today?` : "What role are you targeting? Tell me and I'll give you personalized advice!"}`;

    case INTENTS.SKILL_GAP: {
      if (!role) {
        return `Great question, ${name}! To give you an accurate skill gap analysis, I need to know your target role first. What role are you aiming for? For example: Full Stack Developer, Data Scientist, DevOps Engineer, etc.`;
      }
      const gap = getSkillGap(skills, role);
      if (!gap) {
        return `I have data on roles like Full Stack Developer, Backend Developer, Frontend Developer, Data Scientist, DevOps Engineer, and AI/ML Engineer. Which of these is closest to your target?`;
      }
      const missingCore = gap.missingCore.slice(0, 5);
      const missingGood = gap.missingGood.slice(0, 3);
      return `Here's your skill gap analysis for **${role}**, ${name}:

**Match Rate:** ${gap.matchPercentage}% (${gap.matchedSkills.length} of ${gap.matchedSkills.length + gap.missingCore.length + gap.missingGood.length} skills matched)

**✅ You have:** ${gap.matchedSkills.slice(0, 6).join(", ")}

**🔴 Critical gaps (learn these first):**
${missingCore.length ? missingCore.map(s => `• ${s}`).join("\n") : "• None! Great coverage of core skills."}

**🟡 Good to have:**
${missingGood.length ? missingGood.map(s => `• ${s}`).join("\n") : "• None missing!"}

**💰 Salary range:** ${gap.salary.fresher} (fresher) → ${gap.salary.senior} (senior)

Would you like a **learning roadmap** to close these gaps?`;
    }

    case INTENTS.CAREER_PATH: {
      if (!role) {
        return `To map out your career path, ${name}, tell me your current role or the role you're targeting. I'll show you where you can go from there!`;
      }
      const path = CAREER_PATHS[role];
      if (!path) {
        return `For ${role}, the typical path is: Junior → Mid-level → Senior → Lead/Architect. Each step takes 2-3 years and requires deepening your technical skills plus developing leadership abilities. Want specific advice on what to focus on at your current stage?`;
      }
      return `Career roadmap for **${role}**, ${name}:

**⬆️ Natural next roles:**
${path.next.map(r => `• ${r}`).join("\n")}

**↔️ Career pivots (with skill overlap):**
${path.pivot.map(r => `• ${r}`).join("\n")}

**⏱ Time to next level:** ${path.timeToNext}

**To get promoted, focus on:**
• Leading small projects or mentoring juniors
• Deepening expertise in 1-2 advanced areas
• Contributing beyond your immediate tasks
• Building visibility in your team

What specific transition are you most interested in?`;
    }

    case INTENTS.INTERVIEW_PREP: {
      const behavioral  = INTERVIEW_PATTERNS.behavioral.slice(0, 3);
      const technical   = INTERVIEW_PATTERNS.technical_general.slice(0, 3);
      return `Interview prep plan for ${name}${role ? ` targeting ${role}` : ""}:

**🎯 Top Behavioral Questions:**
${behavioral.map((q, i) => `${i + 1}. ${q}`).join("\n")}

**💻 Top Technical Questions:**
${technical.map((q, i) => `${i + 1}. ${q}`).join("\n")}

**The STAR Method for behavioral questions:**
• **S**ituation — Set the context briefly
• **T**ask — What was your responsibility?
• **A**ction — What did YOU specifically do?
• **R**esult — What was the measurable outcome?

Want me to do a **mock interview**? Ask me any of these questions and I'll evaluate your answer!`;
    }

    case INTENTS.RESUME_REVIEW:
      return `Resume tips for ${name}${score ? ` (current score: ${score}/100)` : ""}:

**🔴 High Impact fixes:**
• Start every bullet with a strong action verb (Led, Built, Improved, Reduced)
• Add numbers: "Improved performance by 40%", "Served 50K users"
• Use standard section headings (EXPERIENCE, EDUCATION, SKILLS) for ATS

**🟡 Medium Impact:**
• Write a 2-3 sentence professional summary at the top
• List 10-15 relevant technical skills
• Add your GitHub/LinkedIn URLs

**✅ Quick Wins:**
• Remove "Responsible for" — replace with action verbs
• Ensure consistent date formatting throughout

${score && score < 70 ? `Your score of ${score}/100 suggests focusing on the high-impact fixes first. Which section would you like to dive deeper into?` : "You're on the right track! Which section do you want to improve most?"}`;

    case INTENTS.LEARNING_ROADMAP: {
      if (!role) {
        return `I'd love to build you a learning roadmap, ${name}! First tell me: what's your target role and what's your current experience level (fresher/1-2 years/3+ years)?`;
      }
      const gap          = getSkillGap(skills, role);
      const missingSkills = gap ? gap.missingCore.slice(0, 4) : [];
      if (missingSkills.length === 0) {
        return `Great news ${name}! You already have strong coverage of core ${role} skills. Focus next on advanced topics and building real projects to strengthen your portfolio. Would you like advice on what to build?`;
      }
      const roadmap = getLearningRoadmap(missingSkills);
      return `**Learning Roadmap for ${role}**, ${name}:

${roadmap.map((item, i) => `**Week ${(i + 1) * 2 - 1}-${(i + 1) * 2}: ${item.skill}**
• Time needed: ${item.estimatedTime}
• Resources: ${item.resources.slice(0, 2).join(", ")}`).join("\n\n")}

**General advice:**
• Code daily — even 1 hour is better than 0
• Build a project with each new skill
• Document your progress on GitHub

Want me to break down any of these skills in more detail?`;
    }

    case INTENTS.SALARY_INFO: {
      if (!role) {
        return `For salary info, ${name}, tell me your target role and I'll give you current market rates! I have data on Frontend, Backend, Full Stack, Data Science, DevOps, and AI/ML roles.`;
      }
      const roleData = ROLE_SKILLS[role];
      if (!roleData) {
        return `Typical salary ranges vary a lot by role and location. In India for tech roles, freshers typically earn 4-12 LPA, mid-level 12-25 LPA, and seniors 25-50+ LPA. Tell me your specific role for more precise numbers!`;
      }
      return `**Salary data for ${role}** in India, ${name}:

💼 **Fresher (0-2 years):** ${roleData.avgSalary.fresher}
🚀 **Mid-level (3-5 years):** ${roleData.avgSalary.mid}
⭐ **Senior (6+ years):** ${roleData.avgSalary.senior}

**Negotiation tips:**
• Research glassdoor.com and levels.fyi for current data
• Never give a number first — ask "What's the budgeted range?"
• Get competing offers to create leverage
• Negotiate the full package: base, bonus, ESOPs, WFH flexibility

Want tips on how to negotiate your specific offer?`;
    }

    case INTENTS.JOB_SEARCH:
      return `Job search strategy for ${name}${role ? ` targeting ${role}` : ""}:

**📋 Best job boards for tech:**
• LinkedIn Jobs — highest quality, use "Easy Apply" filter
• Naukri.com — largest volume in India
• AngelList/Wellfound — startups, equity-based roles
• Company career pages — direct applications get more attention

**🎯 Top tips:**
${JOB_SEARCH_TIPS.slice(0, 3).map(t => `• ${t}`).join("\n")}

**📊 Your application strategy:**
• Apply to 5-10 jobs/day consistently
• Spend 70% on networking, 30% on job boards
• Customize your resume for each application

Want help preparing for a specific company or role?`;

    default:
      return `That's a great question, ${name}! As your career coach, I specialize in:

• Skill gap analysis for your target role
• Career path planning and transitions
• Interview preparation (behavioral + technical)
• Resume improvement strategies
• Learning roadmaps and resources
• Job search tactics and salary negotiation

${role ? `Since you're targeting **${role}**, I can give you very specific advice. What aspect would you like help with?` : "Tell me your target role and I'll give you personalized guidance!"}`;
  }
};

// ── Suggested follow-up questions ─────────────────────────────
const getSuggestedFollowUps = (intent, userContext) => {
  const role = userContext.targetRole;

  const suggestions = {
    [INTENTS.GREETING]: [
      "What skills do I need for my target role?",
      "Help me prepare for interviews",
      "What's my career path from here?",
    ],
    [INTENTS.SKILL_GAP]: [
      "Build me a learning roadmap for these skills",
      "How long will it take to be job-ready?",
      "What projects should I build to practice?",
    ],
    [INTENTS.CAREER_PATH]: [
      "What skills do I need for the next level?",
      "How do I get promoted faster?",
      "Should I switch companies or grow internally?",
    ],
    [INTENTS.INTERVIEW_PREP]: [
      "Ask me a behavioral interview question",
      `What are ${role || "my role"} specific technical questions?`,
      "How do I answer 'Tell me about yourself'?",
    ],
    [INTENTS.RESUME_REVIEW]: [
      "How do I improve my ATS score?",
      "Help me rewrite my summary section",
      "What action verbs should I use?",
    ],
    [INTENTS.LEARNING_ROADMAP]: [
      "How much time should I study daily?",
      "What projects should I build?",
      "Which certifications are worth it?",
    ],
    [INTENTS.SALARY_INFO]: [
      "How do I negotiate my salary?",
      "What benefits should I ask for?",
      "When is the right time to ask for a raise?",
    ],
    [INTENTS.JOB_SEARCH]: [
      "How do I network effectively?",
      "Help me write a cold outreach message",
      "How do I prepare for a referral interview?",
    ],
  };

  return suggestions[intent] || suggestions[INTENTS.GREETING];
};

module.exports = { processMessage };