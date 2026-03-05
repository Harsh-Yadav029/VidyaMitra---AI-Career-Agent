// ============================================================
//  VidyaMitra — tests/agent.test.js
//  Unit + integration tests for Phase 4 Career Agent
// ============================================================

const { detectIntent, detectAllIntents, INTENTS } = require("../src/services/agent/intentDetector");
const { getSkillGap, getLearningRoadmap } = require("../src/services/agent/careerKnowledge");
const { buildSystemPrompt } = require("../src/services/agent/promptBuilder");
const { processMessage } = require("../src/services/agent/careerAgent");
const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User.model");

// ── Intent Detector Tests ─────────────────────────────────────
describe("Intent Detector", () => {
  it("should detect skill_gap intent", () => {
    expect(detectIntent("What skills do I need for this role?")).toBe(INTENTS.SKILL_GAP);
    expect(detectIntent("I have a skill gap in React")).toBe(INTENTS.SKILL_GAP);
    expect(detectIntent("what skills are missing from my resume")).toBe(INTENTS.SKILL_GAP);
  });

  it("should detect interview_prep intent", () => {
    expect(detectIntent("Help me prepare for interviews")).toBe(INTENTS.INTERVIEW_PREP);
    expect(detectIntent("What are common interview questions?")).toBe(INTENTS.INTERVIEW_PREP);
    expect(detectIntent("mock interview please")).toBe(INTENTS.INTERVIEW_PREP);
  });

  it("should detect career_path intent", () => {
    expect(detectIntent("What is my career path?")).toBe(INTENTS.CAREER_PATH);
    expect(detectIntent("I want to transition to data science")).toBe(INTENTS.CAREER_PATH);
    expect(detectIntent("how do I get promoted")).toBe(INTENTS.CAREER_PATH);
  });

  it("should detect salary_info intent", () => {
    expect(detectIntent("What is the salary for this role?")).toBe(INTENTS.SALARY_INFO);
    expect(detectIntent("how much does a developer earn")).toBe(INTENTS.SALARY_INFO);
    expect(detectIntent("what is the CTC for senior engineer")).toBe(INTENTS.SALARY_INFO);
  });

  it("should detect greeting intent", () => {
    expect(detectIntent("hi")).toBe(INTENTS.GREETING);
    expect(detectIntent("hello there")).toBe(INTENTS.GREETING);
    expect(detectIntent("hey")).toBe(INTENTS.GREETING);
  });

  it("should return general for unknown intent", () => {
    expect(detectIntent("the weather is nice today")).toBe(INTENTS.GENERAL);
    expect(detectIntent("what is 2+2")).toBe(INTENTS.GENERAL);
  });

  it("should detect learning roadmap intent", () => {
    expect(detectIntent("build me a learning roadmap")).toBe(INTENTS.LEARNING_ROADMAP);
    expect(detectIntent("how do I learn React?")).toBe(INTENTS.LEARNING_ROADMAP);
    expect(detectIntent("what resources should I use")).toBe(INTENTS.LEARNING_ROADMAP);
  });
});

// ── Career Knowledge Tests ────────────────────────────────────
describe("Career Knowledge — Skill Gap", () => {
  const userSkills = ["JavaScript", "React", "Node.js", "MongoDB"];

  it("should return skill gap for Full Stack Developer", () => {
    const gap = getSkillGap(userSkills, "Full Stack Developer");
    expect(gap).not.toBeNull();
    expect(gap.targetRole).toBe("Full Stack Developer");
    expect(gap.matchedSkills.length).toBeGreaterThan(0);
    expect(typeof gap.matchPercentage).toBe("number");
    expect(gap.matchPercentage).toBeGreaterThanOrEqual(0);
    expect(gap.matchPercentage).toBeLessThanOrEqual(100);
  });

  it("should identify missing skills correctly", () => {
    const gap = getSkillGap(["JavaScript"], "Full Stack Developer");
    expect(gap.missingCore.length).toBeGreaterThan(0);
  });

  it("should return null for unknown role", () => {
    const gap = getSkillGap(userSkills, "Unicorn Role XYZ");
    expect(gap).toBeNull();
  });

  it("should include salary data", () => {
    const gap = getSkillGap(userSkills, "Backend Developer");
    expect(gap.salary).toHaveProperty("fresher");
    expect(gap.salary).toHaveProperty("mid");
    expect(gap.salary).toHaveProperty("senior");
  });

  it("should return 100% match when all skills present", () => {
    const allSkills = ["JavaScript", "TypeScript", "React", "Node.js", "MongoDB",
      "PostgreSQL", "Docker", "AWS", "Git", "REST API"];
    const gap = getSkillGap(allSkills, "Full Stack Developer");
    expect(gap.matchPercentage).toBeGreaterThan(70);
  });
});

