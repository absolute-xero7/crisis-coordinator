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
        ops: {
          bg: '#050816',
          panel: '#0B1220',
          'panel-light': '#111827',
          border: '#1E293B',
        },
        severity: {
          critical: '#DC2626',
          high: '#F59E0B',
          medium: '#EAB308',
          low: '#3B82F6',
        },
        toronto: {
          fire: '#CC0000',
          police: '#003A70',
          ems: '#00563F',
        },
      },
      fontFamily: {
        display: ['Rajdhani', 'sans-serif'],
        body: ['Work Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
