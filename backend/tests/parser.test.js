const { extractContactInfo } = require("../src/services/parser/extractors/contactExtractor");
const { extractSkills } = require("../src/services/parser/extractors/skillsExtractor");
const { extractExperience } = require("../src/services/parser/extractors/experienceExtractor");
const { extractEducation } = require("../src/services/parser/extractors/educationExtractor");
const { extractSummary } = require("../src/services/parser/extractors/summaryExtractor");
const { extractProjects } = require("../src/services/parser/extractors/projectsExtractor");
const { extractCertifications } = require("../src/services/parser/extractors/certificationExtractor");

// ── Sample resume text for testing ───────────────────────────
const SAMPLE_RESUME = `
Rahul Sharma
Bangalore, Karnataka
rahul.sharma@gmail.com
+91 9876543210
linkedin.com/in/rahulsharma
github.com/rahulsharma

Summary
Experienced Full Stack Developer with 3+ years building scalable web applications using React, Node.js and MongoDB. Passionate about clean code and AI-powered tools.

Technical Skills
JavaScript, TypeScript, React, Node.js, Express, MongoDB, PostgreSQL, Docker, AWS, Git, REST API, GraphQL

Work Experience

Senior Software Engineer
TechCorp Solutions Pvt Ltd
Jan 2022 - Present
- Developed microservices architecture using Node.js and Docker
- Led a team of 4 developers to build a payment gateway integration
- Improved API response time by 40% using Redis caching

Software Developer
StartupXYZ Inc
Jun 2020 - Dec 2021
- Built React frontend with Redux state management
- Integrated AWS S3 for file storage

Education

B.Tech in Computer Science
VIT University, Vellore
2016 - 2020
CGPA: 8.4/10

Projects

VidyaMitra - AI Career Platform (React, Node.js, MongoDB)
An intelligent career coaching platform using LangChain and OpenAI API

Portfolio Website (React, Tailwind CSS)
Personal portfolio with project showcase

Certifications
AWS Certified Developer Associate - Amazon 2023
MongoDB Certified Developer - MongoDB 2022
`;

// ── Contact Extractor Tests ───────────────────────────────────
describe("Contact Extractor", () => {
  const contact = extractContactInfo(SAMPLE_RESUME);

  it("should extract email correctly", () => {
    expect(contact.email).toBe("rahul.sharma@gmail.com");
  });

  it("should extract phone number", () => {
    expect(contact.phone).toContain("9876543210");
  });

  it("should extract LinkedIn URL", () => {
    expect(contact.linkedinUrl).toContain("linkedin.com/in/rahulsharma");
  });

  it("should extract GitHub URL", () => {
    expect(contact.githubUrl).toContain("github.com/rahulsharma");
  });

  it("should extract name", () => {
    expect(contact.fullName).toBe("Rahul Sharma");
  });

  it("should extract location", () => {
    expect(contact.location).toContain("Bangalore");
  });
});

// ── Skills Extractor Tests ────────────────────────────────────
describe("Skills Extractor", () => {
  const result = extractSkills(SAMPLE_RESUME);

  it("should extract skills as an array", () => {
    expect(Array.isArray(result.skills)).toBe(true);
  });

  it("should find core skills: JavaScript, React, Node.js", () => {
    const skills = result.skills.map((s) => s.toLowerCase());
    expect(skills).toContain("javascript");
    expect(skills).toContain("react");
    expect(skills).toContain("node.js");
  });

  it("should find MongoDB and Docker", () => {
    const skills = result.skills.map((s) => s.toLowerCase());
    expect(skills).toContain("mongodb");
    expect(skills).toContain("docker");
  });

  it("should have a count > 0", () => {
    expect(result.count).toBeGreaterThan(3);
  });

  it("should return categorized skills", () => {
    expect(typeof result.categorized).toBe("object");
  });
});

// ── Experience Extractor Tests ────────────────────────────────
describe("Experience Extractor", () => {
  const experience = extractExperience(SAMPLE_RESUME);

  it("should return an array", () => {
    expect(Array.isArray(experience)).toBe(true);
  });

  it("should find at least one experience entry", () => {
    expect(experience.length).toBeGreaterThan(0);
  });

  it("each entry should have company and role fields", () => {
    experience.forEach((job) => {
      expect(job).toHaveProperty("company");
      expect(job).toHaveProperty("role");
    });
  });
});

// ── Education Extractor Tests ─────────────────────────────────
describe("Education Extractor", () => {
  const education = extractEducation(SAMPLE_RESUME);

  it("should return an array", () => {
    expect(Array.isArray(education)).toBe(true);
  });

  it("should find at least one education entry", () => {
    expect(education.length).toBeGreaterThan(0);
  });

  it("education entry should have institution", () => {
    expect(education[0]).toHaveProperty("institution");
  });
});

// ── Summary Extractor Tests ───────────────────────────────────
describe("Summary Extractor", () => {
  it("should extract a non-empty summary", () => {
    const summary = extractSummary(SAMPLE_RESUME);
    expect(summary).not.toBeNull();
    expect(summary.length).toBeGreaterThan(20);
  });

  it("should return null for text with no summary section", () => {
    const summary = extractSummary("John Doe\njohn@test.com\n\nSkills\nJavaScript");
    expect(summary).toBeNull();
  });
});

// ── Projects Extractor Tests ──────────────────────────────────
describe("Projects Extractor", () => {
  const projects = extractProjects(SAMPLE_RESUME);

  it("should return an array", () => {
    expect(Array.isArray(projects)).toBe(true);
  });

  it("should find VidyaMitra project", () => {
    const names = projects.map((p) => p.name.toLowerCase());
    expect(names.some((n) => n.includes("vidya"))).toBe(true);
  });
});

// ── Certifications Extractor Tests ───────────────────────────
describe("Certifications Extractor", () => {
  const certs = extractCertifications(SAMPLE_RESUME);

  it("should return an array", () => {
    expect(Array.isArray(certs)).toBe(true);
  });

  it("should find AWS certification", () => {
    const names = certs.map((c) => c.name.toLowerCase());
    expect(names.some((n) => n.includes("aws"))).toBe(true);
  });
});
