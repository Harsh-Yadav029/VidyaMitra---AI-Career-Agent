/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

// ── Design tokens (matching InterviewPage) ───────────────────
const C = {
  bg:       "#090909",
  surface:  "#0f0f0f",
  card:     "#111111",
  border:   "#1a1a1a",
  border2:  "#222222",
  violet:   "#8b5cf6",
  violetDim:"rgba(139,92,246,.12)",
  violetFg: "rgba(139,92,246,.07)",
  text:     "#e8e8e8",
  muted:    "#666",
  muted2:   "#444",
  green:    "#22c55e",
  amber:    "#f59e0b",
  red:      "#ef4444",
  blue:     "#3b82f6",
};

// ── Tiny helpers ─────────────────────────────────────────────
const MonoLabel = ({ children, color = C.muted, style = {} }) => (
  <span style={{
    fontFamily: "'Geist Mono', monospace",
    fontSize: 10,
    fontWeight: 500,
    letterSpacing: "0.10em",
    textTransform: "uppercase",
    color,
    ...style,
  }}>
    {children}
  </span>
);

const Dot = ({ color = C.violet, size = 6 }) => (
  <span style={{
    display: "inline-block",
    width: size,
    height: size,
    borderRadius: "50%",
    background: color,
    flexShrink: 0,
  }} />
);

// ── SVG Icons ────────────────────────────────────────────────
const Icons = {
  Agent: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2a7 7 0 0 1 7 7c0 3.87-3.13 7-7 7s-7-3.13-7-7a7 7 0 0 1 7-7z"/>
      <path d="M9 12s1 1 3 1 3-1 3-1"/>
      <path d="M9 9h.01M15 9h.01"/>
      <path d="M5 20a7 7 0 0 1 14 0"/>
    </svg>
  ),
  Send: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  Sparkle: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
    </svg>
  ),
  Resume: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  Interview: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Jobs: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    </svg>
  ),
  Career: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  Copy: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  Trash: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  ),
  Plus: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  User: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
};

// ── Suggested prompts ─────────────────────────────────────────
const SUGGESTIONS = [
  { icon: <Icons.Resume />, label: "Review my resume",     prompt: "Can you review my resume and suggest the top 3 improvements I should make?" },
  { icon: <Icons.Interview />, label: "Mock interview",    prompt: "Give me a mock interview question for a senior frontend developer role." },
  { icon: <Icons.Jobs />,    label: "Job search tips",     prompt: "What are the best strategies for finding a software engineering job in 2024?" },
  { icon: <Icons.Career />,  label: "Career roadmap",      prompt: "Help me create a 6-month career roadmap to become a senior full-stack engineer." },
  { icon: <Icons.Sparkle />, label: "Optimize LinkedIn",   prompt: "How do I optimize my LinkedIn profile to attract more recruiters?" },
  { icon: <Icons.Agent />,   label: "Salary negotiation",  prompt: "What are proven tactics to negotiate a higher salary offer?" },
];

