// ============================================================
//  VidyaMitra — services/ai/feedbackGenerator.js
//  AI feedback using Google Gemini (free tier)
//  Falls back to rule-based if no GEMINI_API_KEY configured
// ============================================================

const logger = require("../../config/logger");

/**
 * Generate AI-powered resume feedback using Gemini
 */
const generateAIFeedback = async (parsedData, scoreReport, jobDescription = null) => {
  if (!process.env.GEMINI_API_KEY) {
    logger.warn("No GEMINI_API_KEY configured — using rule-based feedback");
    return generateRuleBasedFeedback(parsedData, scoreReport);
  }

  try {
    return await generateGeminiFeedback(parsedData, scoreReport, jobDescription);
  } catch (error) {
    logger.error(`Gemini feedback failed: ${error.message} — using rule-based fallback`);
    return generateRuleBasedFeedback(parsedData, scoreReport);
  }
};

// ── Google Gemini ─────────────────────────────────────────────
const generateGeminiFeedback = async (parsedData, scoreReport, jobDescription) => {
  let GoogleGenerativeAI;
  try {
    ({ GoogleGenerativeAI } = require("@google/generative-ai"));
  } catch {
    throw new Error("@google/generative-ai not installed. Run: npm install @google/generative-ai");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-1.5-flash" });
  const prompt = buildPrompt(parsedData, scoreReport, jobDescription);

  const result = await model.generateContent(
    `You are VidyaMitra, an expert career coach and resume specialist.
You provide concise, actionable, personalized feedback to help candidates improve their resumes.
Always be encouraging but honest. Respond ONLY with valid JSON — no markdown, no backticks, no explanation.

${prompt}`
  );

  const text = result.response.text().trim();

  // Strip markdown code fences if Gemini adds them
  const clean = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const jsonMatch = clean.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Gemini did not return valid JSON");

  const parsed = JSON.parse(jsonMatch[0]);
  parsed.isAIGenerated = true;
  parsed.provider = "gemini";
  return parsed;
};

// ── Shared prompt builder ─────────────────────────────────────
const buildPrompt = (parsedData, scoreReport, jobDescription) => {
  const { overall, ats, impact, completeness, readability, skillMatch } = scoreReport.scores;

  return `Analyze this resume and provide personalized career feedback.

CANDIDATE: ${parsedData.fullName || "Candidate"}
TARGET ROLE: ${parsedData.targetRole || "Not specified"}

RESUME SCORES:
- Overall: ${overall}/100
- ATS Compatibility: ${ats}/100
- Impact: ${impact}/100
- Completeness: ${completeness}/100
- Readability: ${readability}/100
- Skill Match: ${skillMatch}/100

RESUME HIGHLIGHTS:
- Skills: ${(parsedData.skills || []).slice(0, 10).join(", ")}
- Experience entries: ${parsedData.experience?.length || 0}
- Education: ${parsedData.education?.[0]?.degree || "Not found"}
- Projects: ${parsedData.projects?.length || 0}
- Certifications: ${parsedData.certifications?.length || 0}

KEY ISSUES FOUND:
${scoreReport.allIssues.slice(0, 6).map((i) => `- ${i}`).join("\n")}

${jobDescription ? `JOB DESCRIPTION (first 300 chars):\n${jobDescription.slice(0, 300)}` : ""}

Return a JSON object with EXACTLY this structure (no extra fields):
{
  "overallVerdict": "2-3 sentence overall assessment of the resume",
  "strengthHighlights": ["strength 1", "strength 2", "strength 3"],
  "topPriorities": [
    { "priority": "short title", "action": "specific actionable step", "impact": "why this matters" },
    { "priority": "short title", "action": "specific actionable step", "impact": "why this matters" },
    { "priority": "short title", "action": "specific actionable step", "impact": "why this matters" }
  ],
  "sectionFeedback": {
    "experience": "specific feedback on experience section",
    "skills": "specific feedback on skills section",
    "education": "specific feedback on education section"
  },
  "encouragement": "1 motivating closing sentence personalized to the candidate"
}`;
};

// ── Rule-based fallback (works with zero API keys) ────────────
const generateRuleBasedFeedback = (parsedData, scoreReport) => {
  const { overall, ats, impact } = scoreReport.scores;
  const name = parsedData.fullName || "Candidate";
  const skillCount = parsedData.skills?.length || 0;
  const expCount = parsedData.experience?.length || 0;

  const strengths = [];
  if (skillCount >= 10) strengths.push(`Strong technical skill set with ${skillCount} skills listed`);
  if (expCount >= 2) strengths.push(`Good work experience with ${expCount} positions`);
  if (parsedData.projects?.length >= 2) strengths.push("Projects section demonstrates hands-on experience");
  if (parsedData.certifications?.length >= 1) strengths.push("Certifications add credibility to your profile");
  if (parsedData.linkedinUrl) strengths.push("LinkedIn profile URL is included");
  if (strengths.length === 0) strengths.push("Resume has a clear, readable structure");

  const priorities = [];
  if (impact < 60) priorities.push({
    priority: "Add Quantified Achievements",
    action: "Add numbers to your bullet points: percentages, team sizes, project scale, time saved",
    impact: "Resumes with metrics are 40% more likely to get interviews",
  });
  if (ats < 70) priorities.push({
    priority: "Fix ATS Compatibility",
    action: "Use standard section headings: EXPERIENCE, EDUCATION, SKILLS, PROJECTS",
    impact: "75% of resumes are rejected by ATS before a human sees them",
  });
  if (skillCount < 10) priorities.push({
    priority: "Expand Skills Section",
    action: `Add more relevant technical skills — you currently have ${skillCount}. Aim for 12-15.`,
    impact: "More keyword matches = higher ATS score and better job matches",
  });
  if (!parsedData.summary) priorities.push({
    priority: "Add Professional Summary",
    action: "Write a 2-3 sentence summary highlighting your experience, key skills, and career goal",
    impact: "Recruiters spend only 7 seconds on a resume — a strong summary hooks them immediately",
  });
  if (priorities.length === 0) priorities.push({
    priority: "Tailor for Each Job",
    action: "Paste a job description to get a precise skill match score and tailoring tips",
    impact: "Tailored resumes have 3x higher callback rates than generic ones",
  });

  const verdict = overall >= 75
    ? `${name}, your resume is in good shape with an overall score of ${overall}/100. Focus on the priority improvements below to make it exceptional.`
    : overall >= 50
    ? `${name}, your resume has a solid foundation (${overall}/100) but needs work in key areas. The improvements below will significantly boost your chances.`
    : `${name}, your resume needs significant improvement (${overall}/100). Don't worry — the action items below will quickly raise your score.`;

  return {
    overallVerdict: verdict,
    strengthHighlights: strengths.slice(0, 3),
    topPriorities: priorities.slice(0, 3),
    sectionFeedback: {
      experience: expCount === 0
        ? "No experience section detected. Add your work history including internships."
        : expCount === 1
        ? "You have 1 experience entry. Add more context and bullet points with achievements."
        : `Good — ${expCount} experience entries found. Focus on adding quantified achievements.`,
      skills: skillCount < 8
        ? "Skills section is thin. Add more technical skills relevant to your target role."
        : `Good skill coverage with ${skillCount} skills. Make sure they are organized clearly.`,
      education: parsedData.education?.length
        ? "Education section found. Consider adding GPA if above 7.0/10 or 3.5/4.0."
        : "Education section not clearly detected. Use a standard EDUCATION heading.",
    },
    encouragement: `Keep going, ${name.split(" ")[0]}! Every improvement brings you closer to your dream role. 🚀`,
    isAIGenerated: false,
    provider: "rule-based",
  };
};

module.exports = { generateAIFeedback };
