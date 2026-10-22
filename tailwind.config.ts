import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090a0d",
        surface: "#111217",
        "surface-elevated": "#171920",
        "surface-overlay": "#1f212b",
        border: {
          subtle: "#1f222d",
          strong: "#2e3242",
        },
        ink: {
          primary: "#f5f6f8",
          secondary: "#9da3b4",
          muted: "#63697a",
        },
        brand: {
          gold: "#cda043",
          "gold-light": "#e4ba61",
          "gold-dark": "#a77d28",
        },
        status: {
          success: "#22c55e",
          warning: "#f59e0b",
          error: "#ef4444",
          info: "#38bdf8",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
