/** @type {import('tailwindcss').Config} */
export const darkMode = 'class'
export const content = [
  './pages/**/*.{js,ts,jsx,tsx}',
  './components/**/*.{js,ts,jsx,tsx}'
]
export const theme = {
  extend: {
    screens: {
      xs: '480px',
      '3xl': '1792px',
      '4xl': '2048px',
      '5xl': '2304px',
      '6xl': '2560px',
      standalone: { raw: '(display-mode: standalone)' }
    }
  }
}
export const plugins = []
