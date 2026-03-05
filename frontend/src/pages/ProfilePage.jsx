/* eslint-disable react-refresh/only-export-components */
// FIX 1: removed unused `useRef` from import
import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

// ── Design tokens ─────────────────────────────────────────────
const C = {
  bg:        "#090909",
  surface:   "#0f0f0f",
  card:      "#111111",
  border:    "#1a1a1a",
  border2:   "#222222",
  violet:    "#8b5cf6",
  violetDim: "rgba(139,92,246,.12)",
  violetFg:  "rgba(139,92,246,.07)",
  text:      "#e8e8e8",
  muted:     "#666",
  muted2:    "#444",
  green:     "#22c55e",
  amber:     "#f59e0b",
  red:       "#ef4444",
  blue:      "#3b82f6",
};

// ── Helpers ───────────────────────────────────────────────────
const MonoLabel = ({ children, color = C.muted, style = {} }) => (
  <span style={{
    fontFamily: "'Geist Mono', monospace",
    fontSize: 10,
    fontWeight: 500,
    letterSpacing: "0.10em",
    textTransform: "uppercase",
    color,
    ...style,
  }}>{children}</span>
);

const SectionCard = ({ children, style = {} }) => (
  <div style={{
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    overflow: "hidden",
    ...style,
  }}>{children}</div>
);

