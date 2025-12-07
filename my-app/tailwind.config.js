/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Restoring the "Tech Blue" Palette
        slate: {
          850: '#151b2e', // Custom dark blue-gray
          900: '#0f172a', 
          950: '#020617', 
        },
        cyan: {
          400: '#22d3ee', // Neon Cyan
          500: '#06b6d4',
        }
      },
      animation: {
        'scan': 'scan 2s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        scan: {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        }
      }
    },
  },
  plugins: [],
}