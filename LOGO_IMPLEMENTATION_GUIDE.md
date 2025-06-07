# OmniSky Logo Implementation Guide

This guide provides instructions for implementing the OmniSky logo changes across the application.

## Overview

The changes involve:
1. Renaming the logo file to `OmniSky_Logo.jpeg`
2. Updating references in the following files:
   - `src/components/auth/WelcomeScreen.tsx`
   - `Sidebar.tsx`
   - `src/components/AppLayout.tsx`
3. Updating alt text from "BlueShapes" to "OmniSky Logo"

## Implementation Steps

### 1. Logo File

The logo file has been renamed to `OmniSky_Logo.jpeg` and placed in the `public` directory. This ensures it's accessible from the application.

### 2. File Changes

#### WelcomeScreen.tsx

Updated the logo reference from:
```jsx
<Image 
  src="/logo.png" 
  alt="OmniSky Logo" 
  fill
  style={{ objectFit: 'contain' }}
  priority
/>
```

To:
```jsx
<Image 
  src="/OmniSky_Logo.jpeg" 
  alt="OmniSky Logo" 
  fill
  style={{ objectFit: 'contain' }}
  priority
/>
```

#### Sidebar.tsx

Updated the logo reference from:
```jsx
<Image
  src="/shapes_logo.jpeg"
  alt="BlueShapes"
  width={40}
  height={40}
  className="rounded-full"
/>
<h1 className="text-xl font-bold ml-3">BlueShapes</h1>
```

To:
```jsx
<Image
  src="/OmniSky_Logo.jpeg"
  alt="OmniSky Logo"
  width={40}
  height={40}
  className="rounded-full"
/>
<h1 className="text-xl font-bold ml-3">OmniSky</h1>
```

#### AppLayout.tsx

Updated the logo reference from:
```jsx
<Image
  src="/shapes_logo.jpeg"
  alt="Profile"
  width={32}
  height={32}
  className="rounded-full"
/>
```

To:
```jsx
<Image
  src="/OmniSky_Logo.jpeg"
  alt="OmniSky Logo"
  width={32}
  height={32}
  className="rounded-full"
/>
```

### 3. Deployment

The changes have been committed to a new branch called `fix-logo-references`. To deploy these changes:

1. Push the branch to GitHub:
   ```
   git push origin fix-logo-references
   ```

2. Create a pull request on GitHub from the `fix-logo-references` branch to the `main` branch.

3. After the pull request is approved and merged, the changes will be available in the main branch.

4. Deploy the updated application to Render by triggering a new deployment from the main branch.

## Verification

After deployment, verify that:
1. The OmniSky logo appears correctly on the sign-in page
2. The OmniSky logo appears correctly in the sidebar
3. The OmniSky logo appears correctly in the navigation bar
4. All "BlueShapes" text references have been updated to "OmniSky"

## Troubleshooting

If the logo doesn't appear:
1. Check that the `OmniSky_Logo.jpeg` file is in the `public` directory
2. Verify that the path in the Image components is correct (`/OmniSky_Logo.jpeg`)
3. Clear browser cache and reload the page
4. Check the browser console for any errors related to loading the image

