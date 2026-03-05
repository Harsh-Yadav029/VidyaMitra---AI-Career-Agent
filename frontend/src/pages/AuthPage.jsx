/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
  violetHov: "#7c3aed",
  text:      "#e8e8e8",
  muted:     "#666",
  muted2:    "#444",
  green:     "#22c55e",
  red:       "#ef4444",
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

// ── Icons ─────────────────────────────────────────────────────
const Icons = {
  Eye: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  EyeOff: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ),
  Mail: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  Lock: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  User: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  Check: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Google: () => (
    <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
      <path d="M44.5 20H24v8.5h11.8C34.7 33.9 29.8 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" fill="#FFC107"/>
      <path d="M6.3 14.7l7 5.1C15.1 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 7.4 6.3 14.7z" fill="#FF3D00"/>
      <path d="M24 46c5.5 0 10.5-1.9 14.3-5.1l-6.6-5.6C29.7 36.9 26.9 38 24 38c-5.7 0-10.6-3.8-12.4-9l-7 5.3C8.4 41.5 15.6 46 24 46z" fill="#4CAF50"/>
      <path d="M44.5 20H24v8.5h11.8c-.9 2.9-2.8 5.4-5.3 7.1l6.6 5.6C41.5 37.9 45 32 45 24c0-1.3-.2-2.7-.5-4z" fill="#1976D2"/>
    </svg>
  ),
  Sparkle: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
    </svg>
  ),
};

