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
        // Industrial Clarity Color Palette - from Flutter theme
        primary: {
          light: '#2563EB', // Professional blue
          dark: '#3B82F6', // Lighter blue for dark mode
        },
        secondary: {
          light: '#64748B', // Neutral slate
          dark: '#94A3B8', // Lighter slate
        },
        success: {
          light: '#059669', // Clear green
          dark: '#10B981', // Lighter green
        },
        warning: {
          light: '#D97706', // Amber
          dark: '#FBBF24', // Lighter amber
        },
        error: {
          light: '#DC2626', // Distinct red
          dark: '#EF4444', // Lighter red
        },
        surface: {
          light: '#FFFFFF', // Pure white
          dark: '#1E293B', // Dark surface
        },
        background: {
          light: '#F8FAFC', // Subtle off-white
          dark: '#0F172A', // Dark background
        },
        border: {
          light: '#E2E8F0', // Light gray
          dark: '#334155', // Dark border
        },
        // Premium Dark Mode Palette
        dark: {
          base: '#0F1115',      // Layer 1 - Background
          card: '#141820',      // Layer 2 - Cards/Sections
          input: '#1B1F28',     // Layer 3 - Inputs/Surfaces
          stroke: 'rgba(255,255,255,0.07)', // Soft Dividers
          highlight: 'rgba(255,255,255,0.04)', // Hover State
          'text-head': '#FFFFFF',
          'text-body': '#D6DAE2',
          'text-muted': '#A0A6B4',
          'accent-sec': '#9DB4FF', // Secondary Accent
        },
        text: {
          primary: {
            light: '#0F172A', // Near-black
            dark: '#F1F5F9', // Light text
          },
          secondary: {
            light: '#475569', // Medium gray
            dark: '#94A3B8', // Medium light text
          },
          disabled: {
            light: '#94A3B8',
            dark: '#64748B',
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
        'dark-card-shadow': '0px 8px 24px rgba(0,0,0,0.45)',
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

