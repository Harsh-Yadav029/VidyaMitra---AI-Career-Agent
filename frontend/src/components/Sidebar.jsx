import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ── SVG Icons ──────────────────────────────────────────────
const Icon = ({ d, size = 15, viewBox = "0 0 24 24" }) => (
  <svg width={size} height={size} viewBox={viewBox} fill="none"
    stroke="currentColor" strokeWidth="1.75"
    strokeLinecap="round" strokeLinejoin="round">
    {typeof d === "string" ? <path d={d} /> : d}
  </svg>
);

const icons = {
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></>,
  resume:    <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></>,
  builder:   <><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></>,
  score:     <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></>,
  interview: <><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></>,
  jobs:      <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></>,
  tracker:   <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
  agent:     <><circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" /></>,
  profile:   <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  admin:     <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></>,
  logout:    <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>,
  chevron:   <><polyline points="15 18 9 12 15 6" /></>,
};

const NavIcon = ({ name }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75"
    strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0 }}>
    {icons[name]}
  </svg>
);

// ── Nav item ────────────────────────────────────────────────
const NavItem = ({ to, icon, label, badge }) => {
  const { pathname } = useLocation();
  const active = pathname === to || pathname.startsWith(to + "/");

  return (
    <Link to={to} style={{ textDecoration: "none" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "9px",
        padding: "6px 10px",
        borderRadius: "7px",
        marginBottom: "1px",
        position: "relative",
        background: active ? "rgba(139,92,246,0.1)" : "transparent",
        border: `1px solid ${active ? "rgba(139,92,246,0.2)" : "transparent"}`,
        color: active ? "#c4b5fd" : "#666666",
        fontSize: "13px",
        fontWeight: active ? 500 : 400,
        letterSpacing: "-0.01em",
        transition: "all 0.12s",
        cursor: "pointer",
      }}
        onMouseEnter={e => {
          if (!active) {
            e.currentTarget.style.background = "#161616";
            e.currentTarget.style.color = "#aaaaaa";
          }
        }}
        onMouseLeave={e => {
          if (!active) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#666666";
          }
        }}
      >
        {active && (
          <div style={{
            position: "absolute", left: 0, top: "50%",
            transform: "translateY(-50%)",
            width: "2px", height: "14px",
            background: "#8b5cf6",
            borderRadius: "0 2px 2px 0",
          }} />
        )}
        <NavIcon name={icon} />
        <span style={{ flex: 1 }}>{label}</span>
        {badge && (
          <span style={{
            fontSize: "9px", fontWeight: 600,
            fontFamily: "'Geist Mono', monospace",
            padding: "1px 6px", borderRadius: "99px",
            background: "rgba(139,92,246,0.12)",
            color: "#a78bfa",
            border: "1px solid rgba(139,92,246,0.2)",
            letterSpacing: "0.04em",
          }}>{badge}</span>
        )}
      </div>
    </Link>
  );
};

// ── Section label ───────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <div style={{
    fontSize: "9px", fontWeight: 600,
    fontFamily: "'Geist Mono', monospace",
    color: "#333333",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    padding: "12px 10px 4px",
  }}>{children}</div>
);

// ── Sidebar ─────────────────────────────────────────────────
const Sidebar = () => {
  const { user, logout } = useAuth();
  const initials = user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "U";

  return (
    <aside style={{
      width: "220px",
      minWidth: "220px",
      height: "100vh",
      position: "fixed",
      top: 0, left: 0,
      background: "#0e0e0e",
      borderRight: "1px solid #1a1a1a",
      display: "flex",
      flexDirection: "column",
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "16px 14px",
        borderBottom: "1px solid #1a1a1a",
      }}>
        <div style={{
          width: "28px", height: "28px", borderRadius: "7px",
          background: "#8b5cf6",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 2px 8px rgba(139,92,246,0.4)",
        }}>
          <span style={{ color: "#fff", fontSize: "12px", fontWeight: 700, letterSpacing: "-0.02em" }}>V</span>
        </div>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#eeeeee", letterSpacing: "-0.03em", lineHeight: 1.2 }}>VidyaMitra</div>
          <div style={{ fontSize: "9px", fontFamily: "'Geist Mono', monospace", color: "#444444", letterSpacing: "0.08em", marginTop: "1px" }}>BETA</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px 8px", overflowY: "auto" }}>
        <SectionLabel>Menu</SectionLabel>

        <NavItem to="/dashboard"  icon="dashboard" label="Dashboard" />
        <NavItem to="/resume"     icon="resume"    label="Resume" />
        <NavItem to="/score"      icon="score"     label="AI Score" />
        <NavItem to="/builder"    icon="builder"   label="Resume Builder" />
        <NavItem to="/interview"  icon="interview" label="Interview" />
        <NavItem to="/jobs"       icon="jobs"      label="Jobs" />
        {/* <NavItem to="/tracker"    icon="tracker"   label="App Tracker" /> */}
        <NavItem to="/agent"      icon="agent"     label="Career Agent" />
        <NavItem to="/profile"    icon="profile"   label="Profile" />

        {user?.role === "admin" && (
          <>
            <SectionLabel>Admin</SectionLabel>
            <NavItem to="/admin" icon="admin" label="Admin Panel" badge="admin" />
          </>
        )}
      </nav>

      {/* User footer */}
      <div style={{ borderTop: "1px solid #1a1a1a", padding: "10px 8px" }}>
        {/* User row */}
        <div style={{
          display: "flex", alignItems: "center", gap: "9px",
          padding: "8px 10px", borderRadius: "7px",
          marginBottom: "2px",
          cursor: "pointer",
          transition: "background 0.12s",
        }}
          onMouseEnter={e => e.currentTarget.style.background = "#161616"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <div style={{
            width: "26px", height: "26px", borderRadius: "6px",
            background: "rgba(139,92,246,0.15)",
            border: "1px solid rgba(139,92,246,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "10px", fontWeight: 700, color: "#c4b5fd",
            flexShrink: 0,
          }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "12px", fontWeight: 500, color: "#cccccc", letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</div>
            <div style={{ fontSize: "10px", color: "#444444", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'Geist Mono', monospace" }}>{user?.email}</div>
          </div>
        </div>

        {/* Logout */}
        <button onClick={logout} style={{
          display: "flex", alignItems: "center", gap: "9px",
          width: "100%", padding: "6px 10px", borderRadius: "7px",
          background: "transparent", border: "none",
          color: "#555555", fontSize: "13px", cursor: "pointer",
          fontFamily: "'Geist', sans-serif",
          transition: "all 0.12s",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "#161616"; e.currentTarget.style.color = "#aaaaaa"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#555555"; }}
        >
          <NavIcon name="logout" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;