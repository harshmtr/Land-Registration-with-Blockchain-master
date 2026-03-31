# Modern Web3/MetaMask Pattern - Complete Guide

## ❌ WRONG Patterns (What Was Causing Your Error)

### Wrong Pattern 1: Using `currentProvider.selectedAddress`
```javascript
// ❌ INCORRECT - This is not a valid MetaMask API
const currentAddress = await web3.currentProvider.selectedAddress;

// Problems:
// - selectedAddress is not a MetaMask property on currentProvider
// - Returns undefined
// - Causes "call with undefined address" errors
```

### Wrong Pattern 2: Not Awaiting `eth_requestAccounts`
```javascript
// ❌ INCORRECT
window.ethereum.request({ method: 'eth_requestAccounts' });
const accounts = await web3.eth.getAccounts();

// Problem: Race condition - accounts might be empty before MetaMask connects
```

### Wrong Pattern 3: Calling Contract Methods Before State Updates Complete
```javascript
// ❌ INCORRECT - setState is async!
this.setState({ LandInstance: instance, web3: web3 });
var seller = await this.state.LandInstance.methods.isSeller(address).call();

// Problem: this.state.LandInstance is still undefined when you call it
```

---

## ✅ CORRECT Modern Pattern

### Step 1: Initialize Web3 with MetaMask (getWeb3.js)
```javascript
import Web3 from "web3";

const getWeb3 = () =>
  new Promise((resolve, reject) => {
    window.addEventListener("load", async () => {
      // Modern dapp browsers (MetaMask, etc.)
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          // ✓ CORRECT: Request account access from MetaMask
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          console.log("✓ MetaMask connected");
          resolve(web3);
        } catch (error) {
          console.error("User denied account access:", error);
          reject(error);
        }
      }
      // Legacy fallback
      else if (window.web3) {
        resolve(window.web3);
      }
      // Ganache fallback
      else {
        const provider = new Web3.providers.HttpProvider("http://127.0.0.1:7545");
        resolve(new Web3(provider));
      }
    });
  });

export default getWeb3;
```

### Step 2: Get Account Address (CORRECT WAY)
```javascript
// ✓ CORRECT - Use web3.eth.getAccounts()
const accounts = await web3.eth.getAccounts();

// This is the RIGHT way to get the user's address
const currentAddress = accounts[0];  // First account (primary)

console.log('Connected address:', currentAddress);
// Output: Connected address: 0x1E2CF20f8EEaaFb69C2d52719Ea89c2D0d3598FE

// Validate
if (!accounts || accounts.length === 0) {
  throw new Error('No MetaMask accounts found');
}
```

### Step 3: Initialize Contract Instance
```javascript
// ✓ CORRECT
const web3 = await getWeb3();
const accounts = await web3.eth.getAccounts();
const networkId = await web3.eth.net.getId();

const deployedNetwork = LandContract.networks[networkId];
if (!deployedNetwork) {
  throw new Error(`Contract not deployed on network ${networkId}`);
}

const instance = new web3.eth.Contract(
  LandContract.abi,
  deployedNetwork.address  // Safe - we validated it exists
);
```

### Step 4: Call Contract Methods with Correct Address
```javascript
// ✓ CORRECT - Use the address from web3.eth.getAccounts()
const accounts = await web3.eth.getAccounts();
const userAddress = accounts[0];

// Now safe to call methods
const isSeller = await instance.methods.isSeller(userAddress).call();
const isBuyer = await instance.methods.isBuyer(userAddress).call();
const isInspector = await instance.methods.isLandInspector(userAddress).call();

console.log('Seller:', isSeller);
console.log('Buyer:', isBuyer);
console.log('Inspector:', isInspector);
```

---

## Complete React Component Pattern

### BEFORE (BROKEN)
```javascript
componentDidMount = async () => {
  try {
    const web3 = await getWeb3();
    const accounts = await web3.eth.getAccounts();
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = LandContract.networks[networkId];
    const instance = new web3.eth.Contract(LandContract.abi, deployedNetwork.address);

    // ❌ WRONG: This is undefined
    const currentAddress = await web3.currentProvider.selectedAddress;
    
    // ❌ WRONG: setState is async, but we use state immediately after
    this.setState({ LandInstance: instance, web3: web3, account: accounts[0] });
    
    // ❌ WRONG: this.state.LandInstance might be undefined here
    var seller = await this.state.LandInstance.methods.isSeller(currentAddress).call();
    
  } catch (error) {
    console.error(error);
  }
};
```

