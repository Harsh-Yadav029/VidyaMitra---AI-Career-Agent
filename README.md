# 🎓 VidyaMitra — AI-Powered Career Agent

> Resume Evaluator · Skill Gap Analyzer · Career Coach · Job Matcher

---

## 🚀 Quick Start (Phase 1 — Backend)

### Prerequisites
- Node.js 18+ → https://nodejs.org
- MongoDB (local) → https://www.mongodb.com/try/download/community
- OR Docker Desktop → https://www.docker.com/products/docker-desktop

---

### Option A: Run with Docker (Recommended)

```bash
# 1. Clone the project
git clone https://github.com/your-username/vidyamitra.git
cd vidyamitra

# 2. Copy env file
cp backend/.env.example backend/.env

# 3. Start everything
docker-compose up --build

# ✅ Backend:       http://localhost:5000
# ✅ Health check:  http://localhost:5000/api/health
# ✅ MongoDB GUI:   http://localhost:8081
```

---

### Option B: Run Locally (No Docker)

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env and set your MONGO_URI and JWT_SECRET

# 3. Start MongoDB locally
mongod --dbpath /data/db

# 4. Start the backend
npm run dev

# ✅ API running at: http://localhost:5000
```

---

## 📡 API Endpoints (Phase 1)

| Method | Endpoint              | Auth? | Description            |
|--------|-----------------------|-------|------------------------|
| GET    | /api/health           | ❌    | Health check           |
| POST   | /api/auth/register    | ❌    | Register new user      |
| POST   | /api/auth/login       | ❌    | Login, get JWT token   |
| GET    | /api/auth/me          | ✅    | Get current user       |
| POST   | /api/auth/logout      | ✅    | Logout                 |
| GET    | /api/users/profile    | ✅    | Get full profile       |
| PATCH  | /api/users/profile    | ✅    | Update profile         |
| PATCH  | /api/users/skills     | ✅    | Update skills list     |
| POST   | /api/resumes/upload   | ✅    | Upload resume file     |
| GET    | /api/resumes          | ✅    | List all resumes       |
| GET    | /api/resumes/:id      | ✅    | Get single resume      |
| DELETE | /api/resumes/:id      | ✅    | Delete resume          |

---

## 🧪 Testing the API

```bash
# Health check
curl http://localhost:5000/api/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Rahul Sharma","email":"rahul@test.com","password":"Test@12345"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rahul@test.com","password":"Test@12345"}'

# Use the returned token for protected routes:
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <YOUR_TOKEN>"

# Upload a resume
curl -X POST http://localhost:5000/api/resumes/upload \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -F "resume=@/path/to/your/resume.pdf" \
  -F "label=My Resume v1"
```

---

## 🗂️ Project Structure

```
vidyamitra/
├── backend/
│   ├── src/
│   │   ├── app.js              ← Express app + middleware
│   │   ├── server.js           ← Entry point
│   │   ├── config/
│   │   │   ├── db.js           ← MongoDB connection
│   │   │   └── logger.js       ← Winston logger
│   │   ├── models/
│   │   │   ├── User.model.js   ← User schema
│   │   │   └── Resume.model.js ← Resume schema
│   │   ├── routes/             ← Route definitions
│   │   ├── controllers/        ← Business logic
│   │   └── middleware/         ← auth, error, upload
│   ├── tests/                  ← Jest tests
│   ├── uploads/                ← Resume files (gitignored)
│   ├── logs/                   ← Log files (gitignored)
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── frontend/                   ← Coming in Phase 1b
├── ai/                         ← Coming in Phase 2
├── docker-compose.yml
└── README.md
```

---

## 📅 Project Phases

| Phase | What Gets Built | Status |
|-------|----------------|--------|
| **Phase 1** | Backend Foundation (this!) | ✅ Done |
| **Phase 2** | Resume Parser (PDF/DOCX → JSON) | 🔜 Next |
| **Phase 3** | AI Scoring Engine | ⏳ Upcoming |
| **Phase 4** | Career Agent (LangChain) | ⏳ Upcoming |
| **Phase 5** | Interview Simulator + Job Matching | ⏳ Upcoming |
| **Phase 6** | Frontend Dashboard + Deployment | ⏳ Upcoming |

---

## 🛠️ Tech Stack

- **Runtime:** Node.js 20 + Express 4
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (jsonwebtoken) + bcryptjs
- **Validation:** express-validator
- **Logging:** Winston
- **File Upload:** Multer
- **Testing:** Jest + Supertest
- **Containers:** Docker + Docker Compose
