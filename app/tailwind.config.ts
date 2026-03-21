import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // V4 — Whiteboard System
        canvas:  '#F7F7F7',   // base background
        ink:     '#111111',   // primary text
        line:    '#E5E5E5',   // grid / structure lines
        border:  '#DADADA',   // node borders
        muted:   '#888888',   // secondary text
        subtle:  '#CCCCCC',   // very light elements
        // Accent — jade (use sparingly)
        jade:    '#2E7D6B',
        'jade-light': '#EAF4F1',
        'jade-dim':   '#2E7D6B30',
        // States
        signal:  '#2E7D6B',   // active / live signal
        warn:    '#B85C00',   // warning state
        alert:   '#C0392B',   // critical
        // Legacy (atlas dark map still uses these)
        void:     '#0A0B14',
        aqua:     '#5CFFD0',
        terra:    '#FF5C3A',
        solar:    '#FFC64D',
        parchment:'#F0EDE8',
        surface:  '#13141F',
        violet:   '#A78BFA',
      },
      fontFamily: {
        serif: ['DM Serif Display', 'Georgia', 'serif'],
        mono:  ['DM Mono', 'Fira Code', 'monospace'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow':  'pulse 3s ease-in-out infinite',
        'flow':        'flow 8s linear infinite',
        'drift':       'drift 12s ease-in-out infinite',
        'blink':       'blink 1.4s step-end infinite',
        'scan':        'scan 2s ease-in-out infinite',
      },
      keyframes: {
        flow:  { '0%': { opacity: '0.3', transform: 'translateX(-4px)' }, '50%': { opacity: '1' }, '100%': { opacity: '0.3', transform: 'translateX(4px)' } },
        drift: { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-8px)' } },
        blink: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0' } },
        scan:  { '0%,100%': { opacity: '0.2' }, '50%': { opacity: '0.8' } },
      },
    },
  },
  plugins: [],
}

export default config
