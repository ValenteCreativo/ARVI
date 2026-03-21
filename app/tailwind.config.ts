import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'arvi': '#01f094',
        'arvi-dark': '#0a0f0d',
      }
    },
  },
  plugins: [],
}
export default config
