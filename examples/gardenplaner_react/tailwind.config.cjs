/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        garden: {
          bg: '#f4fbf4',
          surface: 'rgba(255,255,255,0.78)',
          line: '#d4e8d5',
          primary: '#2f8a57',
          primaryDark: '#216b42',
          text: '#123223',
          muted: '#5d7668',
          lavender: '#9f8ce6',
          sun: '#f7c95c'
        }
      },
      borderRadius: {
        panel: '1.5rem',
        card: '1.75rem'
      },
      boxShadow: {
        soft: '0 8px 24px rgba(23, 64, 45, 0.1)',
        lift: '0 14px 36px rgba(47, 138, 87, 0.16)'
      },
      spacing: {
        18: '4.5rem'
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
