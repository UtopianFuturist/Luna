# OmniSky Codebase Analysis - File Organization Issues

## Current File Structure Problems

### Files in Wrong Locations (Root Directory):
These files should be moved to proper directories:

1. **Component Files in Root** (should be in src/components/):
   - App.native.tsx
   - AppLayout.tsx
   - AuthContext.tsx (should be in src/contexts/)
   - ComposePost.tsx
   - CredentialsScreen.tsx
   - LoginForm.tsx
   - ProtectedRoute.tsx
   - Sidebar.tsx
   - SignInFlow.tsx
   - TwoFactorScreen.tsx
   - WelcomeScreen.tsx

2. **App Files in Root** (should be in src/app/):
   - index.tsx
   - layout.tsx
   - page.tsx

3. **Utility Files in Root** (should be in src/lib/ or src/utils/):
   - agent.ts
   - client.tsx
   - colors.ts

## Issues to Investigate:
1. Logo display on WelcomeScreen
2. Authentication flow in CredentialsScreen
3. Routing to TwoFactorScreen
4. Client-side exceptions
5. File organization and imports


## Detailed Issues Found

### 1. **Logo Display Issue on WelcomeScreen**
- **Problem**: Logo file `OmniSky_Logo.jpeg` is in root directory but referenced as `/OmniSky_Logo.jpeg`
- **Issue**: Next.js serves static files from `/public` directory, not root
- **Solution**: Need to create `/public` directory and move logo there

### 2. **Authentication Flow Issues**
- **Problem**: Complex authentication flow with potential import path issues
- **Issues Found**:
  - AuthContext imports `./subjectResolver` but file may not exist in root
  - SignInFlow imports from `@/contexts/AuthContext` but AuthContext is in root
  - CredentialsScreen and other components are in root but should be in components

### 3. **File Organization Problems**
- **Critical Issue**: All components are in root directory instead of proper structure
- **Expected Structure**:
  ```
  src/
    app/
      layout.tsx
      page.tsx
      globals.css
    components/
      WelcomeScreen.tsx
      CredentialsScreen.tsx
      TwoFactorScreen.tsx
      etc.
    contexts/
      AuthContext.tsx
    lib/
      colors.ts
      subjectResolver.ts
    public/
      OmniSky_Logo.jpeg
  ```

### 4. **Import Path Issues**
- Components using `@/` alias but files not in correct locations
- Relative imports that will break when files are moved
- Missing `subjectResolver.ts` file referenced in AuthContext

### 5. **Client-Side Exception Sources**
- Missing public directory for static assets
- Incorrect import paths causing module not found errors
- Authentication context trying to import non-existent files

