# Frontend Connection Troubleshooting - Step by Step Guide

## The Problem You're Facing

**Error**: "Failed to load web3, accounts, or contract"

**Root Cause**: Contract deployed on chain ID 5777 but Ganache running on chain ID 1337 (or vice versa)

**Current Status in Land.json**:
- ✓ Network 5777: Contract deployed
- ✗ Network 1337: **NOT** deployed

---

## STEP-BY-STEP FIX

### Step 1: Verify Ganache Configuration

**Check what chain ID your Ganache is using:**

1. Open Ganache GUI
2. Look at the top right corner - should show "CHAIN ID: 1337"
3. In the RPC URL section, confirm it shows: `http://127.0.0.1:7545`

If you see a different Chain ID:
- **If you can change it**: In Ganache settings, set Chain ID to 1337
- **If you can't change it**: Note the current Chain ID (e.g., 5777) and use it in Step 2

### Step 2: Update truffle-config.js with Correct Network ID

```javascript
// truffle-config.js
module.exports = {
  contracts_build_directory: './client/src/artifacts/',
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "1337",  // ← Match your Ganache Chain ID here
    },
  },
  compilers: {
    solc: {
      version: "0.5.16"  // Your solidity version
    }
  }
};
```

**Important**: Set `network_id` to the exact Chain ID Ganache is showing (1337, 5777, etc.)

### Step 3: Clean and Redeploy Contracts

```bash
# From project root directory

# Step 3a: Remove old deployments
rm -r build/

# Step 3b: Do a clean migration
truffle migrate --reset --network development

# Expected output:
# Deploying 'Migrations'
#    - transaction hash: 0x...
#    - contract address: 0x74b24c1...
#
# Deploying 'Land'
#    - transaction hash: 0x...
#    - contract address: 0x96b24c1...
```

### Step 4: Verify Contract Artifact

Check that `client/src/artifacts/Land.json` now contains your Chain ID:

```bash
# Using PowerShell to view the networks section:
(Get-Content client/src/artifacts/Land.json | ConvertFrom-Json).networks | Get-Member

# Should show your chain ID, e.g., "1337"
```

Or open the file and search for `"networks"` - you should see:

```json
"networks": {
  "1337": {
    "events": {},
    "links": {},
    "address": "0x...",
    "transactionHash": "0x..."
  }
}
```

### Step 5: Update MetaMask Network

1. Open MetaMask
2. Go to Settings → Networks → Add Network
3. Configure:
   - **Network Name**: Ganache Local
   - **RPC URL**: http://127.0.0.1:7545
   - **Chain ID**: 1337
   - **Currency Symbol**: ETH
4. Switch to this network in MetaMask
5. Import a Ganache account using the private key from Ganache startup screen

### Step 6: Clear React Cache

```bash
cd client
rm -r node_modules/.cache
npm start
```

### Step 7: Verify Frontend Connection

1. Open browser to `http://localhost:3001`
2. Open Developer Console (F12)
3. You should see detailed logs like:

```
=== RegisterSeller componentDidMount ===
Step 1: Getting Web3 instance...
✓ Web3 instance obtained

Step 2: Getting accounts...
✓ Accounts: ['0x123456...']

Step 3: Getting network ID...
✓ Network ID: 1337

Step 4: Checking contract deployment...
Available networks in Land.json: 1337
✓ Contract deployed at: 0x96b24c1...

Step 5: Creating contract instance...
✓ Contract instance created

Step 6: Setting component state...
✓ State updated successfully
=== RegisterSeller componentDidMount completed ===
```

If you see **red X marks** or errors, check the detailed error message in the console.

---

## TROUBLESHOOTING CHECKLIST

### If you see: "Network ID: 5777" vs "Network ID: 1337"

**Problem**: Ganache Chain ID doesn't match what you expected

**Solution**:
1. Stop Ganache
2. In Ganache workspace settings, change Chain ID to match
3. Restart Ganache
4. Verify the new Chain ID
5. Redeploy contracts

### If you see: "No accounts available"

**Problem**: No account imported in MetaMask

**Solution**:
1. Get private key from Ganache (usually 0x1234... printed at startup)
2. In MetaMask: Settings → Accounts → Import Account
3. Paste the private key
4. Refresh browser

### If you see: "Contract not deployed on network 1337"

**Problem**: Contracts exist in Land.json but for a different chain ID

**Solution**:
```bash
# Verify what's in the artifact
cat client/src/artifacts/Land.json | grep -A 5 "networks"

# If it shows wrong network ID, redeploy:
rm -r build/
truffle migrate --reset --network development
```

### If Ganache crashes or restarts

**Problem**: All deployments are lost (Ganache deletes old blocks)

**Solution**:
```bash
# Redeploy again
truffle migrate --reset --network development
```

---

## QUICK DIAGNOSTIC COMMAND

Run this in browser console to get full diagnostic info:

```javascript
async function diagnoseWeb3Setup() {
  try {
    console.log('=== WEB3 DIAGNOSTIC ===');
    
    const web3 = window.web3 || new Web3(window.ethereum || 'http://127.0.0.1:7545');
    
    // 1. Check connection
    const isListening = await web3.eth.net.isListening();
    console.log('1. Web3 Connection:', isListening ? '✓ OK' : '✗ FAILED');
    
    // 2. Check network
    const networkId = await web3.eth.net.getId();
    console.log('2. Network ID:', networkId);
    
    // 3. Check accounts
    const accounts = await web3.eth.getAccounts();
    console.log('3. Accounts:', accounts.length > 0 ? `✓ ${accounts[0]}` : '✗ None');
    
    // 4. Check contract
    try {
      const Land = require('./artifacts/Land.json');
      const hasNetwork = !!Land.networks[networkId];
      console.log('4. Contract on Network', networkId + ':', hasNetwork ? '✓ YES' : '✗ NO');
      console.log('   Available networks:', Object.keys(Land.networks).join(', '));
      
      if (hasNetwork) {
        console.log('   Contract address:', Land.networks[networkId].address);
      }
    } catch (err) {
      console.log('4. Contract artifact error:', err.message);
    }
    
  } catch (error) {
    console.error('Diagnostic error:', error);
  }
}

diagnoseWeb3Setup();
```

---

## Expected Final Result

✓ Ganache running on http://127.0.0.1:7545 with Chain ID 1337  
✓ Contracts deployed to network 1337  
✓ Land.json shows networks.1337.address exists  
✓ MetaMask connected to Ganache network  
✓ Account imported in MetaMask  
✓ React app loads logs showing step-by-step connection  
✓ No error alerts on page load  

---

## If Still Not Working

1. **Take a screenshot** of the browser console (F12) error
2. **Take a screenshot** of Ganache showing the Chain ID and RPC URL
3. **Share the error message** - it will now be MUCH more detailed thanks to improved logging
4. Run the diagnostic command above and share the output
