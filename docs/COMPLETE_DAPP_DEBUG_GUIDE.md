# Complete DApp Debugging Guide: Truffle + Ganache + React + MetaMask

## Understanding the Flow

```
1. Ganache Starts (Chain ID: 1337 or 5777)
   └─> Runs on http://127.0.0.1:7545
   
2. Truffle Deploys Contracts
   └─> Reads network config from truffle-config.js
   └─> Deploys to specified network_id
   └─> Generates build/contracts/*.json with networks section
       Example: { "networks": { "1337": { "address": "0x..." } } }
   
3. Build artifacts copied to frontend
   └─> client/src/artifacts/*.json
   
4. React App Loads
   └─> Calls getWeb3() to get Web3 instance
   └─> Gets current network ID from Ganache
   └─> Looks up Contract.networks[networkId]
   └─> If found → Creates contract instance ✓
   └─> If NOT found → deployedNetwork = undefined ✗ ERROR
```

---

## The Problem: Contract Network ID Mismatch

### Scenario A: Network ID Mismatch

```javascript
// truffle-config.js
networks: {
  development: {
    host: "127.0.0.1",
    port: 7545,
    network_id: "*",  // ← WILDCARD = PROBLEM!
  }
}

// Result in build/contracts/Land.json:
{
  "networks": {
    "5777": { "address": "0x..." }  // Deployed to 5777
  }
}

// In React, when Ganache actually runs on 1337:
const networkId = 1337;  // From Ganache
const deployedNetwork = Land.networks[1337];  // ✗ undefined!
// ^ MISMATCH: Contract is at 5777, but looking for 1337
```

### Scenario B: Correct Setup

```javascript
// truffle-config.js
networks: {
  development: {
    host: "127.0.0.1",
    port: 7545,
    network_id: "1337",  // ← Explicit
  }
}

// Result in build/contracts/Land.json:
{
  "networks": {
    "1337": { "address": "0xABC123..." }  // Deployed to 1337
  }
}

// In React:
const networkId = 1337;  // From Ganache
const deployedNetwork = Land.networks[1337];  // ✓ Found!
```

---

## Step 1: Determine Your Ganache Chain ID

### Method 1: Check Ganache GUI
- Open Ganache
- Look at top-right corner
- Note the Chain ID displayed (usually 1337 or 5777)

### Method 2: From Terminal
```bash
# If Ganache is running and you have curl/PowerShell
# Send JSON-RPC request to get chain ID

# PowerShell:
$response = Invoke-WebRequest -Uri http://127.0.0.1:7545 `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
  
$response.Content | ConvertFrom-Json

# Look for "result" field - convert hex to decimal
# Example: "0x539" = 1337 in decimal (5777 = 0x5677)
```

### Method 3: From Browser Console (after page loads)
```javascript
web3.eth.net.getId().then(id => console.log('Active Chain ID:', id));
```

---

## Step 2: Fix truffle-config.js

### WRONG (causes network_id mismatch)
```javascript
networks: {
  development: {
    host: "127.0.0.1",
    port: 7545,
    network_id: "*",  // ✗ Wildcard - unpredictable
  },
}
```

### CORRECT (for Ganache with Chain ID 1337)
```javascript
networks: {
  development: {
    host: "127.0.0.1",
    port: 7545,
    network_id: "1337",  // ✓ Explicit
    gas: 6721975,
    gasPrice: 1,
  },
}

compilers: {
  solc: {
    version: "0.5.16",  // Match your Solidity version
  }
}
```

### CORRECT (for Ganache with Chain ID 5777)
```javascript
networks: {
  development: {
    host: "127.0.0.1",
    port: 7545,
    network_id: "5777",  // ✓ For older Ganache versions
  },
}
```

---

## Step 3: Redeploy Contracts with Correct Config

```bash
# From project root (where truffle-config.js is)

# Step 3a: Clean old build
rm -r build/

# Step 3b: Compile contracts
truffle compile

# Step 3c: Migrate (deploy) to development network
truffle migrate --network development

# Expected output:
# Compiling your contracts...
# ============================
# > Everything is up to date.
# 
# Starting migrations...
# ======================
# > Network name:    'development'
# > Network id:      1337
# > Block gas limit: 6721975 (0x6691b7)
# 
# 1_initial_migration.js
# ...
# 2_deploy_contracts.js
# ...
# > Saving migration to chain.
```

---

## Step 4: Verify Contract Artifacts

### Check Build Directory
```bash
# Verify build/contracts/Land.json exists and has correct network
cat build/contracts/Land.json | grep -A 5 '"networks"'

# Should show your chain ID (1337 or 5777):
# "networks": {
#   "1337": {
#     "events": {},
#     "address": "0x...",
#     ...
```

### Check Frontend Artifacts
```bash
# Verify client/src/artifacts/Land.json has been updated
cat client/src/artifacts/Land.json | grep -A 5 '"networks"'