const SectionHeader = ({ icon, title, description }) => (
  <div style={{
    padding: "16px 20px",
    borderBottom: `1px solid ${C.border}`,
    display: "flex",
    alignItems: "center",
    gap: 12,
  }}>
    <div style={{
      width: 30, height: 30, borderRadius: 8,
      background: C.violetDim,
      border: `1px solid rgba(139,92,246,.2)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: C.violet, flexShrink: 0,
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{title}</div>
      {description && <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{description}</div>}
    </div>
  </div>
);

// ── Field Input ───────────────────────────────────────────────
const Field = ({ label, value, onChange, type = "text", placeholder, disabled, hint, multiline }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <MonoLabel>{label}</MonoLabel>
    {multiline ? (
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={3}
        style={{
          background: C.surface,
          border: `1px solid ${C.border2}`,
          borderRadius: 8,
          padding: "10px 12px",
          color: disabled ? C.muted : C.text,
          fontSize: 13,
          fontFamily: "inherit",
          lineHeight: 1.6,
          resize: "vertical",
          outline: "none",
          transition: "border-color .15s",
          opacity: disabled ? 0.5 : 1,
        }}
        onFocus={e => !disabled && (e.target.style.borderColor = "rgba(139,92,246,.4)")}
        onBlur={e  => (e.target.style.borderColor = C.border2)}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          background: C.surface,
          border: `1px solid ${C.border2}`,
          borderRadius: 8,
          padding: "10px 12px",
          color: disabled ? C.muted : C.text,
          fontSize: 13,
          fontFamily: "inherit",
          outline: "none",
          transition: "border-color .15s",
          opacity: disabled ? 0.5 : 1,
        }}
        onFocus={e => !disabled && (e.target.style.borderColor = "rgba(139,92,246,.4)")}
        onBlur={e  => (e.target.style.borderColor = C.border2)}
      />
    )}
    {hint && <span style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>{hint}</span>}
  </div>
);

// ── Toast ─────────────────────────────────────────────────────
const Toast = ({ toasts }) => (
  <div style={{
    position: "fixed", bottom: 24, right: 24,
    display: "flex", flexDirection: "column", gap: 8, zIndex: 9999,
  }}>
    {toasts.map(t => (
      <div key={t.id} style={{
        background: t.type === "error" ? "rgba(239,68,68,.12)" : "rgba(34,197,94,.12)",
        border: `1px solid ${t.type === "error" ? "rgba(239,68,68,.3)" : "rgba(34,197,94,.3)"}`,
        borderRadius: 10,
        padding: "10px 16px",
        display: "flex", alignItems: "center", gap: 8,
        animation: "toastIn .2s ease",
        backdropFilter: "blur(8px)",
      }}>
        <span style={{ fontSize: 13, color: t.type === "error" ? C.red : C.green, fontWeight: 500 }}>
          {t.type === "error" ? "✕" : "✓"}
        </span>
        <span style={{ fontSize: 13, color: C.text }}>{t.message}</span>
      </div>
    ))}
  </div>
);

// ── Icons ─────────────────────────────────────────────────────
const Icons = {
  User: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Lock: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  Bell: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  Shield: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Camera: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  ),
  Trash: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  ),
  Google: () => (
    <svg width="13" height="13" viewBox="0 0 48 48" fill="none">
      <path d="M44.5 20H24v8.5h11.8C34.7 33.9 29.8 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" fill="#FFC107"/>
      <path d="M6.3 14.7l7 5.1C15.1 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 7.4 6.3 14.7z" fill="#FF3D00"/>
      <path d="M24 46c5.5 0 10.5-1.9 14.3-5.1l-6.6-5.6C29.7 36.9 26.9 38 24 38c-5.7 0-10.6-3.8-12.4-9l-7 5.3C8.4 41.5 15.6 46 24 46z" fill="#4CAF50"/>
      <path d="M44.5 20H24v8.5h11.8c-.9 2.9-2.8 5.4-5.3 7.1l6.6 5.6C41.5 37.9 45 32 45 24c0-1.3-.2-2.7-.5-4z" fill="#1976D2"/>
    </svg>
  ),
  Eye: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  EyeOff: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ),
  Check: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
};

// ── Tab definitions ───────────────────────────────────────────
const TABS = [
  { id: "profile",       label: "Profile",       icon: <Icons.User /> },
  { id: "security",      label: "Security",      icon: <Icons.Lock /> },
  { id: "notifications", label: "Notifications", icon: <Icons.Bell /> },
  { id: "account",       label: "Account",       icon: <Icons.Shield /> },
];

// ── Toggle Switch ─────────────────────────────────────────────
const Toggle = ({ checked, onChange, label, description }) => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "13px 0",
    borderBottom: `1px solid ${C.border}`,
  }}>
    <div>
      <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{label}</div>
      {description && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{description}</div>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 40, height: 22, borderRadius: 11,
        background: checked ? C.violet : C.border2,
        border: "none", cursor: "pointer",
        position: "relative", transition: "background .2s",
        flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute", top: 3,
        left: checked ? 21 : 3,
        width: 16, height: 16, borderRadius: "50%",
        background: "#fff",
        transition: "left .2s",
        boxShadow: "0 1px 3px rgba(0,0,0,.4)",
      }} />
    </button>
  </div>
);

// ── Skill Tag ─────────────────────────────────────────────────
const SkillTag = ({ label, onRemove }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 5,
    background: C.violetFg, border: `1px solid rgba(139,92,246,.2)`,
    borderRadius: 6, padding: "3px 8px",
    fontSize: 12, color: C.violet, fontWeight: 500,
  }}>
    {label}
    {onRemove && (
      <button onClick={onRemove} style={{
        background: "none", border: "none", cursor: "pointer",
        color: C.muted, padding: 0, lineHeight: 1,
        display: "flex", alignItems: "center",
        transition: "color .1s",
      }}
        onMouseEnter={e => e.currentTarget.style.color = C.red}
        onMouseLeave={e => e.currentTarget.style.color = C.muted}
      >×</button>
    )}
  </span>
);

// ── Avatar ────────────────────────────────────────────────────
const Avatar = ({ user, size = 72 }) => {
  const initials = (user?.name || "U")
    .split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: C.violetDim,
      border: `2px solid rgba(139,92,246,.3)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size / 3, fontWeight: 700, color: C.violet,
      letterSpacing: "-0.02em", flexShrink: 0,
      backgroundImage: user?.avatar ? `url(${user.avatar})` : undefined,
      backgroundSize: "cover", backgroundPosition: "center",
      overflow: "hidden",
    }}>
      {!user?.avatar && initials}
    </div>
  );
};

