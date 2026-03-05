// ============================================================
//  VidyaMitra — services/agent/careerKnowledge.js
//  Domain knowledge base for the career agent
//  Contains: role requirements, career paths, salary data,
//  interview patterns, skill roadmaps
// ============================================================

// ── Top roles and their required skills ───────────────────────
const ROLE_SKILLS = {
  "Frontend Developer": {
    core: ["HTML", "CSS", "JavaScript", "React", "TypeScript"],
    good: ["Next.js", "Tailwind CSS", "Redux", "Git", "REST API"],
    advanced: ["GraphQL", "Webpack", "Performance Optimization", "Testing"],
    avgSalary: { fresher: "4-8 LPA", mid: "10-18 LPA", senior: "20-35 LPA" },
  },
  "Backend Developer": {
    core: ["Node.js", "Express", "MongoDB", "PostgreSQL", "REST API"],
    good: ["Docker", "AWS", "Redis", "JWT", "Microservices"],
    advanced: ["Kubernetes", "GraphQL", "System Design", "Message Queues"],
    avgSalary: { fresher: "5-10 LPA", mid: "12-22 LPA", senior: "25-40 LPA" },
  },
  "Full Stack Developer": {
    core: ["JavaScript", "React", "Node.js", "MongoDB", "Git"],
    good: ["TypeScript", "Next.js", "Docker", "AWS", "PostgreSQL"],
    advanced: ["System Design", "DevOps", "GraphQL", "Performance"],
    avgSalary: { fresher: "5-10 LPA", mid: "12-25 LPA", senior: "25-45 LPA" },
  },
  "Data Scientist": {
    core: ["Python", "Pandas", "NumPy", "Machine Learning", "Statistics"],
    good: ["TensorFlow", "PyTorch", "SQL", "Tableau", "Scikit-learn"],
    advanced: ["Deep Learning", "NLP", "MLOps", "Spark", "Feature Engineering"],
    avgSalary: { fresher: "6-12 LPA", mid: "15-30 LPA", senior: "30-55 LPA" },
  },
  "DevOps Engineer": {
    core: ["Linux", "Docker", "Kubernetes", "CI/CD", "AWS"],
    good: ["Terraform", "Jenkins", "Git", "Python", "Monitoring"],
    advanced: ["Helm", "Service Mesh", "Security", "Cost Optimization"],
    avgSalary: { fresher: "6-12 LPA", mid: "15-28 LPA", senior: "28-50 LPA" },
  },
  "AI/ML Engineer": {
    core: ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch"],
    good: ["LangChain", "HuggingFace", "SQL", "Docker", "MLOps"],
    advanced: ["LLMs", "RAG", "Fine-tuning", "Distributed Training"],
    avgSalary: { fresher: "8-15 LPA", mid: "18-35 LPA", senior: "35-70 LPA" },
  },
  "Mobile Developer": {
    core: ["React Native", "JavaScript", "Android", "iOS"],
    good: ["TypeScript", "Flutter", "Firebase", "REST API", "Git"],
    advanced: ["Native Modules", "Performance", "App Store Optimization"],
    avgSalary: { fresher: "4-9 LPA", mid: "10-20 LPA", senior: "20-38 LPA" },
  },
};

// ── Career transition paths ────────────────────────────────────
const CAREER_PATHS = {
  "Frontend Developer": {
    next: ["Full Stack Developer", "Frontend Lead", "UI Architect"],
    pivot: ["Product Manager", "UX Engineer", "Mobile Developer"],
    timeToNext: "1-2 years",
  },
  "Backend Developer": {
    next: ["Full Stack Developer", "Backend Lead", "Solutions Architect"],
    pivot: ["DevOps Engineer", "Data Engineer", "Product Manager"],
    timeToNext: "1-2 years",
  },
  "Full Stack Developer": {
    next: ["Tech Lead", "Solutions Architect", "Engineering Manager"],
    pivot: ["Product Manager", "DevOps Engineer", "AI/ML Engineer"],
    timeToNext: "2-3 years",
  },
  "Data Scientist": {
    next: ["Senior Data Scientist", "ML Engineer", "Data Science Manager"],
    pivot: ["AI/ML Engineer", "Data Engineer", "Product Analyst"],
    timeToNext: "2-3 years",
  },
  "DevOps Engineer": {
    next: ["Senior DevOps", "Platform Engineer", "SRE Lead"],
    pivot: ["Cloud Architect", "Security Engineer", "Backend Developer"],
    timeToNext: "1-2 years",
  },
};

