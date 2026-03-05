import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import api from "../services/api";

// ─── Icons ────────────────────────────────────────────────────
const Svg = ({ size = 14, sw = 1.75, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const IconSearch  = () => <Svg size={13}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></Svg>;
const IconBrief   = () => <Svg size={13}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></Svg>;
const IconPin     = () => <Svg size={12}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></Svg>;
const IconClock   = () => <Svg size={11}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Svg>;
const IconArrow   = () => <Svg size={12}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></Svg>;
const IconSpin    = () => <Svg size={13}><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity=".15"/><path d="M21 12a9 9 0 00-9-9"/></Svg>;
const IconLink    = () => <Svg size={12}><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></Svg>;
const IconStar    = () => <Svg size={12}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></Svg>;
const IconStarF   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconFilter  = () => <Svg size={13}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></Svg>;
const IconX       = () => <Svg size={12} sw={2.5}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Svg>;
const IconGrid    = () => <Svg size={13}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></Svg>;
const IconList    = () => <Svg size={13}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></Svg>;

// ─── Helpers ──────────────────────────────────────────────────
const MonoLabel = ({ children, style }) => (
  <p style={{ fontSize:9, fontWeight:600, fontFamily:"'Geist Mono'", color:"#2e2e2e",
    textTransform:"uppercase", letterSpacing:".1em", margin:0, ...style }}>
    {children}
  </p>
);

// FIX: unified date formatter that handles BOTH:
//   postedAt  — ISO date string from demo jobs
//   postedDays — number of days ago from API jobs
const fmtPosted = job => {
  if (job.postedAt) {
    const diff = (Date.now() - new Date(job.postedAt)) / 1000;
    if (diff < 3600)   return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400)  return `${Math.floor(diff/3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff/86400)}d ago`;
    return new Date(job.postedAt).toLocaleDateString("en-IN", { day:"numeric", month:"short" });
  }
  if (job.postedDays != null) {
    if (job.postedDays === 0) return "Today";
    if (job.postedDays === 1) return "1 day ago";
    return `${job.postedDays} days ago`;
  }
  return "Recently";
};

// FIX: normalise a job from either the API or the demo array so the
// rest of the UI always reads _id, applyUrl, match, postedAt consistently.
const normaliseJob = j => ({
  ...j,
  _id:      j._id  || j.id  || String(Math.random()),   // FIX: _id/_id unification
  applyUrl: j.applyUrl || j.apply_url || null,           // FIX: preserve applyUrl
  match:    j.match || j.matchScore   || null,
  // keep postedAt if present, otherwise derive from postedDays for consistent sorting
  postedAt: j.postedAt || (j.postedDays != null
    ? new Date(Date.now() - j.postedDays * 86400000).toISOString()
    : null),
});

const TYPE_COLORS = {
  "Full-time":  { bg:"rgba(139,92,246,.1)",  border:"rgba(139,92,246,.2)",  color:"#c4b5fd" },
  "Part-time":  { bg:"rgba(59,130,246,.1)",  border:"rgba(59,130,246,.2)",  color:"#93c5fd" },
  "Remote":     { bg:"rgba(34,197,94,.1)",   border:"rgba(34,197,94,.2)",   color:"#86efac" },
  "Contract":   { bg:"rgba(245,158,11,.1)",  border:"rgba(245,158,11,.2)",  color:"#fcd34d" },
  "Internship": { bg:"rgba(236,72,153,.1)",  border:"rgba(236,72,153,.2)",  color:"#f9a8d4" },
};
const typeStyle = t => TYPE_COLORS[t] || { bg:"rgba(100,100,100,.1)", border:"rgba(100,100,100,.2)", color:"#888" };

// ─── Demo fallback jobs ───────────────────────────────────────
const DEMO_JOBS = [
  { _id:"1", title:"Software Engineer II",  company:"Google",   location:"Bangalore, IN", type:"Full-time",  salary:"₹28–40 LPA",  postedAt:new Date(Date.now()-86400000*1).toISOString(),  description:"Build and scale backend infrastructure for Google Search. Work with distributed systems, Go/C++, and internal tooling at massive scale.",          skills:["Go","C++","Distributed Systems","gRPC","Kubernetes"],           applyUrl:"https://careers.google.com",          logo:"G", match:92 },
  { _id:"2", title:"Frontend Engineer",     company:"Razorpay", location:"Bangalore, IN", type:"Full-time",  salary:"₹18–28 LPA",  postedAt:new Date(Date.now()-86400000*2).toISOString(),  description:"Own the React frontend for Razorpay's merchant dashboard. Drive performance improvements and build new payment flows used by millions.",        skills:["React","TypeScript","Next.js","CSS","GraphQL"],                  applyUrl:"https://razorpay.com/jobs",           logo:"R", match:88 },
  { _id:"3", title:"Full Stack Developer",  company:"Zepto",    location:"Mumbai, IN",    type:"Full-time",  salary:"₹15–22 LPA",  postedAt:new Date(Date.now()-86400000*3).toISOString(),  description:"Work on Zepto's core consumer app — React Native frontend, Node.js microservices, and real-time inventory for 10-minute delivery.",           skills:["Node.js","React Native","MongoDB","Redis","AWS"],                applyUrl:"https://www.zepto.team",              logo:"Z", match:84 },
  { _id:"4", title:"Backend Engineer",      company:"CRED",     location:"Remote",        type:"Remote",     salary:"₹20–32 LPA",  postedAt:new Date(Date.now()-86400000*5).toISOString(),  description:"Design and build high-throughput financial APIs. Ensure reliability and security of payment infrastructure.",                                   skills:["Kotlin","Go","PostgreSQL","Kafka","Docker"],                     applyUrl:"https://careers.cred.club",           logo:"C", match:79 },
  { _id:"5", title:"React Developer",       company:"Groww",    location:"Bangalore, IN", type:"Full-time",  salary:"₹16–24 LPA",  postedAt:new Date(Date.now()-86400000*7).toISOString(),  description:"Build Groww's investment platform frontend serving 50M+ users. Focus on performance, accessibility, and delightful UX for financial products.", skills:["React","TypeScript","Redux","Webpack","Jest"],                   applyUrl:"https://groww.in/careers",            logo:"G", match:75 },
  { _id:"6", title:"SDE Intern",            company:"Flipkart", location:"Bangalore, IN", type:"Internship", salary:"₹60–80K/mo",  postedAt:new Date(Date.now()-86400000*10).toISOString(), description:"6-month internship on Flipkart's supply chain team. Build internal tools, write production code, mentored by senior engineers.",               skills:["Java","Spring Boot","MySQL","REST APIs"],                        applyUrl:"https://www.flipkartcareers.com",      logo:"F", match:70 },
].map(normaliseJob);

// ─── Search input ─────────────────────────────────────────────
const SearchInput = ({ value, onChange, placeholder }) => (
  <div style={{ position:"relative", flex:1 }}>
    <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:"#333", display:"flex", pointerEvents:"none" }}>
      <IconSearch/>
    </span>
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{
        width:"100%", background:"#0c0c0c", border:"1px solid #1e1e1e", borderRadius:8,
        padding:"9px 10px 9px 33px", color:"#eee", fontFamily:"'Geist'", fontSize:13,
        outline:"none", transition:"border-color .14s, box-shadow .14s",
      }}
      onFocus={e => { e.target.style.borderColor="rgba(139,92,246,.4)"; e.target.style.boxShadow="0 0 0 3px rgba(139,92,246,.07)"; }}
      onBlur={e  => { e.target.style.borderColor="#1e1e1e"; e.target.style.boxShadow="none"; }}
    />
    {value && (
      <button onClick={() => onChange("")} style={{
        position:"absolute", right:9, top:"50%", transform:"translateY(-50%)",
        background:"none", border:"none", color:"#444", cursor:"pointer", display:"flex", padding:2,
      }}><IconX/></button>
    )}
  </div>
);

