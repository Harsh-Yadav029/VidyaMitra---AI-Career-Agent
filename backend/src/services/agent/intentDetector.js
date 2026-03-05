// ============================================================
//  VidyaMitra — services/agent/intentDetector.js
//  Detects user intent from message text
//  Used to route queries to specialized handlers
// ============================================================

const INTENTS = {
  SKILL_GAP: "skill_gap",
  CAREER_PATH: "career_path",
  INTERVIEW_PREP: "interview_prep",
  RESUME_REVIEW: "resume_review",
  SALARY_INFO: "salary_info",
  JOB_SEARCH: "job_search",
  LEARNING_ROADMAP: "learning_roadmap",
  GREETING: "greeting",
  GENERAL: "general",
};

// Keywords that signal each intent
const INTENT_PATTERNS = [
  {
    intent: INTENTS.SKILL_GAP,
    patterns: [
      /skill\s*gap/i, /what skills/i, /skills.*need/i, /need.*skills/i,
      /missing.*skill/i, /skill.*missing/i, /lacking/i, /improve.*skill/i,
      /which skills/i, /skills.*for.*role/i, /skills.*get.*job/i,
    ],
  },
  {
    intent: INTENTS.CAREER_PATH,
    patterns: [
      /career path/i, /career.*switch/i, /career.*change/i, /next role/i,
      /transition.*to/i, /move.*to/i, /become.*a/i, /want to be/i,
      /career.*goal/i, /career.*advice/i, /career.*growth/i,
      /promotion/i, /promoted/i, /get promoted/i, /next.*position/i, /career.*options/i,
    ],
  },
  {
    intent: INTENTS.INTERVIEW_PREP,
    patterns: [
      /interview/i, /prepare.*interview/i, /interview.*question/i,
      /how.*answer/i, /behavioral.*question/i, /technical.*question/i,
      /mock.*interview/i, /interview.*tip/i, /tell me about yourself/i,
      /hr.*round/i, /technical.*round/i,
    ],
  },
  {
    intent: INTENTS.RESUME_REVIEW,
    patterns: [
      /resume/i, /cv\b/i, /improve.*resume/i, /resume.*feedback/i,
      /resume.*tip/i, /ats/i, /applicant.*tracking/i, /resume.*score/i,
      /what.*wrong.*resume/i, /resume.*better/i,
    ],
  },
  {
    intent: INTENTS.SALARY_INFO,
    patterns: [
      /salary/i, /pay/i, /compensation/i, /ctc/i, /package/i,
      /how much.*earn/i, /earn.*how much/i, /lpa/i, /stipend/i,
      /hike/i, /increment/i,
    ],
  },
  {
    intent: INTENTS.JOB_SEARCH,
    patterns: [
      /find.*job/i, /job.*search/i, /apply.*job/i, /job.*portal/i,
      /where.*apply/i, /get.*hired/i, /job.*tip/i, /linkedin/i,
      /naukri/i, /indeed/i, /job.*board/i, /referral/i,
    ],
  },
  {
    intent: INTENTS.LEARNING_ROADMAP,
    patterns: [
      /learn/i, /roadmap/i, /how.*start/i, /beginner/i, /tutorial/i,
      /resource/i, /course/i, /study/i, /where.*start/i,
      /how.*become/i, /certification/i, /practice/i,
    ],
  },
  {
    intent: INTENTS.GREETING,
    patterns: [
      /^hi\b/i, /^hello\b/i, /^hey\b/i, /^good\s*(morning|afternoon|evening)/i,
      /^what.*can.*you.*do/i, /^help/i, /^start/i,
    ],
  },
];

/**
 * Detect the primary intent of a user message
 * @param {string} message - user's message text
 * @returns {string} intent constant
 */
const detectIntent = (message) => {
  for (const { intent, patterns } of INTENT_PATTERNS) {
    if (patterns.some((p) => p.test(message))) {
      return intent;
    }
  }
  return INTENTS.GENERAL;
};

/**
 * Detect all matching intents (for complex messages)
 */
const detectAllIntents = (message) => {
  const matched = [];
  for (const { intent, patterns } of INTENT_PATTERNS) {
    if (patterns.some((p) => p.test(message))) {
      matched.push(intent);
    }
  }
  return matched.length > 0 ? matched : [INTENTS.GENERAL];
};

module.exports = { detectIntent, detectAllIntents, INTENTS };
