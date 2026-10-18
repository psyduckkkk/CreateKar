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
          DEFAULT: '#0D0F14',
          surface: '#161922',
          elevated: '#1E2330',
          border: '#262B38',
          hover: '#222736',
        },
        cobalt: {
          DEFAULT: '#1D62EA',
          hover: '#1550C7',
          light: '#EFF4FE',
          dark: '#0D3D9E',
        },
        tangerine: {
          DEFAULT: '#FF5B00',
          hover: '#E05000',
          light: '#FFF4ED',
          dark: '#B84100',
        },
        brand: {
          DEFAULT: '#1D62EA',
          hover: '#1550C7',
          accent: '#FF5B00',
          light: '#EFF4FE',
          dark: '#0D3D9E',
          glow: 'rgba(29, 98, 234, 0.25)',
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
