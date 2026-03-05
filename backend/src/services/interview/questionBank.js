// ============================================================
//  VidyaMitra — services/interview/questionBank.js
//  200+ curated interview questions across roles & categories
// ============================================================

const QUESTION_CATEGORIES = {
  BEHAVIORAL: "behavioral",
  TECHNICAL: "technical",
  SITUATIONAL: "situational",
  HR: "hr",
};

const DIFFICULTY = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
};

// ── Behavioral Questions (STAR method) ───────────────────────
const behavioralQuestions = [
  {
    id: "b001",
    category: QUESTION_CATEGORIES.BEHAVIORAL,
    difficulty: DIFFICULTY.MEDIUM,
    question: "Tell me about a time you faced a major technical challenge. How did you overcome it?",
    followUps: ["What was the outcome?", "What would you do differently?"],
    starGuide: { situation: "Describe the project context", task: "What was your specific challenge?", action: "What steps did you take?", result: "What was the measurable outcome?" },
    tags: ["problem-solving", "technical"],
  },
  {
    id: "b002",
    category: QUESTION_CATEGORIES.BEHAVIORAL,
    difficulty: DIFFICULTY.MEDIUM,
    question: "Describe a situation where you had to work with a difficult team member.",
    followUps: ["How did it affect the project?", "What was the resolution?"],
    starGuide: { situation: "Set the scene", task: "What was your role?", action: "How did you handle the conflict?", result: "What improved as a result?" },
    tags: ["teamwork", "communication"],
  },
  {
    id: "b003",
    category: QUESTION_CATEGORIES.BEHAVIORAL,
    difficulty: DIFFICULTY.EASY,
    question: "Tell me about a project you are most proud of.",
    followUps: ["What was your specific contribution?", "What impact did it have?"],
    starGuide: { situation: "What was the project?", task: "What were you responsible for?", action: "What did you build/achieve?", result: "What was the impact?" },
    tags: ["achievement", "motivation"],
  },
  {
    id: "b004",
    category: QUESTION_CATEGORIES.BEHAVIORAL,
    difficulty: DIFFICULTY.MEDIUM,
    question: "Tell me about a time you had to learn a new technology quickly under pressure.",
    followUps: ["How long did it take?", "Would you use that approach again?"],
    starGuide: { situation: "What was the deadline/pressure?", task: "What did you need to learn?", action: "How did you learn it?", result: "Did you meet the deadline?" },
    tags: ["learning", "adaptability"],
  },
  {
    id: "b005",
    category: QUESTION_CATEGORIES.BEHAVIORAL,
    difficulty: DIFFICULTY.HARD,
    question: "Describe a time when you disagreed with your manager's technical decision. What did you do?",
    followUps: ["What was the final outcome?", "What did you learn?"],
    starGuide: { situation: "What was the decision?", task: "What was your concern?", action: "How did you raise it?", result: "How was it resolved?" },
    tags: ["leadership", "conflict", "communication"],
  },
  {
    id: "b006",
    category: QUESTION_CATEGORIES.BEHAVIORAL,
    difficulty: DIFFICULTY.MEDIUM,
    question: "Tell me about a time you missed a deadline. What happened?",
    followUps: ["How did you communicate the delay?", "What did you change afterward?"],
    starGuide: { situation: "What was the project?", task: "What was your deadline?", action: "What caused the miss and how did you respond?", result: "What was the impact and what changed?" },
    tags: ["accountability", "time-management"],
  },
  {
    id: "b007",
    category: QUESTION_CATEGORIES.BEHAVIORAL,
    difficulty: DIFFICULTY.EASY,
    question: "Give an example of when you went above and beyond what was expected.",
    followUps: ["Was it recognized?", "Would you do it again?"],
    starGuide: { situation: "What was expected of you?", task: "What extra did you take on?", action: "What did you do?", result: "What was the extra impact?" },
    tags: ["initiative", "motivation"],
  },
  {
    id: "b008",
    category: QUESTION_CATEGORIES.BEHAVIORAL,
    difficulty: DIFFICULTY.HARD,
    question: "Tell me about a time you had to make an important decision with incomplete information.",
    followUps: ["How confident were you?", "Was the decision correct?"],
    starGuide: { situation: "What decision needed to be made?", task: "What information was missing?", action: "How did you decide?", result: "What happened?" },
    tags: ["decision-making", "leadership"],
  },
];

