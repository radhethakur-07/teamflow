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
          50: '#F8F5EF',   // Primary canvas / Warm Ivory
          100: '#F2EDE4',  // Sunken surface / Wells
          200: '#E5DED4',  // Subtle borders / Dividers
          300: '#D2C7B9',  // Strong borders / Inputs
          400: '#9C8E80',  // Muted text
          500: '#73665C',  // Secondary typography
          600: '#554B43',  // Primary Warm Charcoal
          700: '#433A33',  // Deep charcoal
          800: '#322B25',  // Dark charcoal accents
          900: '#221D19',  // Near black charcoal
        },
        terracotta: {
          50: '#FDF6F4',
          100: '#FBF0ED',
          200: '#F5DAD3',
          300: '#EFC1B6',
          400: '#E99B85',
          500: '#E98269',  // Primary Terracotta
          600: '#D46E56',  // Hover / Pressed
          700: '#BA5741',
          800: '#94412E',
          900: '#6B2C1D',
        },
        sage: {
          50: '#F6F8F5',
          100: '#F1F5F0',
          200: '#DFE8DD',
          300: '#CAD8C7',
          400: '#ADC1AA',
          500: '#91A88C',  // Primary Sage
          600: '#778E72',
          700: '#5F735B',
          800: '#495946',
          900: '#354133',
        },
        mustard: {
          50: '#FEFCF7',
          100: '#FDF9F2',
          200: '#FBF0DF',
          300: '#F5E3C7',
          400: '#EFD4AB',
          500: '#E9C995',  // Primary Mustard
          600: '#D1AF77',
          700: '#B08E56',
          800: '#8A6E3F',
          900: '#634E2A',
        },
        lavender: {
          50: '#FAF8FC',
          100: '#F6F3F9',
          200: '#EAE3F2',
          300: '#DCCFE7',
          400: '#D1C2DF',
          500: '#C9B8D9',  // Primary Lavender
          600: '#B09DC2',
          700: '#927EAA',
          800: '#735E8E',
          900: '#53426A',
        },
        charcoal: {
          50: '#F5F4F3',
          100: '#E7E5E3',
          200: '#CFCCC8',
          300: '#B3AEA9',
          400: '#8A827B',
          500: '#554B43',  // Primary Warm Charcoal
          600: '#473E37',
          700: '#38302A',
          800: '#2A241F',
          900: '#1D1814',
        }
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'warm-sm': '0 1px 3px rgba(85, 75, 67, 0.05), 0 1px 2px rgba(85, 75, 67, 0.03)',
        'warm-md': '0 4px 12px rgba(85, 75, 67, 0.08), 0 2px 4px rgba(85, 75, 67, 0.04)',
        'warm-lg': '0 12px 32px rgba(85, 75, 67, 0.12), 0 4px 8px rgba(85, 75, 67, 0.06)',
      }
    },
  },
  plugins: [],
};
