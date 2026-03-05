// ============================================================
//  VidyaMitra — services/scorer/readabilityScorer.js
//  Readability Score: sentence length, clarity, jargon density
// ============================================================

const JARGON_OVERUSED = [
  "synergy", "leverage", "paradigm", "holistic", "proactive",
  "bandwidth", "scalable solution", "thought leader", "disruptive",
  "innovative", "cutting-edge", "best-in-class", "world-class",
  "game-changer", "move the needle", "deep dive", "circle back",
  "low-hanging fruit", "boil the ocean", "value-added",
];

const FILLER_WORDS = [
  "very", "really", "basically", "essentially", "actually",
  "literally", "obviously", "clearly", "certainly", "definitely",
];

/**
 * Calculate readability score (0-100)
 */
const calculateReadabilityScore = (rawText) => {
  const issues = [];
  const tips = [];
  let score = 100; // start full, deduct for problems

  const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);
  const bulletLines = lines.filter((l) => /^[•\-–*▪]/.test(l));
  const words = rawText.split(/\s+/).filter(Boolean);
  const sentences = rawText.split(/[.!?]+/).filter((s) => s.trim().length > 5);

  // ── 1. Bullet point length check ──────────────────────────
  const longBullets = bulletLines.filter((l) => l.split(" ").length > 25);
  if (longBullets.length > 2) {
    const deduction = Math.min(15, longBullets.length * 3);
    score -= deduction;
    issues.push(`${longBullets.length} bullet points are too long (>25 words)`);
    tips.push("Keep bullet points concise — aim for 10-20 words per bullet. Recruiters scan, not read.");
  }

  // ── 2. Sentence length check ──────────────────────────────
  const longSentences = sentences.filter((s) => s.split(" ").length > 35);
  if (longSentences.length > 3) {
    score -= 10;
    issues.push("Multiple overly long sentences detected");
    tips.push("Break long sentences into shorter, punchier statements");
  }

  // ── 3. Overused jargon check ──────────────────────────────
  const textLower = rawText.toLowerCase();
  const foundJargon = JARGON_OVERUSED.filter((j) => textLower.includes(j));
  if (foundJargon.length > 0) {
    score -= Math.min(15, foundJargon.length * 4);
    issues.push(`Overused buzzwords found: "${foundJargon.slice(0, 3).join('", "')}"`);
    tips.push("Replace buzzwords with concrete, specific descriptions of what you actually did");
  }

  // ── 4. Filler words check ─────────────────────────────────
  const foundFillers = FILLER_WORDS.filter((f) => {
    const pattern = new RegExp(`\\b${f}\\b`, "gi");
    const matches = rawText.match(pattern) || [];
    return matches.length > 2;
  });
  if (foundFillers.length > 2) {
    score -= 8;
    tips.push("Remove filler words like 'very', 'really', 'basically' to sound more confident");
  }

  // ── 5. Consistent tense check ─────────────────────────────
  // Current job should use present tense, past jobs past tense
  const presentTenseInBullets = bulletLines.filter((l) =>
    /\b(am|is|are|manage|lead|develop|work|build)\b/i.test(l)
  ).length;
  const pastTenseInBullets = bulletLines.filter((l) =>
    /\b(led|managed|developed|built|created|improved)\b/i.test(l)
  ).length;

  if (bulletLines.length > 5 && presentTenseInBullets > 0 && pastTenseInBullets > 0) {
    // Mixed tense — only a mild issue
    score -= 5;
    tips.push("Use past tense for previous roles and present tense only for your current role");
  }

  // ── 6. Resume length check ────────────────────────────────
  const wordCount = words.length;
  if (wordCount < 200) {
    score -= 15;
    issues.push(`Resume is too short (${wordCount} words). Aim for 400-700 words.`);
    tips.push("Expand your experience and projects sections with more detail");
  } else if (wordCount > 900) {
    score -= 10;
    issues.push(`Resume may be too long (${wordCount} words). Keep it concise.`);
    tips.push("Trim to 1-2 pages. Focus on the most recent and relevant experience.");
  }

  // ── 7. Good formatting signals (bonus) ────────────────────
  if (bulletLines.length >= 5) score += 5;           // uses bullet points
  if (lines.length > 20 && lines.length < 80) score += 5; // good density

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score: finalScore,
    label: getScoreLabel(finalScore),
    stats: {
      wordCount,
      bulletPointCount: bulletLines.length,
      longBullets: longBullets.length,
      jargonFound: foundJargon,
      fillerWordsFound: foundFillers,
    },
    issues,
    tips,
  };
};

const getScoreLabel = (score) => {
  if (score >= 85) return "Highly Readable";
  if (score >= 70) return "Clear";
  if (score >= 50) return "Needs Clarity";
  return "Hard to Read";
};

module.exports = { calculateReadabilityScore };
