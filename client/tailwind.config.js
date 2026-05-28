/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:      { DEFAULT: "#0c0e14", 2: "#111520", 3: "#161c2a" },
        surface: { DEFAULT: "#131720", 2: "#192030", border: "#1e2a3d" },
        // "border" color key: border-border = border-color #1e2a3d, border-border-2 = #253450
        border:  { DEFAULT: "#1e2a3d", 2: "#253450" },
        blue:    { DEFAULT: "#2563eb", hover: "#1d4ed8", muted: "#1e3a6e", light: "#93c5fd" },
        slate:   {
          50: "#f8fafc", 100: "#f1f5f9", 200: "#e2e8f0",
          400: "#94a3b8", 500: "#64748b", 600: "#475569",
          700: "#334155", 800: "#1e293b", 900: "#0f172a",
        },
        green:   { DEFAULT: "#16a34a", muted: "rgba(22,163,74,.12)",  light: "#86efac" },
        amber:   { DEFAULT: "#d97706", muted: "rgba(217,119,6,.12)",   light: "#fcd34d" },
        red:     { DEFAULT: "#dc2626", muted: "rgba(220,38,38,.12)",   light: "#fca5a5" },
        purple:  { 400: "#c084fc" },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
      },
      boxShadow: {
        modal: "0 20px 60px -10px rgba(0,0,0,.7)",
      },
    },
  },
  plugins: [],
};