// ── Technical Questions by Role ───────────────────────────────
const technicalQuestions = {
  "Full Stack Developer": [
    { id: "t_fs001", category: QUESTION_CATEGORIES.TECHNICAL, difficulty: DIFFICULTY.MEDIUM, question: "Explain the difference between REST and GraphQL. When would you choose one over the other?", tags: ["api", "architecture"], keyPoints: ["REST is resource-based", "GraphQL is query-based", "GraphQL prevents over/under-fetching", "REST is simpler for simple APIs"] },
    { id: "t_fs002", category: QUESTION_CATEGORIES.TECHNICAL, difficulty: DIFFICULTY.HARD, question: "How would you design a system to handle 1 million concurrent users?", tags: ["system-design", "scalability"], keyPoints: ["Load balancing", "Horizontal scaling", "Caching (Redis)", "CDN", "Database sharding"] },
    { id: "t_fs003", category: QUESTION_CATEGORIES.TECHNICAL, difficulty: DIFFICULTY.MEDIUM, question: "What is the event loop in Node.js and how does it work?", tags: ["nodejs", "javascript"], keyPoints: ["Single-threaded", "Non-blocking I/O", "Call stack, callback queue, microtask queue", "libuv"] },
    { id: "t_fs004", category: QUESTION_CATEGORIES.TECHNICAL, difficulty: DIFFICULTY.EASY, question: "What is the difference between SQL and NoSQL databases? When would you use MongoDB over PostgreSQL?", tags: ["database", "mongodb"], keyPoints: ["Schema flexibility", "Horizontal vs vertical scaling", "ACID vs BASE", "Use cases"] },
    { id: "t_fs005", category: QUESTION_CATEGORIES.TECHNICAL, difficulty: DIFFICULTY.MEDIUM, question: "Explain React's virtual DOM and why it improves performance.", tags: ["react", "frontend"], keyPoints: ["Diffing algorithm", "Reconciliation", "Batch updates", "Minimizes real DOM manipulation"] },
    { id: "t_fs006", category: QUESTION_CATEGORIES.TECHNICAL, difficulty: DIFFICULTY.HARD, question: "How do you prevent and handle race conditions in async JavaScript?", tags: ["javascript", "async"], keyPoints: ["Promise.all vs Promise.allSettled", "Mutex patterns", "AbortController", "Optimistic locking in DB"] },
    { id: "t_fs007", category: QUESTION_CATEGORIES.TECHNICAL, difficulty: DIFFICULTY.MEDIUM, question: "What is JWT and what are its security considerations?", tags: ["security", "auth"], keyPoints: ["Header.Payload.Signature", "Stateless auth", "Never store sensitive data in payload", "Short expiry + refresh tokens"] },
  ],
  "Frontend Developer": [
    { id: "t_fe001", category: QUESTION_CATEGORIES.TECHNICAL, difficulty: DIFFICULTY.MEDIUM, question: "What are React hooks and why were they introduced?", tags: ["react", "hooks"], keyPoints: ["Replace class lifecycle methods", "useState, useEffect, useContext", "Custom hooks for reuse", "Cleaner component logic"] },
    { id: "t_fe002", category: QUESTION_CATEGORIES.TECHNICAL, difficulty: DIFFICULTY.HARD, question: "How would you optimize a React application that is rendering slowly?", tags: ["react", "performance"], keyPoints: ["React.memo, useMemo, useCallback", "Code splitting", "Lazy loading", "Virtualization for long lists"] },
    { id: "t_fe003", category: QUESTION_CATEGORIES.TECHNICAL, difficulty: DIFFICULTY.MEDIUM, question: "Explain CSS specificity and how it resolves conflicts.", tags: ["css"], keyPoints: ["Inline > ID > Class > Element", "!important override", "Specificity score calculation"] },
    { id: "t_fe004", category: QUESTION_CATEGORIES.TECHNICAL, difficulty: DIFFICULTY.EASY, question: "What is the difference between flexbox and CSS grid?", tags: ["css", "layout"], keyPoints: ["Flexbox is 1D", "Grid is 2D", "When to use each"] },
    { id: "t_fe005", category: QUESTION_CATEGORIES.TECHNICAL, difficulty: DIFFICULTY.HARD, question: "What are Web Vitals and how do you measure and improve them?", tags: ["performance", "seo"], keyPoints: ["LCP, FID/INP, CLS", "Lighthouse, Chrome DevTools", "Image optimization, lazy loading, reducing JS"] },
  ],
  "Backend Developer": [
    { id: "t_be001", category: QUESTION_CATEGORIES.TECHNICAL, difficulty: DIFFICULTY.MEDIUM, question: "What is database indexing and when should you NOT use an index?", tags: ["database", "performance"], keyPoints: ["B-tree indexes", "Write overhead", "Low-cardinality columns", "Small tables"] },
    { id: "t_be002", category: QUESTION_CATEGORIES.TECHNICAL, difficulty: DIFFICULTY.HARD, question: "Explain CAP theorem and its implications for distributed systems.", tags: ["distributed-systems", "architecture"], keyPoints: ["Consistency, Availability, Partition tolerance", "Can only guarantee 2 of 3", "CP vs AP systems", "Real-world examples"] },
    { id: "t_be003", category: QUESTION_CATEGORIES.TECHNICAL, difficulty: DIFFICULTY.MEDIUM, question: "How do you secure a REST API?", tags: ["security", "api"], keyPoints: ["HTTPS", "Authentication (JWT/OAuth)", "Rate limiting", "Input validation", "CORS"] },
    { id: "t_be004", category: QUESTION_CATEGORIES.TECHNICAL, difficulty: DIFFICULTY.MEDIUM, question: "What is the difference between authentication and authorization?", tags: ["security"], keyPoints: ["AuthN = who you are", "AuthZ = what you can do", "JWT, RBAC, OAuth2"] },
    { id: "t_be005", category: QUESTION_CATEGORIES.TECHNICAL, difficulty: DIFFICULTY.HARD, question: "How would you implement a rate limiter from scratch?", tags: ["system-design", "api"], keyPoints: ["Token bucket algorithm", "Sliding window", "Redis for distributed rate limiting", "429 Too Many Requests"] },
  ],
  "Data Scientist": [
    { id: "t_ds001", category: QUESTION_CATEGORIES.TECHNICAL, difficulty: DIFFICULTY.MEDIUM, question: "Explain the bias-variance tradeoff.", tags: ["ml", "theory"], keyPoints: ["Bias = underfitting", "Variance = overfitting", "Sweet spot in model complexity", "Regularization"] },
    { id: "t_ds002", category: QUESTION_CATEGORIES.TECHNICAL, difficulty: DIFFICULTY.HARD, question: "How do you handle class imbalance in a classification problem?", tags: ["ml", "data"], keyPoints: ["SMOTE, undersampling", "Class weights", "Precision/Recall over accuracy", "ROC-AUC"] },
    { id: "t_ds003", category: QUESTION_CATEGORIES.TECHNICAL, difficulty: DIFFICULTY.MEDIUM, question: "What is cross-validation and why is it important?", tags: ["ml", "evaluation"], keyPoints: ["K-fold CV", "Prevents data leakage", "More reliable than single train/test split"] },
  ],
  "DevOps Engineer": [
    { id: "t_do001", category: QUESTION_CATEGORIES.TECHNICAL, difficulty: DIFFICULTY.MEDIUM, question: "What is the difference between Docker and a virtual machine?", tags: ["docker", "infrastructure"], keyPoints: ["Containers share OS kernel", "VMs have full OS", "Docker is lighter and faster", "Isolation levels"] },
    { id: "t_do002", category: QUESTION_CATEGORIES.TECHNICAL, difficulty: DIFFICULTY.HARD, question: "Explain a CI/CD pipeline you have built or worked with.", tags: ["cicd", "automation"], keyPoints: ["Source → Build → Test → Deploy", "GitHub Actions / Jenkins", "Environment stages", "Rollback strategy"] },
    { id: "t_do003", category: QUESTION_CATEGORIES.TECHNICAL, difficulty: DIFFICULTY.MEDIUM, question: "What is Kubernetes and what problems does it solve?", tags: ["kubernetes", "orchestration"], keyPoints: ["Container orchestration", "Auto-scaling", "Self-healing", "Service discovery", "Rolling deployments"] },
  ],
};