// ── Common interview question categories ──────────────────────
const INTERVIEW_PATTERNS = {
  behavioral: [
    "Tell me about a time you faced a technical challenge and how you solved it",
    "Describe a situation where you had to meet a tight deadline",
    "How do you handle disagreements with teammates?",
    "Tell me about your most impactful project",
    "Describe a time you learned from a failure",
    "How do you prioritize tasks when everything feels urgent?",
  ],
  technical_general: [
    "Explain the difference between SQL and NoSQL databases",
    "What is REST API and what are its principles?",
    "Explain how authentication with JWT works",
    "What is the difference between synchronous and asynchronous code?",
    "What are the SOLID principles?",
    "Explain the concept of microservices",
  ],
  system_design: [
    "Design a URL shortener like bit.ly",
    "Design a notification system",
    "How would you design a chat application?",
    "Design a file upload service",
    "How would you design a rate limiter?",
  ],
};

// ── Learning resource recommendations ─────────────────────────
const LEARNING_RESOURCES = {
  JavaScript: ["javascript.info", "MDN Web Docs", "You Don't Know JS (book)"],
  React: ["Official React Docs (react.dev)", "Scrimba React Course", "Epic React by Kent C. Dodds"],
  "Node.js": ["nodejs.org docs", "The Odin Project", "Node.js Design Patterns (book)"],
  Python: ["Python.org tutorial", "Automate the Boring Stuff", "Real Python"],
  "Machine Learning": ["fast.ai", "Coursera ML by Andrew Ng", "Hands-On ML (book)"],
  Docker: ["Docker official docs", "TechWorld with Nana (YouTube)", "Docker Deep Dive (book)"],
  AWS: ["AWS Skill Builder", "A Cloud Guru", "AWS Official Documentation"],
  "System Design": ["System Design Primer (GitHub)", "Designing Data-Intensive Applications (book)", "ByteByteGo"],
  DSA: ["LeetCode", "NeetCode.io", "Striver's DSA Sheet", "GeeksForGeeks"],
};

// ── Job search tips ────────────────────────────────────────────
const JOB_SEARCH_TIPS = [
  "Apply to jobs within 24-48 hours of posting — early applicants get 3x more callbacks",
  "Tailor your resume for each application — customize skills and summary to match JD keywords",
  "Network actively — 70-80% of jobs are filled through referrals, not job boards",
  "Follow up on applications after 5-7 business days with a polite email",
  "Prepare a 60-second elevator pitch about your background and what you're looking for",
  "LinkedIn profile with a photo gets 14x more views — optimize your headline and summary",
  "Contribute to open source or build personal projects to strengthen your portfolio",
];

/**
 * Get skill gap for a user vs target role
 */
const getSkillGap = (userSkills, targetRole) => {
  const roleData = ROLE_SKILLS[targetRole];
  if (!roleData) return null;

  const userSkillsLower = userSkills.map((s) => s.toLowerCase());
  const allRoleSkills = [...roleData.core, ...roleData.good];

  const missing = allRoleSkills.filter(
    (s) => !userSkillsLower.includes(s.toLowerCase())
  );
  const matched = allRoleSkills.filter((s) =>
    userSkillsLower.includes(s.toLowerCase())
  );

  return {
    targetRole,
    matchedSkills: matched,
    missingCore: roleData.core.filter((s) => !userSkillsLower.includes(s.toLowerCase())),
    missingGood: roleData.good.filter((s) => !userSkillsLower.includes(s.toLowerCase())),
    matchPercentage: Math.round((matched.length / allRoleSkills.length) * 100),
    salary: roleData.avgSalary,
  };
};

/**
 * Get learning roadmap for missing skills
 */
const getLearningRoadmap = (missingSkills) => {
  return missingSkills.map((skill) => ({
    skill,
    resources: LEARNING_RESOURCES[skill] || [
      `Search "${skill} tutorial" on YouTube`,
      `Official ${skill} documentation`,
      `Udemy/Coursera ${skill} courses`,
    ],
    estimatedTime: getEstimatedTime(skill),
  }));
};

const getEstimatedTime = (skill) => {
  const quick = ["Git", "REST API", "JWT", "Docker basics"];
  const medium = ["React", "Node.js", "MongoDB", "PostgreSQL", "TypeScript"];
  const long = ["Machine Learning", "System Design", "Kubernetes", "AWS"];

  if (quick.includes(skill)) return "1-2 weeks";
  if (medium.includes(skill)) return "4-8 weeks";
  if (long.includes(skill)) return "2-4 months";
  return "2-4 weeks";
};

module.exports = {
  ROLE_SKILLS,
  CAREER_PATHS,
  INTERVIEW_PATTERNS,
  LEARNING_RESOURCES,
  JOB_SEARCH_TIPS,
  getSkillGap,
  getLearningRoadmap,
};