// ── Learning Roadmap Tests ────────────────────────────────────
describe("Career Knowledge — Learning Roadmap", () => {
  it("should generate roadmap for missing skills", () => {
    const roadmap = getLearningRoadmap(["Docker", "AWS", "GraphQL"]);
    expect(Array.isArray(roadmap)).toBe(true);
    expect(roadmap.length).toBe(3);
    roadmap.forEach((item) => {
      expect(item).toHaveProperty("skill");
      expect(item).toHaveProperty("resources");
      expect(item).toHaveProperty("estimatedTime");
      expect(Array.isArray(item.resources)).toBe(true);
    });
  });

  it("should return fallback resources for unknown skills", () => {
    const roadmap = getLearningRoadmap(["SomeObscureSkill123"]);
    expect(roadmap[0].resources.length).toBeGreaterThan(0);
  });
});

// ── Prompt Builder Tests ──────────────────────────────────────
describe("Prompt Builder", () => {
  const userContext = {
    userName: "Rahul Sharma",
    targetRole: "Full Stack Developer",
    currentSkills: ["JavaScript", "React", "Node.js"],
    yearsOfExperience: 3,
    overallScore: 72,
    topMissingSkills: ["Docker", "AWS"],
    sessionType: "general",
  };

  it("should build a system prompt string", () => {
    const prompt = buildSystemPrompt(userContext);
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(100);
  });

  it("should include candidate name in prompt", () => {
    const prompt = buildSystemPrompt(userContext);
    expect(prompt).toContain("Rahul Sharma");
  });

  it("should include target role in prompt", () => {
    const prompt = buildSystemPrompt(userContext);
    expect(prompt).toContain("Full Stack Developer");
  });

  it("should include resume score in prompt", () => {
    const prompt = buildSystemPrompt(userContext);
    expect(prompt).toContain("72");
  });
});

// ── Career Agent Tests ────────────────────────────────────────
describe("Career Agent — processMessage", () => {
  const userContext = {
    userName: "Rahul",
    targetRole: "Full Stack Developer",
    currentSkills: ["JavaScript", "React", "Node.js", "MongoDB"],
    yearsOfExperience: 2,
    overallScore: 68,
    topMissingSkills: ["Docker", "AWS", "TypeScript"],
  };

  it("should return a reply string for greeting", async () => {
    const result = await processMessage("hi", [], userContext);
    expect(typeof result.reply).toBe("string");
    expect(result.reply.length).toBeGreaterThan(20);
    expect(result.intent).toBe(INTENTS.GREETING);
  });

  it("should include suggested follow-ups", async () => {
    const result = await processMessage("hello", [], userContext);
    expect(Array.isArray(result.suggestedFollowUps)).toBe(true);
    expect(result.suggestedFollowUps.length).toBeGreaterThan(0);
  });

  it("should respond to skill gap query with role data", async () => {
    const result = await processMessage("What skills am I missing?", [], userContext);
    expect(result.reply.toLowerCase()).toMatch(/skill|docker|aws|typescript|match/i);
    expect(result.intent).toBe(INTENTS.SKILL_GAP);
  });

  it("should respond to interview prep query", async () => {
    const result = await processMessage("Help me prepare for interviews", [], userContext);
    expect(result.reply.toLowerCase()).toMatch(/interview|question|star|behavioral/i);
    expect(result.intent).toBe(INTENTS.INTERVIEW_PREP);
  });

  it("should respond to career path query", async () => {
    const result = await processMessage("What is my career path?", [], userContext);
    expect(result.reply.toLowerCase()).toMatch(/career|role|next|senior|lead/i);
    expect(result.intent).toBe(INTENTS.CAREER_PATH);
  });

  it("should respond to salary query", async () => {
    const result = await processMessage("What salary can I expect?", [], userContext);
    expect(result.reply.toLowerCase()).toMatch(/salary|lpa|fresher|mid|senior/i);
    expect(result.intent).toBe(INTENTS.SALARY_INFO);
  });

  it("should maintain context in multi-turn conversation", async () => {
    const history = [
      { role: "user", content: "What skills do I need?" },
      { role: "assistant", content: "You need Docker, AWS, and TypeScript." },
    ];
    const result = await processMessage("Tell me more about Docker", history, userContext);
    expect(typeof result.reply).toBe("string");
    expect(result.reply.length).toBeGreaterThan(10);
  });
});