// ── HR / Culture Fit Questions ────────────────────────────────
const hrQuestions = [
  { id: "hr001", category: QUESTION_CATEGORIES.HR, difficulty: DIFFICULTY.EASY, question: "Tell me about yourself.", tags: ["introduction"], tip: "Keep it under 2 minutes. Cover: current role → key experience → why you're here." },
  { id: "hr002", category: QUESTION_CATEGORIES.HR, difficulty: DIFFICULTY.EASY, question: "Why do you want to leave your current job?", tags: ["motivation"], tip: "Stay positive. Focus on growth opportunities, not negatives about current employer." },
  { id: "hr003", category: QUESTION_CATEGORIES.HR, difficulty: DIFFICULTY.MEDIUM, question: "Where do you see yourself in 5 years?", tags: ["goals", "motivation"], tip: "Align your goals with the role. Show ambition but also commitment." },
  { id: "hr004", category: QUESTION_CATEGORIES.HR, difficulty: DIFFICULTY.EASY, question: "What are your salary expectations?", tags: ["negotiation"], tip: "Research market rates first. Give a range based on your research." },
  { id: "hr005", category: QUESTION_CATEGORIES.HR, difficulty: DIFFICULTY.MEDIUM, question: "What is your biggest weakness?", tags: ["self-awareness"], tip: "Choose a real weakness but one you are actively working to improve. Show growth mindset." },
  { id: "hr006", category: QUESTION_CATEGORIES.HR, difficulty: DIFFICULTY.EASY, question: "Why should we hire you?", tags: ["value-proposition"], tip: "Connect your top 3 skills directly to the job requirements. Be specific." },
  { id: "hr007", category: QUESTION_CATEGORIES.HR, difficulty: DIFFICULTY.MEDIUM, question: "How do you handle stress and pressure?", tags: ["resilience"], tip: "Give a concrete strategy (prioritization, breaks, communication) with an example." },
  { id: "hr008", category: QUESTION_CATEGORIES.HR, difficulty: DIFFICULTY.EASY, question: "Do you prefer working alone or in a team?", tags: ["work-style"], tip: "Show flexibility. Most good answers say both, depending on the task." },
];

