import React, { useState, useEffect, useRef, useCallback } from "react";
import DashboardLayout from "../components/DashboardLayout";
import api from "../services/api";

// ─── Icons ────────────────────────────────────────────────────
const Svg = ({ size = 16, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const IconMic    = () => <Svg><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></Svg>;
const IconSend   = () => <Svg size={14}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></Svg>;
const IconStar   = () => <Svg size={14}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></Svg>;
const IconBack   = () => <Svg size={14}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></Svg>;
const IconCheck  = ({ size = 12 }) => <Svg size={size} strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></Svg>;
const IconClock  = () => <Svg size={12}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Svg>;
const IconChev   = ({ up }) => <Svg size={12}><polyline points={up ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}/></Svg>;
const IconSpin   = () => <Svg size={14}><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.15"/><path d="M21 12a9 9 0 00-9-9"/></Svg>;
const IconArrow  = () => <Svg size={12}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></Svg>;
const IconZap    = () => <Svg size={12}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></Svg>;

// ─── Helpers ──────────────────────────────────────────────────
const sColor = s =>
  s == null ? "#3a3a3a" :
  s >= 80 ? "#8b5cf6" : s >= 60 ? "#3b82f6" : s >= 40 ? "#f59e0b" : "#ef4444";

const sBg = s =>
  s == null ? "rgba(58,58,58,.12)" :
  s >= 80 ? "rgba(139,92,246,.1)" : s >= 60 ? "rgba(59,130,246,.1)" :
  s >= 40 ? "rgba(245,158,11,.1)" : "rgba(239,68,68,.1)";

const sBorder = s =>
  s == null ? "rgba(58,58,58,.2)" :
  s >= 80 ? "rgba(139,92,246,.22)" : s >= 60 ? "rgba(59,130,246,.22)" :
  s >= 40 ? "rgba(245,158,11,.22)" : "rgba(239,68,68,.22)";

const sLabel = s =>
  s == null ? "—" :
  s >= 80 ? "Excellent" : s >= 60 ? "Good" : s >= 40 ? "Needs work" : "Poor";

const fmtDate = d => {
  if (!d) return "";
  const diff = (Date.now() - new Date(d)) / 1000;
  if (diff < 3600)  return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short" });
};

// ── FIX: normalise a question object so the rest of the UI always reads
// `q.question` and `q.type` regardless of what field name the backend used.
const normaliseQ = (q) => ({
  ...q,
  question: q.question || q.questionText || q.text || "",
  type:     q.type     || q.category     || "general",
  hint:     q.hint     || "",
});

// ─── Score Ring ───────────────────────────────────────────────
const Ring = ({ score, size = 80, sw = 5 }) => {
  const r = (size - sw) / 2, circ = 2 * Math.PI * r;
  const [p, setP] = useState(0);
  useEffect(() => { const t = setTimeout(() => setP(score ?? 0), 350); return () => clearTimeout(t); }, [score]);
  const c = sColor(score);
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1c1c1c" strokeWidth={sw}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={circ - (p/100)*circ} strokeLinecap="round"
          style={{ transition:"stroke-dashoffset 1.3s cubic-bezier(.4,0,.2,1)", filter:`drop-shadow(0 0 6px ${c}55)` }}/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:size*.27, fontWeight:800, color:"#eee", fontFamily:"'Geist'", letterSpacing:"-0.05em", lineHeight:1 }}>
          {score ?? "—"}
        </span>
        <span style={{ fontSize:size*.11, color:"#3a3a3a", fontFamily:"'Geist Mono'", marginTop:1 }}>/100</span>
      </div>
    </div>
  );
};

