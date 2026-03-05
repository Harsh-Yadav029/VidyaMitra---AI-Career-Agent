import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import api from "../services/api";

// ── Icons ────────────────────────────────────────────────────
const PlusIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const TrashIcon   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
const DragIcon    = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="19" r="1" fill="currentColor"/><circle cx="15" cy="5" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="19" r="1" fill="currentColor"/></svg>;
const DownloadIcon= () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const SaveIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const EyeIcon     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const SpinIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.2"/><path d="M21 12a9 9 0 00-9-9"/></svg>;
const ChevronIcon = ({ open }) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}><polyline points="6 9 12 15 18 9"/></svg>;
const CheckIcon   = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const ImportIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const SparkIcon   = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;

// ── Default resume state ──────────────────────────────────────
const defaultResume = () => ({
  personalInfo: {
    name: "", email: "", phone: "", location: "",
    linkedin: "", github: "", website: "", summary: "",
  },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
});

const uid = () => Math.random().toString(36).slice(2, 9);

// ── Shared: Input ─────────────────────────────────────────────
const Field = ({ label, value, onChange, placeholder, multiline = false, rows = 3, hint }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
    <label style={{ fontSize: "11px", fontWeight: 500, color: "#666666", fontFamily: "'Geist', sans-serif" }}>{label}</label>
    {multiline ? (
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          width: "100%", background: "#0d0d0d",
          border: "1px solid #1e1e1e", borderRadius: "7px",
          padding: "8px 10px", color: "#eeeeee",
          fontFamily: "'Geist', sans-serif", fontSize: "12px",
          outline: "none", resize: "vertical", lineHeight: 1.6,
          transition: "border-color 0.14s, box-shadow 0.14s",
        }}
        onFocus={e => { e.target.style.borderColor = "rgba(139,92,246,0.4)"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.08)"; }}
        onBlur={e =>  { e.target.style.borderColor = "#1e1e1e";             e.target.style.boxShadow = "none"; }}
      />
    ) : (
      <input
        type="text" value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", background: "#0d0d0d",
          border: "1px solid #1e1e1e", borderRadius: "7px",
          padding: "7px 10px", color: "#eeeeee",
          fontFamily: "'Geist', sans-serif", fontSize: "12px",
          outline: "none",
          transition: "border-color 0.14s, box-shadow 0.14s",
        }}
        onFocus={e => { e.target.style.borderColor = "rgba(139,92,246,0.4)"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.08)"; }}
        onBlur={e =>  { e.target.style.borderColor = "#1e1e1e";             e.target.style.boxShadow = "none"; }}
      />
    )}
    {hint && <p style={{ fontSize: "10px", color: "#333333", fontFamily: "'Geist', sans-serif" }}>{hint}</p>}
  </div>
);

// ── Section wrapper ───────────────────────────────────────────
const Section = ({ title, children, onAdd, addLabel, collapsible = true, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      background: "#111111", border: "1px solid #1a1a1a",
      borderRadius: "10px", overflow: "hidden",
      marginBottom: "8px",
    }}>
      <div
        onClick={() => collapsible && setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 14px",
          cursor: collapsible ? "pointer" : "default",
          borderBottom: open ? "1px solid #1a1a1a" : "none",
          transition: "background 0.12s",
          userSelect: "none",
        }}
        onMouseEnter={e => { if (collapsible) e.currentTarget.style.background = "#161616"; }}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#cccccc", letterSpacing: "-0.01em" }}>{title}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {onAdd && open && (
            <button
              onClick={e => { e.stopPropagation(); onAdd(); }}
              style={{
                display: "flex", alignItems: "center", gap: "4px",
                padding: "3px 9px", borderRadius: "6px",
                background: "rgba(139,92,246,0.1)",
                border: "1px solid rgba(139,92,246,0.2)",
                color: "#c4b5fd", fontSize: "11px", fontWeight: 500,
                cursor: "pointer", fontFamily: "'Geist', sans-serif",
                transition: "background 0.12s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(139,92,246,0.18)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(139,92,246,0.1)"}
            >
              <PlusIcon /> {addLabel || "Add"}
            </button>
          )}
          {collapsible && <span style={{ color: "#333333" }}><ChevronIcon open={open} /></span>}
        </div>
      </div>
      {open && <div style={{ padding: "14px" }}>{children}</div>}
    </div>
  );
};

