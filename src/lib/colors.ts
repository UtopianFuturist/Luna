// src/lib/colors.ts

// This is a simple object for fixed color values.
// For a more dynamic theming system, consider CSS variables or a theming library.

export const colors = {
  // Button colors
  primaryButtonBackground: '#3b82f6', // blue-500
  primaryButtonText: '#ffffff',       // white
  secondaryButtonBackground: '#4b5563', // gray-600
  secondaryButtonText: '#ffffff',     // white

  // Text colors
  primaryText: '#e2e8f0',        // slate-200 (light text for dark backgrounds)
  secondaryText: '#94a3b8',      // slate-400
  errorText: '#f87171',           // red-400

  // Background colors
  mainBackground: '#0f172a',     // slate-900 (very dark blue/gray)
  cardBackground: '#1e293b',      // slate-800 (darker card background)
  inputBackground: '#334155',     // slate-700
  darkInputBackground: '#283141', // Slightly darker for contrast if needed

  // Additional UI colors (examples from WelcomeScreen/CredentialsScreen)
  vibrantBlue: '#2563eb', // blue-600 (used for main action buttons)
  darkGray: '#374151',    // gray-700 (used for 'Back' or secondary actions)
  lightText: '#f3f4f6',   // gray-100 (for text on darkGray buttons)
  white: '#ffffff',

  // Accent colors
  accentBlue: '#3b82f6', // blue-500
  accentRed: '#ef4444',  // red-500
  accentGreen: '#22c55e', // green-500
};