### AFTER (CORRECT)
```javascript
componentDidMount = async () => {
  try {
    console.log('=== Initializing Component ===');
    
    // Step 1: Get Web3
    const web3 = await getWeb3();
    console.log('✓ Web3 obtained');

    // Step 2: Get accounts from MetaMask (CORRECT WAY)
    const accounts = await web3.eth.getAccounts();
    console.log('✓ Accounts:', accounts);
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }
    
    // Step 3: Get address (CORRECT - from accounts array)
    const userAddress = accounts[0];
    console.log('✓ User address:', userAddress);

    // Step 4: Initialize contract
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = LandContract.networks[networkId];
    if (!deployedNetwork) {
      throw new Error(`Contract not deployed on network ${networkId}`);
    }
    
    const instance = new web3.eth.Contract(LandContract.abi, deployedNetwork.address);
    console.log('✓ Contract instance created');

    // Step 5: Set state with all required data
    this.setState({ 
      LandInstance: instance, 
      web3: web3, 
      account: userAddress 
    });
    console.log('✓ State updated');

    // Step 6: Call contract methods with the address (now guaranteed to exist)
    // Use the local userAddress variable, not this.state (still updating)
    try {
      const seller = await instance.methods.isSeller(userAddress).call();
      this.setState({ seller: seller });
      console.log('✓ Is Seller:', seller);
    } catch (err) {
      console.warn('Error checking seller:', err.message);
      this.setState({ seller: false });
    }

  } catch (error) {
    console.error('ERROR:', error.message);
    alert('Failed to initialize: ' + error.message);
  }
};
```

---

## The Key Differences Explained

### Getting the Address - COMPARISON

| Method | Works? | Notes |
|--------|--------|-------|
| `web3.currentProvider.selectedAddress` | ❌ NO | Not a valid API - always undefined |
| `window.ethereum.selectedAddress` | ⚠️ Deprecated | Works but deprecated, avoid |
| `web3.eth.getAccounts()` | ✅ YES | Modern, reliable, recommended |
| `web3.eth.accounts` | ⚠️ Legacy | Only works with some providers |

**✅ ALWAYS use `web3.eth.getAccounts()`**

---

## Common Errors and Solutions

### Error: "Accounts undefined"
**Cause:** Getting accounts before MetaMask authorization
```javascript
// ❌ WRONG
const accounts = await web3.eth.getAccounts();  // Might be empty

// ✅ CORRECT
await window.ethereum.request({ method: 'eth_requestAccounts' });
const accounts = await web3.eth.getAccounts();  // Now populated
```

### Error: "Cannot read property 'methods' of undefined"
**Cause:** Using state before it updates
```javascript
// ❌ WRONG
this.setState({ LandInstance: instance });
var seller = await this.state.LandInstance.methods.isSeller(addr).call();
// this.state.LandInstance is still undefined!

// ✅ CORRECT
const instance = new web3.eth.Contract(LandContract.abi, deployedNetwork.address);
var seller = await instance.methods.isSeller(addr).call();  // Use local variable
this.setState({ LandInstance: instance });
```

### Error: "call with undefined address"
**Cause:** Address is undefined
```javascript
// ❌ WRONG
const currentAddress = await web3.currentProvider.selectedAddress;  // undefined!
await instance.methods.isSeller(currentAddress).call();  // Fails

// ✅ CORRECT
const accounts = await web3.eth.getAccounts();
const currentAddress = accounts[0];  // Guaranteed to have a value
await instance.methods.isSeller(currentAddress).call();  // Works
```

---

## MetaMask Connection Validation