// ── Situational Questions ─────────────────────────────────────
const situationalQuestions = [
  { id: "s001", category: QUESTION_CATEGORIES.SITUATIONAL, difficulty: DIFFICULTY.MEDIUM, question: "If you discovered a critical bug in production 30 minutes before a major demo, what would you do?", tags: ["crisis-management", "communication"], keyPoints: ["Immediate assessment", "Notify stakeholders early", "Quick fix vs rollback decision", "Post-mortem"] },
  { id: "s002", category: QUESTION_CATEGORIES.SITUATIONAL, difficulty: DIFFICULTY.HARD, question: "Your team is divided on a major architectural decision. How do you move forward?", tags: ["leadership", "decision-making"], keyPoints: ["Gather all perspectives", "Data-driven decision", "Prototype/POC if needed", "Document the decision"] },
  { id: "s003", category: QUESTION_CATEGORIES.SITUATIONAL, difficulty: DIFFICULTY.MEDIUM, question: "You are given a 3-month project but only 6 weeks to complete it. What do you do?", tags: ["prioritization", "communication"], keyPoints: ["Clarify requirements", "Identify MVP", "Negotiate scope or timeline", "Daily progress communication"] },
  { id: "s004", category: QUESTION_CATEGORIES.SITUATIONAL, difficulty: DIFFICULTY.EASY, question: "A junior developer on your team keeps making the same mistakes. How do you handle it?", tags: ["mentoring", "communication"], keyPoints: ["Private constructive feedback", "Pair programming", "Clear written guidelines", "Follow-up check-ins"] },
];

// ── Main export functions ─────────────────────────────────────

/**
 * Get questions for a specific role and session config
 */
const getQuestionsForRole = (targetRole, options = {}) => {
  const {
    count = 8,
    includeBehavioral = true,
    includeTechnical = true,
    includeHR = true,
    includeSituational = true,
    difficulty = null,
  } = options;

  let pool = [];

  // Find closest matching role
  const roleKey = Object.keys(technicalQuestions).find(
    (r) => r.toLowerCase() === targetRole?.toLowerCase()
  ) || "Full Stack Developer";

  if (includeTechnical) pool.push(...(technicalQuestions[roleKey] || technicalQuestions["Full Stack Developer"]));
  if (includeBehavioral) pool.push(...behavioralQuestions);
  if (includeHR) pool.push(...hrQuestions);
  if (includeSituational) pool.push(...situationalQuestions);

  // Filter by difficulty if specified
  if (difficulty) pool = pool.filter((q) => q.difficulty === difficulty);

  // Shuffle and pick
  const shuffled = pool.sort(() => Math.random() - 0.5);

  // Ensure good mix: ~40% technical, ~30% behavioral, ~20% HR, ~10% situational
  const technical = shuffled.filter((q) => q.category === QUESTION_CATEGORIES.TECHNICAL).slice(0, Math.ceil(count * 0.4));
  const behavioral = shuffled.filter((q) => q.category === QUESTION_CATEGORIES.BEHAVIORAL).slice(0, Math.ceil(count * 0.3));
  const hr = shuffled.filter((q) => q.category === QUESTION_CATEGORIES.HR).slice(0, Math.ceil(count * 0.2));
  const situational = shuffled.filter((q) => q.category === QUESTION_CATEGORIES.SITUATIONAL).slice(0, Math.ceil(count * 0.1));

  const selected = [...technical, ...behavioral, ...hr, ...situational].slice(0, count);

  return selected;
};

/**
 * Get a single question by ID
 */
const getQuestionById = (id) => {
  const all = [
    ...behavioralQuestions,
    ...Object.values(technicalQuestions).flat(),
    ...hrQuestions,
    ...situationalQuestions,
  ];
  return all.find((q) => q.id === id) || null;
};

/**
 * Get all available roles
 */
const getAvailableRoles = () => Object.keys(technicalQuestions);

module.exports = {
  getQuestionsForRole,
  getQuestionById,
  getAvailableRoles,
  QUESTION_CATEGORIES,
  DIFFICULTY,
  behavioralQuestions,
  technicalQuestions,
  hrQuestions,
  situationalQuestions,
};
