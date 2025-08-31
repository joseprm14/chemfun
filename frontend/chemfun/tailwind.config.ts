import type { Config } from 'tailwindcss'


const config: Config = {
  darkMode: 'class',
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: { soft: "0 10px 25px rgba(0,0,0,0.08)" },
      animation: {
        pop: "pop 300ms ease-out",
        shake: "shake 300ms ease-in-out",
        pulsefast: "pulse 1s ease-in-out infinite",
        confetti: "confetti 1200ms ease-out forwards"
      },
      keyframes: {
        pop: { "0%": { transform: "scale(0.95)" }, "100%": { transform: "scale(1)" } },
        shake: {
          "10%, 90%": { transform: "translateX(-1px)" },
          "20%, 80%": { transform: "translateX(2px)" },
          "30%, 50%, 70%": { transform: "translateX(-4px)" },
          "40%, 60%": { transform: "translateX(4px)" }
        },
        confetti: {
          '0%': { transform: 'translateY(-40vh) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '100%': { transform: 'translateY(60vh) rotate(540deg)', opacity: '0' }
        }
      }
    },
  },
  plugins: [],
}
export default config