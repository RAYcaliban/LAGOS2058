import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Aero teal palette
        aero: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#2a8b9a',
          600: '#1e7a85',
          700: '#185e67',
          800: '#134e56',
          900: '#0f3d44',
          950: '#0a2a2f',
        },
        // Parchment/amber palette
        parchment: {
          50: '#fefcf7',
          100: '#fdf5e6',
          200: '#f7e8cc',
          300: '#f2e2c6',
          400: '#e0cca5',
          500: '#c4a56e',
          600: '#b45a14',
          700: '#8b4513',
          800: '#6b3410',
          900: '#4a250d',
        },
        // Semantic colors
        accent: {
          DEFAULT: '#2a8b9a',
          hover: '#1e7a85',
          light: 'rgba(42, 139, 154, 0.1)',
          glow: 'rgba(42, 139, 154, 0.35)',
        },
        danger: {
          DEFAULT: '#ef4444',
          light: 'rgba(239, 68, 68, 0.1)',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: 'rgba(245, 158, 11, 0.1)',
        },
        success: {
          DEFAULT: '#10b981',
          light: 'rgba(16, 185, 129, 0.1)',
        },
        // Dark theme base
        bg: {
          primary: '#0a0f14',
          secondary: '#111922',
          tertiary: '#1a2332',
          quaternary: '#243044',
        },
        text: {
          primary: '#e2e8f0',
          secondary: '#8b9bb4',
          muted: '#64748b',
        },
      },
      fontFamily: {
        sans: ['Rajdhani', 'Segoe UI', 'sans-serif'],
        display: ['Orbitron', 'monospace'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'aero': '0 2px 24px rgba(160, 80, 20, 0.1), 0 0 12px rgba(42, 139, 154, 0.04)',
        'aero-glow': '0 0 25px rgba(42, 139, 154, 0.12), 0 0 50px rgba(180, 90, 20, 0.06)',
        'panel': '0 2px 24px rgba(160, 80, 20, 0.1), 0 0 12px rgba(42, 139, 154, 0.04), inset 0 1px 0 rgba(255, 245, 230, 0.5), inset 0 0 30px rgba(232, 160, 40, 0.03)',
        'glow-teal': '0 0 15px rgba(42, 139, 154, 0.3)',
      },
      backgroundImage: {
        'parchment-gradient': 'linear-gradient(135deg, rgba(242, 226, 198, 0.95) 0%, rgba(224, 200, 165, 0.93) 100%)',
        'dark-gradient': 'linear-gradient(135deg, #111922 0%, #0a0f14 100%)',
        'glass': 'linear-gradient(135deg, rgba(17, 25, 34, 0.8) 0%, rgba(10, 15, 20, 0.9) 100%)',
      },
      animation: {
        'scan': 'scan 8s linear infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