### Complete Validation Check
```javascript
async function validateMetaMaskConnection() {
  try {
    // 1. Check MetaMask is installed
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }
    console.log('✓ MetaMask installed');

    // 2. Check connection
    if (!window.ethereum.isConnected?.()) {
      throw new Error('MetaMask not connected to network');
    }
    console.log('✓ MetaMask connected to network');

    // 3. Request account access
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    console.log('✓ Account access granted:', accounts[0]);

    // 4. Get current chain ID
    const chainIdHex = await window.ethereum.request({ 
      method: 'eth_chainId' 
    });
    const chainId = parseInt(chainIdHex, 16);
    console.log('✓ Connected to chain ID:', chainId);

    // 5. Create Web3 instance
    const web3 = new Web3(window.ethereum);
    const allAccounts = await web3.eth.getAccounts();
    console.log('✓ Web3 initialized - accounts:', allAccounts);

    return {
      web3,
      accounts: allAccounts,
      chainId,
      address: allAccounts[0]
    };

  } catch (error) {
    console.error('❌ MetaMask validation failed:', error.message);
    throw error;
  }
}

// Usage
try {
  const { web3, accounts, chainId, address } = await validateMetaMaskConnection();
  console.log('Ready to use DApp!');
} catch (error) {
  alert('Please connect MetaMask: ' + error.message);
}
```

---

## Best Practices Summary

### ✅ DO:
1. Use `window.ethereum.request({ method: 'eth_requestAccounts' })` to request access
2. Use `web3.eth.getAccounts()` to get account addresses
3. Use local variables instead of relying on async state updates
4. Call contract methods with addresses from `getAccounts()`
5. Always validate contract deployment exists on current network
6. Add comprehensive error handling with descriptive messages
7. Log each step for debugging

### ❌ DON'T:
1. Use `web3.currentProvider.selectedAddress` (not valid)
2. Use deprecated `window.ethereum.selectedAddress` without reason
3. Use state immediately after `setState()` - it's asynchronous
4. Assume getAccounts() returns non-empty array
5. Call contract methods with undefined addresses
6. Skip error handling for user experience

---

## React Hooks Alternative (Modern)

If you prefer hooks instead of class components:

```javascript
import { useEffect, useState } from 'react';
import getWeb3 from './getWeb3';
import LandContract from './artifacts/Land.json';

function LoginPage() {
  const [account, setAccount] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [isBuyer, setIsBuyer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        // Get Web3
        const web3 = await getWeb3();
        
        // Get accounts
        const accounts = await web3.eth.getAccounts();
        if (!accounts || accounts.length === 0) {
          throw new Error('No MetaMask accounts found');
        }
        
        const userAddress = accounts[0];
        setAccount(userAddress);
        
        // Get contract
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = LandContract.networks[networkId];
        if (!deployedNetwork) {
          throw new Error(`Contract not deployed on network ${networkId}`);
        }
        
        const instance = new web3.eth.Contract(
          LandContract.abi,
          deployedNetwork.address
        );
        
        // Check roles
        const seller = await instance.methods.isSeller(userAddress).call();
        const buyer = await instance.methods.isBuyer(userAddress).call();
        
        setIsSeller(seller);
        setIsBuyer(buyer);
        setLoading(false);
        
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    initWeb3();
  }, []); // Run once on mount

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!account) return <div>Connect MetaMask</div>;

  return (
    <div>
      <p>Account: {account}</p>
      <p>Is Seller: {isSeller ? 'Yes' : 'No'}</p>
      <p>Is Buyer: {isBuyer ? 'Yes' : 'No'}</p>
    </div>
  );
}

export default LoginPage;
```

---

## Testing Your Implementation

### In Browser Console
```javascript
// Test 1: Check Web3 is available
console.log('Web3:', typeof web3);  // Should be 'object'

// Test 2: Check accounts
web3.eth.getAccounts().then(accounts => {
  console.log('Accounts:', accounts);
  console.log('First account:', accounts[0]);
});

// Test 3: Check MetaMask address
console.log('MetaMask address:', window.ethereum?.selectedAddress);

// Test 4: Send request
window.ethereum.request({ method: 'eth_requestAccounts' })
  .then(accounts => console.log('Got accounts:', accounts));
```

---

## Summary

| Issue | Wrong | Right |
|-------|-------|-------|
| Get address | `web3.currentProvider.selectedAddress` | `web3.eth.getAccounts()[0]` |
| Request access | Not called | `window.ethereum.request({method:'eth_requestAccounts'})` |
| Access state | Immediately after setState | Use local variable |
| Call methods | Before validation | After validating contract exists |
| Error handling | Missing | Comprehensive with details |

**Your DApp will now work correctly!** 🚀