# Should match the deploy network
```

### Verify with JSON Query (PowerShell)
```powershell
# Check what networks are in the contract artifact
$artifact = Get-Content client/src/artifacts/Land.json | ConvertFrom-Json
$artifact.networks | Get-Member -Type NoteProperty

# Should show 1337 (or 5777, etc.)
# If empty or only shows "5777", you need to redeploy
```

---

## Step 5: Fix React Code to Handle Undefined deployedNetwork

### WRONG (current problematic code)
```javascript
const deployedNetwork = LandContract.networks[networkId];
const instance = new web3.eth.Contract(
  LandContract.abi,
  deployedNetwork && deployedNetwork.address,  // ✗ May be undefined
);
```

**Problem**: If `deployedNetwork` is undefined, the contract address is also undefined, and calls fail silently.

### CORRECT (with proper validation)
```javascript
const networkId = await web3.eth.net.getId();
console.log('Current Network ID:', networkId);
console.log('Available Networks:', Object.keys(LandContract.networks));

const deployedNetwork = LandContract.networks[networkId];

// ✓ Check if contract is deployed on this network
if (!deployedNetwork) {
  throw new Error(
    `Contract not deployed on network ${networkId}. ` +
    `Available networks: ${Object.keys(LandContract.networks).join(', ')}. ` +
    `Please run: truffle migrate --network development`
  );
}

console.log('Contract Address:', deployedNetwork.address);

const instance = new web3.eth.Contract(
  LandContract.abi,
  deployedNetwork.address
);
```

---

## Step 6: Update getWeb3.js with Better Error Handling

### Current Version (needs improvement)
```javascript
import Web3 from "web3";

const getWeb3 = () =>
  new Promise((resolve, reject) => {
    window.addEventListener("load", async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          resolve(web3);
        } catch (error) {
          reject(error);
        }
      } else if (window.web3) {
        resolve(window.web3);
      } else {
        const provider = new Web3.providers.HttpProvider("http://127.0.0.1:7545");
        const web3 = new Web3(provider);
        resolve(web3);
      }
    });
  });

export default getWeb3;
```

### Improved Version (with logging)
```javascript
import Web3 from "web3";

const getWeb3 = () =>
  new Promise((resolve, reject) => {
    window.addEventListener("load", async () => {
      // MetaMask
      if (window.ethereum) {
        console.log('✓ MetaMask detected');
        const web3 = new Web3(window.ethereum);
        try {
          const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
          });
          console.log('✓ MetaMask accounts accessed:', accounts);
          resolve(web3);
        } catch (error) {
          console.error('✗ MetaMask access denied:', error.message);
          reject(error);
        }
      } 
      // Mist/Legacy
      else if (window.web3) {
        console.log('✓ Legacy provider detected (Mist)');
        resolve(window.web3);
      } 
      // Fallback to Ganache
      else {
        console.log('⚠ No web3 detected, using fallback: http://127.0.0.1:7545');
        try {
          const provider = new Web3.providers.HttpProvider("http://127.0.0.1:7545");
          const web3 = new Web3(provider);
          
          // Test connection
          web3.eth.net.isListening().then(listening => {
            if (listening) {
              console.log('✓ Connected to Ganache');
              resolve(web3);
            } else {
              console.error('✗ Cannot reach Ganache on http://127.0.0.1:7545');
              reject(new Error('Ganache not responding'));
            }
          });
        } catch (error) {
          console.error('✗ Error creating Web3 provider:', error);
          reject(error);
        }
      }
    });
  });

