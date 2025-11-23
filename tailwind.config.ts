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
          bg: '#0a0d11',
          panel: '#0f141c',
          'panel-light': '#151c25',
          border: '#243042',
        },
        severity: {
          critical: '#f06767',
          high: '#f5b75f',
          medium: '#8bc6ff',
          low: '#7be0c3',
        },
        toronto: {
          fire: '#d83a36',
          police: '#1f4f8f',
          ems: '#1f8f78',
        },
        accent: {
          amber: '#f5b75f',
          mint: '#7be0c3',
          coral: '#ef6c57',
          ink: '#c9d7f2',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
