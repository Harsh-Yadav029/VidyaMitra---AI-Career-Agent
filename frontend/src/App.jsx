import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage          from "./pages/AuthPage";
import DashboardPage     from "./pages/DashboardPage";
import ResumePage        from "./pages/ResumePage";
import AIScorePage       from "./pages/AIScorePage";       // file is AIScorePage.jsx
import InterviewPage     from "./pages/InterviewPage";
import JobsPage          from "./pages/JobsPage";
import CareerAgentPage   from "./pages/CareerAgentPage";
import ProfilePage       from "./pages/ProfilePage";
import ResumeBuilderPage from "./pages/ResumeBuilderPage";   // file is AppTrackerPage.jsx
import AdminPage         from "./pages/AdminPage";

// ── Splash loader ─────────────────────────────────────────────
const SplashLoader = () => (
  <div style={{
    minHeight: "100vh", background: "#090909",
    display: "flex", alignItems: "center", justifyContent: "center",
  }}>
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
      <div style={{
        width:40, height:40, borderRadius:10,
        background:"rgba(139,92,246,.1)", border:"1px solid rgba(139,92,246,.3)",
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        <span style={{ color:"#8b5cf6", fontWeight:800, fontSize:18, fontFamily:"'Geist'" }}>V</span>
      </div>
      <div style={{ display:"flex", gap:5 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width:6, height:6, borderRadius:"50%", background:"#8b5cf6",
            animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite`,
          }}/>
        ))}
      </div>
    </div>
    <style>{`@keyframes pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}`}</style>
  </div>
);

// ── Protected route — any logged-in user ──────────────────────
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <SplashLoader />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// ── Admin route — only role=admin ─────────────────────────────
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <SplashLoader />;
  if (!user)                 return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
};

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login"    element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />

        {/* Protected — all logged-in users */}
        <Route path="/"          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/resume"    element={<ProtectedRoute><ResumePage /></ProtectedRoute>} />
        <Route path="/builder"   element={<ProtectedRoute><ResumeBuilderPage /></ProtectedRoute>} />
        <Route path="/score"     element={<ProtectedRoute><AIScorePage /></ProtectedRoute>} />
        <Route path="/interview" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
        <Route path="/jobs"      element={<ProtectedRoute><JobsPage /></ProtectedRoute>} />
        <Route path="/agent"     element={<ProtectedRoute><CareerAgentPage /></ProtectedRoute>} />
        <Route path="/profile"   element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        {/* Admin only */}
        <Route path="/admin"     element={<AdminRoute><AdminPage /></AdminRoute>} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;