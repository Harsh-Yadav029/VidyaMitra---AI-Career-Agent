/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect, useCallback } from "react";
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
  indigo:    "#6366f1",
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

const Badge = ({ label, color = C.violet, bg }) => (
  <span style={{
    background: bg || `${color}18`,
    border: `1px solid ${color}30`,
    borderRadius: 5, padding: "2px 8px",
    fontSize: 11, fontWeight: 500, color,
    fontFamily: "Geist Mono", letterSpacing: "0.06em",
    textTransform: "uppercase", whiteSpace: "nowrap",
  }}>{label}</span>
);

const Dot = ({ color = C.green, size = 6 }) => (
  <span style={{
    display: "inline-block", width: size, height: size,
    borderRadius: "50%", background: color, flexShrink: 0,
  }} />
);

// ── Icons ─────────────────────────────────────────────────────
const Icons = {
  Users: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Resume: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  Stats: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  Shield: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Search: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  ChevronDown: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9"/>
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
  Ban: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/>
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
    </svg>
  ),
  Check: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Crown: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 19l2-10 5 5 3-8 3 8 5-5 2 10H2z"/>
    </svg>
  ),
  User: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Refresh: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  ),
  Eye: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Close: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Google: () => (
    <svg width="11" height="11" viewBox="0 0 48 48" fill="none">
      <path d="M44.5 20H24v8.5h11.8C34.7 33.9 29.8 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" fill="#FFC107"/>
      <path d="M6.3 14.7l7 5.1C15.1 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 7.4 6.3 14.7z" fill="#FF3D00"/>
      <path d="M24 46c5.5 0 10.5-1.9 14.3-5.1l-6.6-5.6C29.7 36.9 26.9 38 24 38c-5.7 0-10.6-3.8-12.4-9l-7 5.3C8.4 41.5 15.6 46 24 46z" fill="#4CAF50"/>
      <path d="M44.5 20H24v8.5h11.8c-.9 2.9-2.8 5.4-5.3 7.1l6.6 5.6C41.5 37.9 45 32 45 24c0-1.3-.2-2.7-.5-4z" fill="#1976D2"/>
    </svg>
  ),
};

