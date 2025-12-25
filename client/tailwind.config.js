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
          light: '#5865F2', // Discord-style Blurple / Premium Blue
          dark: '#5865F2',
        },
        success: {
          light: '#5CC489',
          dark: '#5CC489',
        },
        warning: {
          light: '#FFB85C',
          dark: '#FFB85C',
        },
        error: {
          light: '#FF6A6A',
          dark: '#FF6A6A',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#181C2A', // Panel Color
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
          base: '#0F1220',
          card: '#181C2A',
          input: '#1F2437',
          stroke: 'rgba(255,255,255,0.06)',
          highlight: 'rgba(255,255,255,0.04)',
          'text-head': '#FFFFFF',
          'text-body': 'rgba(255,255,255,0.86)',
          'text-muted': 'rgba(255,255,255,0.65)',
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

