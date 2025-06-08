/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./page.tsx",
    "./layout.tsx"
  ],
  theme: {
    extend: {
      colors: {
        'custom-dark-input': '#1e2130',
        'custom-vibrant-blue': '#1a89d1',
        'custom-dark-gray': '#2a2f45',
      }
    },
  },
  plugins: [],
};
