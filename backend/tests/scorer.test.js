// ============================================================
//  VidyaMitra — tests/scorer.test.js
//  Unit tests for all Phase 3 scoring modules
// ============================================================

const { calculateATSScore } = require("../src/services/scorer/atsScorer");
const { calculateImpactScore } = require("../src/services/scorer/impactScorer");
const { calculateCompletenessScore } = require("../src/services/scorer/completenessScorer");
const { calculateReadabilityScore } = require("../src/services/scorer/readabilityScorer");
const { calculateSkillMatchScore } = require("../src/services/scorer/skillMatchScorer");
const { scoreResume } = require("../src/services/scorer/resumeScorer");

// ── Strong resume mock data ───────────────────────────────────
const STRONG_PARSED = {
  fullName: "Rahul Sharma",
  email: "rahul@gmail.com",
  phone: "+91 9876543210",
  location: "Bangalore, India",
  linkedinUrl: "https://linkedin.com/in/rahulsharma",
  githubUrl: "https://github.com/rahulsharma",
  summary: "Experienced Full Stack Developer with 4 years building scalable web applications.",
  skills: ["JavaScript", "TypeScript", "React", "Node.js", "MongoDB", "PostgreSQL",
           "Docker", "AWS", "Git", "REST API", "GraphQL", "Redis"],
  skillsByCategory: { frontend: ["React"], backend: ["Node.js"], databases: ["MongoDB"] },
  experience: [
    {
      company: "TechCorp",
      role: "Senior Developer",
      duration: "Jan 2022 - Present",
      description: "Led team of 5 engineers. Reduced API response time by 40%. Built microservices serving 100K users.",
      isCurrent: true,
      startDate: new Date("2022-01-01"),
    },
    {
      company: "StartupXYZ",
      role: "Developer",
      duration: "Jun 2020 - Dec 2021",
      description: "Developed React frontend. Improved load time by 60%. Delivered 3 major features.",
      isCurrent: false,
      startDate: new Date("2020-06-01"),
      endDate: new Date("2021-12-31"),
    },
  ],
  education: [{ institution: "VIT University", degree: "B.Tech Computer Science", year: "2020", gpa: "8.4" }],
  projects: [
    { name: "VidyaMitra", description: "AI career platform", techStack: ["React", "Node.js"] },
    { name: "Portfolio", description: "Personal website", techStack: ["React"] },
  ],
  certifications: [{ name: "AWS Developer Associate", issuer: "AWS", year: "2023" }],
  yearsOfExperience: 4,
  rawText: `Rahul Sharma
rahul@gmail.com  +91 9876543210
Bangalore, India | linkedin.com/in/rahulsharma | github.com/rahulsharma

Summary
Experienced Full Stack Developer with 4 years building scalable web applications using React and Node.js.

Technical Skills
JavaScript, TypeScript, React, Node.js, MongoDB, PostgreSQL, Docker, AWS, Git, Redis

Work Experience
Senior Developer - TechCorp  Jan 2022 - Present
• Led team of 5 engineers to deliver payment gateway
• Reduced API response time by 40% using Redis caching
• Built microservices architecture serving 100,000+ users
• Improved deployment frequency by 3x using Docker

Developer - StartupXYZ  Jun 2020 - Dec 2021
• Developed React frontend with Redux state management
• Improved page load time by 60% through code splitting
• Delivered 3 major product features on time

Education
B.Tech Computer Science - VIT University  2016-2020  CGPA: 8.4/10

Projects
VidyaMitra - AI Career Platform (React, Node.js, MongoDB)
Portfolio Website (React, Tailwind CSS)

Certifications
AWS Certified Developer Associate - Amazon 2023`,
};

// ── Weak resume mock data ─────────────────────────────────────
const WEAK_PARSED = {
  fullName: null,
  email: null,
  phone: null,
  location: null,
  linkedinUrl: null,
  githubUrl: null,
  summary: null,
  skills: ["JavaScript"],
  skillsByCategory: {},
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  yearsOfExperience: 0,
  rawText: "I am a developer. I was responsible for working on some projects. I helped with coding tasks.",
};