// ─── Animated progress bar ────────────────────────────────────
const Bar = ({ pct, color, height = 2, delay = 0 }) => {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), 200 + delay); return () => clearTimeout(t); }, [pct, delay]);
  return (
    <div style={{ height, background:"#1a1a1a", borderRadius:99, overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${w}%`, background: color || "#8b5cf6", borderRadius:99, transition:`width 1s cubic-bezier(.4,0,.2,1) ${delay}ms` }}/>
    </div>
  );
};

// ─── Timer ────────────────────────────────────────────────────
const Timer = ({ active }) => {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setS(x => x+1), 1000);
    return () => clearInterval(t);
  }, [active]);
  const m = String(Math.floor(s/60)).padStart(2,"0");
  const sec = String(s%60).padStart(2,"0");
  return (
    <div style={{ display:"flex", alignItems:"center", gap:5, fontFamily:"'Geist Mono'", fontSize:11, color: s > 180 ? "#f59e0b" : "#3a3a3a" }}>
      <IconClock/>{m}:{sec}
    </div>
  );
};

// ─── Pill selector ────────────────────────────────────────────
const Pills = ({ options, value, onChange }) => (
  <div style={{ display:"flex", gap:4, padding:3, background:"#0c0c0c", border:"1px solid #1a1a1a", borderRadius:8 }}>
    {options.map(o => (
      <button key={o.v} onClick={() => onChange(o.v)} style={{
        flex:1, padding:"6px 0", borderRadius:6, border:"none",
        background: value===o.v ? "#1e1e1e" : "transparent",
        color: value===o.v ? "#eee" : "#3a3a3a",
        fontSize:11, fontWeight: value===o.v ? 600 : 400,
        fontFamily:"'Geist'", cursor:"pointer",
        boxShadow: value===o.v ? "0 1px 4px rgba(0,0,0,.4)" : "none",
        transition:"all .14s",
      }}>{o.l}</button>
    ))}
  </div>
);

const MonoLabel = ({ children, style }) => (
  <p style={{ fontSize:9, fontWeight:600, fontFamily:"'Geist Mono'", color:"#2e2e2e", textTransform:"uppercase", letterSpacing:".1em", ...style }}>
    {children}
  </p>
);

const Input = ({ value, onChange, placeholder, style }) => (
  <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    style={{
      width:"100%", background:"#0c0c0c", border:"1px solid #1e1e1e", borderRadius:8,
      padding:"10px 13px", color:"#eee", fontFamily:"'Geist'", fontSize:13,
      outline:"none", transition:"border-color .14s, box-shadow .14s", ...style,
    }}
    onFocus={e => { e.target.style.borderColor="rgba(139,92,246,.45)"; e.target.style.boxShadow="0 0 0 3px rgba(139,92,246,.07)"; }}
    onBlur={e  => { e.target.style.borderColor="#1e1e1e"; e.target.style.boxShadow="none"; }}
  />
);

const PrimaryBtn = ({ onClick, disabled, loading, children, style }) => (
  <button onClick={onClick} disabled={disabled || loading}
    style={{
      display:"flex", alignItems:"center", justifyContent:"center", gap:8,
      padding:"10px 22px", borderRadius:9,
      background: disabled || loading ? "rgba(139,92,246,.2)" : "#8b5cf6",
      border:"none",
      color: disabled || loading ? "#c4b5fd" : "#fff",
      fontSize:13, fontWeight:600, fontFamily:"'Geist'",
      cursor: disabled || loading ? "not-allowed" : "pointer",
      letterSpacing:"-0.01em", transition:"all .15s", ...style,
    }}
    onMouseEnter={e => { if (!disabled && !loading) { e.currentTarget.style.background="#7c3aed"; e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 6px 20px rgba(139,92,246,.35)"; }}}
    onMouseLeave={e => { if (!disabled && !loading) { e.currentTarget.style.background="#8b5cf6"; e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}}
  >
    {loading ? <><span style={{ animation:"spin .8s linear infinite", display:"flex" }}><IconSpin/></span>{children}</> : children}
  </button>
);

// ════════════════════════════════════════════════════════════════
//  VIEW 1 — SETUP
// ════════════════════════════════════════════════════════════════
const SetupView = ({ onStart, starting, sessions }) => {
  const [role,    setRole]    = useState("Software Engineer");
  const [diff,    setDiff]    = useState("medium");
  const [focus,   setFocus]   = useState("mixed");
  const [count,   setCount]   = useState(5);
  const [openTip, setOpenTip] = useState(null);

  const TIPS = [
    { n:"01", title:"STAR method",            body:"Structure every answer — Situation, Task, Action, Result. Crisp and concrete." },
    { n:"02", title:"Pause before answering", body:"Silence is confidence. 'Let me think' is fine. Rushing leads to rambling." },
    { n:"03", title:"Quantify achievements",  body:"'Reduced API latency by 40%' beats 'improved performance'. Numbers stick." },
    { n:"04", title:"End with a check-in",    body:"'Does that answer what you were looking for?' shows clarity and self-awareness." },
    { n:"05", title:"Reference the company",  body:"Mention a specific product or news item. Signals genuine interest." },
  ];

  const avgScore = sessions.length
    ? Math.round(sessions.reduce((a, s) => a + (s.overallScore || 0), 0) / sessions.length)
    : null;

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 272px", gap:14 }}>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        <div className="vm-card" style={{ padding:"26px 26px 22px" }}>
          <h2 style={{ fontSize:16, fontWeight:700, color:"#eee", letterSpacing:"-0.03em", margin:"0 0 3px" }}>
            Configure session
          </h2>
          <p style={{ fontSize:12, color:"#444", marginBottom:24 }}>
            AI generates tailored questions based on your settings.
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <div>
              <MonoLabel style={{ marginBottom:6 }}>Target role</MonoLabel>
              <Input value={role} onChange={setRole} placeholder="Software Engineer, Product Manager, Data Analyst…" />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div>
                <MonoLabel style={{ marginBottom:6 }}>Difficulty</MonoLabel>
                <Pills value={diff} onChange={setDiff}
                  options={[{v:"easy",l:"Easy"},{v:"medium",l:"Medium"},{v:"hard",l:"Hard"}]}/>
              </div>
              <div>
                <MonoLabel style={{ marginBottom:6 }}>Focus</MonoLabel>
                <Pills value={focus} onChange={setFocus}
                  options={[{v:"mixed",l:"Mixed"},{v:"behavioural",l:"Behav."},{v:"technical",l:"Tech."}]}/>
              </div>
            </div>
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:10 }}>
                <MonoLabel>Questions</MonoLabel>
                <span style={{ fontSize:28, fontWeight:800, color:"#8b5cf6", fontFamily:"'Geist'", letterSpacing:"-0.06em", lineHeight:1 }}>{count}</span>
              </div>
              <input type="range" min={3} max={10} value={count} onChange={e => setCount(+e.target.value)}
                style={{ width:"100%", accentColor:"#8b5cf6", cursor:"pointer", height:2 }}/>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
                {[3,4,5,6,7,8,9,10].map(n => (
                  <span key={n} onClick={() => setCount(n)} style={{
                    fontSize:9, fontFamily:"'Geist Mono'", cursor:"pointer",
                    color: count===n ? "#8b5cf6" : "#2a2a2a",
                    fontWeight: count===n ? 700 : 400, transition:"color .12s",
                  }}>{n}</span>
                ))}
              </div>
            </div>
            <PrimaryBtn onClick={() => onStart({ role, difficulty:diff, focus, count })}
              disabled={!role.trim()} loading={starting}>
              {starting ? "Generating questions…" : <><IconMic/> Start interview</>}
            </PrimaryBtn>
          </div>
        </div>

        {sessions.length > 0 && (
          <div>
            <MonoLabel style={{ marginBottom:10 }}>Past sessions</MonoLabel>
            <div className="vm-card" style={{ overflow:"hidden" }}>
              <div style={{ display:"flex", gap:0, borderBottom:"1px solid #161616" }}>
                {[
                  { label:"Sessions",  value: sessions.length,                                                    color:"#eee" },
                  { label:"Avg score", value: avgScore ?? "—",                                                    color: sColor(avgScore) },
                  { label:"Best",      value: Math.max(...sessions.map(s=>s.overallScore||0)) || "—",             color:"#22c55e" },
                ].map((s, i) => (
                  <div key={i} style={{ flex:1, padding:"14px 18px", borderRight: i<2 ? "1px solid #161616" : "none" }}>
                    <div style={{ fontSize:22, fontWeight:800, color:s.color, fontFamily:"'Geist'", letterSpacing:"-0.05em", lineHeight:1, marginBottom:4 }}>{s.value}</div>
                    <MonoLabel>{s.label}</MonoLabel>
                  </div>
                ))}
              </div>
              {sessions.slice(0, 5).map((s, i) => (
                <div key={s._id||i} style={{
                  display:"flex", alignItems:"center", gap:14, padding:"12px 18px",
                  borderBottom: i < Math.min(sessions.length,5)-1 ? "1px solid #0f0f0f" : "none",
                  transition:"background .1s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background="#0f0f0f"}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}
                >
                  <div style={{
                    width:38, height:38, borderRadius:9, flexShrink:0,
                    background: sBg(s.overallScore), border:`1px solid ${sBorder(s.overallScore)}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:13, fontWeight:800, color: sColor(s.overallScore), fontFamily:"'Geist'", letterSpacing:"-0.04em",
                  }}>{s.overallScore ?? "—"}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:500, color:"#ccc", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{s.targetRole}</p>
                    <p style={{ fontSize:10, color:"#383838", fontFamily:"'Geist Mono'", marginTop:2 }}>
                      {s.difficulty} · {s.focus} · {s.answers?.length ?? s.answeredCount ?? s.totalQuestions ?? "?"} questions
                    </p>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:5, flexShrink:0 }}>
                    <span style={{ fontSize:10, fontFamily:"'Geist Mono'", color:"#2e2e2e" }}>{fmtDate(s.completedAt||s.createdAt)}</span>
                    <div style={{ width:60 }}><Bar pct={s.overallScore||0} color={sColor(s.overallScore)} height={2}/></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        <div className="vm-card" style={{ padding:"16px 18px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
            <div style={{ width:18, height:18, borderRadius:"50%", background:"#8b5cf6", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
              <IconZap/>
            </div>
            <MonoLabel>Interview tips</MonoLabel>
          </div>
          {TIPS.map((tip, i) => (
            <div key={i} style={{ borderBottom: i<TIPS.length-1 ? "1px solid #111" : "none" }}>
              <div onClick={() => setOpenTip(openTip===i ? null : i)} style={{
                display:"flex", alignItems:"center", gap:10, padding:"9px 6px",
                cursor:"pointer", borderRadius:6, transition:"background .12s",
              }}
                onMouseEnter={e => e.currentTarget.style.background="#111"}
                onMouseLeave={e => e.currentTarget.style.background="transparent"}
              >
                <span style={{ fontSize:9, fontFamily:"'Geist Mono'", fontWeight:700, color:"#8b5cf6", width:14, flexShrink:0 }}>{tip.n}</span>
                <span style={{ fontSize:12, fontWeight:500, color:"#aaa", flex:1 }}>{tip.title}</span>
                <span style={{ color:"#2e2e2e" }}><IconChev up={openTip===i}/></span>
              </div>
              {openTip===i && (
                <div style={{ padding:"0 6px 11px 24px", animation:"fadeUp .15s ease both" }}>
                  <p style={{ fontSize:11, color:"#4a4a4a", lineHeight:1.7 }}>{tip.body}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="vm-card" style={{ padding:"14px 18px" }}>
          <MonoLabel style={{ marginBottom:12 }}>Score guide</MonoLabel>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {[
              { r:"80–100", l:"Excellent",  c:"#8b5cf6" },
              { r:"60–79",  l:"Good",       c:"#3b82f6" },
              { r:"40–59",  l:"Needs work", c:"#f59e0b" },
              { r:"0–39",   l:"Poor",       c:"#ef4444" },
            ].map(x => (
              <div key={x.r} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:x.c, flexShrink:0 }}/>
                <span style={{ fontSize:12, color:"#555", flex:1 }}>{x.l}</span>
                <span style={{ fontSize:10, fontFamily:"'Geist Mono'", color:"#2e2e2e" }}>{x.r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
//  VIEW 2 — ACTIVE SESSION
// ════════════════════════════════════════════════════════════════
const SessionView = ({ session, onFinish, onAbort, submitting }) => {
  const [qIdx,      setQIdx]      = useState(0);
  const [answers,   setAnswers]   = useState({});
  const [submitted, setSubmitted] = useState({});
  const [feedback,  setFeedback]  = useState({});
  const [evaling,   setEvaling]   = useState(false);
  const textRef = useRef();

  // FIX: normalise every question so q.question and q.type are always defined
  const questions = (session.questions || []).map(normaliseQ);
  const total     = questions.length;
  const q         = questions[qIdx];
  const answered  = Object.keys(submitted).length;
  const allDone   = total > 0 && answered >= total;
  const pct       = total > 0 ? Math.round((answered / total) * 100) : 0;

  const submitAnswer = useCallback(async () => {
    const ans = answers[qIdx]?.trim();
    if (!ans || submitted[qIdx] || evaling) return;
    setEvaling(true);
    try {
      const res = await api.post(`/interview/sessions/${session._id}/answer`, {
        questionIndex: qIdx, answer: ans,
      });
      // FIX: backend returns { feedback: { score, comment, improvements } }
      const fb = res.data?.feedback || res.data?.evaluation || res.data;
      setFeedback(p => ({ ...p, [qIdx]: {
        score:        fb?.score        ?? null,
        comment:      fb?.comment      || fb?.feedback || "",
        improvements: fb?.improvements || [],
      }}));
      setSubmitted(p => ({ ...p, [qIdx]: true }));
    } catch {
      setFeedback(p => ({ ...p, [qIdx]: { score:null, comment:"Could not evaluate — saved locally.", improvements:[] } }));
      setSubmitted(p => ({ ...p, [qIdx]: true }));
    } finally { setEvaling(false); }
  }, [answers, qIdx, submitted, evaling, session._id]);

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 252px", gap:14, alignItems:"start" }}>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>

        {/* Top bar */}
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 }}>
              <span style={{ fontSize:11, color:"#3a3a3a", fontFamily:"'Geist Mono'" }}>
                {answered}/{total} answered
              </span>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <Timer active={!allDone}/>
                <span style={{ fontSize:10, fontFamily:"'Geist Mono'", color:"#8b5cf6", fontWeight:600 }}>{pct}%</span>
              </div>
            </div>
            <Bar pct={pct} color="#8b5cf6" height={2}/>
          </div>
          <button onClick={onAbort} style={{
            padding:"5px 12px", borderRadius:7, flexShrink:0,
            background:"transparent", border:"1px solid #1e1e1e",
            color:"#3a3a3a", fontSize:11, cursor:"pointer", fontFamily:"'Geist'", transition:"all .12s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(239,68,68,.3)"; e.currentTarget.style.color="#ef4444"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="#1e1e1e"; e.currentTarget.style.color="#3a3a3a"; }}
          >End session</button>
        </div>

        {/* Question card */}
        <div className="vm-card" style={{ padding:"22px 24px" }} key={`q-${qIdx}`}>
          <div style={{ display:"flex", gap:14 }}>
            <div style={{
              width:34, height:34, borderRadius:9, flexShrink:0,
              background:"rgba(139,92,246,.1)", border:"1px solid rgba(139,92,246,.2)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:12, fontWeight:700, color:"#c4b5fd", fontFamily:"'Geist Mono'",
            }}>{qIdx+1}</div>
            <div style={{ flex:1 }}>
              {q?.type && (
                <span style={{
                  display:"inline-block", marginBottom:10,
                  padding:"2px 9px", borderRadius:99, textTransform:"capitalize",
                  fontSize:9, fontWeight:600, fontFamily:"'Geist Mono'",
                  background: q.type==="technical" ? "rgba(59,130,246,.1)" : "rgba(139,92,246,.1)",
                  color:      q.type==="technical" ? "#60a5fa"             : "#c4b5fd",
                  border:`1px solid ${q.type==="technical" ? "rgba(59,130,246,.2)" : "rgba(139,92,246,.2)"}`,
                }}>{q.type}</span>
              )}
              {/* FIX: q.question is guaranteed by normaliseQ — no more "Loading…" */}
              <p style={{ fontSize:15, fontWeight:500, color:"#eee", letterSpacing:"-0.02em", lineHeight:1.58 }}>
                {q?.question || "No question text available."}
              </p>
              {q?.hint && (
                <div style={{ marginTop:12, padding:"8px 12px", background:"#0c0c0c", border:"1px solid #161616", borderRadius:7 }}>
                  <p style={{ fontSize:11, color:"#444", lineHeight:1.65, fontStyle:"italic" }}>
                    💡 {q.hint}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Answer box OR Feedback */}
        {!submitted[qIdx] ? (
          <div className="vm-card" style={{ padding:"18px 20px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <MonoLabel>Your answer</MonoLabel>
              <span style={{ fontSize:10, color:"#222", fontFamily:"'Geist Mono'" }}>Ctrl+Enter to submit</span>
            </div>
            <textarea
              ref={textRef}
              value={answers[qIdx]||""}
              onChange={e => setAnswers(p => ({ ...p, [qIdx]: e.target.value }))}
              onKeyDown={e => { if (e.key==="Enter" && (e.ctrlKey||e.metaKey)) { e.preventDefault(); submitAnswer(); }}}
              placeholder="Type your answer… For behavioural questions, try STAR: Situation → Task → Action → Result"
              rows={6}
              style={{
                width:"100%", background:"#0c0c0c", border:"1px solid #1e1e1e", borderRadius:8,
                padding:"12px 14px", color:"#eee", fontFamily:"'Geist'", fontSize:13,
                outline:"none", resize:"vertical", lineHeight:1.68, marginBottom:12,
                transition:"border-color .14s, box-shadow .14s",
              }}
              onFocus={e => { e.target.style.borderColor="rgba(139,92,246,.45)"; e.target.style.boxShadow="0 0 0 3px rgba(139,92,246,.07)"; }}
              onBlur={e  => { e.target.style.borderColor="#1e1e1e"; e.target.style.boxShadow="none"; }}
            />
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontSize:10, color:"#222", fontFamily:"'Geist Mono'" }}>{answers[qIdx]?.length||0} chars</span>
              <PrimaryBtn onClick={submitAnswer} disabled={!answers[qIdx]?.trim()} loading={evaling}
                style={{ padding:"8px 18px", fontSize:12 }}>
                {evaling ? "Evaluating…" : <><IconSend/> Submit answer</>}
              </PrimaryBtn>
            </div>
          </div>
        ) : (
          <div style={{
            background:"#0c0c0c", border:`1px solid ${sBorder(feedback[qIdx]?.score)}`,
            borderRadius:10, overflow:"hidden", animation:"fadeUp .25s ease both",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 18px", borderBottom:"1px solid #141414" }}>
              <div style={{
                width:44, height:44, borderRadius:10, flexShrink:0,
                background: sBg(feedback[qIdx]?.score),
                border:`1px solid ${sBorder(feedback[qIdx]?.score)}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:16, fontWeight:800, color: sColor(feedback[qIdx]?.score),
                fontFamily:"'Geist'", letterSpacing:"-0.05em",
              }}>{feedback[qIdx]?.score ?? "—"}</div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:14, fontWeight:600, color:"#eee" }}>{sLabel(feedback[qIdx]?.score)}</p>
                <p style={{ fontSize:11, color:"#3a3a3a", marginTop:2 }}>Question {qIdx+1} evaluated</p>
              </div>
              <div style={{ color:"#22c55e" }}><IconCheck size={16}/></div>
            </div>
            <div style={{ padding:"15px 18px 17px" }}>
              {feedback[qIdx]?.comment && (
                <p style={{ fontSize:13, color:"#999", lineHeight:1.68, marginBottom:12 }}>
                  {feedback[qIdx].comment}
                </p>
              )}
              {feedback[qIdx]?.improvements?.length > 0 && (
                <div style={{ marginBottom:13 }}>
                  <MonoLabel style={{ marginBottom:8 }}>Improvements</MonoLabel>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    {feedback[qIdx].improvements.map((it, i) => (
                      <div key={i} style={{ display:"flex", gap:9, alignItems:"flex-start" }}>
                        <div style={{ width:4, height:4, borderRadius:"50%", background:"#f59e0b", flexShrink:0, marginTop:8 }}/>
                        <span style={{ fontSize:12, color:"#555", lineHeight:1.65 }}>{it}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ background:"#111", border:"1px solid #1a1a1a", borderRadius:8, padding:"10px 13px" }}>
                <MonoLabel style={{ marginBottom:6 }}>Your answer</MonoLabel>
                <p style={{ fontSize:12, color:"#4a4a4a", lineHeight:1.68 }}>{answers[qIdx]}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <button onClick={() => setQIdx(i => Math.max(0,i-1))} disabled={qIdx===0} style={{
            display:"flex", alignItems:"center", gap:6, padding:"7px 14px",
            borderRadius:8, background:"transparent", border:"1px solid #1e1e1e",
            color: qIdx===0 ? "#1e1e1e" : "#555", fontSize:12,
            cursor: qIdx===0 ? "not-allowed" : "pointer", fontFamily:"'Geist'", transition:"all .12s",
          }}
            onMouseEnter={e => { if(qIdx>0){e.currentTarget.style.background="#161616"; e.currentTarget.style.color="#eee"; }}}
            onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color=qIdx===0?"#1e1e1e":"#555"; }}
          >← Previous</button>

          {allDone ? (
            <PrimaryBtn onClick={() => onFinish(answers, feedback)} loading={submitting}
              style={{ padding:"8px 20px", fontSize:13 }}>
              {submitting ? "Calculating…" : <><IconStar/> Finish &amp; see results</>}
            </PrimaryBtn>
          ) : submitted[qIdx] && qIdx < total-1 ? (
            <button onClick={() => setQIdx(i => i+1)} style={{
              display:"flex", alignItems:"center", gap:6, padding:"7px 16px",
              borderRadius:8, background:"#161616", border:"1px solid #222",
              color:"#eee", fontSize:12, fontWeight:500, cursor:"pointer",
              fontFamily:"'Geist'", transition:"background .12s",
            }}
              onMouseEnter={e => e.currentTarget.style.background="#1e1e1e"}
              onMouseLeave={e => e.currentTarget.style.background="#161616"}
            >Next question <IconArrow/></button>
          ) : null}
        </div>
      </div>

      {/* Sidebar */}
      <div style={{ display:"flex", flexDirection:"column", gap:10, position:"sticky", top:84 }}>
        <div className="vm-card" style={{ padding:"14px 16px" }}>
          <MonoLabel style={{ marginBottom:12 }}>Session</MonoLabel>
          {[
            { k:"Role",       v: session.targetRole,     accent:false },
            { k:"Difficulty", v: session.difficulty,     accent:false },
            { k:"Focus",      v: session.focus,          accent:false },
            { k:"Progress",   v: `${answered}/${total}`, accent:true  },
          ].map(row => (
            <div key={row.k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:9 }}>
              <span style={{ fontSize:11, color:"#3a3a3a" }}>{row.k}</span>
              <span style={{
                fontSize:11, fontWeight: row.accent ? 600 : 400,
                color: row.accent ? "#8b5cf6" : "#ccc",
                textTransform:"capitalize",
                fontFamily: row.accent ? "'Geist Mono'" : "'Geist'",
              }}>{row.v || "—"}</span>
            </div>
          ))}
        </div>

        <div className="vm-card" style={{ padding:"14px 16px" }}>
          <MonoLabel style={{ marginBottom:10 }}>Questions</MonoLabel>
          <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
            {questions.map((q, i) => {
              const sc    = feedback[i]?.score;
              const isCur = i === qIdx;
              const isDone = !!submitted[i];
              return (
                <div key={i} onClick={() => setQIdx(i)} style={{
                  display:"flex", alignItems:"center", gap:9, padding:"7px 8px",
                  borderRadius:7, cursor:"pointer",
                  background: isCur ? "rgba(139,92,246,.08)" : "transparent",
                  border:`1px solid ${isCur ? "rgba(139,92,246,.15)" : "transparent"}`,
                  transition:"all .12s",
                }}
                  onMouseEnter={e => { if(!isCur) e.currentTarget.style.background="#111"; }}
                  onMouseLeave={e => { if(!isCur) e.currentTarget.style.background="transparent"; }}
                >
                  <div style={{
                    width:22, height:22, borderRadius:6, flexShrink:0,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    background: isDone ? sBg(sc) : isCur ? "rgba(139,92,246,.1)" : "#161616",
                    border:`1px solid ${isDone ? sBorder(sc) : isCur ? "rgba(139,92,246,.2)" : "#1e1e1e"}`,
                    fontSize:9, fontWeight:700, fontFamily:"'Geist Mono'",
                    color: isDone ? sColor(sc) : isCur ? "#c4b5fd" : "#2e2e2e",
                  }}>
                    {isDone ? (sc ?? "✓") : i+1}
                  </div>
                  <span style={{
                    fontSize:11, flex:1, color: isCur ? "#ccc" : isDone ? "#4a4a4a" : "#3a3a3a",
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                  }}>
                    {q.question.slice(0, 34)}{q.question.length > 34 ? "…" : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
//  VIEW 3 — RESULTS
// ════════════════════════════════════════════════════════════════
const ResultsView = ({ session, onNew }) => {
  const [exp, setExp] = useState(null);

  // FIX: normalise questions so q.question is always defined in results too
  const questions = (session.questions || []).map(normaliseQ);
  const answers   = session.answers || [];
  const overall   = session.overallScore
    ?? (answers.length ? Math.round(answers.reduce((a,x) => a+(x.score||0),0) / answers.length) : null);
  const best  = answers.length ? Math.max(...answers.map(a=>a.score||0)) : null;
  const worst = answers.length ? Math.min(...answers.map(a=>a.score||0)) : null;

  return (
    <div style={{ animation:"fadeUp .3s ease both" }}>
      <div style={{
        display:"grid", gridTemplateColumns:"auto 1fr", gap:28,
        padding:"26px 30px", marginBottom:16,
        background:"linear-gradient(135deg,#0e0b19 0%,#111 100%)",
        border:"1px solid rgba(139,92,246,.2)", borderRadius:12,
        position:"relative", overflow:"hidden", alignItems:"center",
      }}>
        <div style={{ position:"absolute", top:-50, right:-50, width:150, height:150,
          background:"radial-gradient(circle,rgba(139,92,246,.1),transparent 70%)", pointerEvents:"none" }}/>

        <Ring score={overall} size={100} sw={6}/>

        <div>
          <MonoLabel style={{ color:"rgba(139,92,246,.5)", marginBottom:6 }}>Session complete</MonoLabel>
          <h2 style={{ fontSize:24, fontWeight:800, color:"#eee", letterSpacing:"-0.05em", margin:"0 0 4px" }}>
            {sLabel(overall)}
          </h2>
          <p style={{ fontSize:12, color:"#444", marginBottom:20, textTransform:"capitalize" }}>
            {session.targetRole} · {session.difficulty} · {answers.length} questions
          </p>
          <div style={{ display:"flex", gap:30 }}>
            {[
              { l:"Overall", v: overall ?? "—",  c: sColor(overall) },
              { l:"Best Q",  v: best    ?? "—",  c: "#22c55e" },
              { l:"Worst Q", v: worst   ?? "—",  c: sColor(worst) },
              { l:"Done",    v: `${answers.length}/${questions.length}`, c: "#eee" },
            ].map(x => (
              <div key={x.l}>
                <div style={{ fontSize:22, fontWeight:800, color:x.c, fontFamily:"'Geist'", letterSpacing:"-0.05em", lineHeight:1, marginBottom:4 }}>{x.v}</div>
                <MonoLabel>{x.l}</MonoLabel>
              </div>
            ))}
          </div>
        </div>

        <button onClick={onNew} style={{
          position:"absolute", top:20, right:22,
          display:"flex", alignItems:"center", gap:7, padding:"7px 15px",
          borderRadius:8, background:"rgba(139,92,246,.14)", border:"1px solid rgba(139,92,246,.24)",
          color:"#c4b5fd", fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"'Geist'",
          transition:"background .14s",
        }}
          onMouseEnter={e => e.currentTarget.style.background="rgba(139,92,246,.25)"}
          onMouseLeave={e => e.currentTarget.style.background="rgba(139,92,246,.14)"}
        >
          <IconMic/> New session
        </button>
      </div>

      <MonoLabel style={{ marginBottom:10 }}>Question breakdown · {answers.length} answered</MonoLabel>

      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {answers.map((ans, i) => {
          const q    = questions[i];
          const c    = sColor(ans.score);
          const open = exp === i;
          return (
            <div key={i} style={{
              background:"#0c0c0c", border:`1px solid ${open ? "#1e1e1e" : "#141414"}`,
              borderRadius:10, overflow:"hidden", transition:"border-color .14s",
            }}>
              <div onClick={() => setExp(open ? null : i)} style={{
                display:"flex", alignItems:"center", gap:14, padding:"13px 16px",
                cursor:"pointer", transition:"background .1s",
              }}
                onMouseEnter={e => e.currentTarget.style.background="#0f0f0f"}
                onMouseLeave={e => e.currentTarget.style.background="transparent"}
              >
                <div style={{
                  width:40, height:40, borderRadius:9, flexShrink:0,
                  background: sBg(ans.score), border:`1px solid ${sBorder(ans.score)}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:14, fontWeight:800, color:c, fontFamily:"'Geist'", letterSpacing:"-0.04em",
                }}>{ans.score ?? "—"}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:500, color:"#ccc", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                    {q?.question || `Question ${i+1}`}
                  </p>
                  <div style={{ display:"flex", gap:8, marginTop:3 }}>
                    <span style={{ fontSize:10, color:"#3a3a3a", fontFamily:"'Geist Mono'" }}>{sLabel(ans.score)}</span>
                    {q?.type && <span style={{ fontSize:9, color:"#2a2a2a", fontFamily:"'Geist Mono'", textTransform:"capitalize" }}>· {q.type}</span>}
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
                  <div style={{ width:64 }}><Bar pct={ans.score||0} color={c} height={2}/></div>
                  <span style={{ color:"#2a2a2a" }}><IconChev up={open}/></span>
                </div>
              </div>
              {open && (
                <div style={{ padding:"0 16px 16px", animation:"fadeUp .18s ease both" }}>
                  <div style={{ height:1, background:"#141414", marginBottom:13 }}/>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    {[
                      { label:"Your answer", text: ans.answer  || "No answer recorded." },
                      { label:"AI feedback", text: ans.feedback || ans.comment || "No feedback recorded." },
                    ].map(col => (
                      <div key={col.label} style={{ background:"#111", border:"1px solid #1a1a1a", borderRadius:8, padding:"11px 13px" }}>
                        <MonoLabel style={{ marginBottom:6 }}>{col.label}</MonoLabel>
                        <p style={{ fontSize:12, color:"#4a4a4a", lineHeight:1.68 }}>{col.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ════════════════════════════════════════════════════════════════
const InterviewPage = () => {
  const [view,       setView]       = useState("setup");
  const [sessions,   setSessions]   = useState([]);
  const [session,    setSession]    = useState(null);
  const [starting,   setStarting]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/interview/sessions")
      .then(r => setSessions(r.data.sessions || []))
      .catch(() => {});
  }, []);

  const handleStart = async ({ role, difficulty, focus, count }) => {
    setStarting(true);
    try {
      const res = await api.post("/interview/sessions", {
        targetRole: role, difficulty, focus, questionCount: count,
      });
      // FIX: session now contains a `questions` array from the fixed interviewManager
      const sess = res.data?.session || res.data;
      setSession(sess);
      setView("session");
    } catch (err) {
      console.error("Failed to start session:", err);
    } finally {
      setStarting(false);
    }
  };

  const handleFinish = async (answers, feedback) => {
    setSubmitting(true);
    try {
      const payload = session.questions?.map((_, i) => ({
        questionIndex: i,
        answer:   answers[i]  || "",
        score:    feedback[i]?.score   ?? null,
        feedback: feedback[i]?.comment || "",
      }));
      // FIX: calls /complete endpoint which now exists
      const res  = await api.post(`/interview/sessions/${session._id}/complete`, { answers: payload });
      const done = res.data?.session || { ...session, answers: payload, overallScore: res.data?.overallScore };
      setSession(done);
      setSessions(p => [done, ...p]);
      setView("results");
    } catch {
      // Even if the API call fails, show results with local data
      setSession(prev => ({
        ...prev,
        answers: session.questions?.map((_, i) => ({
          answer:   answers[i]  || "",
          score:    feedback[i]?.score   ?? null,
          feedback: feedback[i]?.comment || "",
          comment:  feedback[i]?.comment || "",
        })) || [],
      }));
      setView("results");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAbort = () => {
    if (window.confirm("End session? Progress will not be saved.")) {
      setSession(null);
      setView("setup");
    }
  };

  const META = {
    setup:   { title:"Mock Interview",  sub:"Practice with AI-generated, role-specific questions." },
    session: { title: session?.targetRole || "Interview", sub:`${session?.difficulty||""} · ${session?.focus||""} · ${session?.questions?.length||0} questions` },
    results: { title:"Session Results", sub:"Full breakdown with per-question AI feedback." },
  };
  const { title, sub } = META[view] || META.setup;

  return (
    <DashboardLayout>
      <div style={{ padding:"32px 28px", maxWidth:1060 }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:28, animation:"fadeUp .3s ease both" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            {view !== "setup" && (
              <button onClick={() => { setView("setup"); setSession(null); }} style={{
                width:32, height:32, borderRadius:8, display:"flex",
                alignItems:"center", justifyContent:"center", flexShrink:0,
                background:"#141414", border:"1px solid #1e1e1e",
                color:"#444", cursor:"pointer", transition:"all .12s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background="#1e1e1e"; e.currentTarget.style.color="#eee"; }}
                onMouseLeave={e => { e.currentTarget.style.background="#141414"; e.currentTarget.style.color="#444"; }}
              >
                <IconBack/>
              </button>
            )}
            <div>
              <MonoLabel style={{ marginBottom:4 }}>Interview</MonoLabel>
              <h1 style={{ fontSize:24, fontWeight:700, color:"#eee", letterSpacing:"-0.04em", margin:0 }}>{title}</h1>
              <p style={{ fontSize:13, color:"#444", marginTop:4, textTransform:"capitalize" }}>{sub}</p>
            </div>
          </div>
          {view==="setup" && sessions.length > 0 && (
            <div style={{ padding:"6px 13px", background:"#111", border:"1px solid #1a1a1a", borderRadius:7, fontSize:12, color:"#444" }}>
              <span style={{ color:"#eee", fontWeight:600 }}>{sessions.length}</span>{" "}
              session{sessions.length!==1?"s":""} completed
            </div>
          )}
        </div>

        {view==="setup"   && <SetupView   onStart={handleStart} starting={starting} sessions={sessions}/>}
        {view==="session" && session && <SessionView session={session} onFinish={handleFinish} onAbort={handleAbort} submitting={submitting}/>}
        {view==="results" && session && <ResultsView session={session} onNew={() => { setView("setup"); setSession(null); }}/>}
      </div>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .vm-card { background:#0e0e0e; border:1px solid #1a1a1a; border-radius:10px; }
        textarea::-webkit-scrollbar { width:3px }
        textarea::-webkit-scrollbar-thumb { background:#222; border-radius:99px }
      `}</style>
    </DashboardLayout>
  );
};

export default InterviewPage;