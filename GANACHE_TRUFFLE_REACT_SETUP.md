# Ganache + Truffle + React DApp Troubleshooting Guide

## Issue: TypeError: Failed to fetch

### Root Causes & Solutions

#### 1. **Port Mismatch** ✅ FIXED
- **Problem**: getWeb3.js was using port 8545, but Ganache runs on 7545
- **Status**: Fixed in getWeb3.js
- **Verification**: Check browser console - should see "using local Ganache (http://127.0.0.1:7545)"

#### 2. **MetaMask RPC Endpoint Configuration**

Ensure MetaMask is properly connected to Ganache:

**Setup Steps:**
1. Open MetaMask menu → Settings → Networks
2. Add custom network:
   - **Network Name**: Ganache Local
   - **RPC URL**: http://127.0.0.1:7545
   - **Chain ID**: 1337
   - **Currency Symbol**: ETH
   - **Block Explorer**: (leave blank)
3. Switch to "Ganache Local" in MetaMask
4. Import Ganache accounts using private keys (from Ganache startup output)

#### 3. **Verify Ganache is Running**

```powershell
# Test connection from terminal
curl http://127.0.0.1:7545

# Or use PowerShell
Invoke-WebRequest -Uri http://127.0.0.1:7545
```

Expected response: Should return data, not "connection refused"

#### 4. **Smart Contract Deployment**

Verify contracts are deployed correctly:

```bash
# From project root
truffle migrate --reset --network development
```

Expected output:
```
Deploying 'Migrations'
   - transaction hash: 0x...
   - contract address: 0x...
```

Check that contract artifacts exist:
- `client/src/artifacts/Land.json` ✓
- `client/src/artifacts/Migrations.json` ✓

#### 5. **CORS Issues (Frontend ↔ Ganache)**

If you still get "Failed to fetch" after fixes above:

Add CORS headers to Ganache (if using ganache-cli):

```bash
ganache-cli --host 0.0.0.0 --port 7545
```

Or use Ganache GUI (which handles CORS automatically)

#### 6. **Browser Console Debugging**

Open browser console (F12) and check logs:

**Good Output:**
```
✓ MetaMask detected and connected
✓ Account: 0x123456...
✓ Contract deployed at: 0xabcdef...
```

**Bad Output (Action Required):**
```
✗ User denied account access
→ Solution: Approve account connection in MetaMask

✗ Error connecting to Ganache
→ Solution: Check if Ganache is running on :7545

✗ Contract not deployed
→ Solution: Run `truffle migrate --reset --network development`
```

#### 7. **Check Contract Addresses**

Open `client/src/artifacts/Land.json` and verify:

```json
{
  "networks": {
    "1337": {
      "address": "0x...",
      "transactionHash": "0x..."
    }
  }
}
```

Network ID 1337 must be present with a valid address.

#### 8. **Restart Checklist**

If issues persist, restart in this order:

1. **Stop everything**:
   ```bash
   # Stop React dev server (Ctrl+C)
   # Stop Ganache (close GUI or Ctrl+C)
   ```

2. **Clear cache**:
   ```bash
   cd client
   rm -r node_modules/.cache
   ```

3. **Restart Ganache**:
   - Open Ganache GUI
   - New workspace or Load existing
   - Note the RPC URL (should be http://127.0.0.1:7545)

4. **Reset Contracts**:
   ```bash
   # From project root
   truffle migrate --reset --network development
   ```

5. **Restart Frontend**:
   ```bash
   cd client
   npm start
   ```

6. **Clear MetaMask Cache**:
   - MetaMask Menu → Settings → Advanced → Clear Activity Tab Data

#### 9. **Network ID Mismatch**

Verify Chain ID matches:

```javascript
// In browser console:
web3.eth.net.getId().then(id => console.log('Chain ID:', id))
```

Should output: `Chain ID: 1337`

If different, update MetaMask to correct chain ID.

#### 10. **IPFS Connectivity** (for document upload)

"Failed to fetch" can also come from IPFS layer:

- IPFS fallback is now: ipfs.io → gateway.pinata.cloud → localhost:5001
- Document upload is optional - registration works without it
- If IPFS fails, document hash will be empty string (acceptable)

---

## Quick Diagnostic Script

Add this to browser console to check everything:

```javascript
async function diagnoseSetup() {
  try {
    // 1. Check MetaMask
    console.log('1. MetaMask:', window.ethereum ? '✓ Connected' : '✗ Not found');
    
    // 2. Check Web3
    const web3 = window.web3 || new Web3(window.ethereum || 'http://127.0.0.1:7545');
    const isConnected = await web3.eth.net.isListening();
    console.log('2. Web3 Connection:', isConnected ? '✓ OK' : '✗ Failed');
    
    // 3. Check Chain ID
    const chainId = await web3.eth.net.getId();
    console.log('3. Chain ID:', chainId === 1337 ? '✓ 1337 (Ganache)' : `✗ ${chainId}`);
    
    // 4. Check Accounts
    const accounts = await web3.eth.getAccounts();
    console.log('4. Accounts:', accounts.length > 0 ? `✓ ${accounts.length} found` : '✗ None');
    
    // 5. Check Contract
    const Land = require('./artifacts/Land.json');
    const address = Land.networks['1337']?.address;
    console.log('5. Land Contract:', address ? `✓ ${address}` : '✗ Not deployed');
    
  } catch (error) {
    console.error('Diagnostic failed:', error);
  }
}

diagnoseSetup();
```

---

## Summary of Changes Made

1. ✅ Fixed port from 8545 → 7545 in getWeb3.js
2. ✅ Updated MetaMask request method to modern API
3. ✅ Added better error logging
4. ✅ Added comprehensive troubleshooting docs

**Next Steps:**
1. Restart your dev server
2. Open browser console (F12)
3. Refresh page and check for green checkmarks in logs
4. If issues remain, run the diagnostic script above
