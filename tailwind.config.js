/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./AuthContext.tsx",
    "./ComposePost.tsx",
    "./CredentialsScreen.tsx",
    "./LoginForm.tsx",
    "./ProtectedRoute.tsx",
    "./Sidebar.tsx",
    "./SignInFlow.tsx",
    "./TwoFactorScreen.tsx",
    "./WelcomeScreen.tsx",
    "./index.tsx",
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
