/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        chronicle: {
          surface: '#fbf9f6',             // Chronicle Light Base Surface (warm editorial paper)
          'surface-raised': '#ffffff',     // Card / Sidebar / Panel surface
          'surface-sunken': '#f2eee9',     // Inset / Well background
          primary: '#3d4451',             // Chronicle Light Primary Ink (clear, comfortable contrast)
          secondary: '#757d8a',           // Chronicle Light Secondary Ink (subdued captions & hints)
          accent: '#82a1b9',              // Chronicle Light Sole Accent (muted slate blue)
          'accent-dim': '#6b89a0',
          'accent-light': '#ebf1f6',       // Very subtle accent tint
          border: 'rgba(61, 68, 81, 0.14)',      // Hairline borders
          'border-strong': 'rgba(61, 68, 81, 0.28)',
          fill: 'rgba(61, 68, 81, 0.05)',        // Subtle Fill (5%)
          'fill-hover': 'rgba(61, 68, 81, 0.09)', // Hover state (9%)
          'stroke-tint': 'rgba(61, 68, 81, 0.60)',
        }
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Songti SC', 'STSong', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      lineHeight: {
        narrative: '1.85',
        display: '1.0',
        heading: '1.2',
      }
    },
  },
  plugins: [],
}
