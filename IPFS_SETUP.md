# IPFS Configuration Guide

## Issue Fixed
The previous IPFS configuration was using Infura's gateway without authentication, which now returns error: **"project id required"**

## Current Solution
The app now uses the public **ipfs.io** gateway which works without authentication. This is sufficient for development and testing.

## For Production (Recommended)

### Option 1: Use Infura IPFS (Recommended)

1. **Create Infura Account:**
   - Go to https://infura.io/
   - Sign up for a free account
   - Create a new IPFS project
   - Copy your **Project ID** and **Project Secret**

2. **Add Environment Variables:**
   Create/update `.env.local` in the `client` folder:
   ```
   REACT_APP_INFURA_PROJECT_ID=your_project_id_here
   REACT_APP_INFURA_PROJECT_SECRET=your_project_secret_here
   ```

3. **Uncomment Infura Configuration in `ipfs.js`:**
   ```javascript
   const projectId = process.env.REACT_APP_INFURA_PROJECT_ID;
   const projectSecret = process.env.REACT_APP_INFURA_PROJECT_SECRET;
   const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
   
   const ipfs = new IPFS({
     host: 'ipfs.infura.io',
     port: 5001,
     protocol: 'https',
     headers: {
       authorization: auth
     }
   });
   ```

### Option 2: Use Pinata (Alternative)

1. Go to https://www.pinata.cloud/
2. Sign up for free account
3. Get your API keys
4. Update `ipfs.js` with Pinata configuration

### Option 3: Run Local IPFS Node

1. Install IPFS Desktop: https://github.com/ipfs/ipfs-desktop
2. Run the desktop app
3. Set IPFS gateway to `localhost:5001`

## Current Setup (Development)
- **Gateway:** ipfs.io (public, no auth required)
- **Port:** 443
- **Protocol:** HTTPS
- **Timeout:** 60 seconds

This works for development but may have rate limiting. For production, set up Infura credentials as shown above.

## Testing
After fixing the configuration:
1. Refresh the page
2. Try registering as Buyer or Seller
3. Upload a document to test IPFS functionality
4. Check browser console for any errors
