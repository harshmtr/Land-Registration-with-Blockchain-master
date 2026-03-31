# Quick Fix Checklist - Network ID Mismatch

## The Problem Explained

When you see "Failed to load web3, accounts, or contract", it's usually because:
- Ganache is running on Chain ID **X**
- But your contracts are deployed to Chain ID **Y**
- Frontend looks for contracts on Chain ID **X**, finds nothing → Error

## Quick Fix (5 Steps)

### Step 1: Find Your Ganache Chain ID
- Open Ganache GUI
- Look at top-right corner
- Note the Chain ID (usually **1337** or **5777**)
- Keep this number handy

### Step 2: Update truffle-config.js
```javascript
// FILE: truffle-config.js
// Find the development network section and change:

FROM:
networks: {
  development: {
    host: "127.0.0.1",
    port: 7545,
    network_id: "*",  // ← CHANGE THIS
  }
}

TO:
networks: {
  development: {
    host: "127.0.0.1",
    port: 7545,
    network_id: "1337",  // ← Use your Chain ID (or 5777)
  }
}
```

### Step 3: Redeploy Contracts
```powershell
# Run these commands in PowerShell from project root:

# Remove old build
rm -r build/

# Compile
truffle compile

# Deploy to development network
truffle migrate --reset --network development
```

**Expected output should show:**
```
> Network name:    'development'
> Network id:      1337
```

### Step 4: Verify Deployment
```powershell
# Check what networks are in the artifact
$artifact = Get-Content build\contracts\Land.json | ConvertFrom-Json
$artifact.networks | Get-Member -Type NoteProperty

# Should show: 1337 (or 5777, etc.)
# If still shows old number, the redeploy didn't work
```

### Step 5: Restart React
```powershell
# Kill existing npm start process (Ctrl+C in the terminal)

# Clear cache
cd client
rm -r node_modules/.cache

# Start again
npm start
```

---

## Verification

1. React app loads at http://localhost:3001
2. **Open browser console**: F12 → Console tab
3. **Look for these messages**:
   ```
   === RegisterSeller componentDidMount ===
   ✓ Web3 instance obtained
   ✓ Accounts: [0x...]
   ✓ Network ID: [1337]
   ✓ Contract deployed at: 0x...
   ✓ Contract instance created
   ✓ State updated - Ready to use!
   ```

**If you see all ✓ marks**: You're done! ✅

**If you see ✗ marks**: Note the error message and check **Detailed Debugging** section in COMPLETE_DAPP_DEBUG_GUIDE.md

---

## Common Issues After Fix

### Issue: Still seeing "Failed to load web3, accounts, or contract"
- [ ] Ganache is actually running? (Check http://127.0.0.1:7545 works in browser)
- [ ] truffle-config.js saved? (Check network_id is NOT "*")
- [ ] New build artifacts created? (Check build/contracts/Land.json exists)
- [ ] React restarted? (Kill and restart npm start)
- [ ] Browser cache? (Hard refresh: Ctrl+Shift+Delete or Cmd+Shift+Delete)
- [ ] Check console logs (F12) - paste the error in COMPLETE_DAPP_DEBUG_GUIDE.md

### Issue: "Contract NOT deployed on network 1337"
- Available networks in console show only 5777 or different number
- Fix: Redeploy again with `truffle migrate --reset --network development`
- Verify: Check `build/contracts/Land.json` has `"1337"` section

### Issue: "No accounts found"
- MetaMask not unlocked? (Click MetaMask icon, enter password)
- Wrong network in MetaMask? (Switch to Ganache network)
- No account imported? (Import account from Ganache private keys)

### Issue: "MetaMask is on network X, but Ganache is on Y"
- Switch MetaMask to correct network
- Or restart Ganache on the network MetaMask expects

---

## Windows PowerShell Commands Reference

```powershell
# Delete folder (like rm -r)
rm -r foldername

# Delete file
rm filename

# View file content
cat filename
Get-Content filename

# Check if folder exists
Test-Path ".\build\contracts"

# Convert JSON and check networks
$art = Get-Content client/src/artifacts/Land.json | ConvertFrom-Json
$art.networks | Get-Member -Type NoteProperty

# Navigate to client folder
cd client  # go into client
cd ..      # go back to parent
```

---

## What Each Component Does

```
1. getWeb3.js
   └─ Detects MetaMask or falls back to HTTP
   └─ Connects to http://127.0.0.1:7545
   
2. RegisterSeller.js / RegisterBuyer.js
   └─ Calls getWeb3()
   └─ Gets accounts from MetaMask/Ganache
   └─ Gets current network ID
   └─ Looks up LandContract.networks[networkId]
   └─ If found → Creates contract instance
   └─ If NOT found → ERROR (this is your issue)
   
3. truffle-config.js
   └─ Tells Truffle where to deploy
   └─ network_id must match your Ganache chain ID
   
4. build/contracts/Land.json
   └─ Contains deployed contract addresses
   └─ Has "networks" object with entries like "1337": { "address": "0x..." }
   └─ This is what React looks up when it says deployedNetwork
   
5. deployedNetwork check
   └─ deployedNetwork = LandContract.networks[networkId]
   └─ If networkId is 1337 but JSON only has 5777
   └─ deployedNetwork = undefined → CONTRACT NOT FOUND ERROR
```

---

## Re-running Diagnostic

To re-check your setup, run:
```powershell
# From project root
.\diagnostic-script.ps1
```

This will tell you exactly what's configured and what networks have contracts.