// ── Message bubble ────────────────────────────────────────────
const MessageBubble = ({ msg, onCopy }) => {
  const isUser = msg.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
    onCopy?.(msg.content);
  };

  // Parse markdown-like bold and code
  const renderContent = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\n)/g);
    return parts.map((p, i) => {
      if (p.startsWith("**") && p.endsWith("**"))
        return <strong key={i} style={{ color: C.text, fontWeight: 600 }}>{p.slice(2, -2)}</strong>;
      if (p.startsWith("`") && p.endsWith("`"))
        return <code key={i} style={{ background: C.border2, padding: "1px 5px", borderRadius: 4, fontFamily: "Geist Mono", fontSize: 12, color: C.violet }}>{p.slice(1, -1)}</code>;
      if (p === "\n") return <br key={i} />;
      return p;
    });
  };

  return (
    <div style={{
      display: "flex",
      gap: 12,
      flexDirection: isUser ? "row-reverse" : "row",
      alignItems: "flex-start",
      animation: "bubbleIn 0.22s ease forwards",
    }}>
      {/* Avatar */}
      <div style={{
        width: 30,
        height: 30,
        borderRadius: "50%",
        background: isUser ? C.border2 : C.violetDim,
        border: `1px solid ${isUser ? C.border2 : "rgba(139,92,246,.3)"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        color: isUser ? C.muted : C.violet,
      }}>
        {isUser ? <Icons.User /> : <Icons.Agent />}
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: "72%", minWidth: 60 }}>
        <div style={{
          background: isUser ? C.violetFg : C.card,
          border: `1px solid ${isUser ? "rgba(139,92,246,.2)" : C.border}`,
          borderRadius: isUser ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
          padding: "11px 14px",
          color: C.text,
          fontSize: 14,
          lineHeight: 1.65,
          wordBreak: "break-word",
        }}>
          {msg.loading ? (
            <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {[0,1,2].map(i => (
                <span key={i} style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: C.violet, opacity: 0.6,
                  animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </span>
          ) : renderContent(msg.content)}
        </div>

        {/* Actions row */}
        {!msg.loading && !isUser && (
          <div style={{ display: "flex", gap: 6, marginTop: 5, paddingLeft: 2 }}>
            <button
              onClick={handleCopy}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: copied ? C.green : C.muted2,
                display: "flex", alignItems: "center", gap: 4,
                fontSize: 11, padding: "2px 0",
                fontFamily: "Geist Mono", letterSpacing: "0.04em",
                transition: "color .15s",
              }}
            >
              <Icons.Copy /> {copied ? "Copied" : "Copy"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Conversation history item ─────────────────────────────────
const HistoryItem = ({ session, active, onClick, onDelete }) => (
  <div
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "8px 10px",
      borderRadius: 8,
      cursor: "pointer",
      background: active ? C.violetFg : "transparent",
      border: `1px solid ${active ? "rgba(139,92,246,.2)" : "transparent"}`,
      transition: "all .15s",
      group: true,
    }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.background = C.surface; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
  >
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontSize: 12, fontWeight: 500, color: active ? C.violet : C.text,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>
        {session.title || "New conversation"}
      </div>
      <MonoLabel color={C.muted2} style={{ fontSize: 9 }}>
        {session.msgCount} msg{session.msgCount !== 1 ? "s" : ""} · {session.date}
      </MonoLabel>
    </div>
    <button
      onClick={e => { e.stopPropagation(); onDelete(session.id); }}
      style={{
        background: "none", border: "none", cursor: "pointer",
        color: C.muted2, padding: 3, borderRadius: 4,
        display: "flex", transition: "color .15s",
        opacity: 0,
      }}
      onMouseEnter={e => { e.currentTarget.style.color = C.red; e.currentTarget.style.opacity = "1"; }}
      onMouseLeave={e => { e.currentTarget.style.color = C.muted2; e.currentTarget.style.opacity = "0"; }}
      className="history-delete-btn"
    >
      <Icons.Trash />
    </button>
  </div>
);

// ── Main component ────────────────────────────────────────────
export default function CareerAgentPage() {
  const { user } = useAuth();
  const [messages, setMessages]         = useState([]);
  const [input, setInput]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [sessions, setSessions]         = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const abortRef   = useRef(null);

  // ── Load sessions from backend on mount ──────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/agent/sessions");
        const raw = res.data?.sessions || res.data || [];
        // Normalise to { id, title, date, msgCount, messages[] }
        const normalised = raw.map(s => ({
          id:       s._id || s.id,
          title:    s.title || s.messages?.[0]?.content?.slice(0, 48) || "New conversation",
          date:     new Date(s.updatedAt || s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
          msgCount: s.messages?.length || 0,
          messages: (s.messages || []).map((m, i) => ({
            id:      i,
            role:    m.role,
            content: m.content,
          })),
        }));
        setSessions(normalised);
      } catch { /* silently ignore — user may have no sessions yet */ }
    })();
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startNewSession = () => {
    setMessages([]);
    setActiveSession(null);
    setInput("");
    inputRef.current?.focus();
  };

  const loadSession = (session) => {
    setMessages(session.messages || []);
    setActiveSession(session.id);
  };

  const deleteSession = async (id) => {
    try {
      await api.delete(`/agent/sessions/${id}`);
    } catch { /* best-effort */ }
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSession === id) startNewSession();
  };

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput("");

    const userMsg  = { id: Date.now(),     role: "user",      content };
    const thinkMsg = { id: Date.now() + 1, role: "assistant", content: "", loading: true };

    const nextMsgs = [...messages, userMsg, thinkMsg];
    setMessages(nextMsgs);
    setLoading(true);

    try {
      let sessionId = activeSession;

      // ── If no active session, create one first ──────────────
      if (!sessionId) {
        const created = await api.post("/agent/sessions");
        sessionId = created.data?.session?._id || created.data?._id || created.data?.sessionId;
        setActiveSession(sessionId);
      }

      // ── Send message to existing session ───────────────────
      const res = await api.post(`/agent/sessions/${sessionId}/message`, {
        message: content,
      });

      const reply = res.data?.reply
        || res.data?.message
        || res.data?.response
        || "I couldn't process that. Please try again.";

      const finalMsgs = nextMsgs.map(m =>
        m.id === thinkMsg.id ? { ...m, content: reply, loading: false } : m
      );
      setMessages(finalMsgs);

      // ── Update sidebar session entry ────────────────────────
      const cleanMsgs = finalMsgs.filter(m => !m.loading);
      const title = cleanMsgs.find(m => m.role === "user")?.content?.slice(0, 48) || "New conversation";
      setSessions(prev => {
        const existing = prev.findIndex(s => s.id === sessionId);
        const entry = {
          id: sessionId, title,
          date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
          msgCount: cleanMsgs.length,
          messages: cleanMsgs,
        };
        return existing >= 0
          ? prev.map(s => s.id === sessionId ? entry : s)
          : [entry, ...prev];
      });

    } catch (err) {
      const errMsg = err?.response?.data?.message || "Something went wrong. Please try again.";
      setMessages(prev => prev.map(m =>
        m.id === thinkMsg.id ? { ...m, content: errMsg, loading: false } : m
      ));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isEmptyChat = messages.length === 0;

  return (
    <DashboardLayout>
      <style>{`
        @keyframes bubbleIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotPulse {
          0%, 80%, 100% { transform: scale(.6); opacity: .4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .history-delete-btn { opacity: 0; transition: opacity .15s; }
        .history-item:hover .history-delete-btn { opacity: 1 !important; }
        .suggestion-chip:hover { background: rgba(139,92,246,.12) !important; border-color: rgba(139,92,246,.3) !important; color: #c4b5fd !important; }
        .send-btn:hover:not(:disabled) { background: #7c3aed !important; }
        .send-btn:disabled { opacity: .4; cursor: not-allowed; }
        textarea:focus { outline: none; }
        textarea::placeholder { color: #444; }
        textarea { resize: none; }
        .new-chat-btn:hover { background: rgba(139,92,246,.1) !important; border-color: rgba(139,92,246,.3) !important; }
        .stop-btn:hover { background: rgba(239,68,68,.1) !important; border-color: rgba(239,68,68,.3) !important; }
      `}</style>

      <div style={{
        display: "flex",
        height: "calc(100vh - 52px)",
        background: C.bg,
        gap: 0,
        overflow: "hidden",
      }}>

        {/* ── Left Sidebar ── */}
        <div style={{
          width: sidebarOpen ? 220 : 0,
          minWidth: sidebarOpen ? 220 : 0,
          overflow: "hidden",
          transition: "all .25s ease",
          borderRight: `1px solid ${C.border}`,
          display: "flex",
          flexDirection: "column",
          background: C.surface,
        }}>
          <div style={{ padding: "16px 12px 12px", flexShrink: 0 }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{
                width: 26, height: 26, borderRadius: 7,
                background: C.violetDim,
                border: `1px solid rgba(139,92,246,.25)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: C.violet,
              }}>
                <Icons.Agent />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>VidyaMitra AI</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
                  <Dot color={C.green} size={5} />
                  <MonoLabel color={C.green} style={{ fontSize: 9 }}>Online</MonoLabel>
                </div>
              </div>
            </div>

            {/* New chat button */}
            <button
              onClick={startNewSession}
              className="new-chat-btn"
              style={{
                width: "100%",
                background: "transparent",
                border: `1px solid ${C.border2}`,
                borderRadius: 8,
                padding: "7px 10px",
                color: C.muted,
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all .15s",
                marginBottom: 14,
              }}
            >
              <Icons.Plus /> New conversation
            </button>

            <MonoLabel color={C.muted2}>History</MonoLabel>
          </div>

          {/* Session list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px 12px" }}>
            {sessions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 8px" }}>
                <MonoLabel color={C.muted2}>No conversations yet</MonoLabel>
              </div>
            ) : (
              sessions.map(s => (
                <div key={s.id} className="history-item" style={{ position: "relative" }}>
                  <HistoryItem
                    session={s}
                    active={activeSession === s.id}
                    onClick={() => loadSession(s)}
                    onDelete={deleteSession}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Main Chat Area ── */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}>

          {/* Top bar */}
          <div style={{
            padding: "0 20px",
            height: 52,
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexShrink: 0,
            background: C.surface,
          }}>
            {/* Toggle sidebar */}
            <button
              onClick={() => setSidebarOpen(v => !v)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: C.muted, padding: 4, borderRadius: 5,
                display: "flex", alignItems: "center",
                transition: "color .15s",
              }}
              onMouseEnter={e => e.currentTarget.style.color = C.text}
              onMouseLeave={e => e.currentTarget.style.color = C.muted}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>

            <div style={{ width: 1, height: 18, background: C.border2 }} />

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 7, height: 7, borderRadius: "50%",
                background: C.violet,
                boxShadow: `0 0 8px ${C.violet}`,
              }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Career Agent</span>
            </div>

            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              {loading && (
                <button
                  className="stop-btn"
                  onClick={() => abortRef.current?.abort()}
                  style={{
                    background: "transparent",
                    border: `1px solid ${C.border2}`,
                    borderRadius: 7,
                    padding: "4px 10px",
                    color: C.red,
                    fontSize: 11,
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontFamily: "Geist Mono",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    transition: "all .15s",
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: 1, background: C.red }} />
                  Stop
                </button>
              )}
              <div style={{
                background: C.violetFg,
                border: `1px solid rgba(139,92,246,.2)`,
                borderRadius: 7,
                padding: "4px 10px",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: C.green,
                }} />
                <MonoLabel color={C.green} style={{ fontSize: 9 }}>Gemini powered</MonoLabel>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 24px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}>
            {isEmptyChat ? (
              /* Welcome / empty state */
              <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 32,
                paddingBottom: 40,
              }}>
                {/* Hero */}
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: C.violetDim,
                    border: `1px solid rgba(139,92,246,.3)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: C.violet,
                    margin: "0 auto 16px",
                    fontSize: 22,
                  }}>
                    <Icons.Agent />
                  </div>
                  <h2 style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: C.text,
                    margin: "0 0 8px",
                    letterSpacing: "-0.03em",
                  }}>
                    What can I help you with?
                  </h2>
                  <p style={{
                    fontSize: 13,
                    color: C.muted,
                    margin: 0,
                    lineHeight: 1.6,
                    maxWidth: 340,
                  }}>
                    Your AI career coach — ask about resumes, interviews, job search, salary negotiation, or career growth.
                  </p>
                </div>

                {/* Suggestion chips */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 8,
                  maxWidth: 560,
                  width: "100%",
                }}>
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      className="suggestion-chip"
                      onClick={() => sendMessage(s.prompt)}
                      style={{
                        background: C.card,
                        border: `1px solid ${C.border}`,
                        borderRadius: 10,
                        padding: "10px 12px",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all .15s",
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                        animation: `fadeSlide .3s ease ${i * 0.06}s both`,
                      }}
                    >
                      <span style={{ color: C.muted, display: "flex" }}>{s.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map(msg => (
                <MessageBubble key={msg.id} msg={msg} />
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* ── Input bar ── */}
          <div style={{
            padding: "12px 20px 20px",
            borderTop: `1px solid ${C.border}`,
            background: C.surface,
          }}>
            {/* Shortcut hint */}
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: 6,
            }}>
              <MonoLabel color={C.muted2}>Enter to send · Shift+Enter for newline</MonoLabel>
            </div>

            <div style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-end",
              background: C.card,
              border: `1px solid ${C.border2}`,
              borderRadius: 12,
              padding: "10px 10px 10px 14px",
              transition: "border-color .2s",
            }}
              onFocusCapture={e => e.currentTarget.style.borderColor = "rgba(139,92,246,.4)"}
              onBlurCapture={e => e.currentTarget.style.borderColor = C.border2}
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  // Auto-resize
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your career…"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  color: C.text,
                  fontSize: 14,
                  lineHeight: 1.5,
                  fontFamily: "inherit",
                  minHeight: 22,
                  maxHeight: 120,
                  overflowY: "auto",
                }}
              />
              <button
                className="send-btn"
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: C.violet,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  flexShrink: 0,
                  transition: "background .15s",
                }}
              >
                <Icons.Send />
              </button>
            </div>

            <p style={{
              textAlign: "center",
              marginTop: 8,
              fontSize: 11,
              color: C.muted2,
              fontFamily: "Geist Mono",
              letterSpacing: "0.04em",
            }}>
              VidyaMitra AI · Powered by Gemini · Not a substitute for professional advice
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}