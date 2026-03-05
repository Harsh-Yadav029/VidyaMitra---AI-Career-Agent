// ============================================================
// VidyaMitra — services/firebase.js
// Firebase app + Google Auth — uses REDIRECT flow (more reliable)
// ============================================================
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Debug — remove after confirming it works
console.log("🔵 Firebase config check:", {
  apiKey:     firebaseConfig.apiKey     ? "✅ set" : "❌ MISSING",
  authDomain: firebaseConfig.authDomain ? "✅ " + firebaseConfig.authDomain : "❌ MISSING",
  projectId:  firebaseConfig.projectId  ? "✅ " + firebaseConfig.projectId  : "❌ MISSING",
  appId:      firebaseConfig.appId      ? "✅ set" : "❌ MISSING",
});

const app      = initializeApp(firebaseConfig);
const auth     = getAuth(app);
const provider = new GoogleAuthProvider();

provider.setCustomParameters({ prompt: "select_account" });
provider.addScope("email");
provider.addScope("profile");

// ── Try popup first, fall back to redirect if popup is blocked ──
export const signInWithGoogle = async () => {
  try {
    console.log("🔵 Trying signInWithPopup...");
    const result = await signInWithPopup(auth, provider);
    console.log("✅ Popup succeeded, getting idToken...");
    const idToken = await result.user.getIdToken();
    console.log("✅ idToken received, length:", idToken?.length);
    return { idToken, user: result.user };
  } catch (popupError) {
    console.warn("⚠️ Popup failed:", popupError.code, "— trying redirect...");

    // If popup was blocked or closed, fall back to redirect
    if (
      popupError.code === "auth/popup-blocked" ||
      popupError.code === "auth/popup-closed-by-user" ||
      popupError.code === "auth/cancelled-popup-request"
    ) {
      // Store flag so AuthContext knows to check redirect result on next load
      sessionStorage.setItem("vm_google_redirect", "1");
      await signInWithRedirect(auth, provider);
      return null; // page will redirect, promise never resolves
    }

    // Any other error — rethrow so AuthPage shows it
    throw popupError;
  }
};

// ── Call this on app load to handle the redirect result ──────
export const getGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (!result) return null;
    console.log("✅ Redirect result received:", result.user?.email);
    const idToken = await result.user.getIdToken();
    return { idToken, user: result.user };
  } catch (error) {
    console.error("❌ getRedirectResult error:", error.code, error.message);
    throw error;
  }
};

export const signOutFirebase = () => signOut(auth);
export { auth };