// ── Entry card (experience, education, project, cert) ─────────
const EntryCard = ({ children, onDelete, title }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#0d0d0d", border: "1px solid #161616",
        borderRadius: "8px", padding: "12px",
        marginBottom: "8px", position: "relative",
        transition: "border-color 0.14s",
        borderColor: hovered ? "#222222" : "#161616",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <span style={{ color: "#333333", cursor: "grab" }}><DragIcon /></span>
          <span style={{ fontSize: "11px", color: "#444444", fontWeight: 500 }}>{title || "Entry"}</span>
        </div>
        <button
          onClick={onDelete}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "24px", height: "24px", borderRadius: "6px",
            background: "transparent", border: "1px solid transparent",
            color: "#333333", cursor: "pointer",
            transition: "all 0.12s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)"; e.currentTarget.style.color = "#ef4444"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.color = "#333333"; }}
        >
          <TrashIcon />
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        {children}
      </div>
    </div>
  );
};

// ── LIVE PREVIEW ──────────────────────────────────────────────
const ResumePreview = ({ data, template }) => {
  const { personalInfo: p, experience, education, skills, projects, certifications } = data;

  const styles = {
    modern: {
      root:         { fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "9.5pt", lineHeight: "1.45", color: "#111", background: "#fff", padding: "32px 36px", minHeight: "297mm", boxSizing: "border-box" },
      name:         { fontSize: "20pt", fontWeight: "700", letterSpacing: "-0.02em", color: "#111", marginBottom: "4px" },
      contact:      { fontSize: "8.5pt", color: "#555", display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "12px", fontFamily: "Arial, sans-serif" },
      sectionTitle: { fontSize: "9pt", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: "#444", borderBottom: "1px solid #ddd", paddingBottom: "3px", marginBottom: "8px", marginTop: "14px", fontFamily: "Arial, sans-serif" },
      jobTitle:     { fontSize: "10pt", fontWeight: "700", color: "#111" },
      company:      { fontSize: "9pt", color: "#555" },
      date:         { fontSize: "8.5pt", color: "#777", fontFamily: "Arial, sans-serif" },
      bullet:       { fontSize: "9.5pt", color: "#333", lineHeight: "1.5", marginBottom: "2px" },
      summary:      { fontSize: "9.5pt", color: "#333", lineHeight: "1.6", marginBottom: "10px" },
      skill:        { display: "inline-block", padding: "1px 8px", borderRadius: "3px", background: "#f4f4f4", fontSize: "8.5pt", color: "#333", marginRight: "5px", marginBottom: "4px", border: "1px solid #e8e8e8" },
    },
    minimal: {
      root:         { fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "9pt", lineHeight: "1.5", color: "#1a1a1a", background: "#fff", padding: "36px 40px", minHeight: "297mm", boxSizing: "border-box" },
      name:         { fontSize: "18pt", fontWeight: "400", letterSpacing: "-0.03em", color: "#000", marginBottom: "3px" },
      contact:      { fontSize: "8pt", color: "#666", display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "14px" },
      sectionTitle: { fontSize: "8pt", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.12em", color: "#999", borderBottom: "none", borderLeft: "2px solid #1a1a1a", paddingLeft: "8px", marginBottom: "8px", marginTop: "16px" },
      jobTitle:     { fontSize: "10pt", fontWeight: "600", color: "#1a1a1a" },
      company:      { fontSize: "9pt", color: "#666" },
      date:         { fontSize: "8pt", color: "#999" },
      bullet:       { fontSize: "9pt", color: "#333", lineHeight: "1.6", marginBottom: "2px" },
      summary:      { fontSize: "9pt", color: "#444", lineHeight: "1.7", marginBottom: "12px" },
      skill:        { display: "inline-block", fontSize: "8.5pt", color: "#444", marginRight: "12px", marginBottom: "4px" },
    },
    classic: {
      root:         { fontFamily: "Georgia, serif", fontSize: "9.5pt", lineHeight: "1.45", color: "#111", background: "#fff", padding: "28px 32px", minHeight: "297mm", boxSizing: "border-box" },
      name:         { fontSize: "20pt", fontWeight: "700", textAlign: "center", color: "#000", marginBottom: "2px" },
      contact:      { fontSize: "8.5pt", color: "#555", display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "10px" },
      sectionTitle: { fontSize: "10pt", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: "#000", borderBottom: "2px solid #000", paddingBottom: "2px", marginBottom: "8px", marginTop: "14px" },
      jobTitle:     { fontSize: "10pt", fontWeight: "700", color: "#000" },
      company:      { fontSize: "9pt", color: "#444", fontStyle: "italic" },
      date:         { fontSize: "8.5pt", color: "#666" },
      bullet:       { fontSize: "9.5pt", color: "#222", lineHeight: "1.5", marginBottom: "2px" },
      summary:      { fontSize: "9.5pt", color: "#333", lineHeight: "1.6", textAlign: "justify", marginBottom: "10px" },
      skill:        { display: "inline-block", fontSize: "9pt", color: "#222", marginRight: "10px", marginBottom: "3px" },
    },
  };

  const s = styles[template] || styles.modern;

  const Bullet = ({ text }) => (
    <div style={{ display: "flex", gap: "6px", alignItems: "flex-start", ...s.bullet }}>
      <span style={{ marginTop: "4px", flexShrink: 0 }}>•</span>
      <span>{text}</span>
    </div>
  );

  return (
    <div style={s.root}>
      {/* Header */}
      {p.name && <div style={s.name}>{p.name}</div>}
      <div style={s.contact}>
        {p.email    && <span>{p.email}</span>}
        {p.phone    && <span>{p.phone}</span>}
        {p.location && <span>{p.location}</span>}
        {p.linkedin && <span>{p.linkedin}</span>}
        {p.github   && <span>{p.github}</span>}
        {p.website  && <span>{p.website}</span>}
      </div>

      {/* Summary */}
      {p.summary && (
        <>
          <div style={s.sectionTitle}>Summary</div>
          <div style={s.summary}>{p.summary}</div>
        </>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <>
          <div style={s.sectionTitle}>Experience</div>
          {experience.map(exp => (
            <div key={exp.id} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span style={s.jobTitle}>{exp.title}</span>
                  {exp.company && <span style={{ ...s.company, marginLeft: "6px" }}>· {exp.company}</span>}
                  {exp.location && <span style={{ ...s.date, marginLeft: "6px" }}>· {exp.location}</span>}
                </div>
                <span style={s.date}>{[exp.startDate, exp.endDate || (exp.current ? "Present" : "")].filter(Boolean).join(" – ")}</span>
              </div>
              {exp.bullets?.filter(b => b.trim()).map((b, i) => <Bullet key={i} text={b} />)}
            </div>
          ))}
        </>
      )}

      {/* Education */}
      {education.length > 0 && (
        <>
          <div style={s.sectionTitle}>Education</div>
          {education.map(edu => (
            <div key={edu.id} style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <span style={s.jobTitle}>{edu.degree}{edu.field ? `, ${edu.field}` : ""}</span>
                  {edu.school && <span style={{ ...s.company, marginLeft: "6px" }}>· {edu.school}</span>}
                </div>
                <span style={s.date}>{[edu.startDate, edu.endDate].filter(Boolean).join(" – ")}</span>
              </div>
              {edu.gpa && <div style={{ ...s.date, marginTop: "1px" }}>GPA: {edu.gpa}</div>}
            </div>
          ))}
        </>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <>
          <div style={s.sectionTitle}>Projects</div>
          {projects.map(proj => (
            <div key={proj.id} style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span style={s.jobTitle}>{proj.name}</span>
                  {proj.tech && <span style={{ ...s.company, marginLeft: "6px" }}>· {proj.tech}</span>}
                </div>
                {proj.link && <span style={{ ...s.date, color: "#2563eb" }}>{proj.link}</span>}
              </div>
              {proj.description && <div style={{ ...s.bullet, marginTop: "2px" }}>{proj.description}</div>}
              {proj.bullets?.filter(b => b.trim()).map((b, i) => <Bullet key={i} text={b} />)}
            </div>
          ))}
        </>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <>
          <div style={s.sectionTitle}>Skills</div>
          <div style={{ marginBottom: "6px" }}>
            {skills.map((cat, i) => (
              <div key={i} style={{ marginBottom: "4px" }}>
                {cat.category && (
                  <span style={{ ...s.date, fontWeight: "600", marginRight: "6px" }}>{cat.category}:</span>
                )}
                {cat.items?.filter(Boolean).map((sk, j) => (
                  <span key={j} style={s.skill}>{sk}</span>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <>
          <div style={s.sectionTitle}>Certifications</div>
          {certifications.map(cert => (
            <div key={cert.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={s.bullet}>{cert.name}{cert.issuer ? ` · ${cert.issuer}` : ""}</span>
              {cert.date && <span style={s.date}>{cert.date}</span>}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

// ── Toast ────────────────────────────────────────────────────
const Toast = ({ msg, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: "fixed", bottom: "24px", right: "24px", zIndex: 999,
      display: "flex", alignItems: "center", gap: "10px",
      padding: "10px 14px",
      background: "#161616", border: "1px solid #222222",
      borderRadius: "8px", boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
      animation: "fadeUp 0.2s ease both", maxWidth: "300px",
    }}>
      <div style={{ width: "5px", height: "5px", borderRadius: "50%", flexShrink: 0, background: type === "success" ? "#22c55e" : type === "error" ? "#ef4444" : "#8b5cf6" }} />
      <span style={{ fontSize: "12px", color: "#cccccc", flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: "14px", lineHeight: 1 }}>×</button>
    </div>
  );
};

// ── ScaledA4: renders A4 at true size, scaled down to fit container ──
const A4_WIDTH_PX = 794; // 210mm at 96dpi

const ScaledA4 = ({ previewRef, resume, template, previewMode }) => {
  const containerRef = React.useRef();
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const available = containerRef.current.parentElement?.clientWidth || 600;
      const padding = 48; // 24px each side
      const usable = available - padding;
      const newScale = Math.min(1, usable / A4_WIDTH_PX);
      setScale(newScale);
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current?.parentElement) ro.observe(containerRef.current.parentElement);
    return () => ro.disconnect();
  }, [previewMode]);

  return (
    <div
      ref={containerRef}
      style={{
        width: A4_WIDTH_PX * scale,
        height: "auto",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: A4_WIDTH_PX,
          transformOrigin: "top left",
          transform: `scale(${scale})`,
          boxShadow: "0 8px 40px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.3)",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div ref={previewRef}>
          <ResumePreview data={resume} template={template} />
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────
const ResumeBuilderPage = () => {
  const [resume,   setResume]   = useState(defaultResume());
  const [template, setTemplate] = useState("modern");
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [toast,    setToast]    = useState(null);
  const [resumes,  setResumes]  = useState([]);
  const [importing,setImporting]= useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const previewRef = useRef();

  const showToast = (msg, type = "info") => setToast({ msg, type });

  // Load saved resumes for import
  useEffect(() => {
    api.get("/resumes").then(r => setResumes(r.data.resumes || [])).catch(() => {});
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem("vm_builder_draft", JSON.stringify(resume));
  }, [resume]);

  // Restore draft
  useEffect(() => {
    try {
      const draft = localStorage.getItem("vm_builder_draft");
      if (draft) setResume(JSON.parse(draft));
    } catch {}
  }, []);

  // ── Helpers ───────────────────────────────────────────────
  const updatePersonal = (field, val) =>
    setResume(r => ({ ...r, personalInfo: { ...r.personalInfo, [field]: val } }));

  const updateSection = (section, id, field, val) =>
    setResume(r => ({
      ...r,
      [section]: r[section].map(item => item.id === id ? { ...item, [field]: val } : item),
    }));

  const addToSection = (section, template) =>
    setResume(r => ({ ...r, [section]: [...r[section], { id: uid(), ...template }] }));

  const removeFromSection = (section, id) =>
    setResume(r => ({ ...r, [section]: r[section].filter(i => i.id !== id) }));

  // Import from parsed resume
  const importFromResume = async (resumeId) => {
    setImporting(true);
    try {
      const res = await api.get(`/resumes/${resumeId}`);
      const d   = res.data?.resume?.parsedData || res.data?.parsedData;
      if (!d) { showToast("No parsed data found.", "error"); return; }

      setResume({
        personalInfo: {
          name:     d.contactInfo?.name     || d.name     || "",
          email:    d.contactInfo?.email    || d.email    || "",
          phone:    d.contactInfo?.phone    || d.phone    || "",
          location: d.contactInfo?.location || d.location || "",
          linkedin: d.contactInfo?.linkedin || "",
          github:   d.contactInfo?.github   || "",
          website:  d.contactInfo?.website  || "",
          summary:  d.summary               || "",
        },
        experience: (d.experience || []).map(e => ({
          id: uid(), title: e.title || e.role || "", company: e.company || "",
          location: e.location || "", startDate: e.startDate || e.start || "",
          endDate: e.endDate || e.end || "", current: e.current || false,
          bullets: Array.isArray(e.description)
            ? e.description
            : (e.description || "").split("\n").filter(Boolean),
        })),
        education: (d.education || []).map(e => ({
          id: uid(), degree: e.degree || "", field: e.field || e.major || "",
          school: e.institution || e.school || "",
          startDate: e.startDate || e.start || "",
          endDate: e.endDate || e.end || e.graduationDate || "",
          gpa: e.gpa || "",
        })),
        skills: (d.skills || []).length > 0
          ? [{ category: "Technical", items: d.skills.map(s => typeof s === "string" ? s : s.name) }]
          : [],
        projects: (d.projects || []).map(p => ({
          id: uid(), name: p.name || "", tech: p.technologies?.join(", ") || p.tech || "",
          description: p.description || "",
          link: p.link || p.url || "",
          bullets: [],
        })),
        certifications: (d.certifications || []).map(c => ({
          id: uid(), name: c.name || c, issuer: c.issuer || "", date: c.date || "",
        })),
      });
      showToast("Resume imported successfully.", "success");
    } catch { showToast("Import failed. Try again.", "error"); }
    finally { setImporting(false); }
  };

  // Save
  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post("/builder/save", { resumeData: resume, template });
      setSaved(true);
      showToast("Saved successfully.", "success");
      setTimeout(() => setSaved(false), 3000);
    } catch { showToast("Save failed. Try again.", "error"); }
    finally { setSaving(false); }
  };

  // Download PDF (print)
  const handleDownload = () => {
    const content = previewRef.current?.innerHTML;
    if (!content) return;
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>${resume.personalInfo.name || "Resume"}</title>
      <style>
        @page { margin: 0; size: A4; }
        body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
        * { box-sizing: border-box; }
      </style></head>
      <body>${content}</body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const s = resume;
  const completeness = [
    s.personalInfo.name, s.personalInfo.email, s.personalInfo.summary,
    s.experience.length, s.education.length, s.skills.length,
  ].filter(Boolean).length;
  const completePct = Math.round((completeness / 6) * 100);

  return (
    <DashboardLayout>
      <div style={{ display: "flex", height: "calc(100vh - 52px)", overflow: "hidden", position: "relative" }}>

        {/* ── LEFT PANEL — Editor ─────────────────────────────── */}
        <div style={{
          width: previewMode ? "0" : "440px",
          minWidth: previewMode ? "0" : "440px",
          height: "100%", overflowY: "auto",
          borderRight: "1px solid #1a1a1a",
          background: "#0a0a0a",
          transition: "width 0.25s ease, min-width 0.25s ease",
          display: "flex", flexDirection: "column",
        }}>

          {/* Editor header */}
          <div style={{
            padding: "16px 16px 12px",
            borderBottom: "1px solid #1a1a1a",
            position: "sticky", top: 0, background: "#0a0a0a", zIndex: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <div>
                <h1 style={{ fontSize: "15px", fontWeight: 700, color: "#eeeeee", letterSpacing: "-0.03em", margin: 0 }}>
                  Resume Builder
                </h1>
                <p style={{ fontSize: "11px", color: "#444444", marginTop: "2px" }}>
                  Build once, export anywhere
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  onClick={handleSave} disabled={saving}
                  style={{
                    display: "flex", alignItems: "center", gap: "5px",
                    padding: "6px 10px",
                    background: saved ? "rgba(34,197,94,0.1)" : "rgba(139,92,246,0.1)",
                    border: `1px solid ${saved ? "rgba(34,197,94,0.2)" : "rgba(139,92,246,0.2)"}`,
                    borderRadius: "7px",
                    color: saved ? "#4ade80" : "#c4b5fd",
                    fontSize: "12px", fontWeight: 500, cursor: "pointer",
                    fontFamily: "'Geist', sans-serif", transition: "all 0.14s",
                  }}
                >
                  {saving ? <SpinIcon /> : saved ? <CheckIcon /> : <SaveIcon />}
                  {saving ? "Saving…" : saved ? "Saved" : "Save"}
                </button>
                <button
                  onClick={handleDownload}
                  style={{
                    display: "flex", alignItems: "center", gap: "5px",
                    padding: "6px 10px",
                    background: "#161616", border: "1px solid #222222",
                    borderRadius: "7px", color: "#888888",
                    fontSize: "12px", fontWeight: 500, cursor: "pointer",
                    fontFamily: "'Geist', sans-serif", transition: "all 0.14s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#1a1a1a"; e.currentTarget.style.color = "#eeeeee"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#161616"; e.currentTarget.style.color = "#888888"; }}
                >
                  <DownloadIcon /> PDF
                </button>
              </div>
            </div>

            {/* Completeness bar */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ flex: 1, height: "2px", background: "#1a1a1a", borderRadius: "99px", overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${completePct}%`,
                  background: completePct === 100 ? "#22c55e" : "#8b5cf6",
                  borderRadius: "99px", transition: "width 0.4s ease",
                }} />
              </div>
              <span style={{ fontSize: "10px", fontFamily: "'Geist Mono', monospace", color: "#444444", whiteSpace: "nowrap" }}>
                {completePct}% complete
              </span>
            </div>
          </div>

          {/* Import strip */}
          {resumes.filter(r => r.isParsed).length > 0 && (
            <div style={{ padding: "10px 16px", borderBottom: "1px solid #1a1a1a" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "8px 10px",
                background: "rgba(139,92,246,0.06)",
                border: "1px solid rgba(139,92,246,0.15)",
                borderRadius: "8px",
              }}>
                <div style={{ width: "13px", height: "13px", borderRadius: "50%", background: "#8b5cf6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <SparkIcon />
                </div>
                <span style={{ fontSize: "11px", color: "#888888", flex: 1 }}>Import data from a parsed resume</span>
                <select
                  onChange={e => { if (e.target.value) importFromResume(e.target.value); e.target.value = ""; }}
                  disabled={importing}
                  style={{
                    background: "#161616", border: "1px solid #222222",
                    borderRadius: "6px", color: "#c4b5fd",
                    fontSize: "11px", padding: "4px 8px",
                    cursor: "pointer", fontFamily: "'Geist', sans-serif",
                    outline: "none",
                  }}
                >
                  <option value="">{importing ? "Importing…" : "Choose resume"}</option>
                  {resumes.filter(r => r.isParsed).map(r => (
                    <option key={r._id} value={r._id}>{r.label || r.originalName}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Sections */}
          <div style={{ padding: "12px 16px", flex: 1 }}>

            {/* ── Personal Info ──────────────────────────────── */}
            <Section title="Personal Info" collapsible defaultOpen>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <Field label="Full Name"  value={s.personalInfo.name}     onChange={v => updatePersonal("name", v)}     placeholder="Harsh Kumar Yadav" />
                  <Field label="Email"      value={s.personalInfo.email}    onChange={v => updatePersonal("email", v)}    placeholder="harsh@gmail.com" />
                  <Field label="Phone"      value={s.personalInfo.phone}    onChange={v => updatePersonal("phone", v)}    placeholder="+91 98765 43210" />
                  <Field label="Location"   value={s.personalInfo.location} onChange={v => updatePersonal("location", v)} placeholder="Varanasi, India" />
                  <Field label="LinkedIn"   value={s.personalInfo.linkedin} onChange={v => updatePersonal("linkedin", v)} placeholder="linkedin.com/in/harsh" />
                  <Field label="GitHub"     value={s.personalInfo.github}   onChange={v => updatePersonal("github", v)}   placeholder="github.com/harsh" />
                </div>
                <Field label="Summary" value={s.personalInfo.summary} onChange={v => updatePersonal("summary", v)}
                  placeholder="2–3 sentences about your background, key skills, and what you're looking for."
                  multiline rows={3}
                  hint="Tip: Start with your title, years of experience, and 2 key strengths." />
              </div>
            </Section>

            {/* ── Experience ─────────────────────────────────── */}
            <Section title="Experience" onAdd={() => addToSection("experience", {
              title: "", company: "", location: "", startDate: "", endDate: "", current: false,
              bullets: [""],
            })} addLabel="Add role">
              {s.experience.length === 0 ? (
                <p style={{ fontSize: "11px", color: "#333333", padding: "4px 0" }}>No experience added yet.</p>
              ) : s.experience.map(exp => (
                <EntryCard key={exp.id} title={exp.title || exp.company || "New role"} onDelete={() => removeFromSection("experience", exp.id)}>
                  <Field label="Job Title"   value={exp.title}     onChange={v => updateSection("experience", exp.id, "title", v)}     placeholder="Software Engineer" />
                  <Field label="Company"     value={exp.company}   onChange={v => updateSection("experience", exp.id, "company", v)}   placeholder="Google" />
                  <Field label="Location"    value={exp.location}  onChange={v => updateSection("experience", exp.id, "location", v)}  placeholder="Remote / Mumbai" />
                  <Field label="Start Date"  value={exp.startDate} onChange={v => updateSection("experience", exp.id, "startDate", v)} placeholder="Jun 2022" />
                  <Field label="End Date"    value={exp.current ? "Present" : exp.endDate} onChange={v => updateSection("experience", exp.id, "endDate", v)} placeholder="Present" />
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ fontSize: "11px", color: "#666666", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", marginBottom: "8px" }}>
                      <input type="checkbox" checked={exp.current} onChange={e => updateSection("experience", exp.id, "current", e.target.checked)} style={{ accentColor: "#8b5cf6" }} />
                      Currently working here
                    </label>
                    <label style={{ fontSize: "11px", fontWeight: 500, color: "#666666", display: "block", marginBottom: "5px" }}>Bullet points</label>
                    {(exp.bullets || [""]).map((b, bi) => (
                      <div key={bi} style={{ display: "flex", gap: "6px", marginBottom: "5px", alignItems: "flex-start" }}>
                        <span style={{ color: "#444", fontSize: "12px", marginTop: "7px", flexShrink: 0 }}>•</span>
                        <input
                          type="text" value={b}
                          onChange={e => {
                            const nb = [...exp.bullets]; nb[bi] = e.target.value;
                            updateSection("experience", exp.id, "bullets", nb);
                          }}
                          onKeyDown={e => {
                            if (e.key === "Enter") { e.preventDefault(); const nb = [...exp.bullets]; nb.splice(bi + 1, 0, ""); updateSection("experience", exp.id, "bullets", nb); }
                            if (e.key === "Backspace" && b === "" && exp.bullets.length > 1) { const nb = exp.bullets.filter((_, i) => i !== bi); updateSection("experience", exp.id, "bullets", nb); }
                          }}
                          placeholder={bi === 0 ? "Reduced page load time by 40% using lazy loading and code splitting." : "Add another achievement…"}
                          style={{
                            flex: 1, background: "#0d0d0d", border: "1px solid #1e1e1e",
                            borderRadius: "6px", padding: "6px 8px",
                            color: "#eeeeee", fontFamily: "'Geist', sans-serif", fontSize: "11px",
                            outline: "none",
                          }}
                          onFocus={e => e.target.style.borderColor = "rgba(139,92,246,0.4)"}
                          onBlur={e =>  e.target.style.borderColor = "#1e1e1e"}
                        />
                        {exp.bullets.length > 1 && (
                          <button onClick={() => { const nb = exp.bullets.filter((_, i) => i !== bi); updateSection("experience", exp.id, "bullets", nb); }}
                            style={{ background: "none", border: "none", color: "#333", cursor: "pointer", padding: "4px", marginTop: "3px" }}>×</button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => updateSection("experience", exp.id, "bullets", [...(exp.bullets || []), ""])}
                      style={{
                        display: "flex", alignItems: "center", gap: "4px",
                        fontSize: "10px", color: "#555555", background: "none",
                        border: "none", cursor: "pointer", fontFamily: "'Geist', sans-serif",
                        padding: "2px 0", marginTop: "2px",
                        transition: "color 0.12s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = "#8b5cf6"}
                      onMouseLeave={e => e.currentTarget.style.color = "#555555"}
                    >
                      <PlusIcon /> Add bullet
                    </button>
                  </div>
                </EntryCard>
              ))}
            </Section>

            {/* ── Education ──────────────────────────────────── */}
            <Section title="Education" onAdd={() => addToSection("education", {
              degree: "", field: "", school: "", startDate: "", endDate: "", gpa: "",
            })} addLabel="Add education">
              {s.education.length === 0 ? (
                <p style={{ fontSize: "11px", color: "#333333", padding: "4px 0" }}>No education added yet.</p>
              ) : s.education.map(edu => (
                <EntryCard key={edu.id} title={edu.degree || edu.school || "New education"} onDelete={() => removeFromSection("education", edu.id)}>
                  <Field label="Degree"     value={edu.degree}    onChange={v => updateSection("education", edu.id, "degree", v)}    placeholder="B.Tech" />
                  <Field label="Field"      value={edu.field}     onChange={v => updateSection("education", edu.id, "field", v)}     placeholder="Computer Science" />
                  <Field label="School"     value={edu.school}    onChange={v => updateSection("education", edu.id, "school", v)}    placeholder="IIT Bombay" />
                  <Field label="GPA"        value={edu.gpa}       onChange={v => updateSection("education", edu.id, "gpa", v)}       placeholder="8.4 / 10" />
                  <Field label="Start Year" value={edu.startDate} onChange={v => updateSection("education", edu.id, "startDate", v)} placeholder="2020" />
                  <Field label="End Year"   value={edu.endDate}   onChange={v => updateSection("education", edu.id, "endDate", v)}   placeholder="2024" />
                </EntryCard>
              ))}
            </Section>

            {/* ── Projects ───────────────────────────────────── */}
            <Section title="Projects" onAdd={() => addToSection("projects", {
              name: "", tech: "", description: "", link: "", bullets: [""],
            })} addLabel="Add project">
              {s.projects.length === 0 ? (
                <p style={{ fontSize: "11px", color: "#333333", padding: "4px 0" }}>No projects added yet.</p>
              ) : s.projects.map(proj => (
                <EntryCard key={proj.id} title={proj.name || "New project"} onDelete={() => removeFromSection("projects", proj.id)}>
                  <Field label="Project Name" value={proj.name}        onChange={v => updateSection("projects", proj.id, "name", v)}        placeholder="VidyaMitra" />
                  <Field label="Tech Stack"   value={proj.tech}        onChange={v => updateSection("projects", proj.id, "tech", v)}        placeholder="React, Node.js, MongoDB" />
                  <Field label="Link / URL"   value={proj.link}        onChange={v => updateSection("projects", proj.id, "link", v)}        placeholder="github.com/harsh/project" />
                  <div />
                  <div style={{ gridColumn: "span 2" }}>
                    <Field label="Description" value={proj.description} onChange={v => updateSection("projects", proj.id, "description", v)} placeholder="One-line description of what you built and its impact." multiline rows={2} />
                  </div>
                </EntryCard>
              ))}
            </Section>

            {/* ── Skills ─────────────────────────────────────── */}
            <Section title="Skills" onAdd={() => addToSection("skills", { category: "", items: [""] })} addLabel="Add category">
              {s.skills.length === 0 ? (
                <p style={{ fontSize: "11px", color: "#333333", padding: "4px 0" }}>No skills added yet.</p>
              ) : s.skills.map((cat, ci) => (
                <div key={ci} style={{ background: "#0d0d0d", border: "1px solid #161616", borderRadius: "8px", padding: "10px", marginBottom: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <Field label="Category" value={cat.category} onChange={v => {
                      const ns = [...s.skills]; ns[ci] = { ...ns[ci], category: v }; setResume(r => ({ ...r, skills: ns }));
                    }} placeholder="e.g. Languages / Frameworks / Tools" />
                    <button onClick={() => removeFromSection("skills", cat.id || ci)}
                      style={{ background: "none", border: "none", color: "#333", cursor: "pointer", padding: "4px", marginTop: "14px", marginLeft: "8px" }}>×</button>
                  </div>
                  <label style={{ fontSize: "11px", color: "#666666", display: "block", marginBottom: "5px" }}>Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={cat.items?.join(", ") || ""}
                    onChange={e => {
                      const ns = [...s.skills];
                      ns[ci] = { ...ns[ci], items: e.target.value.split(",").map(x => x.trimStart()) };
                      setResume(r => ({ ...r, skills: ns }));
                    }}
                    placeholder="React, TypeScript, Node.js, MongoDB, Docker"
                    style={{
                      width: "100%", background: "#111111", border: "1px solid #1e1e1e",
                      borderRadius: "6px", padding: "7px 10px",
                      color: "#eeeeee", fontFamily: "'Geist', sans-serif", fontSize: "11px",
                      outline: "none",
                    }}
                    onFocus={e => e.target.style.borderColor = "rgba(139,92,246,0.4)"}
                    onBlur={e =>  e.target.style.borderColor = "#1e1e1e"}
                  />
                </div>
              ))}
            </Section>

            {/* ── Certifications ─────────────────────────────── */}
            <Section title="Certifications" onAdd={() => addToSection("certifications", { name: "", issuer: "", date: "" })} addLabel="Add cert">
              {s.certifications.length === 0 ? (
                <p style={{ fontSize: "11px", color: "#333333", padding: "4px 0" }}>No certifications added yet.</p>
              ) : s.certifications.map(cert => (
                <EntryCard key={cert.id} title={cert.name || "New cert"} onDelete={() => removeFromSection("certifications", cert.id)}>
                  <Field label="Certificate Name" value={cert.name}   onChange={v => updateSection("certifications", cert.id, "name", v)}   placeholder="AWS Solutions Architect" />
                  <Field label="Issuer"            value={cert.issuer} onChange={v => updateSection("certifications", cert.id, "issuer", v)} placeholder="Amazon Web Services" />
                  <Field label="Date"              value={cert.date}   onChange={v => updateSection("certifications", cert.id, "date", v)}   placeholder="Jan 2024" />
                </EntryCard>
              ))}
            </Section>

          </div>
        </div>

        {/* ── RIGHT PANEL — Preview ───────────────────────────── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#080808", overflow: "hidden", minWidth: 0 }}>

          {/* Preview toolbar */}
          <div style={{
            height: "52px", minHeight: "52px",
            borderBottom: "1px solid #1a1a1a",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 20px", gap: "12px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {/* Template selector */}
              <span style={{ fontSize: "11px", color: "#444444", fontFamily: "'Geist Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>Template</span>
              {["modern", "minimal", "classic"].map(t => (
                <button key={t} onClick={() => setTemplate(t)} style={{
                  padding: "4px 12px", borderRadius: "6px",
                  fontSize: "11px", fontWeight: 500, cursor: "pointer",
                  fontFamily: "'Geist', sans-serif", border: "1px solid",
                  background: template === t ? "rgba(139,92,246,0.1)" : "transparent",
                  borderColor: template === t ? "rgba(139,92,246,0.25)" : "#1e1e1e",
                  color: template === t ? "#c4b5fd" : "#555555",
                  transition: "all 0.14s", textTransform: "capitalize",
                }}>
                  {t}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button onClick={() => setPreviewMode(p => !p)} style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "5px 10px", borderRadius: "6px",
                background: previewMode ? "rgba(139,92,246,0.1)" : "transparent",
                border: `1px solid ${previewMode ? "rgba(139,92,246,0.2)" : "#1e1e1e"}`,
                color: previewMode ? "#c4b5fd" : "#555555",
                fontSize: "11px", cursor: "pointer",
                fontFamily: "'Geist', sans-serif",
              }}>
                <EyeIcon /> {previewMode ? "Show editor" : "Focus preview"}
              </button>
              <button onClick={handleDownload} style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "5px 10px", borderRadius: "6px",
                background: "#8b5cf6", border: "none",
                color: "#fff", fontSize: "11px", cursor: "pointer",
                fontFamily: "'Geist', sans-serif",
                transition: "background 0.14s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#7c3aed"}
                onMouseLeave={e => e.currentTarget.style.background = "#8b5cf6"}
              >
                <DownloadIcon /> Export PDF
              </button>
            </div>
          </div>

          {/* A4 preview — scales to fit available width */}
          <div style={{ flex: 1, overflow: "auto", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "32px 24px", background: "#0a0a0a" }}>
            <ScaledA4 previewRef={previewRef} resume={resume} template={template} previewMode={previewMode} />
          </div>
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <style>{`
        @keyframes fadeUp  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin    { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        textarea::-webkit-scrollbar { width: 3px; }
        textarea::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 99px; }
      `}</style>
    </DashboardLayout>
  );
};

export default ResumeBuilderPage;