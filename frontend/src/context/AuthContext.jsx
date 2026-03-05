/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { signInWithGoogle, signOutFirebase, getGoogleRedirectResult } from "../services/firebase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(() => localStorage.getItem("vm_token"));
  const [loading, setLoading] = useState(true);

  // ── On mount: load user OR handle Google redirect return ──
  useEffect(() => {
    const init = async () => {
      const wasRedirect = sessionStorage.getItem("vm_google_redirect");
      if (wasRedirect) {
        sessionStorage.removeItem("vm_google_redirect");
        try {
          console.log("🔵 Handling Google redirect result...");
          const result = await getGoogleRedirectResult();
          if (result?.idToken) {
            const res = await api.post("/auth/google", { idToken: result.idToken });
            const { token: newToken, user: newUser } = res.data;
            localStorage.setItem("vm_token", newToken);
            setToken(newToken);
            setUser(newUser);
            console.log("✅ Google redirect login complete:", newUser?.email);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error("❌ Google redirect result failed:", err.message);
        }
      }

      // Normal JWT load
      if (!token) { setLoading(false); return; }
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.user);
      } catch {
        localStorage.removeItem("vm_token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem("vm_token", newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await api.post("/auth/register", { name, email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem("vm_token", newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  // ── Google Login (popup with redirect fallback) ───────────
  const loginWithGoogle = useCallback(async () => {
    console.log("🔵 [Google] Step 1: Starting sign-in...");
    const result = await signInWithGoogle();

    if (!result) {
      console.log("🔵 [Google] Redirect initiated — page will reload after Google auth");
      return;
    }

    const { idToken } = result;
    const res = await api.post("/auth/google", { idToken });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem("vm_token", newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem("vm_token");
    setToken(null);
    setUser(null);
    try { await signOutFirebase(); } catch { /* ignore */ }
  }, []);

  // ── updateUser — merges a partial patch into the current user object ──
  // Called by ProfilePage after a successful PUT /auth/profile so the
  // Sidebar avatar/name and hero card update instantly without a page reload.
  const updateUser = useCallback((patch) => {
    setUser(prev => prev ? { ...prev, ...patch } : prev);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, register, loginWithGoogle, logout,
      updateUser,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};