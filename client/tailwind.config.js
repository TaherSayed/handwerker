/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {

      colors: {
        // Industry-standard colors
        primary: {
          light: '#06b6d4', // Cyan-500
          dark: '#0891b2', // Cyan-600
        },
        secondary: {
          light: '#3b82f6',
          dark: '#2563eb',
        },
        success: {
          light: '#10b981',
          dark: '#059669',
        },
        warning: {
          light: '#f59e0b',
          dark: '#d97706',
        },
        error: {
          light: '#ef4444',
          dark: '#dc2626',
        },
        surface: {
          light: '#ffffff',
          dark: '#1e293b',
        },
        background: {
          light: '#F8FAFC',
          dark: '#0F1220', // Base Color
        },
        border: {
          light: '#E2E8F0',
          dark: 'rgba(255,255,255,0.06)', // Border Color
        },
        // Premium Dark Mode Palette
        dark: {
          base: '#0B0D15', // Deeper background
          card: '#1E2330', // Lighter, more distinct card
          input: '#232838', // Slightly lighter input
          stroke: 'rgba(255,255,255,0.08)', // Increased contrast
          highlight: 'rgba(255,255,255,0.05)',
          'text-head': '#FFFFFF',
          'text-body': '#CBD5E1', // More readable body
          'text-muted': '#94A3B8', // Lighter muted
          'accent-sec': '#5865F2',
        },
        text: {
          primary: {
            light: '#0F172A',
            dark: '#FFFFFF',
          },
          secondary: {
            light: '#475569',
            dark: 'rgba(255,255,255,0.86)',
          },
          disabled: {
            light: '#94A3B8',
            dark: 'rgba(255,255,255,0.45)',
          },
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#0F172A',
        },
        'card-foreground': '#0F172A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
        'input': '8px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'elevated': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'dark-card-shadow': '0px 8px 24px rgba(0,0,0,0.25)',
        'sticky-nav': '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
      letterSpacing: {
        'button': '1.25px',
        'label': '0.4px',
      },
    },
  },
  plugins: [],
}