// ── Animated background dots ──────────────────────────────────
const BgDots = () => {
  const dots = Array.from({ length: 18 }, (_, i) => ({
    x: (i * 37 + 11) % 100,
    y: (i * 53 + 7)  % 100,
    size: 1 + (i % 3),
    delay: (i * 0.3) % 4,
    dur:   3 + (i % 3),
  }));

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* Grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(139,92,246,.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139,92,246,.04) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
      }} />
      {/* Radial glow */}
      <div style={{
        position: "absolute",
        top: "30%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 600, height: 600,
        background: "radial-gradient(circle, rgba(139,92,246,.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      {/* Floating dots */}
      {dots.map((d, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${d.x}%`, top: `${d.y}%`,
          width: d.size, height: d.size,
          borderRadius: "50%",
          background: "rgba(139,92,246,.4)",
          animation: `floatDot ${d.dur}s ease-in-out ${d.delay}s infinite alternate`,
        }} />
      ))}
    </div>
  );
};

// ── Feature list (right panel) ────────────────────────────────
const FEATURES = [
  { icon: "◈", label: "AI Resume Scoring",      sub: "Get instant feedback on your resume" },
  { icon: "◉", label: "Mock Interview Coach",   sub: "Practice with AI-generated questions" },
  { icon: "⬡", label: "Smart Job Matching",     sub: "Find roles that fit your skills" },
  { icon: "◎", label: "Career Agent",           sub: "Your 24/7 career advisor" },
];

// ── Password strength ─────────────────────────────────────────
const getStrength = (pwd) => {
  if (!pwd) return 0;
  let s = 0;
  if (pwd.length >= 8)            s++;
  if (/[A-Z]/.test(pwd))          s++;
  if (/[0-9]/.test(pwd))          s++;
  if (/[^A-Za-z0-9]/.test(pwd))   s++;
  return s;
};
const STRENGTH_COLOR = ["", "#ef4444", "#f59e0b", "#84cc16", "#22c55e"];
const STRENGTH_LABEL = ["", "Weak", "Fair", "Good", "Strong"];

// ── Input field ───────────────────────────────────────────────
const InputField = ({ icon, label, type, value, onChange, placeholder, rightEl, error }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <MonoLabel>{label}</MonoLabel>
    <div style={{
      position: "relative",
      display: "flex", alignItems: "center",
    }}>
      <span style={{
        position: "absolute", left: 12,
        color: error ? C.red : C.muted,
        display: "flex", pointerEvents: "none",
        transition: "color .15s",
      }}>{icon}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          background: C.surface,
          border: `1px solid ${error ? "rgba(239,68,68,.4)" : C.border2}`,
          borderRadius: 9,
          padding: `11px 12px 11px 38px`,
          paddingRight: rightEl ? 40 : 12,
          color: C.text,
          fontSize: 13,
          fontFamily: "inherit",
          outline: "none",
          transition: "border-color .15s, box-shadow .15s",
          boxSizing: "border-box",
        }}
        onFocus={e => {
          e.target.style.borderColor = error ? "rgba(239,68,68,.6)" : "rgba(139,92,246,.5)";
          e.target.style.boxShadow   = error
            ? "0 0 0 3px rgba(239,68,68,.08)"
            : "0 0 0 3px rgba(139,92,246,.08)";
        }}
        onBlur={e => {
          e.target.style.borderColor = error ? "rgba(239,68,68,.4)" : C.border2;
          e.target.style.boxShadow   = "none";
        }}
      />
      {rightEl && (
        <span style={{
          position: "absolute", right: 11,
          display: "flex", alignItems: "center",
        }}>{rightEl}</span>
      )}
    </div>
    {error && (
      <span style={{ fontSize: 11, color: C.red, display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontSize: 10 }}>⚠</span> {error}
      </span>
    )}
  </div>
);

// ── Main component ────────────────────────────────────────────
export default function AuthPage({ mode: initialMode = "login" }) {
  const navigate = useNavigate();
  const { login, register, loginWithGoogle, isAuthenticated } = useAuth();

  const [mode, setMode]           = useState(initialMode);
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPwd, setShowPwd]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]         = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess]     = useState("");

  const strength = getStrength(password);
  const isLogin  = mode === "login";

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  // Sync mode prop
  useEffect(() => { setMode(initialMode); }, [initialMode]);

  const switchMode = () => {
    setMode(m => m === "login" ? "register" : "login");
    setError(""); setFieldErrors({}); setSuccess("");
    setName(""); setEmail(""); setPassword("");
  };

  // ── Validate ──────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!isLogin && !name.trim())       errs.name = "Name is required";
    if (!email.trim())                  errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Enter a valid email";
    if (!password)                      errs.password = "Password is required";
    else if (!isLogin && password.length < 8) errs.password = "At least 8 characters";
    return errs;
  };

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError(""); setFieldErrors({});
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Google ─────────────────────────────────────────────────
  const handleGoogle = async () => {
    setError(""); setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (err) {
      if (err?.code !== "auth/popup-closed-by-user") {
        setError(err?.response?.data?.message || err?.message || "Google sign-in failed.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <>
      <style>{`
        @keyframes floatDot {
          from { transform: translateY(0px) scale(1);   opacity: .3; }
          to   { transform: translateY(-12px) scale(1.4); opacity: .8; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmerBar {
          0%   { width: 0%; }
          100% { width: 100%; }
        }
        input::placeholder { color: ${C.muted2} !important; }
        .google-btn:hover:not(:disabled) {
          background: rgba(139,92,246,.1) !important;
          border-color: rgba(139,92,246,.35) !important;
          color: ${C.text} !important;
        }
        .google-btn:disabled { opacity: .5; cursor: not-allowed; }
        .submit-btn:hover:not(:disabled) { background: #7c3aed !important; }
        .submit-btn:disabled { opacity: .55; cursor: not-allowed; }
        .switch-btn:hover { color: ${C.violet} !important; }
        .feature-item:hover .feature-dot { background: ${C.violet} !important; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        position: "relative",
        overflow: "hidden",
      }}>
        <BgDots />

        {/* ── Left panel — form ── */}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 32px",
          position: "relative",
          zIndex: 1,
        }}>
          <div style={{
            width: "100%",
            maxWidth: 400,
            animation: "fadeUp .35s ease",
          }}>

            {/* Logo */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              marginBottom: 36,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: C.violetDim,
                border: `1px solid rgba(139,92,246,.3)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{
                  fontSize: 14, fontWeight: 800,
                  color: C.violet, fontFamily: "Geist, sans-serif",
                  letterSpacing: "-0.04em",
                }}>V</span>
              </div>
              <span style={{
                fontSize: 15, fontWeight: 700, color: C.text,
                letterSpacing: "-0.02em",
              }}>VidyaMitra</span>
              <div style={{
                marginLeft: "auto",
                background: C.violetFg,
                border: `1px solid rgba(139,92,246,.2)`,
                borderRadius: 6, padding: "2px 8px",
                display: "flex", alignItems: "center", gap: 4,
              }}>
                <Icons.Sparkle />
                <MonoLabel color={C.violet} style={{ fontSize: 9 }}>AI Career</MonoLabel>
              </div>
            </div>

            {/* Heading */}
            <div style={{ marginBottom: 28, animation: "slideLeft .3s ease .05s both" }}>
              <h1 style={{
                fontSize: 24, fontWeight: 800, color: C.text,
                margin: "0 0 6px",
                letterSpacing: "-0.04em",
                lineHeight: 1.2,
              }}>
                {isLogin ? "Welcome back" : "Create your account"}
              </h1>
              <p style={{ fontSize: 13, color: C.muted, margin: 0, lineHeight: 1.5 }}>
                {isLogin
                  ? "Sign in to continue building your career."
                  : "Join VidyaMitra and accelerate your job search."}
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div style={{
                background: "rgba(239,68,68,.08)",
                border: "1px solid rgba(239,68,68,.25)",
                borderRadius: 9, padding: "10px 14px",
                marginBottom: 16, display: "flex", gap: 8,
                animation: "fadeIn .2s ease",
              }}>
                <span style={{ color: C.red, fontSize: 13, flexShrink: 0 }}>⚠</span>
                <span style={{ fontSize: 13, color: "#fca5a5", lineHeight: 1.4 }}>{error}</span>
              </div>
            )}

            {/* Success banner */}
            {success && (
              <div style={{
                background: "rgba(34,197,94,.08)",
                border: "1px solid rgba(34,197,94,.25)",
                borderRadius: 9, padding: "10px 14px",
                marginBottom: 16, display: "flex", gap: 8,
                animation: "fadeIn .2s ease",
              }}>
                <span style={{ color: C.green, fontSize: 13 }}><Icons.Check /></span>
                <span style={{ fontSize: 13, color: "#86efac" }}>{success}</span>
              </div>
            )}

            {/* Google button */}
            <button
              className="google-btn"
              onClick={handleGoogle}
              disabled={loading || googleLoading}
              style={{
                width: "100%",
                background: C.card,
                border: `1px solid ${C.border2}`,
                borderRadius: 10,
                padding: "11px 16px",
                color: C.muted,
                fontSize: 13, fontWeight: 500,
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                marginBottom: 20,
                transition: "all .15s",
                fontFamily: "inherit",
              }}
            >
              {googleLoading ? (
                <span style={{
                  width: 16, height: 16,
                  border: "2px solid rgba(139,92,246,.3)",
                  borderTopColor: C.violet,
                  borderRadius: "50%",
                  animation: "spin .7s linear infinite",
                  display: "inline-block",
                }} />
              ) : <Icons.Google />}
              {googleLoading ? "Connecting…" : "Continue with Google"}
            </button>

            {/* Divider */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              marginBottom: 20,
            }}>
              <div style={{ flex: 1, height: 1, background: C.border }} />
              <MonoLabel color={C.muted2} style={{ fontSize: 9 }}>or with email</MonoLabel>
              <div style={{ flex: 1, height: 1, background: C.border }} />
            </div>

            {/* Form */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
              onKeyDown={handleKeyDown}
            >
              {/* Name — register only */}
              {!isLogin && (
                <div style={{ animation: "fadeIn .2s ease" }}>
                  <InputField
                    icon={<Icons.User />}
                    label="Full Name"
                    type="text"
                    value={name}
                    onChange={setName}
                    placeholder="Your full name"
                    error={fieldErrors.name}
                  />
                </div>
              )}

              <InputField
                icon={<Icons.Mail />}
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                error={fieldErrors.email}
              />

              <InputField
                icon={<Icons.Lock />}
                label="Password"
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={setPassword}
                placeholder={isLogin ? "Your password" : "At least 8 characters"}
                error={fieldErrors.password}
                rightEl={
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    style={{
                      background: "none", border: "none",
                      cursor: "pointer", color: C.muted,
                      display: "flex", padding: 0,
                      transition: "color .15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = C.text}
                    onMouseLeave={e => e.currentTarget.style.color = C.muted}
                  >
                    {showPwd ? <Icons.EyeOff /> : <Icons.Eye />}
                  </button>
                }
              />

              {/* Password strength — register only */}
              {!isLogin && password && (
                <div style={{ animation: "fadeIn .15s ease", marginTop: -4 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 2,
                        background: i <= strength ? STRENGTH_COLOR[strength] : C.border2,
                        transition: "background .25s",
                      }} />
                    ))}
                  </div>
                  <MonoLabel color={STRENGTH_COLOR[strength]} style={{ fontSize: 9 }}>
                    {STRENGTH_LABEL[strength]}
                  </MonoLabel>
                </div>
              )}

              {/* Forgot password */}
              {isLogin && (
                <div style={{ textAlign: "right", marginTop: -6 }}>
                  <button style={{
                    background: "none", border: "none",
                    color: C.muted, fontSize: 12,
                    cursor: "pointer", padding: 0,
                    transition: "color .15s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = C.violet}
                    onMouseLeave={e => e.currentTarget.style.color = C.muted}
                    onClick={() => setSuccess("Password reset coming soon.")}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit */}
              <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={loading || googleLoading}
                style={{
                  width: "100%",
                  background: C.violet,
                  border: "none",
                  borderRadius: 10,
                  padding: "12px",
                  color: "#fff",
                  fontSize: 13, fontWeight: 700,
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  marginTop: 4,
                  transition: "background .15s",
                  letterSpacing: "-0.01em",
                  fontFamily: "inherit",
                }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: 14, height: 14,
                      border: "2px solid rgba(255,255,255,.3)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin .7s linear infinite",
                      display: "inline-block",
                    }} />
                    {isLogin ? "Signing in…" : "Creating account…"}
                  </>
                ) : (
                  <>
                    {isLogin ? "Sign in" : "Create account"}
                    <Icons.ArrowRight />
                  </>
                )}
              </button>
            </div>

            {/* Switch mode */}
            <div style={{
              textAlign: "center", marginTop: 24,
              fontSize: 13, color: C.muted,
            }}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                className="switch-btn"
                onClick={switchMode}
                style={{
                  background: "none", border: "none",
                  color: C.muted, fontSize: 13, fontWeight: 600,
                  cursor: "pointer", padding: 0,
                  transition: "color .15s",
                }}
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </div>

            {/* Terms */}
            {!isLogin && (
              <p style={{
                textAlign: "center", fontSize: 11,
                color: C.muted2, marginTop: 14, lineHeight: 1.5,
              }}>
                By creating an account you agree to our{" "}
                <span style={{ color: C.muted, cursor: "pointer" }}>Terms</span>
                {" "}and{" "}
                <span style={{ color: C.muted, cursor: "pointer" }}>Privacy Policy</span>.
              </p>
            )}
          </div>
        </div>

        {/* ── Right panel — brand ── */}
        <div style={{
          width: 420,
          background: C.surface,
          borderLeft: `1px solid ${C.border}`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "48px 40px",
          position: "relative",
          zIndex: 1,
          animation: "fadeIn .4s ease",
        }}
          className="auth-right-panel"
        >
          {/* Decorative ring */}
          <div style={{
            position: "absolute",
            top: -80, right: -80,
            width: 320, height: 320,
            borderRadius: "50%",
            border: "1px solid rgba(139,92,246,.1)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute",
            top: -40, right: -40,
            width: 200, height: 200,
            borderRadius: "50%",
            border: "1px solid rgba(139,92,246,.06)",
            pointerEvents: "none",
          }} />

          {/* Tagline */}
          <div style={{ marginBottom: 40 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: C.violetFg,
              border: `1px solid rgba(139,92,246,.2)`,
              borderRadius: 7, padding: "4px 10px",
              marginBottom: 16,
            }}>
              <span style={{ color: C.violet, display: "flex" }}><Icons.Sparkle /></span>
              <MonoLabel color={C.violet} style={{ fontSize: 9 }}>AI-Powered Platform</MonoLabel>
            </div>
            <h2 style={{
              fontSize: 26, fontWeight: 800, color: C.text,
              margin: "0 0 12px",
              letterSpacing: "-0.04em",
              lineHeight: 1.2,
            }}>
              Build your career<br />
              <span style={{ color: C.violet }}>with AI</span>
            </h2>
            <p style={{
              fontSize: 13, color: C.muted, margin: 0,
              lineHeight: 1.65, maxWidth: 280,
            }}>
              VidyaMitra helps you craft better resumes, ace interviews, and land the job you deserve — all powered by AI.
            </p>
          </div>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="feature-item"
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "13px 0",
                  borderBottom: i < FEATURES.length - 1 ? `1px solid ${C.border}` : "none",
                  animation: `fadeUp .3s ease ${.1 + i * .08}s both`,
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: C.violetDim,
                  border: `1px solid rgba(139,92,246,.15)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, color: C.violet, flexShrink: 0,
                  transition: "background .15s",
                }}>{f.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{f.label}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{f.sub}</div>
                </div>
                <div
                  className="feature-dot"
                  style={{
                    marginLeft: "auto", width: 6, height: 6,
                    borderRadius: "50%", background: C.muted2,
                    transition: "background .15s", flexShrink: 0,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div style={{
            marginTop: 36,
            padding: "14px 16px",
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              {/* Avatar stack */}
              <div style={{ display: "flex" }}>
                {["AK", "SR", "PV"].map((init, i) => (
                  <div key={i} style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: `hsl(${260 + i * 20}, 60%, 50%)`,
                    border: `2px solid ${C.card}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 8, fontWeight: 700, color: "#fff",
                    marginLeft: i > 0 ? -6 : 0,
                    zIndex: 3 - i,
                    position: "relative",
                  }}>{init}</div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>
                Join <span style={{ color: C.text, fontWeight: 600 }}>2,400+</span> job seekers
              </div>
            </div>
            <div style={{
              display: "flex", gap: 2,
            }}>
              {[1,2,3,4,5].map(i => (
                <span key={i} style={{ fontSize: 11, color: "#f59e0b" }}>★</span>
              ))}
              <span style={{ fontSize: 11, color: C.muted, marginLeft: 4 }}>
                4.9 avg resume score improvement
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hide right panel on small screens */}
      <style>{`
        @media (max-width: 768px) {
          .auth-right-panel { display: none !important; }
        }
      `}</style>
    </>
  );
}