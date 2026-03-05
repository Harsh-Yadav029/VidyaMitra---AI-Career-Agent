/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import api from "../services/api";

// ── Design tokens ─────────────────────────────────────────────
const C = {
  bg:        "#090909",
  surface:   "#0f0f0f",
  card:      "#111111",
  border:    "#1a1a1a",
  border2:   "#222222",
  border3:   "#2a2a2a",
  violet:    "#8b5cf6",
  violetDim: "rgba(139,92,246,.12)",
  violetFg:  "rgba(139,92,246,.07)",
  text:      "#e8e8e8",
  muted:     "#666",
  muted2:    "#444",
  muted3:    "#333",
  green:     "#22c55e",
  amber:     "#f59e0b",
  red:       "#ef4444",
  blue:      "#3b82f6",
};

// ── Helpers ───────────────────────────────────────────────────
const MonoLabel = ({ children, color = C.muted, style = {} }) => (
  <span style={{
    fontFamily: "'Geist Mono', monospace",
    fontSize: 10, fontWeight: 500,
    letterSpacing: "0.10em", textTransform: "uppercase",
    color, ...style,
  }}>{children}</span>
);

const scoreColor = (s) =>
  s >= 85 ? C.green : s >= 70 ? C.violet : s >= 55 ? C.blue : s >= 40 ? C.amber : C.red;

const scoreLabel = (s) =>
  s >= 85 ? "Excellent" : s >= 70 ? "Good" : s >= 55 ? "Average" : s >= 40 ? "Needs Work" : "Poor";

// ── Icons ─────────────────────────────────────────────────────
const Icons = {
  Spin: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      style={{ animation: "spin .8s linear infinite" }}>
      <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" strokeOpacity=".2"/>
      <path d="M21 12a9 9 0 0 0-9-9"/>
    </svg>
  ),
  Check: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  X: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Arrow: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  Resume: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
  Sparkle: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
    </svg>
  ),
};

// ── Score dimensions config ───────────────────────────────────
const DIMENSIONS = [
  { key: "ats",          label: "ATS Compatibility",    weight: 25 },
  { key: "impact",       label: "Impact & Achievements", weight: 25 },
  { key: "completeness", label: "Completeness",          weight: 20 },
  { key: "readability",  label: "Readability",           weight: 15 },
  { key: "skillMatch",   label: "Skill Match",           weight: 15 },
];

// ── Big score ring ────────────────────────────────────────────
const BigRing = ({ score }) => {
  const [prog, setProg] = useState(0);
  const size = 148;
  const sw   = 9;
  const r    = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const color = scoreColor(score);

  useEffect(() => {
    const t = setTimeout(() => setProg(score || 0), 350);
    return () => clearTimeout(t);
  }, [score]);

  const offset = circ - (prog / 100) * circ;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border2} strokeWidth={sw}/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.34,1.56,.64,1)" }}/>
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <span style={{
            fontSize: 36, fontWeight: 800, color: C.text,
            fontFamily: "'Geist Mono', monospace",
            letterSpacing: "-0.05em", lineHeight: 1,
          }}>{score ?? "—"}</span>
          <MonoLabel color={C.muted2} style={{ fontSize: 9, marginTop: 3 }}>/100</MonoLabel>
        </div>
      </div>
      {/* Grade badge */}
      <div style={{
        padding: "3px 12px", borderRadius: 99,
        background: `${color}14`,
        border: `1px solid ${color}30`,
        fontSize: 11, fontWeight: 600,
        color, fontFamily: "'Geist Mono', monospace",
        letterSpacing: "0.06em", textTransform: "uppercase",
      }}>
        {scoreLabel(score)}
      </div>
    </div>
  );
};