// FIX 6: module-level counter instead of Date.now() to guarantee unique toast IDs
let _toastCounter = 0;

// ════════════════════════════════════════════════════════════════
//  MAIN
// ════════════════════════════════════════════════════════════════
export default function ProfilePage() {
  // FIX 5: destructure updateUser so saved profile reflects instantly in hero + sidebar
  const { user, logout, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState("profile");
  const [saving,    setSaving]    = useState(false);
  const [toasts,    setToasts]    = useState([]);

  // Profile fields — initialised empty; FIX 3 syncs them once user loads
  const [name,       setName]       = useState("");
  const [email,      setEmail]      = useState("");
  const [phone,      setPhone]      = useState("");
  const [location,   setLocation]   = useState("");
  const [bio,        setBio]        = useState("");
  const [linkedin,   setLinkedin]   = useState("");
  const [github,     setGithub]     = useState("");
  const [website,    setWebsite]    = useState("");
  const [skills,     setSkills]     = useState([]);
  const [skillInput, setSkillInput] = useState("");

  // Security fields
  const [currentPwd,  setCurrentPwd]  = useState("");
  const [newPwd,      setNewPwd]      = useState("");
  const [confirmPwd,  setConfirmPwd]  = useState("");
  const [showPwd,     setShowPwd]     = useState(false);
  const [pwdStrength, setPwdStrength] = useState(0);

  // Notification prefs
  const [notifs, setNotifs] = useState({
    emailJobs:       true,
    emailScore:      true,
    emailInterview:  false,
    emailMarketing:  false,
    pushAll:         false,
  });

  // FIX 3: sync form fields whenever `user` loads or changes (handles async auth)
  useEffect(() => {
    if (!user) return;
    setName(user.name      || "");
    setEmail(user.email    || "");
    setPhone(user.phone    || "");
    setLocation(user.location || "");
    setBio(user.bio        || "");
    setLinkedin(user.linkedin || "");
    setGithub(user.github  || "");
    setWebsite(user.website || "");
    setSkills(user.skills  || []);
  }, [user]);

  // Password strength
  useEffect(() => {
    if (!newPwd) { setPwdStrength(0); return; }
    let score = 0;
    if (newPwd.length >= 8)           score++;
    if (/[A-Z]/.test(newPwd))         score++;
    if (/[0-9]/.test(newPwd))         score++;
    if (/[^A-Za-z0-9]/.test(newPwd))  score++;
    setPwdStrength(score);
  }, [newPwd]);

  // FIX 6: use incrementing counter — no collision risk
  const addToast = (message, type = "success") => {
    const id = ++_toastCounter;
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  };

  // ── Save profile ────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const payload = { name, phone, location, bio, linkedin, github, website, skills };
      await api.put("/auth/profile", payload);
      // FIX 5: push changes into AuthContext so hero card + sidebar update immediately
      if (typeof updateUser === "function") updateUser(payload);
      addToast("Profile updated successfully");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Change password ─────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!currentPwd || !newPwd || !confirmPwd) {
      addToast("Please fill all password fields", "error"); return;
    }
    if (newPwd !== confirmPwd) {
      addToast("New passwords don't match", "error"); return;
    }
    if (newPwd.length < 8) {
      addToast("Password must be at least 8 characters", "error"); return;
    }
    setSaving(true);
    try {
      await api.put("/auth/change-password", { currentPassword: currentPwd, newPassword: newPwd });
      addToast("Password changed successfully");
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to change password", "error");
    } finally {
      setSaving(false);
    }
  };

  // FIX 8: actually persist notification prefs to backend
  const handleSaveNotifs = async () => {
    try {
      await api.put("/auth/notifications", { preferences: notifs });
      addToast("Notification preferences saved");
    } catch {
      addToast("Failed to save preferences", "error");
    }
  };

  const addSkill = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      const sk = skillInput.trim();
      if (!skills.includes(sk)) setSkills(p => [...p, sk]);
      setSkillInput("");
    }
  };

  // FIX 2: index 0 is a real CSS colour (C.border2) not an empty string ''
  // This prevents `background: ""` and `color: ""` when pwdStrength === 0
  const strengthColors = [C.border2, C.red, C.amber, "#84cc16", C.green];
  const strengthLabels = ["",        "Weak", "Fair",  "Good",    "Strong"];

  const isGoogleUser = user?.authProvider === "google";

  return (
    <DashboardLayout>
      {/*
        FIX 7: single <style> block — merged @keyframes spin in here
        (was split across two separate <style> tags, causing double injection)
      */}
      <style>{`
        @keyframes toastIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin    { to   { transform: rotate(360deg); } }
        input[type="text"], input[type="email"], input[type="tel"],
        input[type="url"],  input[type="password"], textarea {
          background: ${C.surface} !important;
        }
        input::placeholder, textarea::placeholder { color: ${C.muted2} !important; }
        .tab-btn:hover  { color: ${C.text} !important; }
        .save-btn:hover:not(:disabled) { background: #7c3aed !important; }
        .save-btn:disabled { opacity: .5; cursor: not-allowed; }
        .danger-btn:hover  { background: rgba(239,68,68,.12) !important; border-color: rgba(239,68,68,.4) !important; }
      `}</style>

      <div style={{
        maxWidth: 860,
        margin: "0 auto",
        padding: "28px 24px 48px",
        animation: "fadeUp .3s ease",
      }}>

        {/* ── Page header ── */}
        <div style={{ marginBottom: 28 }}>
          <MonoLabel color={C.muted2}>Account</MonoLabel>
          <h1 style={{
            fontSize: 22, fontWeight: 700, color: C.text,
            margin: "6px 0 4px", letterSpacing: "-0.03em",
          }}>Profile Settings</h1>
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
            Manage your account details, security, and preferences.
          </p>
        </div>

        {/* ── Profile hero card ── */}
        <SectionCard style={{ marginBottom: 24 }}>
          <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ position: "relative" }}>
              <Avatar user={user} size={64} />
              <button style={{
                position: "absolute", bottom: 0, right: 0,
                width: 22, height: 22, borderRadius: "50%",
                background: C.violet, border: `2px solid ${C.card}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#fff",
              }}>
                <Icons.Camera />
              </button>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: "-0.02em" }}>
                {user?.name || "Your Name"}
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{user?.email}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                <span style={{
                  background: C.violetFg, border: `1px solid rgba(139,92,246,.2)`,
                  borderRadius: 5, padding: "2px 8px",
                  fontSize: 11, color: C.violet, fontWeight: 500,
                  fontFamily: "Geist Mono", letterSpacing: "0.06em", textTransform: "uppercase",
                }}>
                  {user?.role || "user"}
                </span>
                {isGoogleUser && (
                  <span style={{
                    background: "rgba(59,130,246,.08)", border: "1px solid rgba(59,130,246,.2)",
                    borderRadius: 5, padding: "2px 8px",
                    fontSize: 11, color: C.blue, fontWeight: 500,
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    <Icons.Google /> Google account
                  </span>
                )}
                <span style={{
                  background: "rgba(34,197,94,.08)", border: "1px solid rgba(34,197,94,.2)",
                  borderRadius: 5, padding: "2px 8px",
                  fontSize: 11, color: C.green, fontWeight: 500,
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.green }} />
                  Verified
                </span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <MonoLabel color={C.muted2}>Member since</MonoLabel>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
                  : "—"}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── Tabs ── */}
        <div style={{
          display: "flex", gap: 2, marginBottom: 20,
          borderBottom: `1px solid ${C.border}`,
        }}>
          {TABS.map(tab => (
            <button key={tab.id} className="tab-btn" onClick={() => setActiveTab(tab.id)} style={{
              background: "none", border: "none",
              borderBottom: `2px solid ${activeTab === tab.id ? C.violet : "transparent"}`,
              padding: "10px 16px 12px",
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 13, fontWeight: 500,
              color: activeTab === tab.id ? C.violet : C.muted,
              transition: "all .15s",
              marginBottom: -1,
            }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════
            TAB: Profile
        ════════════════════════════════════════ */}
        {activeTab === "profile" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeUp .2s ease" }}>

            {/* Basic info */}
            <SectionCard>
              <SectionHeader icon={<Icons.User />} title="Basic Information" description="Your name, contact details, and bio" />
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Field label="Full Name" value={name}     onChange={setName}     placeholder="Your full name" />
                  <Field label="Email"     value={email}    onChange={setEmail}    placeholder="you@example.com"
                    disabled={isGoogleUser}
                    hint={isGoogleUser ? "Managed by Google — cannot be changed here." : undefined} />
                  <Field label="Phone"    value={phone}    onChange={setPhone}    placeholder="+91 98765 43210" type="tel" />
                  <Field label="Location" value={location} onChange={setLocation} placeholder="City, Country" />
                </div>
                <Field label="Bio" value={bio} onChange={setBio}
                  placeholder="Tell recruiters a bit about yourself…" multiline />
              </div>
            </SectionCard>

            {/* Social links */}
            <SectionCard>
              <SectionHeader icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              } title="Social Links" description="Links shown on your public profile" />
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
                <Field label="LinkedIn"  value={linkedin} onChange={setLinkedin} placeholder="https://linkedin.com/in/yourname" type="url" />
                <Field label="GitHub"    value={github}   onChange={setGithub}   placeholder="https://github.com/yourname"   type="url" />
                <Field label="Portfolio" value={website}  onChange={setWebsite}  placeholder="https://yoursite.com"           type="url" />
              </div>
            </SectionCard>

            {/* Skills */}
            <SectionCard>
              <SectionHeader icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              } title="Skills" description="Press Enter to add a skill" />
              <div style={{ padding: "20px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                  {skills.map((sk, i) => (
                    <SkillTag key={i} label={sk} onRemove={() => setSkills(p => p.filter((_, j) => j !== i))} />
                  ))}
                  {skills.length === 0 && (
                    <span style={{ fontSize: 12, color: C.muted2 }}>No skills added yet</span>
                  )}
                </div>
                <input
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={addSkill}
                  placeholder="Type a skill and press Enter…"
                  style={{
                    background: C.surface, border: `1px solid ${C.border2}`,
                    borderRadius: 8, padding: "9px 12px",
                    color: C.text, fontSize: 13, fontFamily: "inherit",
                    outline: "none", width: "100%", transition: "border-color .15s",
                  }}
                  onFocus={e => (e.target.style.borderColor = "rgba(139,92,246,.4)")}
                  onBlur={e  => (e.target.style.borderColor = C.border2)}
                />
              </div>
            </SectionCard>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="save-btn" onClick={handleSaveProfile} disabled={saving} style={{
                background: C.violet, border: "none", borderRadius: 9, padding: "10px 24px",
                color: "#fff", fontSize: 13, fontWeight: 600,
                cursor: "pointer", transition: "background .15s",
                display: "flex", alignItems: "center", gap: 7,
              }}>
                {saving ? (
                  <>
                    <span style={{
                      width: 13, height: 13,
                      border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff",
                      borderRadius: "50%", animation: "spin .6s linear infinite",
                      display: "inline-block",
                    }} />
                    Saving…
                  </>
                ) : (
                  <><Icons.Check /> Save changes</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            TAB: Security
        ════════════════════════════════════════ */}
        {activeTab === "security" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeUp .2s ease" }}>

            <SectionCard>
              <SectionHeader icon={<Icons.Lock />} title="Change Password" description="Use a strong, unique password" />
              {isGoogleUser ? (
                <div style={{ padding: "24px 20px", textAlign: "center" }}>
                  <div style={{ color: C.muted, fontSize: 13, marginBottom: 4 }}>
                    Your account uses Google Sign-In — password management is handled by Google.
                  </div>
                  <MonoLabel color={C.muted2}>No password to change</MonoLabel>
                </div>
              ) : (
                <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
                  <Field label="Current Password" value={currentPwd} onChange={setCurrentPwd}
                    type={showPwd ? "text" : "password"} placeholder="Your current password" />

                  <div style={{ position: "relative" }}>
                    <Field label="New Password" value={newPwd} onChange={setNewPwd}
                      type={showPwd ? "text" : "password"} placeholder="At least 8 characters" />
                    <button onClick={() => setShowPwd(v => !v)} style={{
                      position: "absolute", right: 10, bottom: 10,
                      background: "none", border: "none", cursor: "pointer",
                      color: C.muted, display: "flex",
                    }}>
                      {showPwd ? <Icons.EyeOff /> : <Icons.Eye />}
                    </button>
                  </div>

                  {/* Strength bar — FIX 2: strengthColors[0] is C.border2, never empty string */}
                  {newPwd && (
                    <div>
                      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                        {[1,2,3,4].map(i => (
                          <div key={i} style={{
                            flex: 1, height: 3, borderRadius: 2,
                            background: i <= pwdStrength ? strengthColors[pwdStrength] : C.border2,
                            transition: "background .2s",
                          }} />
                        ))}
                      </div>
                      {/* Only show label when there's text at index (avoids blank label at 0) */}
                      {strengthLabels[pwdStrength] && (
                        <MonoLabel color={strengthColors[pwdStrength]} style={{ fontSize: 9 }}>
                          {strengthLabels[pwdStrength]}
                        </MonoLabel>
                      )}
                    </div>
                  )}

                  <Field label="Confirm New Password" value={confirmPwd} onChange={setConfirmPwd}
                    type={showPwd ? "text" : "password"} placeholder="Repeat new password" />

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button className="save-btn" onClick={handleChangePassword} disabled={saving} style={{
                      background: C.violet, border: "none", borderRadius: 9, padding: "10px 22px",
                      color: "#fff", fontSize: 13, fontWeight: 600,
                      cursor: "pointer", transition: "background .15s",
                      display: "flex", alignItems: "center", gap: 6,
                    }}>
                      {saving ? "Updating…" : "Update Password"}
                    </button>
                  </div>
                </div>
              )}
            </SectionCard>

            <SectionCard>
              <SectionHeader icon={<Icons.Shield />} title="Login Activity" description="Recent sign-in information" />
              <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "Auth Provider",  value: isGoogleUser ? "Google OAuth" : "Email / Password" },
                  { label: "Account Status", value: "Active & Verified" },
                  { label: "Last Login",     value: user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("en-IN") : "—" },
                  { label: "Login Count",    value: user?.loginCount ? `${user.loginCount} times` : "—" },
                ].map((row, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px 0",
                    borderBottom: i < 3 ? `1px solid ${C.border}` : "none",
                  }}>
                    <MonoLabel color={C.muted}>{row.label}</MonoLabel>
                    <span style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {/* ════════════════════════════════════════
            TAB: Notifications
        ════════════════════════════════════════ */}
        {activeTab === "notifications" && (
          <div style={{ animation: "fadeUp .2s ease" }}>
            <SectionCard>
              <SectionHeader icon={<Icons.Bell />} title="Email Notifications" description="Choose what emails you receive" />
              <div style={{ padding: "4px 20px 8px" }}>
                <Toggle checked={notifs.emailJobs}      onChange={v => setNotifs(p => ({ ...p, emailJobs: v }))}
                  label="Job Match Alerts"       description="Get notified when new jobs match your profile" />
                <Toggle checked={notifs.emailScore}     onChange={v => setNotifs(p => ({ ...p, emailScore: v }))}
                  label="Resume Score Updates"   description="Receive tips when your score can be improved" />
                <Toggle checked={notifs.emailInterview} onChange={v => setNotifs(p => ({ ...p, emailInterview: v }))}
                  label="Interview Reminders"    description="Reminders before scheduled mock interviews" />
                <Toggle checked={notifs.emailMarketing} onChange={v => setNotifs(p => ({ ...p, emailMarketing: v }))}
                  label="Tips & Product Updates" description="Occasional career tips and feature announcements" />
              </div>
            </SectionCard>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              {/* FIX 8: wired to handleSaveNotifs which calls the API */}
              <button className="save-btn" onClick={handleSaveNotifs} style={{
                background: C.violet, border: "none", borderRadius: 9, padding: "10px 22px",
                color: "#fff", fontSize: 13, fontWeight: 600,
                cursor: "pointer", transition: "background .15s",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <Icons.Check /> Save preferences
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            TAB: Account
        ════════════════════════════════════════ */}
        {activeTab === "account" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeUp .2s ease" }}>

            <SectionCard>
              <SectionHeader icon={<Icons.Shield />} title="Account Details" />
              <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  { label: "User ID",      value: user?._id ? `${user._id.slice(0, 8)}…` : "—" },
                  { label: "Plan",         value: "Free" },
                  { label: "Auth Method",  value: isGoogleUser ? "Google OAuth 2.0" : "Email & Password" },
                  { label: "Role",         value: user?.role || "user" },
                  { label: "Member Since", value: user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                      : "—" },
                ].map((row, i, arr) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 0",
                    borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none",
                  }}>
                    <MonoLabel color={C.muted}>{row.label}</MonoLabel>
                    <span style={{ fontSize: 12, color: C.text, fontWeight: 500, fontFamily: "Geist Mono" }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Danger zone */}
            <SectionCard style={{ borderColor: "rgba(239,68,68,.2)" }}>
              <div style={{
                padding: "14px 20px", borderBottom: `1px solid rgba(239,68,68,.15)`,
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7,
                  background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: C.red,
                }}>
                  <Icons.Trash />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.red }}>Danger Zone</div>
                  <div style={{ fontSize: 11, color: C.muted }}>Irreversible actions — proceed with caution</div>
                </div>
              </div>

              <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 14px", background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`,
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>Sign out everywhere</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>Revokes all active sessions</div>
                  </div>
                  <button className="danger-btn" onClick={logout} style={{
                    background: "transparent", border: `1px solid rgba(239,68,68,.3)`,
                    borderRadius: 7, padding: "7px 14px",
                    color: C.red, fontSize: 12, fontWeight: 500,
                    cursor: "pointer", transition: "all .15s",
                  }}>Sign out</button>
                </div>

                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 14px", background: "rgba(239,68,68,.03)", borderRadius: 8,
                  border: `1px solid rgba(239,68,68,.15)`,
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.red }}>Delete account</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>
                      Permanently deletes your account, resumes, and all data
                    </div>
                  </div>
                  <button className="danger-btn"
                    onClick={() => addToast("Contact support to delete your account", "error")}
                    style={{
                      background: "rgba(239,68,68,.08)", border: `1px solid rgba(239,68,68,.3)`,
                      borderRadius: 7, padding: "7px 14px",
                      color: C.red, fontSize: 12, fontWeight: 500,
                      cursor: "pointer", transition: "all .15s",
                    }}>Delete account</button>
                </div>
              </div>
            </SectionCard>
          </div>
        )}
      </div>

      <Toast toasts={toasts} />
      {/* NOTE: no second <style> block here — spin keyframe is in the single block above (FIX 7) */}
    </DashboardLayout>
  );
}