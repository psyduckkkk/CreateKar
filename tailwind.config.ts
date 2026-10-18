import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#090B10',
          surface: '#11141D',
          elevated: '#171B26',
          border: '#232838',
          hover: '#1C2232',
        },
        brand: {
          DEFAULT: '#6366F1',
          hover: '#4F46E5',
          light: '#EEF2FF',
          dark: '#312E81',
          glow: 'rgba(99, 102, 241, 0.25)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
