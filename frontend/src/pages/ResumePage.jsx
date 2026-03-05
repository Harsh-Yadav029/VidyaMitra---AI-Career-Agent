import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import api from "../services/api";

// ── Icons ────────────────────────────────────────────────────
const FileIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const UploadIcon  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const StarIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const TrashIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
const EyeIcon     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const ArrowIcon   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const CheckIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const SpinIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.2"/><path d="M21 12a9 9 0 00-9-9"/></svg>;
const CloseIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const InfoIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;

// ── Helpers ──────────────────────────────────────────────────
const fmt = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const timeAgo = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60)     return "just now";
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

// ── Score ring (mini) ────────────────────────────────────────
const MiniRing = ({ score, size = 36 }) => {
  const r = (size - 4) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - ((score || 0) / 100) * circ;
  const color = score >= 80 ? "#8b5cf6" : score >= 60 ? "#3b82f6" : score >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1a1a1a" strokeWidth="3"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}/>
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "10px", fontWeight: 700,
        fontFamily: "'Geist', sans-serif",
        color: "#eeeeee", letterSpacing: "-0.02em",
      }}>{score ?? "—"}</div>
    </div>
  );
};

// ── Toast ────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const colors = { success: "#22c55e", error: "#ef4444", info: "#8b5cf6" };
  return (
    <div style={{
      position: "fixed", bottom: "24px", right: "24px", zIndex: 999,
      display: "flex", alignItems: "center", gap: "10px",
      padding: "12px 16px",
      background: "#161616", border: "1px solid #222222",
      borderRadius: "9px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
      animation: "fadeUp 0.25s ease both",
      maxWidth: "320px",
    }}>
      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: colors[type] || colors.info, flexShrink: 0 }} />
      <span style={{ fontSize: "13px", color: "#cccccc", flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", padding: "2px" }}><CloseIcon /></button>
    </div>
  );
};

// ── Delete confirm modal ─────────────────────────────────────
const DeleteModal = ({ resume, onConfirm, onCancel, loading }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 200,
    background: "rgba(0,0,0,0.7)",
    display: "flex", alignItems: "center", justifyContent: "center",
    animation: "fadeIn 0.15s ease",
  }}>
    <div style={{
      background: "#111111", border: "1px solid #1e1e1e",
      borderRadius: "12px", padding: "24px",
      width: "360px",
      boxShadow: "0 24px 48px rgba(0,0,0,0.6)",
      animation: "fadeUp 0.2s ease both",
    }}>
      <div style={{
        width: "36px", height: "36px", borderRadius: "9px",
        background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#ef4444", marginBottom: "14px",
      }}><TrashIcon /></div>
      <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#eeeeee", letterSpacing: "-0.02em", marginBottom: "6px" }}>
        Delete resume?
      </h3>
      <p style={{ fontSize: "13px", color: "#555555", marginBottom: "20px", lineHeight: 1.55 }}>
        <span style={{ color: "#888888" }}>"{resume?.label || resume?.originalName}"</span> will be permanently deleted. This cannot be undone.
      </p>
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={onCancel} className="vm-btn-ghost" style={{ flex: 1 }}>Cancel</button>
        <button onClick={onConfirm} disabled={loading} style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          padding: "9px 18px",
          background: "rgba(239,68,68,0.15)", color: "#ef4444",
          border: "1px solid rgba(239,68,68,0.25)", borderRadius: "8px",
          fontSize: "13px", fontWeight: 500, cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "'Geist', sans-serif", opacity: loading ? 0.6 : 1,
          transition: "background 0.14s",
        }}>
          {loading ? <SpinIcon /> : <TrashIcon />} Delete
        </button>
      </div>
    </div>
  </div>
);

