/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // ✅ Nuances de gris pour le thème sombre (moins noir)
        dark: {
          bg: '#111827',        // gris très foncé
          surface: '#1f2937',   // gris foncé pour les cartes
          surface2: '#374151',  // gris moyen pour les inputs
          surface3: '#4b5563',  // gris clair pour les hover
          border: '#374151',    // bordures
          text: '#f3f4f6',     // texte clair
          textMuted: '#9ca3af', // texte secondaire
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'DM Sans', 'system-ui', 'sans-serif'],
        display: ['Inter', 'Syne', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};