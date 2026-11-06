/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#FAF8F5',   // Canvas base / Ivory
          100: '#F4EFEA',  // Sunken surface / Card well
          200: '#ECE5DD',  // Soft borders / Dividers
          300: '#D8D3CD',  // Strong borders / Inputs
          400: '#99958F',  // Disabled text / Muted
          500: '#706E69',  // Secondary typography
          700: '#52504B',  // Tertiary charcoal
          800: '#403E3A',  // Dark charcoal accents
          900: '#2B2A27',  // Primary Charcoal typography
        },
        terracotta: {
          50: '#FDF7F5',
          100: '#F9EDE8',
          200: '#F2D7CD',
          500: '#C85A32',  // Primary CTA / Brand Accent
          600: '#9F4120',  // Hover / Pressed
          700: '#7F3218',
        },
        sage: {
          50: '#F4F7F4',
          100: '#E8EFE9',
          200: '#D1DFD3',
          500: '#588157',  // Success / Completed / Healthy
          600: '#3A5A40',
        },
        mustard: {
          50: '#FEFCF9',
          100: '#FDF6ED',
          200: '#FAEDCD',
          500: '#D4A373',  // In-Progress / Attention
          600: '#B07D48',
        },
        lavender: {
          50: '#FAF9FB',
          100: '#F0EDF5',
          200: '#E1DBEC',
          500: '#8F819E',  // Review / Tag Accent
          600: '#6A5C7A',
        }
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'warm-sm': '0 1px 3px rgba(43, 42, 39, 0.05), 0 1px 2px rgba(43, 42, 39, 0.03)',
        'warm-md': '0 4px 12px rgba(43, 42, 39, 0.08), 0 2px 4px rgba(43, 42, 39, 0.04)',
        'warm-lg': '0 12px 32px rgba(43, 42, 39, 0.12), 0 4px 8px rgba(43, 42, 39, 0.06)',
      }
    },
  },
  plugins: [],
};
