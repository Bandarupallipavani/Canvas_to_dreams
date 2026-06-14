/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: {
          50:  '#fdf8f0',
          100: '#faefd9',
          200: '#f4dbb0',
          300: '#ecc27e',
          400: '#e3a44a',
          500: '#d4892a',
          600: '#b86e1f',
          700: '#96541b',
          800: '#7a441d',
          900: '#65391b',
        },
        ink: {
          DEFAULT: '#1a1208',
          light: '#3d2e1a',
          muted: '#7a6a55',
        },
        parchment: {
          DEFAULT: '#fdf8f0',
          dark: '#f5ede0',
        },
        sage: '#7a8c6e',
        blush: '#c97b6e',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'canvas-gradient': 'linear-gradient(135deg, #fdf8f0 0%, #f4dbb0 100%)',
      },
    },
  },
  plugins: [],
}