export default getWeb3;
```

---

## Step 7: Complete componentDidMount with Full Debugging

```javascript
componentDidMount = async () => {
  try {
    console.log('=== Starting Web3 Connection ===');
    
    // 1. Get Web3
    console.log('Step 1: Getting Web3 instance...');
    const web3 = await getWeb3();
    console.log('✓ Web3 obtained');

    // 2. Get Accounts
    console.log('Step 2: Getting accounts...');
    const accounts = await web3.eth.getAccounts();
    console.log('✓ Accounts:', accounts);
    if (!accounts || accounts.length === 0) {
      throw new Error(
        'No accounts found. Please ensure:\n' +
        '1. MetaMask is installed\n' +
        '2. Account is imported from Ganache\n' +
        '3. Network is set to Ganache (Chain ID 1337 or 5777)'
      );
    }

    // 3. Get Network ID
    console.log('Step 3: Getting network ID...');
    const networkId = await web3.eth.net.getId();
    console.log('✓ Network ID:', networkId);

    // 4. Check MetaMask matches Ganache
    const expectedChainId = 1337; // or 5777
    if (networkId !== expectedChainId) {
      console.warn(
        `⚠ MetaMask is on network ${networkId}, ` +
        `but Ganache is on ${expectedChainId}. ` +
        `Please switch in MetaMask.`
      );
    }

    // 5. Validate Contract Deployment
    console.log('Step 4: Validating contract deployment...');
    console.log('Available networks in artifact:', Object.keys(LandContract.networks));
    
    const deployedNetwork = LandContract.networks[networkId];
    if (!deployedNetwork) {
      throw new Error(
        `Contract NOT deployed on network ${networkId}.\n` +
        `Available: ${Object.keys(LandContract.networks).join(', ')}\n\n` +
        `Fix:\n` +
        `1. Update truffle-config.js with correct network_id: "${networkId}"\n` +
        `2. Run: rm -r build/ && truffle migrate --network development`
      );
    }
    
    console.log('✓ Contract deployed at:', deployedNetwork.address);

    // 6. Create Contract Instance
    console.log('Step 5: Creating contract instance...');
    const instance = new web3.eth.Contract(
      LandContract.abi,
      deployedNetwork.address
    );
    console.log('✓ Contract instance created');

    // 7. Set State
    console.log('Step 6: Setting state...');
    this.setState({ 
      LandInstance: instance, 
      web3: web3, 
      account: accounts[0] 
    });
    console.log('✓ State updated - Ready to use!');

  } catch (error) {
    console.error('✗ ERROR:', error.message);
    console.error('Full error:', error);
    
    alert(
      `Failed to initialize DApp:\n\n` +
      `${error.message}\n\n` +
      `Check console (F12) for details.`
    );
  }
};
```

---

## Step 8: Complete Verification Checklist

- [ ] **Ganache Running**: Open http://127.0.0.1:7545 in browser - should show dashboard
- [ ] **Chain ID Known**: Check Ganache GUI for Chain ID (1337 or 5777)
- [ ] **truffle-config.js Updated**: Set `network_id` to exact chain ID (not "*")
- [ ] **Contracts Deployed**: Run `truffle migrate --network development`
- [ ] **Build Artifacts**: Check `build/contracts/Land.json` has networks section
- [ ] **Frontend Artifacts**: Check `client/src/artifacts/Land.json` is copied
- [ ] **MetaMask Connected**: Set to Ganache network with correct Chain ID
- [ ] **Account Imported**: Add account from Ganache private keys
- [ ] **React Cache Cleared**: Delete `client/node_modules/.cache`
- [ ] **App Restarted**: Kill `npm start` and restart
- [ ] **Console Logs**: Open F12, check for ✓ checkmarks and no ✗ errors

---

## Quick Debug Script

Run this in browser console (F12) to diagnose:

```javascript
async function debugDApp() {
  console.clear();
  console.log('=== DAPP DIAGNOSTIC ===\n');
  
  try {
    // 1. Web3 Check
    if (!window.web3) {
      console.error('❌ Web3 not available');
      return;
    }
    console.log('✓ Web3 available');
    
    // 2. MetaMask Check
    if (window.ethereum) {
      console.log('✓ MetaMask detected');
      const isConnected = await window.ethereum.isConnected();
      console.log('  Connected:', isConnected ? 'Yes' : 'No');
    } else {
      console.log('⚠ MetaMask not detected');
    }
    
    // 3. Accounts Check
    const accounts = await web3.eth.getAccounts();
    console.log(`✓ Accounts: ${accounts.length} found`);
    if (accounts.length > 0) {
      console.log(`  First account: ${accounts[0]}`);
    }
    
    // 4. Network Check
    const networkId = await web3.eth.net.getId();
    console.log(`✓ Network ID: ${networkId}`);
    
    // 5. Contract Check
    try {
      const Land = require('./artifacts/Land.json');
      const networks = Object.keys(Land.networks);
      console.log(`✓ Contract networks: [${networks.join(', ')}]`);
      
      if (networks.includes(String(networkId))) {
        console.log(`  ✓ Contract deployed on network ${networkId}`);
        console.log(`  Address: ${Land.networks[networkId].address}`);
      } else {
        console.error(`  ✗ Contract NOT on network ${networkId}`);
        console.error(`  Available: ${networks.join(', ')}`);
      }
    } catch (err) {
      console.error('✗ Error loading contract:', err.message);
    }
    
  } catch (error) {
    console.error('Diagnostic error:', error);
  }
}

debugDApp();
```

---

## If Still Failing

**Collect this info and share:**

1. Output from browser console (F12) after running `debugDApp()`
2. Content of `build/contracts/Land.json` networks section
3. Output from `truffle migrate --network development`
4. Screenshot of Ganache showing Chain ID
5. Any error messages in browser console

