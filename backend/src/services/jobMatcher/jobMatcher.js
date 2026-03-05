// ============================================================
//  VidyaMitra — services/jobMatcher/jobMatcher.js
//  Matches resumes to job descriptions using keyword analysis
// ============================================================

const stringSimilarity = require("string-similarity");
const logger = require("../../config/logger");

// ── Job Database (curated sample) ────────────────────────────
const JOB_DATABASE = [
  {
    id: "j001",
    title: "Full Stack Developer",
    company: "TechCorp India",
    location: "Bangalore, India",
    type: "Full-time",
    experience: "2-4 years",
    salary: "₹8L - ₹15L",
    skills: ["React", "Node.js", "MongoDB", "REST API", "JavaScript", "Git", "Express"],
    description: "Build and maintain web applications using React and Node.js. Work with MongoDB databases and REST APIs.",
    tags: ["fullstack", "web", "javascript"],
    postedDays: 2,
    applyUrl: "https://jobs.techcorp.example.com/fsd-001",
  },
  {
    id: "j002",
    title: "Frontend Developer",
    company: "Startup Hub",
    location: "Mumbai, India",
    type: "Full-time",
    experience: "1-3 years",
    salary: "₹6L - ₹12L",
    skills: ["React", "TypeScript", "CSS", "HTML", "Redux", "Figma", "Git"],
    description: "Design and implement responsive UI components. Collaborate with designers and backend engineers.",
    tags: ["frontend", "react", "ui"],
    postedDays: 5,
    applyUrl: "https://startuphub.example.com/frontend-dev",
  },
  {
    id: "j003",
    title: "Backend Developer",
    company: "FinTech Solutions",
    location: "Hyderabad, India",
    type: "Full-time",
    experience: "3-5 years",
    salary: "₹12L - ₹20L",
    skills: ["Node.js", "PostgreSQL", "Redis", "Docker", "REST API", "Microservices", "AWS"],
    description: "Design and build scalable backend services. Experience with microservices architecture required.",
    tags: ["backend", "nodejs", "fintech"],
    postedDays: 1,
    applyUrl: "https://fintechsolutions.example.com/backend",
  },
  {
    id: "j004",
    title: "MERN Stack Developer",
    company: "Digital Agency",
    location: "Remote",
    type: "Full-time",
    experience: "2-5 years",
    salary: "₹10L - ₹18L",
    skills: ["MongoDB", "Express", "React", "Node.js", "JavaScript", "TypeScript", "Git"],
    description: "End-to-end development of web applications using the MERN stack.",
    tags: ["mern", "fullstack", "remote"],
    postedDays: 3,
    applyUrl: "https://digitalagency.example.com/mern",
  },
  {
    id: "j005",
    title: "React Developer",
    company: "Product Company",
    location: "Pune, India",
    type: "Full-time",
    experience: "1-3 years",
    salary: "₹7L - ₹13L",
    skills: ["React", "Redux", "JavaScript", "CSS", "REST API", "Jest", "Git"],
    description: "Build feature-rich React applications with focus on performance and accessibility.",
    tags: ["react", "frontend", "product"],
    postedDays: 7,
    applyUrl: "https://productco.example.com/react-dev",
  },
  {
    id: "j006",
    title: "DevOps Engineer",
    company: "Cloud Services Ltd",
    location: "Bangalore, India",
    type: "Full-time",
    experience: "3-6 years",
    salary: "₹15L - ₹25L",
    skills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Terraform", "Python"],
    description: "Manage cloud infrastructure, CI/CD pipelines, and container orchestration.",
    tags: ["devops", "cloud", "aws"],
    postedDays: 4,
    applyUrl: "https://cloudservices.example.com/devops",
  },
  {
    id: "j007",
    title: "Data Scientist",
    company: "Analytics Corp",
    location: "Delhi, India",
    type: "Full-time",
    experience: "2-4 years",
    salary: "₹12L - ₹22L",
    skills: ["Python", "Machine Learning", "TensorFlow", "SQL", "Pandas", "NumPy", "Statistics"],
    description: "Develop machine learning models and derive insights from large datasets.",
    tags: ["data-science", "ml", "python"],
    postedDays: 6,
    applyUrl: "https://analyticscorp.example.com/ds",
  },
  {
    id: "j008",
    title: "Junior Full Stack Developer",
    company: "EdTech Startup",
    location: "Remote",
    type: "Full-time",
    experience: "0-2 years",
    salary: "₹4L - ₹8L",
    skills: ["JavaScript", "React", "Node.js", "HTML", "CSS", "Git", "MongoDB"],
    description: "Great opportunity for freshers and junior developers to work on an education platform.",
    tags: ["fullstack", "junior", "remote", "edtech"],
    postedDays: 2,
    applyUrl: "https://edtech.example.com/junior-fsd",
  },
  {
    id: "j009",
    title: "Node.js Backend Engineer",
    company: "SaaS Company",
    location: "Chennai, India",
    type: "Full-time",
    experience: "2-5 years",
    salary: "₹10L - ₹20L",
    skills: ["Node.js", "Express", "MongoDB", "Redis", "JWT", "REST API", "TypeScript"],
    description: "Build robust backend APIs for our SaaS platform. Focus on performance and security.",
    tags: ["backend", "nodejs", "saas"],
    postedDays: 8,
    applyUrl: "https://saascompany.example.com/node-engineer",
  },
  {
    id: "j010",
    title: "Software Engineer - Fresher",
    company: "IT Services Company",
    location: "Multiple Locations",
    type: "Full-time",
    experience: "0-1 year",
    salary: "₹3.5L - ₹6L",
    skills: ["JavaScript", "Java", "Python", "SQL", "Data Structures", "Algorithms", "Git"],
    description: "Entry level position for fresh graduates. Training provided.",
    tags: ["fresher", "entry-level", "training"],
    postedDays: 1,
    applyUrl: "https://itservices.example.com/fresher",
  },
];

