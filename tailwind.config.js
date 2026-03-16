/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design-er specific colors
        'cyber-blue': '#00F0FF',
        'cyber-yellow': '#F5D061',
        'glass-dark': 'rgba(15, 23, 42, 0.4)',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
      },
      backgroundImage: {
        // Space background gradient
        'space-dark': 'linear-gradient(to bottom right, #050b18, #101d33, #050b18)',
        'neon-gradient': 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      },
      boxShadow: {
        'neon-glow': '0 0 20px rgba(0, 240, 255, 0.3)',
        'yellow-glow': '0 0 25px rgba(245, 208, 97, 0.5)',
      }
    },
  },
  plugins: [],
}