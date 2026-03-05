// ============================================================
//  VidyaMitra — services/scorer/completenessScorer.js
//  Completeness Score: checks all important sections exist
//  and have sufficient content
// ============================================================

/**
 * Calculate completeness score (0-100)
 */
const calculateCompletenessScore = (parsedData) => {
  const checks = [];
  const issues = [];
  const tips = [];

  // ── Contact Info (25 pts total) ───────────────────────────
  checks.push({
    label: "Full Name",
    passed: !!parsedData.fullName,
    points: 5,
    tip: "Make sure your full name is clearly at the top of the resume",
  });
  checks.push({
    label: "Email Address",
    passed: !!parsedData.email,
    points: 5,
    tip: "Add a professional email address",
  });
  checks.push({
    label: "Phone Number",
    passed: !!parsedData.phone,
    points: 5,
    tip: "Add your phone number for recruiters to reach you",
  });
  checks.push({
    label: "Location",
    passed: !!parsedData.location,
    points: 3,
    tip: "Add your city/state so recruiters know your location",
  });
  checks.push({
    label: "LinkedIn URL",
    passed: !!parsedData.linkedinUrl,
    points: 4,
    tip: "Add your LinkedIn profile URL — 87% of recruiters use LinkedIn",
  });
  checks.push({
    label: "GitHub / Portfolio",
    passed: !!(parsedData.githubUrl || parsedData.portfolioUrl),
    points: 3,
    tip: "Add your GitHub or portfolio URL to showcase your work",
  });

  // ── Professional Summary (10 pts) ─────────────────────────
  checks.push({
    label: "Professional Summary",
    passed: !!(parsedData.summary && parsedData.summary.length > 50),
    points: 10,
    tip: "Add a 2-3 sentence professional summary that highlights your value proposition",
  });

  // ── Skills (20 pts) ───────────────────────────────────────
  const skillCount = parsedData.skills?.length || 0;
  checks.push({
    label: "Skills Section (5+ skills)",
    passed: skillCount >= 5,
    points: 10,
    tip: "List at least 8-12 relevant technical skills",
  });
  checks.push({
    label: "Skills Variety (10+ skills)",
    passed: skillCount >= 10,
    points: 10,
    tip: `You have ${skillCount} skills listed. Aim for 10-15 relevant skills.`,
  });

  // ── Work Experience (25 pts) ──────────────────────────────
  const expCount = parsedData.experience?.length || 0;
  checks.push({
    label: "Work Experience",
    passed: expCount >= 1,
    points: 15,
    tip: "Add your work experience entries with company name, role, and dates",
  });
  checks.push({
    label: "Multiple Experience Entries",
    passed: expCount >= 2,
    points: 10,
    tip: "Include all relevant work experience, including internships",
  });

  // ── Education (15 pts) ────────────────────────────────────
  const eduCount = parsedData.education?.length || 0;
  checks.push({
    label: "Education",
    passed: eduCount >= 1,
    points: 10,
    tip: "Add your educational qualifications",
  });
  checks.push({
    label: "Education Details (degree, institution)",
    passed: !!(parsedData.education?.[0]?.institution && parsedData.education?.[0]?.degree),
    points: 5,
    tip: "Include degree name, institution, and graduation year",
  });

  // ── Projects (10 pts) ─────────────────────────────────────
  const projCount = parsedData.projects?.length || 0;
  checks.push({
    label: "Projects Section",
    passed: projCount >= 1,
    points: 7,
    tip: "Add 2-3 significant projects with tech stack and outcomes",
  });
  checks.push({
    label: "Multiple Projects",
    passed: projCount >= 2,
    points: 3,
    tip: "Showcase at least 2-3 projects to demonstrate practical experience",
  });

  // ── Certifications (bonus 5 pts) ──────────────────────────
  checks.push({
    label: "Certifications",
    passed: (parsedData.certifications?.length || 0) >= 1,
    points: 5,
    tip: "Add relevant certifications (AWS, Google, Microsoft, etc.) to stand out",
  });

  // ── Calculate score ───────────────────────────────────────
  let totalPossible = checks.reduce((sum, c) => sum + c.points, 0);
  let earned = checks.filter((c) => c.passed).reduce((sum, c) => sum + c.points, 0);

  // Normalize to 100
  const score = Math.round((earned / totalPossible) * 100);

  // Collect issues and tips for failed checks
  checks.forEach((check) => {
    if (!check.passed) {
      issues.push(`Missing: ${check.label}`);
      tips.push(check.tip);
    }
  });

  return {
    score,
    label: getScoreLabel(score),
    checks: checks.map((c) => ({
      label: c.label,
      passed: c.passed,
      points: c.passed ? c.points : 0,
      maxPoints: c.points,
    })),
    issues,
    tips,
    summary: {
      skillCount,
      experienceCount: expCount,
      educationCount: eduCount,
      projectCount: projCount,
      certificationCount: parsedData.certifications?.length || 0,
    },
  };
};

const getScoreLabel = (score) => {
  if (score >= 90) return "Complete";
  if (score >= 75) return "Mostly Complete";
  if (score >= 55) return "Partially Complete";
  return "Incomplete";
};

module.exports = { calculateCompletenessScore };