// ── Match Calculator ──────────────────────────────────────────

/**
 * Calculate match score between resume skills and job
 */
const calculateJobMatch = (resumeSkills, job) => {
  if (!resumeSkills || !resumeSkills.length) return { score: 0, matched: [], missing: job.skills };

  const normalizedResumeSkills = resumeSkills.map((s) =>
    (typeof s === "string" ? s : s.name || "").toLowerCase()
  );

  const matched = [];
  const missing = [];

  for (const jobSkill of job.skills) {
    const jobSkillLower = jobSkill.toLowerCase();

    // Exact match
    const exactMatch = normalizedResumeSkills.includes(jobSkillLower);

    // Fuzzy match (similarity > 0.75)
    const fuzzyMatch = !exactMatch && normalizedResumeSkills.some((rs) => {
      try {
        return stringSimilarity.compareTwoStrings(rs, jobSkillLower) > 0.75;
      } catch {
        return false;
      }
    });

    if (exactMatch || fuzzyMatch) {
      matched.push(jobSkill);
    } else {
      missing.push(jobSkill);
    }
  }

  const score = Math.round((matched.length / job.skills.length) * 100);

  return { score, matched, missing };
};

/**
 * Find best matching jobs for a resume
 */
const matchJobsToResume = (parsedData, options = {}) => {
  const { limit = 5, minScore = 20, targetRole = null } = options;

  const resumeSkills = parsedData?.skills || [];
  const resumeExperience = parsedData?.experience || [];
  const yearsOfExp = estimateYearsOfExperience(resumeExperience);

  logger.info(`Job matching: ${resumeSkills.length} skills, ~${yearsOfExp} years exp`);

  // Score all jobs
  const scoredJobs = JOB_DATABASE.map((job) => {
    const { score, matched, missing } = calculateJobMatch(resumeSkills, job);

    // Bonus for title similarity if targetRole provided
    let titleBonus = 0;
    if (targetRole) {
      try {
        titleBonus = Math.round(
          stringSimilarity.compareTwoStrings(
            targetRole.toLowerCase(),
            job.title.toLowerCase()
          ) * 15
        );
      } catch {
        titleBonus = 0;
      }
    }

    // Experience fit bonus
    const expFit = isExperienceFit(yearsOfExp, job.experience);
    const expBonus = expFit ? 10 : 0;

    const totalScore = Math.min(100, score + titleBonus + expBonus);

    return {
      ...job,
      matchScore: totalScore,
      skillMatch: score,
      matchedSkills: matched,
      missingSkills: missing,
      isExperienceFit: expFit,
      matchLabel:
        totalScore >= 80 ? "Excellent Match" :
        totalScore >= 60 ? "Good Match" :
        totalScore >= 40 ? "Fair Match" : "Partial Match",
    };
  });

  // Sort by score and filter
  const results = scoredJobs
    .filter((j) => j.matchScore >= minScore)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  return {
    totalJobsChecked: JOB_DATABASE.length,
    matchesFound: results.length,
    topMatches: results,
    searchCriteria: {
      skillsUsed: resumeSkills.length,
      estimatedExperience: `${yearsOfExp} years`,
      targetRole: targetRole || "Any",
    },
  };
};

/**
 * Estimate years of experience from parsed experience array
 */
const estimateYearsOfExperience = (experience) => {
  if (!experience || !experience.length) return 0;

  let total = 0;
  for (const exp of experience) {
    if (exp.duration) {
      const years = exp.duration.match(/(\d+)\s*year/i);
      const months = exp.duration.match(/(\d+)\s*month/i);
      if (years) total += parseInt(years[1]);
      if (months) total += parseInt(months[1]) / 12;
    }
  }

  // If no duration found, estimate from count
  if (total === 0) total = experience.length * 1.5;

  return Math.round(total * 10) / 10;
};

/**
 * Check if experience years fit a job's requirement string
 */
const isExperienceFit = (yearsOfExp, experienceStr) => {
  if (!experienceStr) return true;

  const match = experienceStr.match(/(\d+)-(\d+)/);
  if (!match) return true;

  const min = parseInt(match[1]);
  const max = parseInt(match[2]);

  return yearsOfExp >= min && yearsOfExp <= max + 1;
};

/**
 * Get a single job by ID
 */
const getJobById = (jobId) => JOB_DATABASE.find((j) => j.id === jobId) || null;

/**
 * Get all jobs (with optional filters)
 */
const getAllJobs = (filters = {}) => {
  let jobs = [...JOB_DATABASE];

  if (filters.location) {
    jobs = jobs.filter((j) =>
      j.location.toLowerCase().includes(filters.location.toLowerCase()) ||
      j.location.toLowerCase() === "remote"
    );
  }

  if (filters.type) {
    jobs = jobs.filter((j) => j.type.toLowerCase() === filters.type.toLowerCase());
  }

  if (filters.experience) {
    jobs = jobs.filter((j) => j.tags.includes("fresher") === (filters.experience === "fresher"));
  }

  return jobs;
};

module.exports = {
  matchJobsToResume,
  calculateJobMatch,
  getJobById,
  getAllJobs,
  JOB_DATABASE,
};