// ─── Job detail panel ─────────────────────────────────────────
const JobDetail = ({ job, onClose, onSave, saved }) => {
  if (!job) return null;
  const s = typeStyle(job.type);

  // FIX: validate applyUrl before using it — if missing or invalid show a disabled state
  const hasValidUrl = job.applyUrl && job.applyUrl !== "#" && job.applyUrl.startsWith("http");

  return (
    <div style={{
      position:"fixed", top:0, right:0, bottom:0, width:460,
      background:"#0a0a0a", borderLeft:"1px solid #181818",
      display:"flex", flexDirection:"column", zIndex:100,
      animation:"slideIn .2s ease both",
      boxShadow:"-8px 0 32px rgba(0,0,0,.5)",
    }}>
      {/* Header */}
      <div style={{ padding:"18px 20px 16px", borderBottom:"1px solid #181818" }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{
              width:44, height:44, borderRadius:10, flexShrink:0,
              background:"rgba(139,92,246,.12)", border:"1px solid rgba(139,92,246,.2)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:16, fontWeight:800, color:"#c4b5fd", fontFamily:"'Geist'",
            }}>{job.logo || job.company?.[0]}</div>
            <div>
              <p style={{ fontSize:15, fontWeight:700, color:"#eee", letterSpacing:"-0.02em", marginBottom:2 }}>{job.title}</p>
              <p style={{ fontSize:12, color:"#555" }}>{job.company}</p>
            </div>
          </div>
          <button onClick={onClose} style={{
            width:28, height:28, borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center",
            background:"#141414", border:"1px solid #1e1e1e", color:"#444",
            cursor:"pointer", transition:"all .12s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background="#1e1e1e"; e.currentTarget.style.color="#eee"; }}
            onMouseLeave={e => { e.currentTarget.style.background="#141414"; e.currentTarget.style.color="#444"; }}
          ><IconX/></button>
        </div>

        {/* Meta chips */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          <span style={{ display:"flex", alignItems:"center", gap:5, padding:"3px 9px", borderRadius:99,
            fontSize:10, fontWeight:600, fontFamily:"'Geist Mono'",
            background:s.bg, border:`1px solid ${s.border}`, color:s.color }}>{job.type}</span>
          {job.location && <span style={{ display:"flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:99,
            fontSize:10, color:"#555", border:"1px solid #1a1a1a", background:"#111" }}>
            <IconPin/>{job.location}</span>}
          {job.salary && <span style={{ padding:"3px 9px", borderRadius:99,
            fontSize:10, color:"#4ade80", border:"1px solid rgba(34,197,94,.2)", background:"rgba(34,197,94,.06)",
            fontFamily:"'Geist Mono'", fontWeight:600 }}>{job.salary}</span>}
          {job.match && <span style={{ padding:"3px 9px", borderRadius:99,
            fontSize:10, color:"#c4b5fd", border:"1px solid rgba(139,92,246,.2)", background:"rgba(139,92,246,.08)",
            fontFamily:"'Geist Mono'", fontWeight:600 }}>{job.match}% match</span>}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex:1, overflowY:"auto", padding:"18px 20px" }}>
        {job.description && (
          <div style={{ marginBottom:20 }}>
            <MonoLabel style={{ marginBottom:10 }}>About this role</MonoLabel>
            <p style={{ fontSize:13, color:"#666", lineHeight:1.72 }}>{job.description}</p>
          </div>
        )}
        {job.skills?.length > 0 && (
          <div style={{ marginBottom:20 }}>
            <MonoLabel style={{ marginBottom:10 }}>Skills required</MonoLabel>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {job.skills.map((sk, i) => (
                <span key={i} style={{ padding:"4px 10px", borderRadius:7,
                  fontSize:11, fontWeight:500, color:"#aaa",
                  background:"#111", border:"1px solid #1a1a1a" }}>{sk}</span>
              ))}
            </div>
          </div>
        )}
        <div style={{ marginBottom:20 }}>
          <MonoLabel style={{ marginBottom:10 }}>Details</MonoLabel>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {[
              { k:"Company",  v: job.company },
              { k:"Location", v: job.location },
              { k:"Type",     v: job.type },
              { k:"Salary",   v: job.salary || "Not disclosed" },
              { k:"Posted",   v: fmtPosted(job) },
            ].map(row => (
              <div key={row.k} style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:12, color:"#3a3a3a" }}>{row.k}</span>
                <span style={{ fontSize:12, color:"#aaa", textAlign:"right" }}>{row.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FIX: show URL preview so users know where Apply Now goes */}
        {hasValidUrl && (
          <div style={{ padding:"8px 12px", background:"#0d0d0d", border:"1px solid #1a1a1a", borderRadius:8, marginBottom:8 }}>
            <MonoLabel style={{ marginBottom:4 }}>Apply at</MonoLabel>
            <p style={{ fontSize:11, color:"#555", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {job.applyUrl}
            </p>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div style={{ padding:"14px 20px 18px", borderTop:"1px solid #181818", display:"flex", gap:8 }}>
        <button onClick={() => onSave(job._id)} style={{
          display:"flex", alignItems:"center", gap:6, padding:"9px 14px",
          borderRadius:8, cursor:"pointer", fontFamily:"'Geist'",
          fontSize:12, fontWeight:500, transition:"all .14s",
          background: saved ? "rgba(245,158,11,.1)" : "#141414",
          border: `1px solid ${saved ? "rgba(245,158,11,.2)" : "#1e1e1e"}`,
          color: saved ? "#fcd34d" : "#555",
        }}>
          {saved ? <IconStarF/> : <IconStar/>} {saved ? "Saved" : "Save"}
        </button>

        {/* FIX: only render as <a> if URL is valid — otherwise show disabled button */}
        {hasValidUrl ? (
          <a href={job.applyUrl} target="_blank" rel="noreferrer noopener" style={{ flex:1, textDecoration:"none" }}>
            <button style={{
              width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:7,
              padding:"9px 20px", borderRadius:8,
              background:"#8b5cf6", border:"none",
              color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer",
              fontFamily:"'Geist'", transition:"all .15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background="#7c3aed"; e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 6px 20px rgba(139,92,246,.35)"; }}
              onMouseLeave={e => { e.currentTarget.style.background="#8b5cf6"; e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}
            >
              Apply now <IconArrow/>
            </button>
          </a>
        ) : (
          <button disabled style={{
            flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:7,
            padding:"9px 20px", borderRadius:8,
            background:"rgba(139,92,246,.15)", border:"1px solid rgba(139,92,246,.2)",
            color:"#7c5cbf", fontSize:13, fontWeight:600,
            fontFamily:"'Geist'", cursor:"not-allowed", opacity:0.6,
          }}>
            <IconLink/> No apply link
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Job card ─────────────────────────────────────────────────
const JobCard = ({ job, onSelect, selected, onSave, saved, view }) => {
  const s      = typeStyle(job.type);
  const isList = view === "list";

  if (isList) return (
    <div onClick={() => onSelect(job)} style={{
      display:"flex", alignItems:"center", gap:14,
      padding:"13px 16px", cursor:"pointer",
      background: selected ? "rgba(139,92,246,.05)" : "transparent",
      borderBottom:"1px solid #111",
      borderLeft: `2px solid ${selected ? "#8b5cf6" : "transparent"}`,
      transition:"all .12s",
    }}
      onMouseEnter={e => { if(!selected) e.currentTarget.style.background="#0d0d0d"; }}
      onMouseLeave={e => { if(!selected) e.currentTarget.style.background="transparent"; }}
    >
      <div style={{
        width:36, height:36, borderRadius:8, flexShrink:0,
        background:"rgba(139,92,246,.1)", border:"1px solid rgba(139,92,246,.15)",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:13, fontWeight:800, color:"#c4b5fd", fontFamily:"'Geist'",
      }}>{job.logo || job.company?.[0]}</div>

      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
          <p style={{ fontSize:13, fontWeight:600, color:"#eee", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{job.title}</p>
          <span style={{ padding:"1px 7px", borderRadius:99, fontSize:9, fontWeight:600, fontFamily:"'Geist Mono'",
            background:s.bg, border:`1px solid ${s.border}`, color:s.color, flexShrink:0 }}>{job.type}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:11, color:"#444" }}>{job.company}</span>
          {job.location && <span style={{ fontSize:10, color:"#333", display:"flex", alignItems:"center", gap:3 }}><IconPin/>{job.location}</span>}
        </div>
      </div>

      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:5, flexShrink:0 }}>
        {job.match && <span style={{ fontSize:10, fontFamily:"'Geist Mono'", fontWeight:700, color:"#8b5cf6" }}>{job.match}%</span>}
        <span style={{ fontSize:10, fontFamily:"'Geist Mono'", color:"#2e2e2e" }}>{fmtPosted(job)}</span>
      </div>
    </div>
  );

  return (
    <div onClick={() => onSelect(job)} style={{
      background: selected ? "rgba(139,92,246,.05)" : "#0c0c0c",
      border:`1px solid ${selected ? "rgba(139,92,246,.2)" : "#181818"}`,
      borderRadius:10, padding:"16px", cursor:"pointer",
      transition:"all .14s", animation:"fadeUp .25s ease both",
    }}
      onMouseEnter={e => { if(!selected){e.currentTarget.style.borderColor="#222"; e.currentTarget.style.background="#0f0f0f";} }}
      onMouseLeave={e => { if(!selected){e.currentTarget.style.borderColor="#181818"; e.currentTarget.style.background="#0c0c0c";} }}
    >
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:38, height:38, borderRadius:9, flexShrink:0,
            background:"rgba(139,92,246,.1)", border:"1px solid rgba(139,92,246,.15)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:14, fontWeight:800, color:"#c4b5fd", fontFamily:"'Geist'",
          }}>{job.logo || job.company?.[0]}</div>
          <div>
            <p style={{ fontSize:13, fontWeight:600, color:"#eee", marginBottom:1 }}>{job.title}</p>
            <p style={{ fontSize:11, color:"#444" }}>{job.company}</p>
          </div>
        </div>
        <button onClick={e => { e.stopPropagation(); onSave(job._id); }} style={{
          width:26, height:26, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center",
          background: saved ? "rgba(245,158,11,.1)" : "transparent",
          border:`1px solid ${saved ? "rgba(245,158,11,.2)" : "transparent"}`,
          color: saved ? "#fcd34d" : "#2e2e2e", cursor:"pointer", transition:"all .12s",
        }}
          onMouseEnter={e => { if(!saved){e.currentTarget.style.color="#f59e0b"; e.currentTarget.style.background="rgba(245,158,11,.08)";} }}
          onMouseLeave={e => { if(!saved){e.currentTarget.style.color="#2e2e2e"; e.currentTarget.style.background="transparent";} }}
        >{saved ? <IconStarF/> : <IconStar/>}</button>
      </div>

      <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:10 }}>
        <span style={{ padding:"2px 8px", borderRadius:99, fontSize:9, fontWeight:600, fontFamily:"'Geist Mono'",
          background:s.bg, border:`1px solid ${s.border}`, color:s.color }}>{job.type}</span>
        {job.location && <span style={{ display:"flex", alignItems:"center", gap:3, padding:"2px 8px", borderRadius:99,
          fontSize:9, color:"#444", border:"1px solid #181818" }}><IconPin/>{job.location}</span>}
        {job.salary && <span style={{ padding:"2px 8px", borderRadius:99, fontSize:9, fontFamily:"'Geist Mono'",
          color:"#4ade80", border:"1px solid rgba(34,197,94,.15)", background:"rgba(34,197,94,.05)" }}>{job.salary}</span>}
      </div>

      {job.description && (
        <p style={{ fontSize:12, color:"#444", lineHeight:1.6, marginBottom:12,
          overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
          {job.description}
        </p>
      )}

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:5, color:"#2e2e2e" }}>
          <IconClock/><span style={{ fontSize:10, fontFamily:"'Geist Mono'" }}>{fmtPosted(job)}</span>
        </div>
        {job.match && (
          <span style={{ fontSize:10, fontFamily:"'Geist Mono'", fontWeight:700,
            color:"#8b5cf6", background:"rgba(139,92,246,.08)",
            border:"1px solid rgba(139,92,246,.15)", borderRadius:99, padding:"1px 8px" }}>
            {job.match}% match
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Filter pill ──────────────────────────────────────────────
const FilterPill = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    padding:"5px 12px", borderRadius:99, border:"1px solid",
    fontSize:11, fontWeight: active ? 600 : 400, cursor:"pointer",
    fontFamily:"'Geist'", transition:"all .12s",
    background: active ? "rgba(139,92,246,.12)" : "transparent",
    borderColor: active ? "rgba(139,92,246,.25)" : "#1a1a1a",
    color: active ? "#c4b5fd" : "#444",
  }}>{label}</button>
);

// ════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ════════════════════════════════════════════════════════════════
const JobsPage = () => {
  const [jobs,       setJobs]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [searching,  setSearching]  = useState(false);
  const [query,      setQuery]      = useState("");
  const [location,   setLocation]   = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selected,   setSelected]   = useState(null);
  const [savedIds,   setSavedIds]   = useState(new Set());
  const [viewMode,   setViewMode]   = useState("grid");
  const [showFilters,setShowFilters]= useState(false);
  const [sortBy,     setSortBy]     = useState("recent");
  const searchTimer = useRef();

  const JOB_TYPES = ["All", "Full-time", "Part-time", "Remote", "Contract", "Internship"];

  // Load initial jobs
  useEffect(() => {
    const load = async () => {
      try {
        const res  = await api.get("/jobs");
        // FIX: normalise every job so _id and applyUrl are always present
        const list = (res.data?.jobs || res.data || []).map(normaliseJob);
        setJobs(list.length > 0 ? list : DEMO_JOBS);
      } catch {
        setJobs(DEMO_JOBS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Debounced search
  const doSearch = useCallback(async (q, loc) => {
    if (!q.trim() && !loc.trim()) return;
    setSearching(true);
    try {
      const res  = await api.get(`/jobs/search?q=${encodeURIComponent(q)}&location=${encodeURIComponent(loc)}`);
      const list = (res.data?.jobs || res.data || []).map(normaliseJob);
      setJobs(list.length > 0 ? list : DEMO_JOBS.filter(j =>
        j.title.toLowerCase().includes(q.toLowerCase()) ||
        j.company.toLowerCase().includes(q.toLowerCase())
      ));
    } catch {
      setJobs(DEMO_JOBS.filter(j =>
        j.title.toLowerCase().includes(q.toLowerCase())   ||
        j.company.toLowerCase().includes(q.toLowerCase()) ||
        (j.location||"").toLowerCase().includes(loc.toLowerCase())
      ));
    } finally { setSearching(false); }
  }, []);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    if (!query && !location) { setJobs(DEMO_JOBS); return; }
    searchTimer.current = setTimeout(() => doSearch(query, location), 500);
    return () => clearTimeout(searchTimer.current);
  }, [query, location, doSearch]);

  const toggleSave = id => setSavedIds(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const filtered = jobs
    .filter(j => typeFilter === "All" || j.type === typeFilter)
    .sort((a, b) => {
      if (sortBy === "match")  return (b.match||0) - (a.match||0);
      if (sortBy === "salary") return (b.salary||"").localeCompare(a.salary||"");
      return new Date(b.postedAt||0) - new Date(a.postedAt||0);
    });

  return (
    <DashboardLayout>
      <div style={{ padding:"32px 28px", maxWidth:1100 }}>

        {/* Header */}
        <div style={{ marginBottom:24, animation:"fadeUp .3s ease both" }}>
          <MonoLabel style={{ marginBottom:5 }}>Jobs</MonoLabel>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
            <div>
              <h1 style={{ fontSize:24, fontWeight:700, color:"#eee", letterSpacing:"-0.04em", margin:0 }}>
                Job Search
              </h1>
              <p style={{ fontSize:13, color:"#444", marginTop:4 }}>
                Find roles matching your skills and experience.
              </p>
            </div>
            {savedIds.size > 0 && (
              <div style={{ padding:"6px 13px", background:"#111", border:"1px solid #1a1a1a", borderRadius:7, fontSize:12, color:"#555" }}>
                <span style={{ color:"#fcd34d", fontWeight:600 }}>{savedIds.size}</span> job{savedIds.size!==1?"s":""} saved
              </div>
            )}
          </div>
        </div>

        {/* Search bar */}
        <div style={{ display:"flex", gap:8, marginBottom:12, animation:"fadeUp .3s ease both", animationDelay:"60ms" }}>
          <SearchInput value={query}    onChange={setQuery}    placeholder="Job title, company, or keyword…"/>
          <SearchInput value={location} onChange={setLocation} placeholder="Location…"/>
          <button onClick={() => setShowFilters(f=>!f)} style={{
            display:"flex", alignItems:"center", gap:6, padding:"9px 14px",
            borderRadius:8, cursor:"pointer", fontFamily:"'Geist'", fontSize:12, fontWeight:500,
            background: showFilters ? "rgba(139,92,246,.1)" : "#0c0c0c",
            border:`1px solid ${showFilters ? "rgba(139,92,246,.2)" : "#1e1e1e"}`,
            color: showFilters ? "#c4b5fd" : "#555", transition:"all .14s", flexShrink:0,
          }}>
            <IconFilter/> Filters
          </button>
          <div style={{ display:"flex", gap:2, padding:3, background:"#0c0c0c", border:"1px solid #181818", borderRadius:8, flexShrink:0 }}>
            {[{v:"grid",I:IconGrid},{v:"list",I:IconList}].map(({v,I}) => (
              <button key={v} onClick={() => setViewMode(v)} style={{
                width:32, height:30, borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center",
                background: viewMode===v ? "#1e1e1e" : "transparent",
                border:"none", color: viewMode===v ? "#eee" : "#333",
                cursor:"pointer", transition:"all .12s",
                boxShadow: viewMode===v ? "0 1px 3px rgba(0,0,0,.4)" : "none",
              }}><I/></button>
            ))}
          </div>
        </div>

        {/* Expanded filter row */}
        {showFilters && (
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16, flexWrap:"wrap", animation:"fadeUp .15s ease both" }}>
            <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
              {JOB_TYPES.map(t => <FilterPill key={t} label={t} active={typeFilter===t} onClick={() => setTypeFilter(t)}/>)}
            </div>
            <div style={{ width:1, height:20, background:"#1a1a1a", flexShrink:0 }}/>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <MonoLabel>Sort</MonoLabel>
              <div style={{ display:"flex", gap:4 }}>
                {[{v:"recent",l:"Recent"},{v:"match",l:"Match %"},{v:"salary",l:"Salary"}].map(s => (
                  <FilterPill key={s.v} label={s.l} active={sortBy===s.v} onClick={() => setSortBy(s.v)}/>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Type pills (collapsed state) */}
        {!showFilters && (
          <div style={{ display:"flex", gap:5, marginBottom:16, flexWrap:"wrap", animation:"fadeUp .3s ease both", animationDelay:"80ms" }}>
            {JOB_TYPES.map(t => <FilterPill key={t} label={t} active={typeFilter===t} onClick={() => setTypeFilter(t)}/>)}
          </div>
        )}

        {/* Results count */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {searching && <span style={{ animation:"spin .8s linear infinite", display:"flex", color:"#8b5cf6" }}><IconSpin/></span>}
            <MonoLabel>{loading ? "Loading…" : `${filtered.length} result${filtered.length!==1?"s":""}`}</MonoLabel>
          </div>
        </div>

        {/* Job grid / list */}
        {loading ? (
          <div style={{ display:"grid", gridTemplateColumns: viewMode==="grid" ? "repeat(auto-fill,minmax(280px,1fr))" : "1fr", gap:8 }}>
            {Array(6).fill(0).map((_,i) => (
              <div key={i} style={{ height: viewMode==="grid" ? 180 : 64, background:"#0c0c0c", border:"1px solid #141414", borderRadius:10,
                animation:"shimmer 1.5s ease infinite", animationDelay:`${i*100}ms` }}/>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"64px 24px",
            background:"#0c0c0c", border:"1px solid #141414", borderRadius:12, textAlign:"center" }}>
            <div style={{ width:44, height:44, borderRadius:10, background:"#161616", border:"1px solid #1e1e1e",
              display:"flex", alignItems:"center", justifyContent:"center", color:"#2e2e2e", marginBottom:14 }}>
              <IconBrief/>
            </div>
            <p style={{ fontSize:14, fontWeight:500, color:"#444", marginBottom:6 }}>No jobs found</p>
            <p style={{ fontSize:12, color:"#2e2e2e" }}>Try different keywords or clear the filters.</p>
          </div>
        ) : (
          <div style={{
            display: viewMode==="grid" ? "grid" : "block",
            gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
            gap:8,
            background: viewMode==="list" ? "#0c0c0c" : "transparent",
            border: viewMode==="list" ? "1px solid #181818" : "none",
            borderRadius: viewMode==="list" ? 10 : 0,
            overflow:"hidden",
          }}>
            {filtered.map((job, i) => (
              <div key={job._id} style={{ animationDelay:`${i*40}ms` }}>
                <JobCard
                  job={job} view={viewMode}
                  selected={selected?._id === job._id}
                  onSelect={j => setSelected(selected?._id===j._id ? null : j)}
                  onSave={toggleSave}
                  saved={savedIds.has(job._id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Job detail panel */}
      {selected && (
        <>
          <div onClick={() => setSelected(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.3)", zIndex:99 }}/>
          <JobDetail job={selected} onClose={() => setSelected(null)} onSave={toggleSave} saved={savedIds.has(selected._id)}/>
        </>
      )}

      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
        @keyframes shimmer { 0%,100%{opacity:.4} 50%{opacity:.7} }
      `}</style>
    </DashboardLayout>
  );
};

export default JobsPage;