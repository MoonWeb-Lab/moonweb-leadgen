/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#070C18',
        surface: '#0E172A',
        'surface-elevated': '#162038',
        'surface-card': '#1E293B',
        accent: {
          cyan: '#38BDF8',
          emerald: '#10B981',
          rose: '#F43F5E',
          violet: '#8B5CF6',
          amber: '#F59E0B'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'neon-cyan': '0 0 20px -5px rgba(56, 189, 248, 0.4)',
        'neon-emerald': '0 0 20px -5px rgba(16, 185, 129, 0.4)'
      }
    }
  },
  plugins: []
};