// ── Animated score bar ────────────────────────────────────────
const ScoreBar = ({ label, score, weight, delay = 0 }) => {
  const [width, setWidth] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const color = scoreColor(score);

  useEffect(() => {
    const t = setTimeout(() => setWidth(score || 0), 500 + delay);
    return () => clearTimeout(t);
  }, [score, delay]);

  return (
    <div style={{ cursor: "pointer" }} onClick={() => setExpanded(v => !v)}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{label}</span>
          <span style={{
            fontSize: 9, fontFamily: "'Geist Mono', monospace",
            color: C.muted2, letterSpacing: "0.06em",
          }}>{weight}% wt</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            fontSize: 13, fontWeight: 700,
            fontFamily: "'Geist Mono', monospace",
            color,
          }}>{score ?? "—"}</span>
          <MonoLabel color={C.muted2} style={{ fontSize: 9 }}>/100</MonoLabel>
        </div>
      </div>
      <div style={{
        height: 3, background: C.border2, borderRadius: 99, overflow: "hidden",
      }}>
        <div style={{
          height: "100%", width: `${width}%`,
          background: color, borderRadius: 99,
          transition: "width 1s ease",
        }} />
      </div>
    </div>
  );
};

// ── Tip card ──────────────────────────────────────────────────
const TipCard = ({ tip, index }) => {
  const priority = tip.priority || (index < 2 ? "high" : index < 4 ? "medium" : "low");
  const message  = typeof tip === "string" ? tip : tip.message || tip.tip || String(tip);
  const dotColor = priority === "high" ? C.red : priority === "medium" ? C.amber : C.muted2;

  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 12,
      padding: "11px 14px",
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 9, animation: `fadeUp .25s ease ${index * 40}ms both`,
    }}>
      <div style={{
        width: 6, height: 6, borderRadius: "50%",
        background: dotColor, flexShrink: 0, marginTop: 5,
      }} />
      <p style={{ fontSize: 13, color: C.text, lineHeight: 1.65, margin: 0 }}>{message}</p>
    </div>
  );
};

