/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        garden: {
          primary: {
            DEFAULT: '#2f8a57',
            hover: '#27744a',
            active: '#1f603d'
          },
          accent: {
            DEFAULT: '#d8f0ff',
            hover: '#c1e5fa',
            active: '#acd9f2'
          },
          neutral: {
            100: '#f4fbf4',
            200: '#edf6ee',
            300: '#d4e8d5',
            700: '#4d6a55',
            900: '#123223'
          },
          success: {
            DEFAULT: '#5bbf73',
            hover: '#46a75f',
            active: '#388d50'
          },
          warning: {
            DEFAULT: '#f6e8c6',
            hover: '#edd8ab',
            active: '#d8bf82'
          }
        }
      },
      borderRadius: {
        garden: {
          sm: '0.5rem',
          md: '0.75rem',
          lg: '1rem'
        }
      },
      boxShadow: {
        garden: {
          1: '0 6px 18px rgba(23, 64, 45, 0.08)',
          2: '0 14px 34px rgba(23, 64, 45, 0.14)'
        }
      },
      transitionDuration: {
        garden: '180ms'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      minHeight: {
        field: '2.75rem'
      }
    }
  },
  plugins: []
};
