/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans:    ["'Geist'", "system-ui", "sans-serif"],
        display: ["'Geist'", "system-ui", "sans-serif"],
        body:    ["'Geist'", "system-ui", "sans-serif"],
        mono:    ["'Geist Mono'", "monospace"],
      },
      colors: {
        // Base surfaces — true black, not navy
        gray: {
          1000: "#080808",  // body bg
          950:  "#0e0e0e",  // sidebar
          900:  "#111111",  // card bg
          800:  "#1a1a1a",  // card hover / elevated
          700:  "#222222",  // input bg
          600:  "#2a2a2a",  // borders
          500:  "#333333",  // muted borders
          400:  "#555555",  // placeholder
          300:  "#888888",  // muted text
          200:  "#aaaaaa",  // secondary text
          100:  "#cccccc",  // body text
          50:   "#eeeeee",  // headings
        },
        // Single accent — violet (Vercel-like)
        violet: {
          600: "#7c3aed",
          500: "#8b5cf6",
          400: "#a78bfa",
          300: "#c4b5fd",
          dim: "rgba(139,92,246,0.12)",
          border: "rgba(139,92,246,0.25)",
        },
        // Semantic
        success: "#22c55e",
        warning: "#f59e0b",
        danger:  "#ef4444",
        info:    "#3b82f6",
      },
      borderRadius: {
        sm:  "4px",
        DEFAULT: "6px",
        md:  "8px",
        lg:  "10px",
        xl:  "12px",
        "2xl": "16px",
        "3xl": "20px",
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "14px", letterSpacing: "0.05em" }],
        xs:    ["11px", { lineHeight: "16px" }],
        sm:    ["12px", { lineHeight: "18px" }],
        base:  ["13px", { lineHeight: "20px" }],
        md:    ["14px", { lineHeight: "22px" }],
        lg:    ["16px", { lineHeight: "24px", letterSpacing: "-0.01em" }],
        xl:    ["18px", { lineHeight: "26px", letterSpacing: "-0.02em" }],
        "2xl": ["22px", { lineHeight: "30px", letterSpacing: "-0.03em" }],
        "3xl": ["28px", { lineHeight: "36px", letterSpacing: "-0.04em" }],
      },
      animation: {
        "fade-up":    "fadeUp 0.35s ease both",
        "fade-in":    "fadeIn 0.25s ease both",
        "shimmer":    "shimmer 1.8s linear infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: 0 },
          "100%": { opacity: 1 },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
      },
      boxShadow: {
        "card":     "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
        "violet":   "0 0 0 2px rgba(139,92,246,0.35)",
      },
    },
  },
  plugins: [],
};