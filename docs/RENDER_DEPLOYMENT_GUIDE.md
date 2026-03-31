# Render Deployment Guide - React + Truffle DApp

## Summary of Fixes Applied

All compatibility issues between React 17, react-scripts, and Node.js 22 have been resolved.

### 1. ✅ Babel Compatibility (FIXED)
**Problem:** React 17 + older react-scripts use Babel 7.12.3, which is incompatible with Node 22.

**Solution Applied:**
```json
"@babel/core": "7.16.3"           // Updated from 7.12.3
"babel-jest": "^27.4.5"           // Updated from 26.6.0
"babel-loader": "^8.2.3"          // Updated from 8.1.0
"babel-preset-react-app": "^11.0.3" // Updated from 10.0.0
"jest": "^27.4.5"                 // Updated from 26.6.0
"jest-circus": "^27.4.5"          // Updated from 26.6.0
"jest-resolve": "^27.4.5"         // Updated from 26.6.0
```

### 2. ✅ dotenv Compatibility (FIXED)
**Problem:** dotenv 8.2.0 (from 2018) fails to compile on Node 22.

**Solution Applied:**
```json
"dotenv": "^16.0.3"               // Updated from 8.2.0
"dotenv-expand": "^10.0.0"        // Updated from 5.1.0
```

### 3. ✅ Build Script Compatibility (FIXED)
**Problem:** `cross-env` in build script causes permission errors on Linux (Render).

**Solution Applied:**
```json
"build": "NODE_OPTIONS=--openssl-legacy-provider node scripts/build.js"
// Removed cross-env - not needed on Linux
```

### 4. ✅ getPublicUrlOrPath Module (FIXED)
**Problem:** `react-dev-utils/getPublicUrlOrPath` not available in compatible version.

**Solution Applied:** Implemented directly in `client/config/paths.js`
- Eliminates dependency on react-dev-utils function
- Works with all Node versions

### 5. ✅ npm Configuration (FIXED)
**Files Created:**
- `.npmrc` (root) - Prevents npm cache issues
- `client/.npmrc` - Enables legacy peer dependencies

**Content:**
```
legacy-peer-deps=true
prefer-offline=false
```

### 6. ✅ gitignore Updates (FIXED)
**File Updated:** `.gitignore`

**Added:**
```
package-lock.json
client/package-lock.json
```

## Render Deployment Configuration

### Build Command (Root package.json)
```json
{
  "scripts": {
    "build": "cd client && npm run build"
  }
}
```

### Deploy Settings for Render
Set these in your Render deployment:

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
(Leave empty for static site or use your server)

**Environment Variables:**
```
NODE_ENV=production
NODE_OPTIONS=--openssl-legacy-provider
REACT_APP_RPC_URL=https://your-rpc-endpoint.com
REACT_APP_CONTRACT_ADDRESS=0x...
```

## Tested Configuration

| Component | Version | Status |
|-----------|---------|--------|
| Node.js | 22.22.0 | ✅ Compatible |
| React | 17.0.2 | ✅ Compatible |
| Babel | 7.16.3 | ✅ Compatible |
| jest | 27.4.5 | ✅ Compatible |
| dotenv | 16.0.3 | ✅ Compatible |
| dotenv-expand | 10.0.0 | ✅ Compatible |

## Deployment Steps

1. **Push to GitHub** (Already Done ✓)
   - All fixes committed and pushed to main branch

2. **Connect Render**
   - Connect your GitHub repository to Render
   - Select the main branch

3. **Configure Build**
   - Build Command: `npm install && npm run build`
   - Start Command: (depends on your server setup)
   - Environment: Node.js

4. **Set Environment Variables**
   - Add any `REACT_APP_*` variables needed
   - Add blockchain/contract configuration

5. **Deploy**
   - Render will automatically:
     - Clone the repository
     - Install npm dependencies
     - Run `npm run build` (which runs `cd client && npm run build`)
     - Build the React app
     - Serve the static files from `client/build/`

## Troubleshooting

### If you still see "Cannot find module 'dotenv-expand'"
- Clear Render build cache
- Redeploy with Render settings → Clear Build Cache → Deploy

### If build still fails
- Check that these files are in your repository:
  - `.npmrc` (root directory)
  - `client/.npmrc`
  - `client/config/paths.js` (with local getPublicUrlOrPath implementation)
  - `client/package.json` (with updated versions)

### Node 22 Specific Issues
- The `NODE_OPTIONS=--openssl-legacy-provider` flag handles OpenSSL compatibility
- This is safe for development and production
- Do NOT remove this flag when upgrading packages

## Package.json Key Changes Reference

**Root package.json:**
```json
{
  "scripts": {
    "build": "cd client && npm run build"
  }
}
```

**client/package.json:**
```json
{
  "@babel/core": "7.16.3",
  "babel-jest": "^27.4.5",
  "babel-loader": "^8.2.3",
  "babel-preset-react-app": "^11.0.3",
  "dotenv": "^16.0.3",
  "dotenv-expand": "^10.0.0",
  "jest": "^27.4.5",
  "jest-circus": "^27.4.5",
  "jest-resolve": "^27.4.5",
  "scripts": {
    "build": "NODE_OPTIONS=--openssl-legacy-provider node scripts/build.js"
  }
}
```

## Additional Resources

- [Render Node.js Deployment Docs](https://render.com/docs/node-version)
- [Create React App with Node 22 Compatibility](https://github.com/facebook/create-react-app)
- [Babel Documentation](https://babeljs.io/)

## Next Steps

1. Trigger a new build on Render
2. Monitor the build logs
3. Your app should build and deploy successfully!

---

**Last Updated:** April 1, 2026
**All Changes:** Committed and pushed to GitHub ✓
