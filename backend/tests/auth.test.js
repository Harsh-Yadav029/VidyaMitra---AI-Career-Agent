const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const User = require("../src/models/User.model");

const testUser = {
  name: "Rahul Sharma",
  email: "rahul@vidyamitra.test",
  password: "Test@12345",
};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

beforeAll(async () => {
  await mongoose.connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/vidyamitra_test"
  );
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

// ── Register ──────────────────────────────────────────────────
describe("POST /api/auth/register", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await wait(100);
  });

  it("should register a new user and return a token", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.password).toBeUndefined();
  });

  it("should reject duplicate email", async () => {
    await request(app).post("/api/auth/register").send(testUser);
    const res = await request(app).post("/api/auth/register").send(testUser);
    expect(res.statusCode).toBe(409);
  });

  it("should reject weak password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...testUser, password: "weak" });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});

// ── Login ─────────────────────────────────────────────────────
describe("POST /api/auth/login", () => {
  // Register ONCE before all login tests — not wiped between them
  beforeAll(async () => {
    await User.deleteMany({});
    await wait(100);
    await request(app).post("/api/auth/register").send(testUser);
    await wait(150); // ensure write is committed
  });

  afterAll(async () => {
    await User.deleteMany({});
    await wait(100);
  });

  it("should login with correct credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("should reject wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: "WrongPass@99" });
    expect(res.statusCode).toBe(401);
  });
});

// ── Auth Me ───────────────────────────────────────────────────
describe("GET /api/auth/me", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await wait(100);
  });

  it("should return user profile with valid token", async () => {
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send(testUser);
    const token = registerRes.body.token;

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe(testUser.email);
  });

  it("should reject request without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.statusCode).toBe(401);
  });
});

// ── Health ────────────────────────────────────────────────────
describe("GET /api/health", () => {
  it("should return 200 health status", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});