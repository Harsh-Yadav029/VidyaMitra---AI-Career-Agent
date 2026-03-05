import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import api from "../services/api";

// ── SVG icons ─────────────────────────────────────────────────
const FileIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const StarIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const MicIcon     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/></svg>;
const BriefIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>;
const ArrowIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const CheckIcon   = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const TrendIcon   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const SparkIcon   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;

// ── Animated counter ──────────────────────────────────────────
const AnimatedNumber = ({ value, suffix = "" }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!value) return;
    let start = 0;
    const end = parseInt(value);
    const step = Math.ceil(end / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(start);
    }, 20);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}{suffix}</>;
};

// ── Score ring ────────────────────────────────────────────────
const ScoreRing = ({ score, size = 88, strokeWidth = 5 }) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setProgress(score || 0), 300);
    return () => clearTimeout(t);
  }, [score]);

  const offset = circ - (progress / 100) * circ;
  const color = score >= 80 ? "#8b5cf6" : score >= 60 ? "#3b82f6" : score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1a1a1a" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Geist', sans-serif",
        fontWeight: 700, fontSize: size * 0.24,
        color: "#eeeeee", letterSpacing: "-0.04em",
      }}>
        {score ?? "—"}
      </div>
    </div>
  );
};

// ── Stat card ─────────────────────────────────────────────────
const StatCard = ({ icon, label, value, suffix, sub, subColor = "#555555", delay = 0 }) => (
  <div className="vm-card" style={{
    padding: "18px 20px",
    animation: `fadeUp 0.35s ease both`,
    animationDelay: `${delay}ms`,
  }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
      <div style={{
        width: "30px", height: "30px", borderRadius: "7px",
        background: "#161616", border: "1px solid #222222",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#444444",
      }}>{icon}</div>
      <span style={{
        fontSize: "10px", fontWeight: 600,
        fontFamily: "'Geist Mono', monospace",
        color: "#333333", textTransform: "uppercase", letterSpacing: "0.08em",
      }}>{label}</span>
    </div>
    <div style={{
      fontFamily: "'Geist', sans-serif",
      fontSize: "28px", fontWeight: 700,
      color: "#eeeeee", letterSpacing: "-0.05em", lineHeight: 1,
      marginBottom: "6px",
    }}>
      {value !== null && value !== undefined
        ? <AnimatedNumber value={value} suffix={suffix} />
        : <span style={{ color: "#222222" }}>—</span>}
    </div>
    {sub && <p style={{ fontSize: "11px", color: subColor, fontFamily: "'Geist', sans-serif", marginTop: "4px" }}>{sub}</p>}
  </div>
);

// ── Score bar ─────────────────────────────────────────────────
const ScoreBar = ({ label, score, delay = 0 }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(score || 0), 500 + delay);
    return () => clearTimeout(t);
  }, [score, delay]);

  const color = score >= 80 ? "#8b5cf6" : score >= 60 ? "#3b82f6" : score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
        <span style={{ fontSize: "12px", color: "#666666", fontFamily: "'Geist', sans-serif" }}>{label}</span>
        <span style={{ fontSize: "11px", fontFamily: "'Geist Mono', monospace", color: "#888888" }}>{score ?? "—"}</span>
      </div>
      <div style={{ height: "3px", background: "#1a1a1a", borderRadius: "99px", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${width}%`,
          background: color, borderRadius: "99px",
          transition: `width 1s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
        }} />
      </div>
    </div>
  );
};

// ── Quick action card ─────────────────────────────────────────
const QuickAction = ({ to, icon, title, desc, meta, delay = 0 }) => (
  <Link to={to} style={{ textDecoration: "none" }}>
    <div className="vm-card-interactive" style={{
      padding: "16px",
      display: "flex", flexDirection: "column", gap: "12px",
      animation: `fadeUp 0.35s ease both`,
      animationDelay: `${delay}ms`,
    }}>
      <div style={{
        width: "32px", height: "32px", borderRadius: "8px",
        background: "#161616", border: "1px solid #1e1e1e",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#555555", transition: "all 0.15s",
      }}>{icon}</div>
      <div>
        <p style={{ fontSize: "13px", fontWeight: 500, color: "#cccccc", letterSpacing: "-0.01em", marginBottom: "3px" }}>{title}</p>
        <p style={{ fontSize: "11px", color: "#444444", lineHeight: 1.4 }}>{desc}</p>
        {meta && <p style={{ fontSize: "10px", color: "#8b5cf6", fontFamily: "'Geist Mono', monospace", marginTop: "5px" }}>{meta}</p>}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
        <span style={{ color: "#333333", transition: "color 0.12s" }}><ArrowIcon /></span>
      </div>
    </div>
  </Link>
);