// ── Feedback section ──────────────────────────────────────────
const FeedbackSection = ({ feedback }) => {
  if (!feedback) return null;
  const sections = [
    { key: "strengths",   label: "Strengths",       color: C.green,  bg: "rgba(34,197,94,.06)",   border: "rgba(34,197,94,.15)"   },
    { key: "weaknesses",  label: "Areas to Improve", color: C.amber,  bg: "rgba(245,158,11,.06)",  border: "rgba(245,158,11,.15)"  },
    { key: "suggestions", label: "AI Suggestions",  color: C.violet, bg: "rgba(139,92,246,.06)",  border: "rgba(139,92,246,.15)"  },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
      {sections.map(({ key, label, color, bg, border }) => {
        const items = feedback[key] || [];
        if (!items.length) return null;
        return (
          <div key={key} style={{
            background: bg, border: `1px solid ${border}`,
            borderRadius: 12, padding: "14px 16px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
              <MonoLabel color={color} style={{ fontSize: 9 }}>{label}</MonoLabel>
            </div>
            <ul style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {items.slice(0, 4).map((item, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color, fontSize: 10, marginTop: 3, flexShrink: 0 }}>·</span>
                  <span style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>
                    {typeof item === "string" ? item : item.message || item.text || String(item)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

// ── Skill chips ───────────────────────────────────────────────
const SkillChip = ({ label, matched }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "3px 9px", borderRadius: 6,
    background: matched ? "rgba(34,197,94,.06)" : "rgba(239,68,68,.06)",
    border: `1px solid ${matched ? "rgba(34,197,94,.2)" : "rgba(239,68,68,.2)"}`,
    fontSize: 11, fontWeight: 500,
    color: matched ? C.green : C.red,
    fontFamily: "'Geist Mono', monospace",
  }}>
    {matched ? <Icons.Check /> : <Icons.X />} {label}
  </span>
);

// ── Normalize API response ─────────────────────────────────────
const normalizeScore = (raw) => {
  if (!raw) return null;
  const report = raw.scoreReport || raw;
  const scores  = report.scores  || {};
  const details = report.details || {};
  const labels  = report.labels  || {};

  return {
    overall: scores.overall ?? report.overall,
    label:   labels.overall,
    ats: {
      score:  scores.ats ?? details.ats?.score,
      label:  labels.ats,
      issues: details.ats?.issues || [],
      tips:   details.ats?.tips   || [],
    },
    impact: {
      score: scores.impact ?? details.impact?.score,
      tips:  details.impact?.tips || [],
    },
    completeness: {
      score:  scores.completeness ?? details.completeness?.score,
      issues: details.completeness?.issues || [],
      tips:   details.completeness?.tips   || [],
    },
    readability: {
      score: scores.readability ?? details.readability?.score,
      tips:  details.readability?.tips || [],
    },
    skillMatch: {
      score:         scores.skillMatch ?? details.skillMatch?.score,
      matchedSkills: details.skillMatch?.matchedSkills || [],
      missingSkills: details.skillMatch?.missingSkills || [],
      resumeSkills:  [],
      tips:          details.skillMatch?.tips || [],
    },
    feedback: raw.scoreReport?.aiFeedback ? {
      summary:     raw.scoreReport.aiFeedback.overallVerdict,
      strengths:   raw.scoreReport.aiFeedback.strengthHighlights || [],
      weaknesses:  (raw.scoreReport.aiFeedback.topPriorities || []).map(p => p.priority),
      suggestions: (raw.scoreReport.aiFeedback.topPriorities || []).map(p => p.action),
    } : null,
  };
};

// ── Toast ─────────────────────────────────────────────────────
const Toast = ({ msg, type }) => (
  <div style={{
    position: "fixed", top: 20, right: 20, zIndex: 9999,
    display: "flex", alignItems: "center", gap: 8,
    padding: "10px 14px",
    background: C.card, border: `1px solid ${C.border2}`,
    borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,.5)",
    animation: "fadeUp .2s ease",
    fontSize: 13, color: C.text,
  }}>
    <div style={{
      width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
      background: type === "error" ? C.red : C.green,
    }} />
    {msg}
  </div>
);

// ── TABS ──────────────────────────────────────────────────────
const TABS = [
  { id: "breakdown", label: "Breakdown" },
  { id: "feedback",  label: "AI Feedback" },
  { id: "tips",      label: "Tips" },
  { id: "skills",    label: "Skill Match" },
];

// ── MAIN ──────────────────────────────────────────────────────
export default function ScorePage() {
  const [resumes,        setResumes]        = useState([]);
  const [selectedId,     setSelectedId]     = useState("");
  const [jobDesc,        setJobDesc]        = useState("");
  const [scoreData,      setScoreData]      = useState(null);
  const [tips,           setTips]           = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [loadingTips,    setLoadingTips]    = useState(false);
  const [fetchingScore,  setFetchingScore]  = useState(false);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [activeTab,      setActiveTab]      = useState("breakdown");
  const [toast,          setToast]          = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load resumes
  useEffect(() => {
    (async () => {
      setResumesLoading(true);
      try {
        const res    = await api.get("/resumes");
        const parsed = (res.data.resumes || []).filter(r => r.isParsed);
        setResumes(parsed);
        if (parsed.length > 0) setSelectedId(parsed[0]._id);
      } catch { showToast("Failed to load resumes", "error"); }
      finally   { setResumesLoading(false); }
    })();
  }, []);

  // Load tips
  const loadTips = useCallback(async (id) => {
    setLoadingTips(true);
    try {
      const res = await api.get(`/scores/${id}/tips`);
      setTips(res.data?.tips || res.data?.allTips || []);
    } catch { setTips([]); }
    finally { setLoadingTips(false); }
  }, []);

  // Load existing score when resume changes
  useEffect(() => {
    if (!selectedId) return;
    (async () => {
      setFetchingScore(true);
      try {
        const res = await api.get(`/scores/${selectedId}`);
        const raw = res.data?.score || res.data;
        const hasData = raw?.scoreReport?.scores?.overall !== undefined || raw?.overall !== undefined;
        if (hasData) {
          setScoreData(normalizeScore(raw));
          loadTips(selectedId);
        } else {
          setScoreData(null); setTips([]);
        }
      } catch { setScoreData(null); setTips([]); }
      finally { setFetchingScore(false); }
    })();
  }, [selectedId, loadTips]);

  // Analyze
  const handleScore = async () => {
    if (!selectedId) { showToast("Please select a resume first", "error"); return; }
    setLoading(true); setScoreData(null);
    try {
      const res = await api.post(`/scores/${selectedId}`, {
        jobDescription: jobDesc.trim() || undefined,
      });
      setScoreData(normalizeScore(res.data?.score || res.data));
      await loadTips(selectedId);
      showToast("Resume scored successfully");
      setActiveTab("breakdown");
    } catch (err) {
      showToast(err?.response?.data?.message || "Scoring failed", "error");
    } finally { setLoading(false); }
  };

  return (
    <DashboardLayout>
      <style>{`
        @keyframes fadeUp  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes spin    { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes shimmer { 0%,100% { opacity:.4; } 50% { opacity:.8; } }
        .tab-btn:hover     { color: ${C.text} !important; }
        .score-btn:hover:not(:disabled) { background: #7c3aed !important; }
        .score-btn:disabled { opacity:.5; cursor:not-allowed; }
        select option { background: ${C.card}; }
        select { cursor: pointer; }
        textarea { resize: vertical; }
        textarea::placeholder, input::placeholder { color: ${C.muted2} !important; }
      `}</style>

      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div style={{ maxWidth: 900, padding: "28px 24px 48px" }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 28, animation: "fadeUp .3s ease both" }}>
          <MonoLabel color={C.muted2} style={{ display: "block", marginBottom: 5 }}>
            AI Score Engine
          </MonoLabel>
          <h1 style={{
            fontSize: 22, fontWeight: 700, color: C.text,
            letterSpacing: "-0.04em", margin: "0 0 4px",
          }}>Resume Analysis</h1>
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
            ATS score, impact analysis, and AI-powered feedback across 5 dimensions.
          </p>
        </div>

        {/* ── Config card ── */}
        <div style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: "20px",
          marginBottom: 24, animation: "fadeUp .3s ease .05s both",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14, marginBottom: 16,
          }}>
            {/* Resume selector */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <MonoLabel>Select Resume</MonoLabel>
              {resumes.length === 0 ? (
                <div style={{
                  background: C.surface, border: `1px solid ${C.border2}`,
                  borderRadius: 8, padding: "10px 12px",
                  fontSize: 13, color: C.muted,
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  No parsed resumes —{" "}
                  <Link to="/resume" style={{ color: C.violet, textDecoration: "none", fontWeight: 500 }}>
                    Upload one →
                  </Link>
                </div>
              ) : (
                <select
                  value={selectedId}
                  onChange={e => setSelectedId(e.target.value)}
                  style={{
                    background: C.surface, border: `1px solid ${C.border2}`,
                    borderRadius: 8, padding: "10px 12px",
                    color: C.text, fontSize: 13, fontFamily: "inherit",
                    outline: "none", transition: "border-color .15s",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23666' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 12px center",
                    paddingRight: 32,
                  }}
                  onFocus={e => e.target.style.borderColor = "rgba(139,92,246,.4)"}
                  onBlur={e  => e.target.style.borderColor = C.border2}
                >
                  {resumes.map(r => (
                    <option key={r._id} value={r._id}>
                      {r.label || r.originalName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* JD textarea */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <MonoLabel>Job Description</MonoLabel>
                <MonoLabel color={C.muted2} style={{ fontSize: 9 }}>optional · boosts skill match</MonoLabel>
              </div>
              <textarea
                value={jobDesc}
                onChange={e => setJobDesc(e.target.value)}
                placeholder="Paste the job description to get skill match analysis…"
                rows={3}
                style={{
                  background: C.surface, border: `1px solid ${C.border2}`,
                  borderRadius: 8, padding: "10px 12px",
                  color: C.text, fontSize: 13, fontFamily: "inherit",
                  outline: "none", transition: "border-color .15s",
                  minHeight: 80,
                }}
                onFocus={e => e.target.style.borderColor = "rgba(139,92,246,.4)"}
                onBlur={e  => e.target.style.borderColor = C.border2}
              />
            </div>
          </div>

          {/* Analyze button */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              className="score-btn"
              onClick={handleScore}
              disabled={loading || !selectedId}
              style={{
                background: C.violet, border: "none",
                borderRadius: 9, padding: "10px 22px",
                color: "#fff", fontSize: 13, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 8,
                transition: "background .15s",
              }}
            >
              {loading ? (
                <><Icons.Spin /> Analyzing…</>
              ) : (
                <>{scoreData ? "Re-analyze" : "Analyze Resume"} <Icons.Arrow /></>
              )}
            </button>
            {scoreData && (
              <span style={{ fontSize: 12, color: C.muted }}>
                Last scored · re-analyze to refresh
              </span>
            )}
          </div>
        </div>

        {/* ── Fetching skeleton ── */}
        {fetchingScore && (
          <div style={{
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: "40px",
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 12,
            animation: "fadeUp .25s ease both",
          }}>
            <div style={{ color: C.violet }}><Icons.Spin /></div>
            <MonoLabel color={C.muted2}>Loading score data…</MonoLabel>
          </div>
        )}

        {/* ── Score results ── */}
        {scoreData && !fetchingScore && (
          <div style={{ animation: "fadeUp .3s ease both" }}>

            {/* ── Score hero ── */}
            <div style={{
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 12, padding: "24px",
              marginBottom: 16,
            }}>
              <div style={{
                display: "flex", flexDirection: "row",
                alignItems: "center", gap: 28,
                flexWrap: "wrap",
              }}>
                {/* Big ring */}
                <BigRing score={scoreData.overall} />

                {/* Mini dimension grid */}
                <div style={{
                  flex: 1, minWidth: 280,
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: 8,
                }}>
                  {DIMENSIONS.map(dim => {
                    const raw   = scoreData[dim.key];
                    const score = typeof raw === "object" ? raw?.score : raw;
                    const color = scoreColor(score);
                    return (
                      <div key={dim.key} style={{
                        background: `${color}08`,
                        border: `1px solid ${color}20`,
                        borderRadius: 9, padding: "10px 8px",
                        textAlign: "center",
                      }}>
                        <div style={{
                          fontSize: 16, fontWeight: 800, color,
                          fontFamily: "'Geist Mono', monospace",
                          letterSpacing: "-0.04em", lineHeight: 1,
                          marginBottom: 5,
                        }}>{score ?? "—"}</div>
                        <MonoLabel color={C.muted2} style={{ fontSize: 8, lineHeight: 1.3, display: "block" }}>
                          {dim.label}
                        </MonoLabel>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Meta strip */}
              <div style={{
                marginTop: 18, paddingTop: 16,
                borderTop: `1px solid ${C.border}`,
                display: "flex", gap: 16, flexWrap: "wrap",
                alignItems: "center",
              }}>
                {scoreData.ats?.label && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.violet }} />
                    <MonoLabel color={C.muted}>ATS Status:</MonoLabel>
                    <MonoLabel color={C.violet}>{scoreData.ats.label}</MonoLabel>
                  </div>
                )}
                {scoreData.label && (
                  <>
                    <div style={{ width: 1, height: 12, background: C.border2 }} />
                    <MonoLabel color={C.muted}>
                      Overall: <span style={{ color: C.text }}>{scoreData.label}</span>
                    </MonoLabel>
                  </>
                )}
                {jobDesc && (
                  <>
                    <div style={{ width: 1, height: 12, background: C.border2 }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ color: C.green, display: "flex" }}><Icons.Check /></span>
                      <MonoLabel color={C.green}>Scored against JD</MonoLabel>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ── Tabs ── */}
            <div style={{
              display: "flex", gap: 2,
              borderBottom: `1px solid ${C.border}`,
              marginBottom: 16,
            }}>
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  className="tab-btn"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: "none", border: "none",
                    borderBottom: `2px solid ${activeTab === tab.id ? C.violet : "transparent"}`,
                    padding: "9px 16px 11px",
                    cursor: "pointer",
                    fontSize: 13, fontWeight: 500,
                    color: activeTab === tab.id ? C.violet : C.muted,
                    transition: "all .15s", marginBottom: -1,
                    fontFamily: "inherit",
                    display: "flex", alignItems: "center", gap: 5,
                  }}
                >
                  {tab.label}
                  {tab.id === "tips" && tips.length > 0 && (
                    <span style={{
                      background: C.violetFg, border: `1px solid rgba(139,92,246,.2)`,
                      borderRadius: 99, padding: "0 6px",
                      fontSize: 9, color: C.violet,
                      fontFamily: "Geist Mono",
                    }}>{tips.length}</span>
                  )}
                </button>
              ))}
            </div>

            {/* ════ Breakdown tab ════ */}
            {activeTab === "breakdown" && (
              <div style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 12, padding: "20px",
                display: "flex", flexDirection: "column", gap: 18,
                animation: "fadeUp .2s ease both",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <MonoLabel color={C.muted2}>Score Breakdown</MonoLabel>
                  <div style={{ flex: 1, height: 1, background: C.border }} />
                  <MonoLabel color={C.muted2} style={{ fontSize: 9 }}>Click bar for details</MonoLabel>
                </div>

                {DIMENSIONS.map((dim, i) => {
                  const raw   = scoreData[dim.key];
                  const score = typeof raw === "object" ? raw?.score : raw;
                  return (
                    <ScoreBar
                      key={dim.key}
                      label={dim.label}
                      score={typeof score === "number" ? score : null}
                      weight={dim.weight}
                      delay={i * 80}
                    />
                  );
                })}

                {/* ATS issues */}
                {scoreData.ats?.issues?.length > 0 && (
                  <div style={{
                    paddingTop: 16, borderTop: `1px solid ${C.border}`,
                  }}>
                    <MonoLabel color={C.muted2} style={{ display: "block", marginBottom: 10 }}>
                      ATS Issues Found
                    </MonoLabel>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {scoreData.ats.issues.slice(0, 5).map((issue, i) => (
                        <div key={i} style={{
                          display: "flex", alignItems: "flex-start", gap: 8,
                          fontSize: 13, color: C.text,
                        }}>
                          <span style={{ color: C.red, flexShrink: 0, marginTop: 1 }}><Icons.X /></span>
                          <span style={{ lineHeight: 1.55 }}>
                            {typeof issue === "string" ? issue : issue.message || String(issue)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ════ Feedback tab ════ */}
            {activeTab === "feedback" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeUp .2s ease both" }}>
                {scoreData.feedback ? (
                  <>
                    {scoreData.feedback.summary && (
                      <div style={{
                        background: C.card, border: `1px solid ${C.border}`,
                        borderRadius: 12, padding: "16px 18px",
                      }}>
                        <MonoLabel color={C.muted2} style={{ display: "block", marginBottom: 8 }}>
                          AI Summary
                        </MonoLabel>
                        <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7, margin: 0 }}>
                          {scoreData.feedback.summary}
                        </p>
                      </div>
                    )}
                    <FeedbackSection feedback={scoreData.feedback} />
                  </>
                ) : (
                  <div style={{
                    background: C.card, border: `1px solid ${C.border}`,
                    borderRadius: 12, padding: "48px",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", gap: 10, textAlign: "center",
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: C.violetDim, border: `1px solid rgba(139,92,246,.2)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: C.violet,
                    }}><Icons.Sparkle /></div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>
                        No AI feedback available
                      </div>
                      <div style={{ fontSize: 12, color: C.muted }}>
                        Add a Gemini API key to unlock AI-powered feedback.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ════ Tips tab ════ */}
            {activeTab === "tips" && (
              <div style={{ animation: "fadeUp .2s ease both" }}>
                <div style={{
                  background: C.card, border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: "16px 18px",
                  marginBottom: 12,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <MonoLabel color={C.muted2}>Improvement Tips</MonoLabel>
                    <div style={{ flex: 1, height: 1, background: C.border }} />
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      {[
                        { label: "High",   color: C.red },
                        { label: "Medium", color: C.amber },
                        { label: "Low",    color: C.muted2 },
                      ].map(p => (
                        <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <div style={{ width: 5, height: 5, borderRadius: "50%", background: p.color }} />
                          <MonoLabel color={C.muted2} style={{ fontSize: 9 }}>{p.label}</MonoLabel>
                        </div>
                      ))}
                    </div>
                  </div>

                  {loadingTips ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "24px 0" }}>
                      <div style={{ color: C.violet }}><Icons.Spin /></div>
                    </div>
                  ) : tips.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {tips.map((tip, i) => <TipCard key={i} tip={tip} index={i} />)}
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "24px 0" }}>
                      <MonoLabel color={C.muted2}>No tips available</MonoLabel>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ════ Skills tab ════ */}
            {activeTab === "skills" && (
              <div style={{ animation: "fadeUp .2s ease both" }}>
                {jobDesc ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {/* Matched */}
                    {scoreData.skillMatch?.matchedSkills?.length > 0 && (
                      <div style={{
                        background: C.card, border: `1px solid ${C.border}`,
                        borderRadius: 12, padding: "16px 18px",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
                          <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.green }} />
                          <MonoLabel color={C.green}>
                            Matched Skills ({scoreData.skillMatch.matchedSkills.length})
                          </MonoLabel>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {scoreData.skillMatch.matchedSkills.map((s, i) => (
                            <SkillChip key={i} label={s} matched />
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Missing */}
                    {scoreData.skillMatch?.missingSkills?.length > 0 && (
                      <div style={{
                        background: C.card, border: `1px solid ${C.border}`,
                        borderRadius: 12, padding: "16px 18px",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
                          <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.red }} />
                          <MonoLabel color={C.red}>
                            Missing Skills ({scoreData.skillMatch.missingSkills.length})
                          </MonoLabel>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {scoreData.skillMatch.missingSkills.map((s, i) => (
                            <SkillChip key={i} label={s} matched={false} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{
                    background: C.card, border: `1px solid ${C.border}`,
                    borderRadius: 12, padding: "48px",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", gap: 12, textAlign: "center",
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: C.surface, border: `1px solid ${C.border2}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: C.muted2, fontSize: 18,
                    }}>◎</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>
                        No job description provided
                      </div>
                      <div style={{ fontSize: 12, color: C.muted }}>
                        Paste a JD above and re-analyze to see skill match
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("breakdown")}
                      style={{
                        background: "transparent", border: `1px solid ${C.border2}`,
                        borderRadius: 8, padding: "8px 16px",
                        color: C.muted, fontSize: 12, cursor: "pointer",
                        fontFamily: "inherit", transition: "all .15s",
                        display: "flex", alignItems: "center", gap: 5,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = C.border3; e.currentTarget.style.color = C.text; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border2; e.currentTarget.style.color = C.muted; }}
                    >
                      Add job description <Icons.Arrow />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Empty — no score yet ── */}
        {!scoreData && !fetchingScore && !resumesLoading && resumes.length > 0 && (
          <div style={{
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: "52px 24px",
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 20, textAlign: "center",
            animation: "fadeUp .3s ease .1s both",
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: C.violetDim, border: `1px solid rgba(139,92,246,.2)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: C.violet, fontSize: 20,
            }}><Icons.Sparkle /></div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6, letterSpacing: "-0.03em" }}>
                Ready to analyze
              </div>
              <p style={{ fontSize: 13, color: C.muted, maxWidth: 320, lineHeight: 1.6, margin: 0 }}>
                Select your resume above, optionally paste a job description, then click Analyze.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, width: "100%", maxWidth: 340 }}>
              {[
                { label: "ATS Score",      icon: "◈" },
                { label: "Impact Analysis", icon: "◉" },
                { label: "AI Feedback",    icon: "⬡" },
              ].map(f => (
                <div key={f.label} style={{
                  padding: "12px 8px",
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 9, textAlign: "center",
                }}>
                  <div style={{ fontSize: 16, color: C.violet, marginBottom: 5 }}>{f.icon}</div>
                  <MonoLabel color={C.muted2} style={{ fontSize: 9 }}>{f.label}</MonoLabel>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── No resumes ── */}
        {!resumesLoading && resumes.length === 0 && (
          <div style={{
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: "48px",
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 14, textAlign: "center",
            animation: "fadeUp .3s ease both",
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: C.surface, border: `1px solid ${C.border2}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: C.muted2,
            }}><Icons.Resume /></div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>
                No parsed resumes
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>
                Upload and parse a resume first to get started
              </div>
            </div>
            <Link to="/resume" style={{ textDecoration: "none" }}>
              <button style={{
                background: C.violet, border: "none",
                borderRadius: 9, padding: "10px 20px",
                color: "#fff", fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                Upload Resume <Icons.Arrow />
              </button>
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}