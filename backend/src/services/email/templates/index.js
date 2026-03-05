const baseTemplate = require("./baseTemplate");

// ── Welcome Email ─────────────────────────────────────────────
const welcomeEmail = ({ name }) => ({
  subject: "🎓 Welcome to VidyaMitra — Let's build your career!",
  html: baseTemplate(`
    <p class="greeting">Welcome aboard, ${name}! 👋</p>
    <p class="text">You've just joined thousands of students and professionals using AI to supercharge their career journey.</p>
    <div class="card">
      <div class="card-title">🚀 Get Started in 4 Steps</div>
      <div class="stat"><span class="stat-label">1. Upload your resume</span><span class="stat-value">→</span></div>
      <div class="stat"><span class="stat-label">2. Get your AI score</span><span class="stat-value">→</span></div>
      <div class="stat"><span class="stat-label">3. Practice mock interviews</span><span class="stat-value">→</span></div>
      <div class="stat"><span class="stat-label">4. Find matching jobs</span><span class="stat-value">→</span></div>
    </div>
    <p class="text">Your career journey starts now. We're here every step of the way.</p>
    <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" class="btn">Open VidyaMitra →</a>
    <div class="divider"></div>
    <p class="text" style="font-size:13px">Questions? Just reply to this email — we read every message.</p>
  `),
});

// ── Score Report Email ────────────────────────────────────────
const scoreReportEmail = ({ name, resumeLabel, scores }) => {
  const overall = scores?.overall ?? "--";
  const grade = overall >= 80 ? "A" : overall >= 60 ? "B" : overall >= 40 ? "C" : "D";
  const gradeColor = overall >= 80 ? "#22c55e" : overall >= 60 ? "#22d3ee" : overall >= 40 ? "#f59e0b" : "#ef4444";

  return {
    subject: `⭐ Your Resume Score is ${overall}/100 — ${resumeLabel}`,
    html: baseTemplate(`
      <p class="greeting">Your AI Score Report is ready! ⭐</p>
      <p class="text">Hi <span class="highlight">${name}</span>, here's the full breakdown for <span class="highlight">"${resumeLabel}"</span>.</p>
      <div class="card">
        <div class="score-big">
          <div class="score-number" style="color:${gradeColor}">${overall}</div>
          <div class="score-label">Overall Score / 100 &nbsp;·&nbsp; Grade: <strong style="color:${gradeColor}">${grade}</strong></div>
        </div>
      </div>
      <div class="card">
        <div class="card-title">📊 Score Breakdown</div>
        <div class="stat"><span class="stat-label">ATS Compatibility</span><span class="stat-value">${scores?.ats ?? "--"}/100</span></div>
        <div class="stat"><span class="stat-label">Impact & Achievements</span><span class="stat-value">${scores?.impact ?? "--"}/100</span></div>
        <div class="stat"><span class="stat-label">Completeness</span><span class="stat-value">${scores?.completeness ?? "--"}/100</span></div>
        <div class="stat"><span class="stat-label">Readability</span><span class="stat-value">${scores?.readability ?? "--"}/100</span></div>
        <div class="stat"><span class="stat-label">Skill Match</span><span class="stat-value">${scores?.skillMatch ?? "--"}/100</span></div>
      </div>
      <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/score" class="btn">View Full Report →</a>
    `),
  };
};

// ── Interview Results Email ───────────────────────────────────
const interviewResultEmail = ({ name, targetRole, overallScore, totalQuestions, answers }) => {
  const grade = overallScore >= 80 ? "Excellent" : overallScore >= 60 ? "Good" : overallScore >= 40 ? "Average" : "Needs Work";
  const topAnswers = (answers || []).slice(0, 3);

  return {
    subject: `🎤 Interview Results: ${overallScore}/100 for ${targetRole}`,
    html: baseTemplate(`
      <p class="greeting">Your Mock Interview Results 🎤</p>
      <p class="text">Hi <span class="highlight">${name}</span>, you just completed a mock interview for <span class="highlight">${targetRole}</span>. Here's how you did!</p>
      <div class="card">
        <div class="score-big">
          <div class="score-number">${overallScore}</div>
          <div class="score-label">Overall Score / 100 &nbsp;·&nbsp; ${grade}</div>
        </div>
      </div>
      <div class="card">
        <div class="card-title">📋 Session Summary</div>
        <div class="stat"><span class="stat-label">Target Role</span><span class="stat-value">${targetRole}</span></div>
        <div class="stat"><span class="stat-label">Questions Answered</span><span class="stat-value">${totalQuestions}</span></div>
        <div class="stat"><span class="stat-label">Performance</span><span class="stat-value">${grade}</span></div>
      </div>
      ${topAnswers.length > 0 ? `
      <div class="card">
        <div class="card-title">💡 Top Answers</div>
        ${topAnswers.map(a => `
          <div style="margin-bottom:12px">
            <p style="font-size:13px;color:#64748b;margin-bottom:4px">${a.question || "Question"}</p>
            <p style="font-size:14px;color:#22d3ee;font-weight:600">Score: ${a.score ?? "--"}/100</p>
          </div>
        `).join("")}
      </div>` : ""}
      <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/interview" class="btn">Practice Again →</a>
    `),
  };
};

// ── Job Match Alert Email ─────────────────────────────────────
const jobMatchEmail = ({ name, targetRole, jobs }) => {
  const topJobs = (jobs || []).slice(0, 5);

  return {
    subject: `💼 ${topJobs.length} New Job Matches for ${targetRole}`,
    html: baseTemplate(`
      <p class="greeting">New Job Matches Found! 💼</p>
      <p class="text">Hi <span class="highlight">${name}</span>, we found <span class="highlight">${topJobs.length} jobs</span> matching your profile for <span class="highlight">${targetRole}</span>.</p>
      <div class="card">
        <div class="card-title">🎯 Top Matches</div>
        ${topJobs.map(job => `
          <div class="stat">
            <div>
              <p style="font-size:14px;color:#f1f5f9;font-weight:600">${job.title || "Role"}</p>
              <p style="font-size:12px;color:#64748b">${job.company || ""} ${job.location ? "· " + job.location : ""}</p>
            </div>
            <span class="stat-value">${job.matchScore ?? "--"}%</span>
          </div>
        `).join("")}
      </div>
      <div style="margin:16px 0">
        ${(topJobs[0]?.requiredSkills || []).slice(0, 6).map(s => `<span class="tag">${s}</span>`).join("")}
      </div>
      <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/jobs" class="btn">View All Matches →</a>
    `),
  };
};

module.exports = { welcomeEmail, scoreReportEmail, interviewResultEmail, jobMatchEmail };