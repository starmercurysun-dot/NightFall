import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      borderRadius: {
        "4xl": "1.875rem",
        "5xl": "2.25rem",
      },
      colors: {
        night: {
          950: "#08080f",
          900: "#0c0c14",
          850: "#111119",
          800: "#16161f",
          700: "#1c1c28",
          600: "#242432",
        },
        accent: {
          blue: "#93b4ff",
          purple: "#b4a8ff",
          mint: "#7dd4c8",
          danger: "#e8a09a",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      boxShadow: {
        card: "0 1px 0 rgba(255,255,255,0.04), 0 24px 48px rgba(0,0,0,0.35)",
        zen: "0 0 0 1px rgba(255,255,255,0.05), 0 20px 50px rgba(0,0,0,0.28)",
        "zen-soft":
          "0 0 80px rgba(147, 180, 255, 0.06), 0 0 1px rgba(255,255,255,0.06)",
      },
      backgroundImage: {
        "zen-radial":
          "radial-gradient(120% 80% at 50% -10%, rgba(147, 180, 255, 0.12) 0%, transparent 55%), radial-gradient(80% 60% at 100% 50%, rgba(180, 168, 255, 0.06) 0%, transparent 50%)",
        "zen-card":
          "linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 45%, rgba(255,255,255,0.03) 100%)",
        "zen-active":
          "linear-gradient(135deg, rgba(147, 180, 255, 0.22) 0%, rgba(180, 168, 255, 0.18) 50%, rgba(99, 102, 241, 0.12) 100%)",
        "zen-button":
          "linear-gradient(135deg, rgba(147, 180, 255, 0.35) 0%, rgba(180, 168, 255, 0.28) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