// ── Resume card ──────────────────────────────────────────────
const ResumeCard = ({ resume, onDelete, onScore, index }) => {
  const [hovered, setHovered] = useState(false);

  const scoreColor = resume.score >= 80 ? "#8b5cf6"
    : resume.score >= 60 ? "#3b82f6"
    : resume.score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#111111",
        border: `1px solid ${hovered ? "#222222" : "#1a1a1a"}`,
        borderRadius: "10px",
        padding: "16px",
        display: "flex", flexDirection: "column", gap: "14px",
        transition: "border-color 0.15s, box-shadow 0.15s, transform 0.15s",
        boxShadow: hovered ? "0 4px 16px rgba(0,0,0,0.4)" : "0 1px 3px rgba(0,0,0,0.3)",
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
        animation: `fadeUp 0.35s ease both`,
        animationDelay: `${index * 60}ms`,
      }}>

      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        {/* File icon */}
        <div style={{
          width: "36px", height: "36px", borderRadius: "8px",
          background: "#161616", border: "1px solid #1e1e1e",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#555555", flexShrink: 0,
        }}>
          <FileIcon />
        </div>

        {/* Name + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: "13px", fontWeight: 500, color: "#dddddd",
            letterSpacing: "-0.01em",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            marginBottom: "4px",
          }}>
            {resume.label || resume.originalName}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {resume.fileSize && (
              <span style={{ fontSize: "10px", fontFamily: "'Geist Mono', monospace", color: "#333333" }}>
                {fmt(resume.fileSize)}
              </span>
            )}
            <span style={{ fontSize: "10px", color: "#333333" }}>·</span>
            <span style={{ fontSize: "10px", fontFamily: "'Geist Mono', monospace", color: "#333333" }}>
              {timeAgo(resume.createdAt)}
            </span>
          </div>
        </div>

        {/* Score ring or status */}
        {resume.score != null ? (
          <MiniRing score={resume.score} size={38} />
        ) : (
          <div style={{
            padding: "2px 8px", borderRadius: "99px",
            fontSize: "10px", fontWeight: 500,
            fontFamily: "'Geist Mono', monospace",
            background: resume.isParsed ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
            color: resume.isParsed ? "#4ade80" : "#fbbf24",
            border: `1px solid ${resume.isParsed ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.2)"}`,
            flexShrink: 0, alignSelf: "flex-start",
          }}>
            {resume.isParsed ? "Parsed" : "Processing"}
          </div>
        )}
      </div>

      {/* Parsed info strip */}
      {resume.isParsed && resume.parsedData && (
        <div style={{
          display: "flex", gap: "16px",
          padding: "8px 10px",
          background: "#0d0d0d", borderRadius: "7px",
          border: "1px solid #161616",
        }}>
          {[
            { label: "Skills",   value: resume.parsedData.skills?.length       || "—" },
            { label: "Exp",      value: resume.parsedData.experience?.length    || "—" },
            { label: "Projects", value: resume.parsedData.projects?.length      || "—" },
          ].map(item => (
            <div key={item.label}>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#cccccc", letterSpacing: "-0.03em", lineHeight: 1 }}>{item.value}</p>
              <p style={{ fontSize: "9px", fontFamily: "'Geist Mono', monospace", color: "#333333", marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{item.label}</p>
            </div>
          ))}
          {resume.score != null && (
            <div style={{ marginLeft: "auto" }}>
              <p style={{ fontSize: "14px", fontWeight: 600, color: scoreColor, letterSpacing: "-0.03em", lineHeight: 1 }}>{resume.score}</p>
              <p style={{ fontSize: "9px", fontFamily: "'Geist Mono', monospace", color: "#333333", marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Score</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "6px", marginTop: "2px" }}>
        {resume.isParsed && !resume.score && (
          <button
            onClick={() => onScore(resume)}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
              padding: "7px 12px",
              background: "rgba(139,92,246,0.1)",
              border: "1px solid rgba(139,92,246,0.2)",
              borderRadius: "7px",
              color: "#c4b5fd", fontSize: "12px", fontWeight: 500,
              cursor: "pointer", fontFamily: "'Geist', sans-serif",
              transition: "background 0.14s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(139,92,246,0.18)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(139,92,246,0.1)"}
          >
            <StarIcon /> Score resume
          </button>
        )}

        {resume.score != null && (
          <Link to={`/score?id=${resume._id}`} style={{ flex: 1, textDecoration: "none" }}>
            <button style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
              padding: "7px 12px",
              background: "rgba(139,92,246,0.1)",
              border: "1px solid rgba(139,92,246,0.2)",
              borderRadius: "7px",
              color: "#c4b5fd", fontSize: "12px", fontWeight: 500,
              cursor: "pointer", fontFamily: "'Geist', sans-serif",
              transition: "background 0.14s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(139,92,246,0.18)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(139,92,246,0.1)"}
            >
              <EyeIcon /> View score
            </button>
          </Link>
        )}

        <button
          onClick={() => onDelete(resume)}
          style={{
            width: "32px", height: "32px",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "transparent", border: "1px solid #1e1e1e",
            borderRadius: "7px", color: "#444444",
            cursor: "pointer", flexShrink: 0,
            transition: "all 0.14s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)"; e.currentTarget.style.color = "#ef4444"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#1e1e1e"; e.currentTarget.style.color = "#444444"; }}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
};

// ── Upload zone ──────────────────────────────────────────────
const UploadZone = ({ onUpload, uploading, progress }) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  }, [onUpload]);

  const handleDrag = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDrag}
      onDragLeave={handleDragLeave}
      onClick={() => !uploading && inputRef.current?.click()}
      style={{
        border: `2px dashed ${dragging ? "rgba(139,92,246,0.5)" : uploading ? "rgba(139,92,246,0.3)" : "#1e1e1e"}`,
        borderRadius: "12px",
        padding: "40px 24px",
        textAlign: "center",
        background: dragging ? "rgba(139,92,246,0.04)" : uploading ? "rgba(139,92,246,0.02)" : "#0d0d0d",
        cursor: uploading ? "default" : "pointer",
        transition: "all 0.2s",
        marginBottom: "24px",
        animation: "fadeUp 0.3s ease both",
      }}>
      <input
        ref={inputRef} type="file" accept=".pdf,.doc,.docx"
        style={{ display: "none" }}
        onChange={e => { if (e.target.files[0]) onUpload(e.target.files[0]); e.target.value = ""; }}
      />

      {uploading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "10px",
            background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#8b5cf6",
          }}>
            <SpinIcon />
          </div>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "#cccccc", marginBottom: "4px" }}>Uploading & parsing…</p>
            <p style={{ fontSize: "12px", color: "#444444" }}>AI is reading your resume</p>
          </div>
          {progress > 0 && (
            <div style={{ width: "200px", height: "2px", background: "#1a1a1a", borderRadius: "99px", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${progress}%`,
                background: "#8b5cf6", borderRadius: "99px",
                transition: "width 0.3s ease",
              }} />
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "11px",
            background: dragging ? "rgba(139,92,246,0.15)" : "#161616",
            border: `1px solid ${dragging ? "rgba(139,92,246,0.3)" : "#222222"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: dragging ? "#8b5cf6" : "#444444",
            transition: "all 0.2s",
          }}>
            <UploadIcon />
          </div>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 500, color: dragging ? "#c4b5fd" : "#aaaaaa", marginBottom: "4px", letterSpacing: "-0.01em" }}>
              {dragging ? "Drop to upload" : "Drag & drop your resume"}
            </p>
            <p style={{ fontSize: "12px", color: "#333333", marginBottom: "14px" }}>
              PDF, DOC, DOCX — up to 5 MB
            </p>
          </div>
          <button
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "8px 18px",
              background: "#161616", border: "1px solid #222222",
              borderRadius: "8px", color: "#aaaaaa",
              fontSize: "13px", fontWeight: 500, cursor: "pointer",
              fontFamily: "'Geist', sans-serif",
              transition: "all 0.14s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#1a1a1a"; e.currentTarget.style.color = "#eeeeee"; e.currentTarget.style.borderColor = "#2a2a2a"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#161616"; e.currentTarget.style.color = "#aaaaaa"; e.currentTarget.style.borderColor = "#222222"; }}
          >
            <UploadIcon /> Choose file
          </button>
        </div>
      )}
    </div>
  );
};

