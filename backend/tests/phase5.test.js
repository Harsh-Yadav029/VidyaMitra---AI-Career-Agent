// ============================================================
//  VidyaMitra — tests/phase5.test.js
//  Phase 5: Interview Simulator + Job Matcher tests
// ============================================================

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const User = require("../src/models/User.model");
const InterviewSession = require("../src/models/InterviewSession.model");

const { getQuestionsForRole, getAvailableRoles, getQuestionById } = require("../src/services/interview/questionBank");
const { evaluateAnswer, evaluateSession } = require("../src/services/interview/answerEvaluator");
const { matchJobsToResume, getAllJobs, getJobById } = require("../src/services/jobMatcher/jobMatcher");

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const testUser = {
  name: "Phase5 Tester",
  email: "phase5@vidyamitra.test",
  password: "Test@12345",
  targetRole: "Full Stack Developer",
};

// ── DB Setup ──────────────────────────────────────────────────
beforeAll(async () => {
  await mongoose.connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/vidyamitra_test"
  );
  await User.deleteMany({});
  await InterviewSession.deleteMany({});
  await wait(100);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

// ── Question Bank Tests ───────────────────────────────────────
describe("Question Bank", () => {
  it("should return questions for Full Stack Developer", () => {
    const questions = getQuestionsForRole("Full Stack Developer", { count: 8 });
    expect(Array.isArray(questions)).toBe(true);
    expect(questions.length).toBe(8);
  });

  it("each question should have required fields", () => {
    const questions = getQuestionsForRole("Full Stack Developer", { count: 5 });
    questions.forEach((q) => {
      expect(q).toHaveProperty("id");
      expect(q).toHaveProperty("question");
      expect(q).toHaveProperty("category");
      expect(q).toHaveProperty("difficulty");
    });
  });

  it("should return available roles list", () => {
    const roles = getAvailableRoles();
    expect(Array.isArray(roles)).toBe(true);
    expect(roles.length).toBeGreaterThan(0);
    expect(roles).toContain("Full Stack Developer");
  });

  it("should filter questions by difficulty", () => {
    const questions = getQuestionsForRole("Full Stack Developer", {
      count: 10,
      difficulty: "easy",
    });
    questions.forEach((q) => {
      expect(q.difficulty).toBe("easy");
    });
  });

  it("should get question by id", () => {
    const questions = getQuestionsForRole("Full Stack Developer", { count: 3 });
    const q = getQuestionById(questions[0].id);
    expect(q).not.toBeNull();
    expect(q.id).toBe(questions[0].id);
  });
});

// ── Answer Evaluator Tests ────────────────────────────────────
describe("Answer Evaluator", () => {
  const behavioralQuestion = {
    id: "b001",
    category: "behavioral",
    starGuide: {
      situation: "Describe the context",
      task: "What was your role?",
      action: "What did you do?",
      result: "What was the outcome?",
    },
    keyPoints: [],
  };

  const technicalQuestion = {
    id: "t001",
    category: "technical",
    keyPoints: ["event loop", "non-blocking", "callback queue"],
  };

  it("should return score between 0 and 100", () => {
    const result = evaluateAnswer("This is a test answer with some content.", behavioralQuestion);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("should return grade A-F", () => {
    const result = evaluateAnswer("Test answer", behavioralQuestion);
    expect(["A", "B", "C", "D", "F"]).toContain(result.grade);
  });

  it("should score empty answer as 0", () => {
    const result = evaluateAnswer("", behavioralQuestion);
    expect(result.score).toBe(0);
  });

  it("should score strong STAR answer higher than weak answer", () => {
    const strongAnswer = `
      Situation: I was working at a startup when our production server went down at 2am.
      Task: I was the on-call engineer responsible for fixing the critical bug within 2 hours.
      Action: I immediately SSH'd into the server, checked the logs, identified a memory leak in our Node.js service, 
      and implemented a fix by optimizing the database queries that were causing the leak. I collaborated with the 
      backend team lead to review my fix before deploying it.
      Result: As a result, I restored the service within 45 minutes, reducing potential revenue loss by approximately 
      $10,000. I also created a runbook to prevent similar incidents, which reduced our mean time to recovery by 60%.
    `;
    const weakAnswer = "I fixed a bug once. It was hard but I did it.";

    const strongResult = evaluateAnswer(strongAnswer, behavioralQuestion);
    const weakResult = evaluateAnswer(weakAnswer, behavioralQuestion);

    expect(strongResult.score).toBeGreaterThan(weakResult.score);
  });

  it("should detect STAR components in answer", () => {
    const starAnswer = `
      I was working on a Node.js project (situation). My responsibility was to improve performance (task). 
      I implemented Redis caching and optimized the database queries (action). 
      As a result, we reduced API response time by 40% (result).
    `;
    const result = evaluateAnswer(starAnswer, behavioralQuestion);
    expect(result.starAnalysis).not.toBeNull();
    expect(typeof result.starAnalysis).toBe("object");
  });

  it("should return improvements array", () => {
    const result = evaluateAnswer("Short answer without details.", behavioralQuestion);
    expect(Array.isArray(result.improvements)).toBe(true);
    expect(result.improvements.length).toBeGreaterThan(0);
  });

  it("should evaluate session with multiple answers", () => {
    const answers = [
      {
        questionId: "b001",
        questionText: "Tell me about a challenge",
        answer: "I faced a challenge and solved it by working hard with my team. The result was successful.",
        question: behavioralQuestion,
      },
      {
        questionId: "b002",
        questionText: "Tell me about teamwork",
        answer: "We worked together on a project last year. I collaborated with colleagues and we delivered on time.",
        question: behavioralQuestion,
      },
    ];

    const summary = evaluateSession(answers);
    expect(summary).toHaveProperty("averageScore");
    expect(summary).toHaveProperty("grade");
    expect(summary.averageScore).toBeGreaterThanOrEqual(0);
    expect(summary.averageScore).toBeLessThanOrEqual(100);
    expect(summary).toHaveProperty("recommendation");
  });
});

// ── Job Matcher Tests ─────────────────────────────────────────
describe("Job Matcher", () => {
  const mockParsedData = {
    skills: ["React", "Node.js", "MongoDB", "JavaScript", "Express", "Git", "REST API"],
    experience: [{ company: "TechCorp", role: "Developer", duration: "2 years" }],
  };

  it("should return job matches", () => {
    const result = matchJobsToResume(mockParsedData);
    expect(result).toHaveProperty("topMatches");
    expect(Array.isArray(result.topMatches)).toBe(true);
  });

  it("each match should have a matchScore", () => {
    const result = matchJobsToResume(mockParsedData);
    result.topMatches.forEach((job) => {
      expect(job).toHaveProperty("matchScore");
      expect(job.matchScore).toBeGreaterThanOrEqual(0);
      expect(job.matchScore).toBeLessThanOrEqual(100);
    });
  });

  it("should include matched and missing skills", () => {
    const result = matchJobsToResume(mockParsedData);
    result.topMatches.forEach((job) => {
      expect(job).toHaveProperty("matchedSkills");
      expect(job).toHaveProperty("missingSkills");
      expect(Array.isArray(job.matchedSkills)).toBe(true);
    });
  });

  it("should score high-skill resume higher than low-skill resume", () => {
    const strongResume = { skills: ["React", "Node.js", "MongoDB", "JavaScript", "Express", "TypeScript", "Git"] };
    const weakResume = { skills: ["HTML"] };

    const strongResult = matchJobsToResume(strongResume);
    const weakResult = matchJobsToResume(weakResume);

    const strongAvg = strongResult.topMatches.reduce((s, j) => s + j.matchScore, 0) / (strongResult.topMatches.length || 1);
    const weakAvg = weakResult.topMatches.reduce((s, j) => s + j.matchScore, 0) / (weakResult.topMatches.length || 1);

    expect(strongAvg).toBeGreaterThan(weakAvg);
  });

  it("should get all jobs", () => {
    const jobs = getAllJobs();
    expect(Array.isArray(jobs)).toBe(true);
    expect(jobs.length).toBeGreaterThan(0);
  });

  it("should get job by id", () => {
    const job = getJobById("j001");
    expect(job).not.toBeNull();
    expect(job.id).toBe("j001");
    expect(job).toHaveProperty("title");
    expect(job).toHaveProperty("skills");
  });

  it("should return null for unknown job id", () => {
    const job = getJobById("j999");
    expect(job).toBeNull();
  });
});

// ── Interview API Tests ───────────────────────────────────────
describe("Interview API Endpoints", () => {
  let token;
  let sessionId;

  const getFreshToken = async () => {
    await User.deleteMany({});
    await InterviewSession.deleteMany({});
    await wait(100);
    const res = await request(app).post("/api/auth/register").send(testUser);
    return res.body.token;
  };

  beforeAll(async () => {
    token = await getFreshToken();
  });

  it("should get available roles", async () => {
    const res = await request(app)
      .get("/api/interview/roles")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.roles)).toBe(true);
    expect(res.body.roles.length).toBeGreaterThan(0);
  });

  it("should preview questions for a role", async () => {
    const res = await request(app)
      .get("/api/interview/questions/preview?role=Full Stack Developer&count=5")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.questions.length).toBe(5);
  });

  it("should create an interview session", async () => {
    const res = await request(app)
      .post("/api/interview/sessions")
      .set("Authorization", `Bearer ${token}`)
      .send({ targetRole: "Full Stack Developer", questionCount: 3 });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.session).toHaveProperty("sessionId");
    expect(res.body.session).toHaveProperty("currentQuestion");
    sessionId = res.body.session.sessionId;
  });

  it("should get session status", async () => {
    const res = await request(app)
      .get(`/api/interview/sessions/${sessionId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.session.status).toBe("in_progress");
    expect(res.body.session.progress.answered).toBe(0);
  });

  it("should submit an answer and get evaluation", async () => {
    const answer = `
      I was working on a production Node.js application when our team faced a critical performance issue.
      My task was to identify and resolve the bottleneck within 24 hours.
      I profiled the application, found N+1 database queries, and implemented proper indexing and query optimization.
      As a result, we reduced API response times by 60% and the system handled 3x more concurrent users.
    `;

    const res = await request(app)
      .post(`/api/interview/sessions/${sessionId}/answer`)
      .set("Authorization", `Bearer ${token}`)
      .send({ questionIndex: 0, answer });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("evaluation");
    expect(res.body.evaluation).toHaveProperty("score");
    expect(res.body.evaluation.score).toBeGreaterThanOrEqual(0);
    expect(res.body.answeredCount).toBe(1);
  });

  it("should reject empty answer", async () => {
    const res = await request(app)
      .post(`/api/interview/sessions/${sessionId}/answer`)
      .set("Authorization", `Bearer ${token}`)
      .send({ questionIndex: 1, answer: "" });
    expect(res.statusCode).toBe(400);
  });

  it("should list all sessions", async () => {
    const res = await request(app)
      .get("/api/interview/sessions")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBeGreaterThan(0);
  });
});

// ── Jobs API Tests ────────────────────────────────────────────
describe("Jobs API Endpoints", () => {
  let token;

  beforeAll(async () => {
    await User.deleteMany({});
    await wait(100);
    const res = await request(app).post("/api/auth/register").send({
      ...testUser,
      email: "jobs@vidyamitra.test",
    });
    token = res.body.token;
  });

  it("should list all jobs", async () => {
    const res = await request(app)
      .get("/api/jobs")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBeGreaterThan(0);
    expect(Array.isArray(res.body.jobs)).toBe(true);
  });

  it("should get a single job by id", async () => {
    const res = await request(app)
      .get("/api/jobs/j001")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.job.id).toBe("j001");
    expect(res.body.job).toHaveProperty("title");
    expect(res.body.job).toHaveProperty("skills");
  });

  it("should return 404 for unknown job", async () => {
    const res = await request(app)
      .get("/api/jobs/j999")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });
});
