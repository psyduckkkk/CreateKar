import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: '#FBFBF9',
        ink: {
          DEFAULT: '#0B0F14',
          muted: '#4A5568',
        },
        ledger: '#E2E2DC',
        seal: {
          DEFAULT: '#C83220',
          hover: '#A82615',
          light: '#FDF2F0',
        },
        pine: {
          DEFAULT: '#144234',
          light: '#EBF3F0',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        sm: '2px',
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
      },
    },
  },
  plugins: [],
};

export default config;