// ── Tips strip ───────────────────────────────────────────────
const TipStrip = () => (
  <div style={{
    display: "flex", gap: "8px", flexWrap: "wrap",
    marginBottom: "24px", animation: "fadeUp 0.35s ease both", animationDelay: "100ms",
  }}>
    {[
      { icon: <CheckIcon />, text: "Use standard section headings (Experience, Skills, Education)" },
      { icon: <CheckIcon />, text: "Avoid tables, columns, or graphics — they confuse ATS scanners" },
      { icon: <CheckIcon />, text: "Quantify your achievements wherever possible" },
    ].map((tip, i) => (
      <div key={i} style={{
        display: "flex", alignItems: "center", gap: "7px",
        padding: "6px 10px",
        background: "#0d0d0d", border: "1px solid #1a1a1a",
        borderRadius: "7px",
        fontSize: "11px", color: "#555555",
      }}>
        <span style={{ color: "#22c55e", display: "flex" }}>{tip.icon}</span>
        {tip.text}
      </div>
    ))}
  </div>
);

// ── Main page ────────────────────────────────────────────────
const ResumePage = () => {
  const [resumes,   setResumes]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [toast,     setToast]     = useState(null);
  const [toDelete,  setToDelete]  = useState(null);
  const [deleting,  setDeleting]  = useState(false);
  const [scoring,   setScoring]   = useState(null);

  const showToast = (message, type = "info") => setToast({ message, type });

  // Load resumes
  const loadResumes = useCallback(async () => {
    try {
      const res = await api.get("/resumes");
      const list = res.data.resumes || [];
      // Fetch scores for parsed resumes
      const withScores = await Promise.all(
        list.map(async (r) => {
          if (!r.isParsed) return r;
          try {
            const s = await api.get(`/scores/${r._id}`);
            const overall = s.data?.scores?.overall ?? s.data?.overall ?? s.data?.score?.overall;
            return { ...r, score: overall ?? null };
          } catch { return r; }
        })
      );
      setResumes(withScores);
    } catch { showToast("Failed to load resumes.", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadResumes(); }, [loadResumes]);

  // Upload
  const handleUpload = async (file) => {
    const validTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!validTypes.includes(file.type)) { showToast("Only PDF, DOC, or DOCX files are accepted.", "error"); return; }
    if (file.size > 5 * 1024 * 1024) { showToast("File must be under 5 MB.", "error"); return; }

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      await api.post("/resumes/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => setProgress(Math.round((e.loaded / e.total) * 100)),
      });
      showToast("Resume uploaded and parsed successfully.", "success");
      await loadResumes();
    } catch (err) {
      showToast(err?.response?.data?.message || "Upload failed. Please try again.", "error");
    } finally { setUploading(false); setProgress(0); }
  };

  // Delete
  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/resumes/${toDelete._id}`);
      showToast("Resume deleted.", "success");
      setResumes(prev => prev.filter(r => r._id !== toDelete._id));
    } catch { showToast("Failed to delete. Try again.", "error"); }
    finally { setDeleting(false); setToDelete(null); }
  };

  // Score
  const handleScore = async (resume) => {
    setScoring(resume._id);
    try {
      await api.post(`/scores/analyze/${resume._id}`);
      showToast("Scoring complete.", "success");
      await loadResumes();
    } catch { showToast("Scoring failed. Try again.", "error"); }
    finally { setScoring(null); }
  };

  return (
    <DashboardLayout>
      <div style={{ padding: "32px 28px", maxWidth: "900px" }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <div style={{ marginBottom: "28px", animation: "fadeUp 0.3s ease both" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <p style={{ fontSize: "11px", fontFamily: "'Geist Mono', monospace", color: "#333333", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Resume
              </p>
              <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#eeeeee", letterSpacing: "-0.04em", margin: 0 }}>
                Your Resumes
              </h1>
              <p style={{ fontSize: "13px", color: "#555555", marginTop: "4px" }}>
                Upload, manage, and score your resumes with AI.
              </p>
            </div>

            {/* Summary chips */}
            {!loading && resumes.length > 0 && (
              <div style={{ display: "flex", gap: "8px" }}>
                <div style={{
                  padding: "6px 12px",
                  background: "#111111", border: "1px solid #1a1a1a", borderRadius: "7px",
                  fontSize: "12px", color: "#666666",
                }}>
                  <span style={{ color: "#eeeeee", fontWeight: 600 }}>{resumes.length}</span> resume{resumes.length !== 1 ? "s" : ""}
                </div>
                {resumes.filter(r => r.isParsed).length > 0 && (
                  <div style={{
                    padding: "6px 12px",
                    background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: "7px",
                    fontSize: "12px", color: "#4ade80",
                  }}>
                    {resumes.filter(r => r.isParsed).length} parsed
                  </div>
                )}
                {resumes.filter(r => r.score != null).length > 0 && (
                  <div style={{
                    padding: "6px 12px",
                    background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: "7px",
                    fontSize: "12px", color: "#c4b5fd",
                  }}>
                    {resumes.filter(r => r.score != null).length} scored
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Upload zone ─────────────────────────────────────── */}
        <UploadZone onUpload={handleUpload} uploading={uploading} progress={progress} />

        {/* ── Tips ───────────────────────────────────────────── */}
        <TipStrip />

        {/* ── Resume list ─────────────────────────────────────── */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "10px" }}>
            {[1, 2].map(i => (
              <div key={i} style={{
                height: "140px", borderRadius: "10px",
                background: "linear-gradient(90deg, #111 0%, #161616 50%, #111 100%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.8s linear infinite",
                border: "1px solid #1a1a1a",
              }} />
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "48px 24px", textAlign: "center",
            background: "#0d0d0d", border: "1px solid #161616", borderRadius: "10px",
            animation: "fadeUp 0.3s ease both",
          }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "11px",
              background: "#161616", border: "1px solid #1e1e1e",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#333333", marginBottom: "14px",
            }}><FileIcon /></div>
            <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#555555", letterSpacing: "-0.02em", marginBottom: "6px" }}>
              No resumes yet
            </h3>
            <p style={{ fontSize: "12px", color: "#333333", lineHeight: 1.6 }}>
              Upload your first resume above to get started.
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <p style={{ fontSize: "10px", fontWeight: 600, fontFamily: "'Geist Mono', monospace", color: "#333333", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Uploaded resumes
              </p>
              <Link to="/score" style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#555555", textDecoration: "none", transition: "color 0.12s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#8b5cf6"}
                onMouseLeave={e => e.currentTarget.style.color = "#555555"}
              >
                Score all <ArrowIcon />
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "10px" }}>
              {resumes.map((r, i) => (
                <ResumeCard
                  key={r._id}
                  resume={{ ...r, score: scoring === r._id ? null : r.score }}
                  onDelete={setToDelete}
                  onScore={handleScore}
                  index={i}
                />
              ))}
            </div>
          </>
        )}

        {/* ── Info box ────────────────────────────────────────── */}
        {resumes.length > 0 && (
          <div style={{
            display: "flex", gap: "10px", alignItems: "flex-start",
            marginTop: "20px", padding: "12px 14px",
            background: "#0d0d0d", border: "1px solid #161616", borderRadius: "9px",
            animation: "fadeUp 0.35s ease both",
          }}>
            <span style={{ color: "#444444", flexShrink: 0, marginTop: "1px" }}><InfoIcon /></span>
            <p style={{ fontSize: "11px", color: "#444444", lineHeight: 1.6 }}>
              After parsing, use <span style={{ color: "#8b5cf6" }}>Score Resume</span> to get your AI breakdown across ATS compatibility, impact, completeness, readability, and skill match.
            </p>
          </div>
        )}
      </div>

      {/* ── Modals & toasts ─────────────────────────────────── */}
      {toDelete && (
        <DeleteModal
          resume={toDelete}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
          loading={deleting}
        />
      )}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <style>{`
        @keyframes fadeUp  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes spin    { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
        @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
      `}</style>
    </DashboardLayout>
  );
};

export default ResumePage;