// ── Stat card ─────────────────────────────────────────────────
const StatCard = ({ label, value, sub, accent = C.violet, icon, loading }) => (
  <div style={{
    background: C.card, border: `1px solid ${C.border}`,
    borderRadius: 12, padding: "18px 20px",
    display: "flex", flexDirection: "column", gap: 12,
    animation: "fadeUp .3s ease",
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <MonoLabel>{label}</MonoLabel>
      <div style={{
        width: 28, height: 28, borderRadius: 7,
        background: `${accent}18`, border: `1px solid ${accent}25`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: accent,
      }}>{icon}</div>
    </div>
    {loading ? (
      <div style={{ height: 28, background: C.border2, borderRadius: 6, animation: "shimmer 1.2s ease infinite" }} />
    ) : (
      <div style={{
        fontSize: 26, fontWeight: 700, color: C.text,
        fontFamily: "Geist Mono", letterSpacing: "-0.04em",
      }}>{value ?? "—"}</div>
    )}
    {sub && <div style={{ fontSize: 11, color: C.muted }}>{sub}</div>}
  </div>
);

// ── Avatar initials ───────────────────────────────────────────
const AvatarInitials = ({ name = "", size = 30 }) => {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: C.violetDim, border: `1px solid rgba(139,92,246,.25)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size / 3, fontWeight: 700, color: C.violet,
      flexShrink: 0, letterSpacing: "-0.02em",
    }}>{initials || "?"}</div>
  );
};

// ── Confirm Modal ─────────────────────────────────────────────
const ConfirmModal = ({ open, title, message, confirmLabel, confirmColor = C.red, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,.7)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: C.card, border: `1px solid ${C.border2}`,
        borderRadius: 14, padding: "24px", width: 380,
        animation: "scaleIn .18s ease",
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 20 }}>{message}</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{
            background: "transparent", border: `1px solid ${C.border2}`,
            borderRadius: 8, padding: "8px 16px",
            color: C.muted, fontSize: 13, cursor: "pointer",
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            background: `${confirmColor}18`, border: `1px solid ${confirmColor}40`,
            borderRadius: 8, padding: "8px 16px",
            color: confirmColor, fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};

// ── User Detail Drawer ────────────────────────────────────────
const UserDrawer = ({ user: u, open, onClose, onRoleChange, onToggleActive }) => {
  if (!open || !u) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9998,
      display: "flex", justifyContent: "flex-end",
    }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.5)" }} />
      <div style={{
        position: "relative", width: 360,
        background: C.card, borderLeft: `1px solid ${C.border}`,
        display: "flex", flexDirection: "column",
        animation: "slideIn .2s ease",
        overflowY: "auto",
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 20px", borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <MonoLabel>User Details</MonoLabel>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            color: C.muted, display: "flex", padding: 3,
          }}><Icons.Close /></button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Avatar + name */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <AvatarInitials name={u.name} size={48} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{u.name}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{u.email}</div>
              <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
                <Badge
                  label={u.role}
                  color={u.role === "admin" ? C.amber : C.violet}
                />
                <Badge
                  label={u.isActive !== false ? "Active" : "Inactive"}
                  color={u.isActive !== false ? C.green : C.red}
                />
                {u.authProvider === "google" && (
                  <span style={{
                    background: "rgba(59,130,246,.08)", border: "1px solid rgba(59,130,246,.2)",
                    borderRadius: 5, padding: "2px 7px",
                    fontSize: 11, color: C.blue, fontWeight: 500,
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    <Icons.Google /> Google
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Info rows */}
          {[
            { label: "User ID",      value: u._id?.slice(0, 16) + "…" },
            { label: "Joined",       value: u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—" },
            { label: "Last Login",   value: u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString("en-IN") : "—" },
            { label: "Login Count",  value: u.loginCount ?? 0 },
            { label: "Resumes",      value: u.resumeCount ?? 0 },
          ].map((row, i, arr) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between",
              padding: "8px 0",
              borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none",
            }}>
              <MonoLabel color={C.muted2}>{row.label}</MonoLabel>
              <span style={{ fontSize: 12, color: C.text, fontFamily: "Geist Mono" }}>{row.value}</span>
            </div>
          ))}

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            <MonoLabel color={C.muted2} style={{ marginBottom: 4 }}>Actions</MonoLabel>

            <button
              onClick={() => onRoleChange(u._id, u.role === "admin" ? "user" : "admin")}
              style={{
                background: C.violetFg, border: `1px solid rgba(139,92,246,.2)`,
                borderRadius: 8, padding: "9px 14px",
                color: C.violet, fontSize: 13, fontWeight: 500,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
                transition: "all .15s",
              }}
            >
              <Icons.Crown />
              {u.role === "admin" ? "Demote to User" : "Promote to Admin"}
            </button>

            <button
              onClick={() => onToggleActive(u._id, u.isActive !== false)}
              style={{
                background: u.isActive !== false ? "rgba(239,68,68,.06)" : "rgba(34,197,94,.06)",
                border: `1px solid ${u.isActive !== false ? "rgba(239,68,68,.2)" : "rgba(34,197,94,.2)"}`,
                borderRadius: 8, padding: "9px 14px",
                color: u.isActive !== false ? C.red : C.green,
                fontSize: 13, fontWeight: 500, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 7,
                transition: "all .15s",
              }}
            >
              {u.isActive !== false ? <><Icons.Ban /> Deactivate account</> : <><Icons.Check /> Activate account</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Toast ─────────────────────────────────────────────────────
const Toast = ({ toasts }) => (
  <div style={{ position: "fixed", bottom: 24, right: 24, display: "flex", flexDirection: "column", gap: 8, zIndex: 99999 }}>
    {toasts.map(t => (
      <div key={t.id} style={{
        background: t.type === "error" ? "rgba(239,68,68,.12)" : "rgba(34,197,94,.12)",
        border: `1px solid ${t.type === "error" ? "rgba(239,68,68,.3)" : "rgba(34,197,94,.3)"}`,
        borderRadius: 10, padding: "10px 16px",
        display: "flex", alignItems: "center", gap: 8,
        animation: "toastIn .2s ease",
      }}>
        <span style={{ fontSize: 13, color: t.type === "error" ? C.red : C.green, fontWeight: 600 }}>
          {t.type === "error" ? "✕" : "✓"}
        </span>
        <span style={{ fontSize: 13, color: C.text }}>{t.message}</span>
      </div>
    ))}
  </div>
);

// ── Tabs ──────────────────────────────────────────────────────
const TABS = [
  { id: "overview", label: "Overview",         icon: <Icons.Stats /> },
  { id: "users",    label: "User Management",  icon: <Icons.Users /> },
  { id: "resumes",  label: "Resumes",          icon: <Icons.Resume /> },
];

// ── MAIN ─────────────────────────────────────────────────────
export default function AdminPage() {
  const { user: me } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Stats
  const [stats, setStats]         = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Users
  const [users, setUsers]         = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Resumes
  const [resumes, setResumes]     = useState([]);
  const [resumesLoading, setResumesLoading] = useState(false);

  // Modals
  const [confirmModal, setConfirmModal] = useState(null);

  // Toasts
  const [toasts, setToasts]       = useState([]);

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  };

  // ── Fetch stats ──────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data.stats || res.data);
    } catch {
      // Use fallback demo stats if API not ready
      setStats({
        totalUsers: 0, newUsersToday: 0,
        totalResumes: 0, resumesThisWeek: 0,
        totalScores: 0, avgScore: 0,
        totalInterviews: 0, activeUsers: 0,
      });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Fetch users ──────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.users || res.data || []);
    } catch {
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // ── Fetch resumes ─────────────────────────────────────────────
  const fetchResumes = useCallback(async () => {
    setResumesLoading(true);
    try {
      const res = await api.get("/admin/resumes");
      setResumes(res.data.resumes || res.data || []);
    } catch {
      setResumes([]);
    } finally {
      setResumesLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => {
    if (activeTab === "users")   fetchUsers();
    if (activeTab === "resumes") fetchResumes();
  }, [activeTab, fetchUsers, fetchResumes]);

  // ── User actions ──────────────────────────────────────────────
  const handleRoleChange = async (userId, newRole) => {
    if (userId === me?._id) { addToast("Cannot change your own role", "error"); return; }
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(p => p.map(u => u._id === userId ? { ...u, role: newRole } : u));
      if (selectedUser?._id === userId) setSelectedUser(p => ({ ...p, role: newRole }));
      addToast(`Role updated to ${newRole}`);
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to update role", "error");
    }
  };

  const handleToggleActive = async (userId, currentlyActive) => {
    if (userId === me?._id) { addToast("Cannot deactivate your own account", "error"); return; }
    setConfirmModal({
      title: currentlyActive ? "Deactivate Account" : "Activate Account",
      message: currentlyActive
        ? "This user will be signed out and unable to log in."
        : "This will restore the user's access to their account.",
      confirmLabel: currentlyActive ? "Deactivate" : "Activate",
      confirmColor: currentlyActive ? C.red : C.green,
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await api.patch(`/admin/users/${userId}/status`, { isActive: !currentlyActive });
          setUsers(p => p.map(u => u._id === userId ? { ...u, isActive: !currentlyActive } : u));
          if (selectedUser?._id === userId) setSelectedUser(p => ({ ...p, isActive: !currentlyActive }));
          addToast(currentlyActive ? "Account deactivated" : "Account activated");
        } catch (err) {
          addToast(err?.response?.data?.message || "Failed to update status", "error");
        }
      },
    });
  };

  const handleDeleteUser = (userId) => {
    if (userId === me?._id) { addToast("Cannot delete your own account", "error"); return; }
    setConfirmModal({
      title: "Delete User",
      message: "This will permanently delete the user and all their data — resumes, scores, and sessions. This cannot be undone.",
      confirmLabel: "Delete permanently",
      confirmColor: C.red,
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await api.delete(`/admin/users/${userId}`);
          setUsers(p => p.filter(u => u._id !== userId));
          if (drawerOpen && selectedUser?._id === userId) { setDrawerOpen(false); setSelectedUser(null); }
          addToast("User deleted");
        } catch (err) {
          addToast(err?.response?.data?.message || "Failed to delete user", "error");
        }
      },
    });
  };

  // ── Filtered users ─────────────────────────────────────────────
  const filteredUsers = users.filter(u => {
    const matchSearch = !userSearch ||
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole   = roleFilter === "all" || u.role === roleFilter;
    const matchStatus = statusFilter === "all" ||
      (statusFilter === "active" && u.isActive !== false) ||
      (statusFilter === "inactive" && u.isActive === false);
    return matchSearch && matchRole && matchStatus;
  });

  const statCards = [
    { label: "Total Users",     value: stats?.totalUsers,      sub: `+${stats?.newUsersToday ?? 0} today`,          accent: C.violet, icon: <Icons.Users /> },
    { label: "Resumes Uploaded",value: stats?.totalResumes,    sub: `+${stats?.resumesThisWeek ?? 0} this week`,    accent: C.blue,   icon: <Icons.Resume /> },
    { label: "AI Scores Run",   value: stats?.totalScores,     sub: `Avg score: ${stats?.avgScore ?? "—"}`,         accent: C.green,  icon: <Icons.Stats /> },
    { label: "Mock Interviews",  value: stats?.totalInterviews, sub: `${stats?.activeUsers ?? 0} active users`,     accent: C.amber,  icon: <Icons.Shield /> },
  ];

  return (
    <DashboardLayout>
      <style>{`
        @keyframes fadeUp   { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes toastIn  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scaleIn  { from { opacity:0; transform:scale(.95); } to { opacity:1; transform:scale(1); } }
        @keyframes slideIn  { from { transform:translateX(40px); opacity:0; } to { transform:translateX(0); opacity:1; } }
        @keyframes shimmer  { 0%,100% { opacity:.4; } 50% { opacity:.8; } }
        .tab-btn:hover     { color: ${C.text} !important; }
        .icon-btn:hover    { background: ${C.surface} !important; color: ${C.text} !important; }
        .danger-btn:hover  { background: rgba(239,68,68,.1) !important; color: ${C.red} !important; }
        .row-hover:hover   { background: ${C.surface} !important; cursor: pointer; }
        .filter-select     { appearance: none; cursor: pointer; }
        input::placeholder { color: ${C.muted2} !important; }
      `}</style>

      <div style={{ padding: "28px 24px 48px", maxWidth: 1100, margin: "0 auto" }}>

        {/* ── Page header ── */}
        <div style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          marginBottom: 28,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: "rgba(245,158,11,.12)",
                border: "1px solid rgba(245,158,11,.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: C.amber,
              }}><Icons.Shield /></div>
              <MonoLabel color={C.amber}>Admin Panel</MonoLabel>
            </div>
            <h1 style={{
              fontSize: 22, fontWeight: 700, color: C.text,
              margin: "0 0 4px", letterSpacing: "-0.03em",
            }}>Platform Overview</h1>
            <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
              Manage users, review content, and monitor platform health.
            </p>
          </div>
          <button
            onClick={() => { fetchStats(); if (activeTab === "users") fetchUsers(); if (activeTab === "resumes") fetchResumes(); }}
            style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 8, padding: "8px 14px",
              color: C.muted, fontSize: 12, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              transition: "all .15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = C.border2; }}
            onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}
          >
            <Icons.Refresh /> Refresh
          </button>
        </div>

        {/* ── Stat cards ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14, marginBottom: 28,
        }}>
          {statCards.map((sc, i) => (
            <StatCard key={i} {...sc} loading={statsLoading} />
          ))}
        </div>

        {/* ── Tabs ── */}
        <div style={{
          display: "flex", gap: 2,
          borderBottom: `1px solid ${C.border}`,
          marginBottom: 24,
        }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className="tab-btn"
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: "none", border: "none",
                borderBottom: `2px solid ${activeTab === tab.id ? C.violet : "transparent"}`,
                padding: "10px 18px 12px",
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 13, fontWeight: 500,
                color: activeTab === tab.id ? C.violet : C.muted,
                transition: "all .15s", marginBottom: -1,
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ════════════════════════════
            TAB: Overview
        ════════════════════════════ */}
        {activeTab === "overview" && (
          <div style={{ animation: "fadeUp .25s ease" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

              {/* Recent signups */}
              <div style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 12, overflow: "hidden",
              }}>
                <div style={{
                  padding: "14px 18px", borderBottom: `1px solid ${C.border}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Recent Signups</div>
                  <MonoLabel color={C.muted2}>{users.slice(0, 5).length} shown</MonoLabel>
                </div>
                {usersLoading ? (
                  <div style={{ padding: 20 }}>
                    {[1,2,3].map(i => (
                      <div key={i} style={{
                        height: 36, background: C.border,
                        borderRadius: 6, marginBottom: 8,
                        animation: "shimmer 1.2s ease infinite",
                      }} />
                    ))}
                  </div>
                ) : users.slice(0, 5).length === 0 ? (
                  <div style={{ padding: "24px", textAlign: "center" }}>
                    <MonoLabel color={C.muted2}>No users yet</MonoLabel>
                  </div>
                ) : (
                  users.slice(0, 5).map((u, i) => (
                    <div key={u._id} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 18px",
                      borderBottom: i < 4 ? `1px solid ${C.border}` : "none",
                    }}>
                      <AvatarInitials name={u.name} size={28} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.email}</div>
                      </div>
                      <Badge label={u.role} color={u.role === "admin" ? C.amber : C.muted} />
                    </div>
                  ))
                )}
              </div>

              {/* Quick actions */}
              <div style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 12, overflow: "hidden",
              }}>
                <div style={{
                  padding: "14px 18px", borderBottom: `1px solid ${C.border}`,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Quick Actions</div>
                </div>
                <div style={{ padding: "12px" }}>
                  {[
                    { label: "Manage all users",   sub: "View, edit, and control user accounts", tab: "users",   color: C.violet },
                    { label: "Review resumes",     sub: "Browse all uploaded resumes",           tab: "resumes", color: C.blue },
                    { label: "Platform stats",     sub: "Refresh metrics and overview",          tab: null,      color: C.green, action: fetchStats },
                  ].map((item, i) => (
                    <button
                      key={i}
                      onClick={() => item.tab ? setActiveTab(item.tab) : item.action?.()}
                      style={{
                        width: "100%", background: "transparent",
                        border: `1px solid ${C.border}`, borderRadius: 9,
                        padding: "11px 14px", marginBottom: 8,
                        display: "flex", alignItems: "center", gap: 12,
                        cursor: "pointer", transition: "all .15s", textAlign: "left",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.borderColor = `${item.color}30`; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = C.border; }}
                    >
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: item.color, flexShrink: 0,
                      }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{item.label}</div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{item.sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════
            TAB: Users
        ════════════════════════════ */}
        {activeTab === "users" && (
          <div style={{ animation: "fadeUp .25s ease" }}>

            {/* Filters bar */}
            <div style={{
              display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap",
            }}>
              {/* Search */}
              <div style={{
                flex: 1, minWidth: 220,
                display: "flex", alignItems: "center", gap: 8,
                background: C.card, border: `1px solid ${C.border2}`,
                borderRadius: 9, padding: "0 12px",
              }}>
                <span style={{ color: C.muted, display: "flex" }}><Icons.Search /></span>
                <input
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search by name or email…"
                  style={{
                    background: "transparent", border: "none",
                    color: C.text, fontSize: 13, fontFamily: "inherit",
                    padding: "9px 0", outline: "none", flex: 1,
                  }}
                />
              </div>

              {/* Role filter */}
              {[
                { label: "All Roles", value: "all" },
                { label: "Users",     value: "user" },
                { label: "Admins",    value: "admin" },
              ].map(f => (
                <button key={f.value}
                  onClick={() => setRoleFilter(f.value)}
                  style={{
                    background: roleFilter === f.value ? C.violetFg : C.card,
                    border: `1px solid ${roleFilter === f.value ? "rgba(139,92,246,.3)" : C.border}`,
                    borderRadius: 8, padding: "8px 14px",
                    color: roleFilter === f.value ? C.violet : C.muted,
                    fontSize: 12, fontWeight: 500, cursor: "pointer",
                    transition: "all .15s",
                  }}
                >{f.label}</button>
              ))}

              {/* Status filter */}
              {[
                { label: "All",      value: "all" },
                { label: "Active",   value: "active" },
                { label: "Inactive", value: "inactive" },
              ].map(f => (
                <button key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  style={{
                    background: statusFilter === f.value ? C.violetFg : C.card,
                    border: `1px solid ${statusFilter === f.value ? "rgba(139,92,246,.3)" : C.border}`,
                    borderRadius: 8, padding: "8px 14px",
                    color: statusFilter === f.value ? C.violet : C.muted,
                    fontSize: 12, fontWeight: 500, cursor: "pointer",
                    transition: "all .15s",
                  }}
                >{f.label}</button>
              ))}

              {/* Count */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <MonoLabel color={C.muted2}>{filteredUsers.length} of {users.length}</MonoLabel>
              </div>
            </div>

            {/* Table */}
            <div style={{
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 12, overflow: "hidden",
            }}>
              {/* Table head */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "2fr 2fr 90px 90px 80px 110px",
                padding: "10px 16px",
                borderBottom: `1px solid ${C.border}`,
                background: C.surface,
              }}>
                {["User", "Email", "Role", "Status", "Resumes", "Actions"].map(col => (
                  <MonoLabel key={col} color={C.muted2}>{col}</MonoLabel>
                ))}
              </div>

              {usersLoading ? (
                <div style={{ padding: 20 }}>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{
                      height: 44, background: C.border, borderRadius: 6,
                      marginBottom: 8, animation: "shimmer 1.2s ease infinite",
                    }} />
                  ))}
                </div>
              ) : filteredUsers.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center" }}>
                  <MonoLabel color={C.muted2}>No users found</MonoLabel>
                </div>
              ) : (
                filteredUsers.map((u, i) => (
                  <div
                    key={u._id}
                    className="row-hover"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 2fr 90px 90px 80px 110px",
                      padding: "11px 16px",
                      borderBottom: i < filteredUsers.length - 1 ? `1px solid ${C.border}` : "none",
                      alignItems: "center",
                      transition: "background .1s",
                    }}
                  >
                    {/* Name */}
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                      onClick={() => { setSelectedUser(u); setDrawerOpen(true); }}
                    >
                      <AvatarInitials name={u.name} size={28} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontSize: 13, fontWeight: 500, color: C.text,
                          display: "flex", alignItems: "center", gap: 5,
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                          {u.name}
                          {u._id === me?._id && (
                            <span style={{
                              background: C.violetFg, border: `1px solid rgba(139,92,246,.2)`,
                              borderRadius: 4, padding: "0 5px",
                              fontSize: 9, color: C.violet,
                              fontFamily: "Geist Mono", letterSpacing: "0.06em",
                            }}>YOU</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div style={{ fontSize: 12, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5 }}>
                      {u.authProvider === "google" && <Icons.Google />}
                      {u.email}
                    </div>

                    {/* Role */}
                    <div>
                      <Badge
                        label={u.role}
                        color={u.role === "admin" ? C.amber : C.muted}
                      />
                    </div>

                    {/* Status */}
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Dot color={u.isActive !== false ? C.green : C.red} />
                      <span style={{ fontSize: 12, color: u.isActive !== false ? C.green : C.red }}>
                        {u.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {/* Resumes */}
                    <div>
                      <span style={{ fontSize: 12, fontFamily: "Geist Mono", color: C.muted }}>
                        {u.resumeCount ?? 0}
                      </span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 4 }}>
                      {/* View */}
                      <button
                        className="icon-btn"
                        title="View details"
                        onClick={() => { setSelectedUser(u); setDrawerOpen(true); }}
                        style={{
                          background: "transparent", border: `1px solid ${C.border}`,
                          borderRadius: 7, padding: "5px 7px",
                          color: C.muted, cursor: "pointer",
                          display: "flex", alignItems: "center",
                          transition: "all .1s",
                        }}
                      ><Icons.Eye /></button>

                      {/* Toggle role */}
                      <button
                        className="icon-btn"
                        title={u.role === "admin" ? "Demote to user" : "Promote to admin"}
                        onClick={() => handleRoleChange(u._id, u.role === "admin" ? "user" : "admin")}
                        disabled={u._id === me?._id}
                        style={{
                          background: "transparent", border: `1px solid ${C.border}`,
                          borderRadius: 7, padding: "5px 7px",
                          color: u.role === "admin" ? C.amber : C.muted,
                          cursor: u._id === me?._id ? "not-allowed" : "pointer",
                          display: "flex", alignItems: "center",
                          transition: "all .1s", opacity: u._id === me?._id ? 0.4 : 1,
                        }}
                      ><Icons.Crown /></button>

                      {/* Delete */}
                      <button
                        title="Delete user"
                        onClick={() => handleDeleteUser(u._id)}
                        disabled={u._id === me?._id}
                        style={{
                          background: "transparent", border: `1px solid ${C.border}`,
                          borderRadius: 7, padding: "5px 7px",
                          color: C.muted, cursor: u._id === me?._id ? "not-allowed" : "pointer",
                          display: "flex", alignItems: "center",
                          transition: "all .1s", opacity: u._id === me?._id ? 0.4 : 1,
                        }}
                        onMouseEnter={e => { if (u._id !== me?._id) { e.currentTarget.style.color = C.red; e.currentTarget.style.borderColor = "rgba(239,68,68,.3)"; } }}
                        onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}
                      ><Icons.Trash /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════
            TAB: Resumes
        ════════════════════════════ */}
        {activeTab === "resumes" && (
          <div style={{ animation: "fadeUp .25s ease" }}>
            <div style={{
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 12, overflow: "hidden",
            }}>
              {/* Head */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "2.5fr 2fr 120px 100px 80px",
                padding: "10px 16px",
                borderBottom: `1px solid ${C.border}`,
                background: C.surface,
              }}>
                {["File Name", "Owner", "Uploaded", "Score", "Actions"].map(col => (
                  <MonoLabel key={col} color={C.muted2}>{col}</MonoLabel>
                ))}
              </div>

              {resumesLoading ? (
                <div style={{ padding: 20 }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{
                      height: 44, background: C.border, borderRadius: 6,
                      marginBottom: 8, animation: "shimmer 1.2s ease infinite",
                    }} />
                  ))}
                </div>
              ) : resumes.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center" }}>
                  <MonoLabel color={C.muted2}>No resumes found</MonoLabel>
                </div>
              ) : (
                resumes.map((r, i) => {
                  const score = r.score ?? r.overallScore ?? null;
                  const scoreColor = score >= 80 ? C.green : score >= 60 ? C.amber : score ? C.red : C.muted2;
                  return (
                    <div key={r._id} style={{
                      display: "grid",
                      gridTemplateColumns: "2.5fr 2fr 120px 100px 80px",
                      padding: "11px 16px",
                      borderBottom: i < resumes.length - 1 ? `1px solid ${C.border}` : "none",
                      alignItems: "center",
                    }}>
                      {/* File */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 6,
                          background: "rgba(59,130,246,.08)",
                          border: "1px solid rgba(59,130,246,.15)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: C.blue, flexShrink: 0,
                        }}><Icons.Resume /></div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            fontSize: 13, fontWeight: 500, color: C.text,
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          }}>{r.originalName || r.filename || "Resume"}</div>
                          <MonoLabel color={C.muted2} style={{ fontSize: 9 }}>
                            {r.fileSize ? `${(r.fileSize / 1024).toFixed(0)} KB` : "—"}
                          </MonoLabel>
                        </div>
                      </div>

                      {/* Owner */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                        <AvatarInitials name={r.userId?.name || "?"} size={22} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 12, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {r.userId?.name || "Unknown"}
                          </div>
                          <div style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {r.userId?.email || ""}
                          </div>
                        </div>
                      </div>

                      {/* Date */}
                      <div>
                        <span style={{ fontSize: 12, color: C.muted }}>
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                        </span>
                      </div>

                      {/* Score */}
                      <div>
                        {score != null ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{
                              fontSize: 13, fontWeight: 700, color: scoreColor,
                              fontFamily: "Geist Mono",
                            }}>{score}</span>
                            <div style={{
                              flex: 1, height: 3, background: C.border2, borderRadius: 2,
                            }}>
                              <div style={{
                                width: `${score}%`, height: "100%",
                                background: scoreColor, borderRadius: 2,
                              }} />
                            </div>
                          </div>
                        ) : (
                          <MonoLabel color={C.muted2}>Not scored</MonoLabel>
                        )}
                      </div>

                      {/* Delete */}
                      <div>
                        <button
                          title="Delete resume"
                          onClick={() => setConfirmModal({
                            title: "Delete Resume",
                            message: "This will permanently delete this resume and all its scores.",
                            confirmLabel: "Delete",
                            confirmColor: C.red,
                            onConfirm: async () => {
                              setConfirmModal(null);
                              try {
                                await api.delete(`/admin/resumes/${r._id}`);
                                setResumes(p => p.filter(x => x._id !== r._id));
                                addToast("Resume deleted");
                              } catch {
                                addToast("Failed to delete resume", "error");
                              }
                            },
                          })}
                          style={{
                            background: "transparent", border: `1px solid ${C.border}`,
                            borderRadius: 7, padding: "5px 7px",
                            color: C.muted, cursor: "pointer",
                            display: "flex", alignItems: "center",
                            transition: "all .1s",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color = C.red; e.currentTarget.style.borderColor = "rgba(239,68,68,.3)"; }}
                          onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}
                        ><Icons.Trash /></button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Drawers & Modals ── */}
      <UserDrawer
        user={selectedUser}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedUser(null); }}
        onRoleChange={(id, role) => { handleRoleChange(id, role); }}
        onToggleActive={(id, active) => { handleToggleActive(id, active); }}
      />

      <ConfirmModal
        open={!!confirmModal}
        title={confirmModal?.title}
        message={confirmModal?.message}
        confirmLabel={confirmModal?.confirmLabel}
        confirmColor={confirmModal?.confirmColor}
        onConfirm={confirmModal?.onConfirm}
        onCancel={() => setConfirmModal(null)}
      />

      <Toast toasts={toasts} />
    </DashboardLayout>
  );
}