// ============================================================
//  VidyaMitra — services/agent/promptBuilder.js
//  Builds personalized system prompts for the career agent
//  Injects user context: resume data, scores, target role
// ============================================================

const { ROLE_SKILLS, CAREER_PATHS } = require("./careerKnowledge");

/**
 * Build the system prompt for the career agent
 * Personalizes based on user profile and resume data
 */
const buildSystemPrompt = (userContext) => {
  const {
    userName,
    targetRole,
    currentSkills,
    yearsOfExperience,
    overallScore,
    education,
    topMissingSkills,
    sessionType,
  } = userContext;

  const roleContext = targetRole && ROLE_SKILLS[targetRole]
    ? `\nTarget Role Data:
- Core skills needed: ${ROLE_SKILLS[targetRole].core.join(", ")}
- Good-to-have skills: ${ROLE_SKILLS[targetRole].good.join(", ")}
- Salary range: Fresher ${ROLE_SKILLS[targetRole].avgSalary.fresher}, Mid ${ROLE_SKILLS[targetRole].avgSalary.mid}, Senior ${ROLE_SKILLS[targetRole].avgSalary.senior}`
    : "";

  const careerPathContext = targetRole && CAREER_PATHS[targetRole]
    ? `\nCareer Growth from ${targetRole}:
- Next roles: ${CAREER_PATHS[targetRole].next.join(", ")}
- Career pivots: ${CAREER_PATHS[targetRole].pivot.join(", ")}
- Time to next level: ${CAREER_PATHS[targetRole].timeToNext}`
    : "";

  return `You are VidyaMitra, an expert AI Career Coach and Resume Advisor. You are warm, encouraging, and give specific, actionable advice.

YOUR PERSONALITY:
- Speak like a senior mentor — knowledgeable, supportive, direct
- Give concrete advice, not vague suggestions
- Use examples and numbers wherever possible
- Be concise — 3-5 sentences per point max
- Always end with a clear next action step

CANDIDATE PROFILE:
- Name: ${userName || "the candidate"}
- Target Role: ${targetRole || "Not specified (ask them!)"}
- Years of Experience: ${yearsOfExperience || 0}
- Current Skills: ${currentSkills?.slice(0, 12).join(", ") || "Not specified"}
- Education: ${education || "Not specified"}
- Resume Score: ${overallScore ? `${overallScore}/100` : "Not scored yet"}
- Skills to Improve: ${topMissingSkills?.slice(0, 5).join(", ") || "Run a skill gap analysis first"}
${roleContext}
${careerPathContext}

SESSION TYPE: ${sessionType || "general career coaching"}

IMPORTANT RULES:
1. Always address the candidate by their first name
2. Reference their actual skills and score in your responses
3. Give role-specific advice based on their target role
4. If they haven't set a target role, ask them first
5. Keep responses focused and actionable — no fluff
6. If asked about topics outside career/tech, politely redirect
7. Format responses with clear sections when giving lists

You have access to the candidate's full profile above. Use it to give personalized, specific advice every time.`;
};

/**
 * Build a short context injection for follow-up messages
 * (keeps token count low for multi-turn conversations)
 */
const buildContextInjection = (userContext) => {
  return `[Candidate: ${userContext.userName}, Target: ${userContext.targetRole || "TBD"}, Skills: ${userContext.currentSkills?.slice(0, 5).join(", ")}, Score: ${userContext.overallScore || "N/A"}/100]`;
};

/**
 * Build intent-specific prompt additions
 */
const buildIntentPrompt = (intent, userContext) => {
  const prompts = {
    skill_gap: `Focus on: Identify exactly which skills ${userContext.userName} is missing for their target role. Be specific about priority order — what to learn first for maximum job impact.`,

    career_path: `Focus on: Give ${userContext.userName} a clear career progression roadmap. Include realistic timelines, skills to acquire at each stage, and what senior-level looks like for their target role.`,

    interview_prep: `Focus on: Give ${userContext.userName} role-specific interview preparation advice. Include both behavioral and technical question patterns. Give a sample strong answer for one behavioral question.`,

    resume_review: `Focus on: Give ${userContext.userName} specific, actionable resume improvement advice based on their score of ${userContext.overallScore}/100. Prioritize the highest-impact changes.`,

    salary_info: `Focus on: Give ${userContext.userName} accurate, current salary information for their target role and experience level. Include negotiation tips.`,

    learning_roadmap: `Focus on: Create a structured, week-by-week learning plan for ${userContext.userName}. Be specific about resources (course names, websites, books) for their skill gaps.`,

    job_search: `Focus on: Give ${userContext.userName} practical, tactical job search advice. Include where to apply, how to network, and how to stand out for their target role.`,
  };

  return prompts[intent] || "";
};

module.exports = { buildSystemPrompt, buildContextInjection, buildIntentPrompt };
