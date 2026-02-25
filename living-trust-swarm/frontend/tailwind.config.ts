import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        stable: '#22c55e',
        stressed: '#eab308',
        turbulent: '#f97316',
        collapsing: '#ef4444',
      },
    },
  },
  plugins: [],
}
export default config