// ── ATS Scorer Tests ──────────────────────────────────────────
describe("ATS Scorer", () => {
  it("should return score between 0 and 100", () => {
    const result = calculateATSScore(STRONG_PARSED, STRONG_PARSED.rawText);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("should score strong resume higher than weak", () => {
    const strong = calculateATSScore(STRONG_PARSED, STRONG_PARSED.rawText);
    const weak = calculateATSScore(WEAK_PARSED, WEAK_PARSED.rawText);
    expect(strong.score).toBeGreaterThan(weak.score);
  });

  it("should return label string", () => {
    const result = calculateATSScore(STRONG_PARSED, STRONG_PARSED.rawText);
    expect(typeof result.label).toBe("string");
    expect(result.label.length).toBeGreaterThan(0);
  });

  it("should return issues array", () => {
    const result = calculateATSScore(WEAK_PARSED, WEAK_PARSED.rawText);
    expect(Array.isArray(result.issues)).toBe(true);
  });

  it("should return tips array", () => {
    const result = calculateATSScore(WEAK_PARSED, WEAK_PARSED.rawText);
    expect(Array.isArray(result.tips)).toBe(true);
    expect(result.tips.length).toBeGreaterThan(0);
  });
});

// ── Impact Scorer Tests ───────────────────────────────────────
describe("Impact Scorer", () => {
  it("should score between 0 and 100", () => {
    const result = calculateImpactScore(STRONG_PARSED, STRONG_PARSED.rawText);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("should detect action verbs in strong resume", () => {
    const result = calculateImpactScore(STRONG_PARSED, STRONG_PARSED.rawText);
    expect(result.foundActionVerbs.length).toBeGreaterThan(0);
  });

  it("should detect quantified achievements", () => {
    const result = calculateImpactScore(STRONG_PARSED, STRONG_PARSED.rawText);
    expect(result.quantifiedAchievements.length).toBeGreaterThan(0);
  });

  it("should detect weak phrases in weak resume", () => {
    const result = calculateImpactScore(WEAK_PARSED, WEAK_PARSED.rawText);
    expect(result.weakPhrasesFound.length).toBeGreaterThan(0);
  });

  it("strong resume should score higher than weak", () => {
    const strong = calculateImpactScore(STRONG_PARSED, STRONG_PARSED.rawText);
    const weak = calculateImpactScore(WEAK_PARSED, WEAK_PARSED.rawText);
    expect(strong.score).toBeGreaterThan(weak.score);
  });
});

// ── Completeness Scorer Tests ─────────────────────────────────
describe("Completeness Scorer", () => {
  it("should return score between 0 and 100", () => {
    const result = calculateCompletenessScore(STRONG_PARSED);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("should give strong resume high completeness", () => {
    const result = calculateCompletenessScore(STRONG_PARSED);
    expect(result.score).toBeGreaterThan(70);
  });

  it("should give weak resume low completeness", () => {
    const result = calculateCompletenessScore(WEAK_PARSED);
    expect(result.score).toBeLessThan(30);
  });

  it("should return checks array with passed/failed items", () => {
    const result = calculateCompletenessScore(STRONG_PARSED);
    expect(Array.isArray(result.checks)).toBe(true);
    result.checks.forEach((check) => {
      expect(check).toHaveProperty("label");
      expect(check).toHaveProperty("passed");
      expect(check).toHaveProperty("points");
    });
  });

  it("should include summary counts", () => {
    const result = calculateCompletenessScore(STRONG_PARSED);
    expect(result.summary).toHaveProperty("skillCount");
    expect(result.summary).toHaveProperty("experienceCount");
    expect(result.summary.skillCount).toBe(12);
    expect(result.summary.experienceCount).toBe(2);
  });
});

// ── Readability Scorer Tests ──────────────────────────────────
describe("Readability Scorer", () => {
  it("should return score between 0 and 100", () => {
    const result = calculateReadabilityScore(STRONG_PARSED.rawText);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("should return word count stats", () => {
    const result = calculateReadabilityScore(STRONG_PARSED.rawText);
    expect(result.stats.wordCount).toBeGreaterThan(0);
    expect(result.stats.bulletPointCount).toBeGreaterThanOrEqual(0);
  });

  it("should penalize weak resume for short content", () => {
    const result = calculateReadabilityScore(WEAK_PARSED.rawText);
    expect(result.issues.some((i) => i.toLowerCase().includes("short"))).toBe(true);
  });

  it("should return a label", () => {
    const result = calculateReadabilityScore(STRONG_PARSED.rawText);
    expect(typeof result.label).toBe("string");
  });
});

// ── Skill Match Scorer Tests ──────────────────────────────────
describe("Skill Match Scorer", () => {
  const sampleJD = `We are looking for a Senior Full Stack Developer with experience in:
  - React.js and TypeScript for frontend development
  - Node.js and Express for backend APIs
  - MongoDB and PostgreSQL for databases
  - Docker and AWS for deployment
  - REST API design and GraphQL
  Strong communication and teamwork skills required.`;

  it("should return score between 0 and 100", () => {
    const result = calculateSkillMatchScore(STRONG_PARSED, sampleJD);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("should find matched skills when JD is provided", () => {
    const result = calculateSkillMatchScore(STRONG_PARSED, sampleJD);
    expect(result.matchedSkills.length).toBeGreaterThan(0);
    expect(result.hasJobDescription).toBe(true);
  });

  it("should work without job description", () => {
    const result = calculateSkillMatchScore(STRONG_PARSED, null);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.hasJobDescription).toBe(false);
  });

  it("should show missing skills for weak resume", () => {
    const result = calculateSkillMatchScore(WEAK_PARSED, sampleJD);
    expect(result.missingSkills.length).toBeGreaterThan(0);
  });

  it("strong resume should match JD better than weak", () => {
    const strong = calculateSkillMatchScore(STRONG_PARSED, sampleJD);
    const weak = calculateSkillMatchScore(WEAK_PARSED, sampleJD);
    expect(strong.score).toBeGreaterThan(weak.score);
  });
});

// ── Master Resume Scorer Integration Test ─────────────────────
describe("Master Resume Scorer", () => {
  it("should return complete score report", async () => {
    const report = await scoreResume(STRONG_PARSED, null);

    expect(report.scores).toHaveProperty("overall");
    expect(report.scores).toHaveProperty("ats");
    expect(report.scores).toHaveProperty("impact");
    expect(report.scores).toHaveProperty("completeness");
    expect(report.scores).toHaveProperty("readability");
    expect(report.scores).toHaveProperty("skillMatch");
  }, 15000);

  it("overall score should be between 0 and 100", async () => {
    const report = await scoreResume(STRONG_PARSED, null);
    expect(report.scores.overall).toBeGreaterThanOrEqual(0);
    expect(report.scores.overall).toBeLessThanOrEqual(100);
  }, 15000);

  it("should include AI feedback", async () => {
    const report = await scoreResume(STRONG_PARSED, null);
    expect(report.aiFeedback).toBeDefined();
    expect(report.aiFeedback.overallVerdict).toBeDefined();
    expect(Array.isArray(report.aiFeedback.strengthHighlights)).toBe(true);
    expect(Array.isArray(report.aiFeedback.topPriorities)).toBe(true);
  }, 15000);

  it("strong resume should outscore weak resume", async () => {
    const [strongReport, weakReport] = await Promise.all([
      scoreResume(STRONG_PARSED, null),
      scoreResume(WEAK_PARSED, null),
    ]);
    expect(strongReport.scores.overall).toBeGreaterThan(weakReport.scores.overall);
  }, 20000);

  it("should include labels for all scores", async () => {
    const report = await scoreResume(STRONG_PARSED, null);
    expect(report.labels.overall).toBeDefined();
    expect(report.labels.ats).toBeDefined();
    expect(report.labels.impact).toBeDefined();
  }, 15000);
});