// ── Agent API Integration Tests ───────────────────────────────
describe("Agent API Endpoints", () => {
  let token;

  // Helper: register and return a fresh token every time
  const getFreshToken = async () => {
    await User.deleteMany({});
    const ChatSession = require("../src/models/ChatSession.model");
    await ChatSession.deleteMany({});
    await new Promise((r) => setTimeout(r, 100));

    const res = await request(app).post("/api/auth/register").send({
      name: "Rahul Sharma",
      email: "rahul@agent.test",
      password: "Test@12345",
      targetRole: "Full Stack Developer",
    });
    return res.body.token;
  };

  beforeAll(async () => {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/vidyamitra_test"
    );
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    token = await getFreshToken();
  });

  it("should create a new chat session", async () => {
    const res = await request(app)
      .post("/api/agent/sessions")
      .set("Authorization", `Bearer ${token}`)
      .send({ sessionType: "general" });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.session).toHaveProperty("_id");
    expect(res.body.session.messages.length).toBeGreaterThan(0);
    expect(Array.isArray(res.body.session.suggestedFollowUps)).toBe(true);
  });

  it("should send a message and get a reply", async () => {
    const sessionRes = await request(app)
      .post("/api/agent/sessions")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    const sessionId = sessionRes.body.session._id;

    const msgRes = await request(app)
      .post(`/api/agent/sessions/${sessionId}/message`)
      .set("Authorization", `Bearer ${token}`)
      .send({ message: "What skills do I need?" });

    expect(msgRes.statusCode).toBe(200);
    expect(msgRes.body.reply).toBeDefined();
    expect(msgRes.body.intent).toBeDefined();
    expect(typeof msgRes.body.reply).toBe("string");
    expect(msgRes.body.reply.length).toBeGreaterThan(10);
  }, 15000);

  it("should list all sessions", async () => {
    await request(app)
      .post("/api/agent/sessions")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    const res = await request(app)
      .get("/api/agent/sessions")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBeGreaterThan(0);
  });

  it("should get skill gap analysis", async () => {
    // Get a dedicated fresh token for this test
    await User.deleteMany({});
    const ChatSession = require("../src/models/ChatSession.model");
    await ChatSession.deleteMany({});
    await new Promise((r) => setTimeout(r, 100));

    const regRes = await request(app).post("/api/auth/register").send({
      name: "Rahul Sharma",
      email: "rahul@skillgap.test",
      password: "Test@12345",
      targetRole: "Full Stack Developer",
    });
    const freshToken = regRes.body.token;

    const res = await request(app)
      .get("/api/agent/skill-gap?targetRole=Full Stack Developer")
      .set("Authorization", `Bearer ${freshToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.skillGap).toHaveProperty("matchPercentage");
    expect(res.body.learningRoadmap).toBeDefined();
  });

  it("should reject empty message", async () => {
    const sessionRes = await request(app)
      .post("/api/agent/sessions")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    const sessionId = sessionRes.body.session._id;

    const res = await request(app)
      .post(`/api/agent/sessions/${sessionId}/message`)
      .set("Authorization", `Bearer ${token}`)
      .send({ message: "" });

    expect(res.statusCode).toBe(400);
  });
});