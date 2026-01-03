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
        // Primary Brand Color - OnSite Türkis (from Logo)
        primary: {
          50: '#e6f7f9',
          100: '#b3e8ed',
          200: '#80d9e1',
          300: '#4dcad5',
          400: '#1ab9c9',
          500: '#0FB2C9', // Main primary - Türkis Verlauf Mitte
          600: '#0A8FA9', // Dunkler Verlauf
          700: '#066B7E', // Buttons Hover / Outline
          800: '#044755',
          900: '#02232b',
          // Legacy support
          light: '#0FB2C9',
          dark: '#0A8FA9',
        },
        secondary: {
          DEFAULT: '#3b82f6', // Standard Blue
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        // Steel Colors - Industrial Look
        steel: {
          100: '#e5e5e5',
          200: '#cccccc',
          300: '#9E9E9E',
          400: '#808080',
          500: '#6C6C6C',
          600: '#4d4d4d',
          700: '#2B2B2B', // Headlines, Cards, Status
        },
        // Semantic Colors - Harmonious, not bright
        success: {
          DEFAULT: '#0d9488', // Teal-green blend
          light: '#14b8a6',
          dark: '#0f766e',
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#0d9488',
          600: '#0f766e',
        },
        warning: {
          DEFAULT: '#ea8a00', // Muted orange
          light: '#f59e0b',
          dark: '#c9730a',
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#ea8a00',
          600: '#c9730a',
        },
        danger: {
          DEFAULT: '#dc3545', // Muted red
          light: '#e63946',
          dark: '#b02a37',
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#dc3545',
          600: '#b02a37',
        },
        error: {
          DEFAULT: '#ef4444',
          light: '#f87171',
          dark: '#dc2626',
        },
        // Neutral Colors
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Surface Colors
        surface: {
          base: 'var(--color-surface-base)',
          elevated: 'var(--color-surface-elevated)',
          subtle: 'var(--color-surface-subtle)',
          light: '#ffffff',
          dark: '#1e293b',
        },
        // Background Colors
        background: {
          light: '#F8FAFC',
          dark: '#1a1a1a', // Anthracite instead of black
        },
        // Border Colors
        border: {
          subtle: 'var(--color-border-subtle)',
          DEFAULT: 'var(--color-border-default)',
          strong: 'var(--color-border-strong)',
          light: '#E2E8F0',
          dark: 'rgba(255,255,255,0.06)',
        },
        // Text Colors
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          disabled: 'var(--color-text-disabled)',
          inverse: 'var(--color-text-inverse)',
        },
        // Premium Dark Mode Palette - Industrial Anthracite
        dark: {
          base: '#1a1a1a', // Anthracite base
          card: '#252525', // Elevated cards
          input: '#2a2a2a', // Input backgrounds
          stroke: 'rgba(255,255,255,0.12)', // Borders with metallic feel
          highlight: 'rgba(255,255,255,0.08)',
          'text-head': '#f5f5f5',
          'text-body': '#d4d4d4',
          'text-muted': '#a3a3a3',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.5' }],
        sm: ['0.875rem', { lineHeight: '1.5' }],
        base: ['1rem', { lineHeight: '1.5' }],
        lg: ['1.125rem', { lineHeight: '1.5' }],
        xl: ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.375' }],
        '3xl': ['1.875rem', { lineHeight: '1.25' }],
        '4xl': ['2.25rem', { lineHeight: '1.25' }],
      },
      borderRadius: {
        sm: '0.375rem',   // 6px
        md: '0.5rem',       // 8px
        lg: '0.75rem',    // 12px
        xl: '1rem',       // 16px
        '2xl': '1.5rem',  // 24px
        card: '0.75rem',  // 12px
        button: '0.5rem', // 8px
        input: '0.5rem',  // 8px
        pill: '9999px',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        elevated: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'dark-card': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
        'sticky-nav': '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      zIndex: {
        dropdown: '1000',
        sticky: '1020',
        fixed: '1030',
        'modal-backdrop': '1040',
        modal: '1050',
        popover: '1060',
        tooltip: '1070',
      },
    },
  },
  plugins: [],
}