// ── Main Dashboard ────────────────────────────────────────────
const DashboardPage = () => {
  const { user } = useAuth();
  const [resumes, setResumes]         = useState([]);
  const [latestScore, setLatestScore] = useState(null);
  const [sessions, setSessions]       = useState([]);
  const [loading, setLoading]         = useState(true);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [resumeRes, sessionRes] = await Promise.allSettled([
          api.get("/resumes"),
          api.get("/interview/sessions"),
        ]);

        if (resumeRes.status === "fulfilled") {
          const r = resumeRes.value.data.resumes || [];
          setResumes(r);
          const parsed = r.find(res => res.isParsed);
          if (parsed) {
            try {
              const scoreRes = await api.get(`/scores/${parsed._id}`);
              const raw = scoreRes.data?.scores || scoreRes.data?.score || scoreRes.data?.data || scoreRes.data;
              if (raw?.overall !== undefined) {
                const norm = { ...raw };
                ["ats","impact","completeness","readability","skillMatch"].forEach(k => {
                  if (typeof norm[k] !== "object") norm[k] = { score: norm[k] };
                });
                setLatestScore(norm);
              }
            } catch { /* no score */ }
          }
        }
        if (sessionRes.status === "fulfilled") {
          setSessions(sessionRes.value.data.sessions || []);
        }
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const parsedResume      = resumes.find(r => r.isParsed);
  const completedSessions = sessions.filter(s => s.status === "completed");
  const avgScore          = completedSessions.length
    ? Math.round(completedSessions.reduce((s, i) => s + (i.overallScore || 0), 0) / completedSessions.length)
    : null;
  const hasResume = resumes.length > 0;
  const hasScore  = !!latestScore;

  return (
    <DashboardLayout>
      <div style={{ padding: "32px 28px", maxWidth: "1100px" }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <div style={{ marginBottom: "28px", animation: "fadeUp 0.3s ease both" }}>
          {/* Live indicator */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <p style={{
                fontSize: "11px", fontFamily: "'Geist Mono', monospace",
                color: "#444444", marginBottom: "6px",
              }}>
                {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
              </p>
              <h1 style={{
                fontFamily: "'Geist', sans-serif",
                fontSize: "26px", fontWeight: 700,
                color: "#eeeeee", letterSpacing: "-0.04em",
                lineHeight: 1.15, margin: 0,
              }}>
                {getGreeting()}, {user?.name?.split(" ")[0]}
              </h1>
              <p style={{ fontSize: "13px", color: "#555555", marginTop: "5px", fontFamily: "'Geist', sans-serif" }}>
                {hasResume ? "Your career dashboard is up to date." : "Upload your resume to get started."}
              </p>
            </div>

            {/* Status chip */}
            <div style={{
              display: "flex", alignItems: "center", gap: "7px",
              padding: "6px 12px",
              background: "#111111", border: "1px solid #1a1a1a", borderRadius: "7px",
            }}>
              <span style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: "#22c55e", display: "block",
                animation: "pulse 2.5s ease-in-out infinite",
              }} />
              <span style={{ fontSize: "11px", color: "#555555", fontFamily: "'Geist Mono', monospace" }}>All systems normal</span>
            </div>
          </div>
        </div>

        {/* ── Stat cards ─────────────────────────────────────── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: "10px", marginBottom: "20px",
        }}>
          <StatCard icon={<FileIcon />}  label="Resumes"     value={resumes.length || null}
            sub={parsedResume ? "Parsed & ready" : "None uploaded yet"}
            subColor={parsedResume ? "#22c55e" : "#555555"} delay={0} />
          <StatCard icon={<StarIcon />}  label="AI Score"    value={latestScore?.overall} suffix="/100"
            sub={hasScore ? `Grade: ${latestScore?.label || "—"}` : "Not scored yet"}
            subColor={hasScore ? "#8b5cf6" : "#555555"} delay={60} />
          <StatCard icon={<MicIcon />}   label="Interviews"  value={completedSessions.length || null}
            sub={avgScore ? `Avg score ${avgScore}` : "No sessions yet"}
            subColor={avgScore ? "#3b82f6" : "#555555"} delay={120} />
          <StatCard icon={<BriefIcon />} label="Target Role" value={null}
            sub={user?.targetRole || "Not set"} subColor="#555555" delay={180} />
        </div>

        {/* ── Main grid ──────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "12px", marginBottom: "20px" }}>

          {/* Score card */}
          <div className="vm-card" style={{ padding: 0, animation: "fadeUp 0.35s ease both", animationDelay: "100ms" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "18px 20px 0" }}>
              <div>
                <h2 style={{ fontSize: "14px", fontWeight: 600, color: "#eeeeee", letterSpacing: "-0.02em", margin: 0 }}>Resume Score</h2>
                <p style={{ fontSize: "11px", color: "#444444", marginTop: "2px" }}>AI-powered breakdown</p>
              </div>
              {hasScore && (
                <Link to="/score" style={{
                  display: "flex", alignItems: "center", gap: "4px",
                  fontSize: "12px", color: "#8b5cf6", textDecoration: "none",
                  transition: "color 0.12s",
                }}>
                  View full report <ArrowIcon />
                </Link>
              )}
            </div>

            <div style={{ padding: "16px 20px 20px" }}>
              {hasScore ? (
                <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                    <ScoreRing score={latestScore.overall} size={96} strokeWidth={6} />
                    <span style={{ fontSize: "10px", fontFamily: "'Geist Mono', monospace", color: "#444444", textTransform: "uppercase", letterSpacing: "0.08em" }}>Overall</span>
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "13px" }}>
                    <ScoreBar label="ATS Compatibility"    score={latestScore.ats?.score}          delay={0} />
                    <ScoreBar label="Impact & Achievements" score={latestScore.impact?.score}       delay={80} />
                    <ScoreBar label="Completeness"          score={latestScore.completeness?.score} delay={160} />
                    <ScoreBar label="Readability"           score={latestScore.readability?.score}  delay={240} />
                    <ScoreBar label="Skill Match"           score={latestScore.skillMatch?.score}   delay={320} />
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 0", gap: "12px" }}>
                  <div style={{
                    width: "38px", height: "38px", borderRadius: "10px",
                    background: "#161616", border: "1px solid #1e1e1e",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "#333333",
                  }}><StarIcon /></div>
                  <p style={{ fontSize: "13px", color: "#444444", textAlign: "center" }}>
                    {hasResume ? "Score your resume to see breakdown." : "Upload a resume first."}
                  </p>
                  <Link to={hasResume ? "/score" : "/resume"}>
                    <button className="vm-btn-ghost" style={{ width: "auto" }}>
                      {hasResume ? "Score now" : "Upload resume"}
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Interview card */}
          <div className="vm-card" style={{ padding: 0, display: "flex", flexDirection: "column", animation: "fadeUp 0.35s ease both", animationDelay: "140ms" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "18px 20px 0" }}>
              <div>
                <h2 style={{ fontSize: "14px", fontWeight: 600, color: "#eeeeee", letterSpacing: "-0.02em", margin: 0 }}>Interviews</h2>
                <p style={{ fontSize: "11px", color: "#444444", marginTop: "2px" }}>Practice sessions</p>
              </div>
              <Link to="/interview" style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#8b5cf6", textDecoration: "none" }}>
                Practice <ArrowIcon />
              </Link>
            </div>

            {completedSessions.length > 0 ? (
              <>
                <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
                  <ScoreRing score={avgScore} size={72} strokeWidth={5} />
                  <div>
                    <div style={{ fontFamily: "'Geist', sans-serif", fontSize: "24px", fontWeight: 700, color: "#eeeeee", letterSpacing: "-0.05em", lineHeight: 1 }}>
                      {avgScore}<span style={{ fontSize: "13px", fontWeight: 400, color: "#555555" }}>/100</span>
                    </div>
                    <div style={{ fontSize: "11px", color: "#444444", marginTop: "3px", fontFamily: "'Geist Mono', monospace" }}>
                      avg · {completedSessions.length} session{completedSessions.length !== 1 ? "s" : ""}
                    </div>
                    {avgScore >= 70 && (
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "6px", color: "#22c55e", fontSize: "11px" }}>
                        <TrendIcon /><span>Above average</span>
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ borderTop: "1px solid #1a1a1a", padding: "12px 20px 16px", display: "flex", flexDirection: "column", gap: "9px" }}>
                  {completedSessions.slice(0, 3).map((s, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: "#666666", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "150px" }}>{s.targetRole}</span>
                      <span style={{ fontSize: "11px", fontFamily: "'Geist Mono', monospace", color: s.overallScore >= 70 ? "#22c55e" : "#f59e0b" }}>
                        {s.overallScore}/100
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 20px", gap: "10px" }}>
                <div style={{
                  width: "38px", height: "38px", borderRadius: "10px",
                  background: "#161616", border: "1px solid #1e1e1e",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#333333",
                }}><MicIcon /></div>
                <p style={{ fontSize: "12px", color: "#444444", textAlign: "center", lineHeight: 1.5 }}>
                  No sessions yet.<br />Start a mock interview.
                </p>
                <Link to="/interview">
                  <button className="vm-btn-ghost" style={{ width: "auto", fontSize: "12px" }}>Start now</button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Quick actions ───────────────────────────────────── */}
        <div style={{ marginBottom: "20px" }}>
          <p style={{ fontSize: "10px", fontWeight: 600, fontFamily: "'Geist Mono', monospace", color: "#333333", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>
            Quick actions
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
            <QuickAction to="/resume"    icon={<FileIcon />}  title="Upload Resume"  desc="Parse your CV with AI"       meta={hasResume ? `${resumes.length} uploaded` : null}              delay={0} />
            <QuickAction to="/score"     icon={<StarIcon />}  title="Score Resume"   desc="ATS, impact & readability"   meta={hasScore ? `Last: ${latestScore.overall}/100` : null}         delay={60} />
            <QuickAction to="/interview" icon={<MicIcon />}   title="Mock Interview" desc="Role-specific questions"     meta={sessions.length ? `${sessions.length} sessions` : null}       delay={120} />
            <QuickAction to="/jobs"      icon={<BriefIcon />} title="Job Matches"    desc="Roles matching your skills"  meta={null}                                                          delay={180} />
          </div>
        </div>

        {/* ── AI Suggestions ──────────────────────────────────── */}
        {hasScore && (
          <div style={{
            background: "linear-gradient(135deg, #0f0b1a 0%, #111111 100%)",
            border: "1px solid rgba(139,92,246,0.2)",
            borderRadius: "10px",
            padding: "20px",
            marginBottom: "20px",
            position: "relative", overflow: "hidden",
            animation: "fadeUp 0.35s ease both", animationDelay: "200ms",
          }}>
            {/* Subtle glow in corner */}
            <div style={{
              position: "absolute", top: "-40px", right: "-40px",
              width: "120px", height: "120px",
              background: "radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)",
              pointerEvents: "none",
            }} />

            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "5px",
                padding: "2px 9px 2px 5px",
                background: "rgba(139,92,246,0.12)",
                border: "1px solid rgba(139,92,246,0.2)",
                borderRadius: "99px",
                fontSize: "10px", fontWeight: 600, color: "#c4b5fd",
                fontFamily: "'Geist Mono', monospace",
              }}>
                <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: "#8b5cf6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <SparkIcon />
                </div>
                AI Suggestions
              </div>
            </div>

            <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#eeeeee", letterSpacing: "-0.02em", marginBottom: "4px" }}>
              3 ways to push your score to 90+
            </h3>
            <p style={{ fontSize: "12px", color: "#555555", marginBottom: "14px" }}>
              Based on your latest resume analysis.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
              {[
                { title: "Quantify your impact", desc: "Your impact score is 42. Add metrics to every bullet — e.g. 'reduced load time by 40%'." },
                { title: "Expand skills section", desc: "Skill match is 60. Add TypeScript, Docker, and AWS to match Software Engineer JDs." },
                { title: "Complete your profile", desc: "Completeness at 71. Add a summary section and link your GitHub." },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: "10px",
                  padding: "10px 12px",
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "8px",
                }}>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#8b5cf6", flexShrink: 0, marginTop: "7px" }} />
                  <div>
                    <span style={{ fontSize: "12px", fontWeight: 500, color: "#cccccc" }}>{item.title}</span>
                    <span style={{ fontSize: "12px", color: "#555555" }}> — {item.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <Link to="/builder">
              <button className="vm-btn-primary" style={{ width: "auto", fontSize: "12px", padding: "7px 16px" }}>
                Open Resume Builder →
              </button>
            </Link>
          </div>
        )}

        {/* ── Resumes ─────────────────────────────────────────── */}
        {resumes.length > 0 && (
          <div style={{ animation: "fadeUp 0.35s ease both", animationDelay: "240ms" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <p style={{ fontSize: "10px", fontWeight: 600, fontFamily: "'Geist Mono', monospace", color: "#333333", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Your resumes
              </p>
              <Link to="/resume" style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#555555", textDecoration: "none", transition: "color 0.12s" }}>
                Manage all <ArrowIcon />
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
              {resumes.slice(0, 3).map(r => (
                <div key={r._id} className="vm-card" style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "30px", height: "30px", borderRadius: "7px",
                    background: "#161616", border: "1px solid #1e1e1e",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#444444", flexShrink: 0,
                  }}><FileIcon /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "12px", fontWeight: 500, color: "#cccccc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.label || r.originalName}
                    </p>
                    <span style={{ fontSize: "10px", fontFamily: "'Geist Mono', monospace", color: r.isParsed ? "#22c55e" : "#f59e0b" }}>
                      {r.isParsed ? "Parsed" : "Processing"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Onboarding (new users) ───────────────────────────── */}
        {!hasResume && (
          <div className="vm-card" style={{ padding: "18px", animation: "fadeUp 0.35s ease both", animationDelay: "240ms" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#eeeeee", letterSpacing: "-0.02em", marginBottom: "14px" }}>
              Get started
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {[
                { n: 1, title: "Upload your resume",  desc: "PDF or DOCX",          done: hasResume,                    to: "/resume" },
                { n: 2, title: "Get your AI score",   desc: "ATS + impact analysis", done: hasScore,                    to: "/score" },
                { n: 3, title: "Practice interviews", desc: "Role-specific Q&A",     done: completedSessions.length > 0, to: "/interview" },
                { n: 4, title: "Find matching jobs",  desc: "Based on your skills",  done: false,                       to: "/jobs" },
              ].map(item => (
                <Link key={item.n} to={item.to} style={{ textDecoration: "none" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "9px 10px", borderRadius: "7px",
                    cursor: "pointer", transition: "background 0.12s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "#161616"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{
                      width: "24px", height: "24px", borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                      background: item.done ? "rgba(139,92,246,0.12)" : "transparent",
                      border: `1px solid ${item.done ? "rgba(139,92,246,0.25)" : "#222222"}`,
                      color: item.done ? "#a78bfa" : "#444444",
                    }}>
                      {item.done
                        ? <CheckIcon />
                        : <span style={{ fontSize: "10px", fontFamily: "'Geist Mono', monospace" }}>{item.n}</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "13px", fontWeight: 500, color: item.done ? "#444444" : "#cccccc", textDecoration: item.done ? "line-through" : "none", letterSpacing: "-0.01em" }}>
                        {item.title}
                      </p>
                      <p style={{ fontSize: "11px", color: "#333333" }}>{item.desc}</p>
                    </div>
                    <span style={{ color: "#2a2a2a" }}><ArrowIcon /></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;