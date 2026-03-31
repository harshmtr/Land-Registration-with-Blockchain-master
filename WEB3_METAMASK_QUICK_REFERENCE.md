# Quick Reference - Copy & Paste Solutions

## Your Exact Problem & Solution

### What You Had (BROKEN)
```javascript
const currentAddress = await web3.currentProvider.selectedAddress;  // ❌ undefined!
var seller = await this.state.LandInstance.methods.isSeller(currentAddress).call();
// Crashes: TypeError: Cannot call methods on undefined contract
```

### What You Need (FIXED)
```javascript
const accounts = await web3.eth.getAccounts();
const currentAddress = accounts[0];  // ✅ Correct!
const seller = await instance.methods.isSeller(currentAddress).call();
// Works perfectly
```

---

## Copy-Paste: Fixed Login Component

Replace your entire `login.component.js` componentDidMount with this:

```javascript
componentDidMount = async () => {
  if (!window.location.hash) {
    window.location = window.location + '#loaded';
    window.location.reload();
  }

  try {
    console.log('=== Login componentDidMount ===');
    
    // Get Web3
    const web3 = await getWeb3();
    console.log('✓ Web3 obtained');

    // Get accounts - CORRECT WAY
    const accounts = await web3.eth.getAccounts();
    if (!accounts || accounts.length === 0) {
      throw new Error('No MetaMask accounts found');
    }
    const currentAddress = accounts[0];  // ✅ THIS IS CORRECT
    console.log('✓ Current address:', currentAddress);

    // Get network and contract
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = LandContract.networks[networkId];
    if (!deployedNetwork) {
      throw new Error(`Contract not deployed on network ${networkId}`);
    }
    
    const instance = new web3.eth.Contract(
      LandContract.abi,
      deployedNetwork.address,
    );
    console.log('✓ Contract instance created');

    // Set state
    this.setState({ LandInstance: instance, web3: web3, account: currentAddress });

    // Check roles using the LOCAL currentAddress variable (not state)
    try {
      const seller = await instance.methods.isSeller(currentAddress).call();
      this.setState({ seller: seller });
      console.log('✓ Is Seller:', seller);
    } catch (err) {
      this.setState({ seller: false });
    }
    
    try {
      const buyer = await instance.methods.isBuyer(currentAddress).call();
      this.setState({ buyer: buyer });
      console.log('✓ Is Buyer:', buyer);
    } catch (err) {
      this.setState({ buyer: false });
    }
    
    try {
      const landInspector = await instance.methods.isLandInspector(currentAddress).call();
      this.setState({ landInspector: landInspector });
      console.log('✓ Is Land Inspector:', landInspector);
    } catch (err) {
      this.setState({ landInspector: false });
    }

  } catch (error) {
    console.error('ERROR:', error.message);
    alert(`Failed to load web3: ${error.message}`);
  }
};
```

---

## Copy-Paste: Complete getWeb3.js

```javascript
import Web3 from "web3";

const getWeb3 = () =>
  new Promise((resolve, reject) => {
    window.addEventListener("load", async () => {
      // MetaMask or other modern dapp browsers
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          // Request account access
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          console.log("✓ MetaMask connected");
          resolve(web3);
        } catch (error) {
          console.error("User denied account access:", error);
          reject(error);
        }
      }
      // Legacy browsers
      else if (window.web3) {
        console.log("Legacy web3 detected");
        resolve(window.web3);
      }
      // Fallback to Ganache
      else {
        try {
          const provider = new Web3.providers.HttpProvider(
            "http://127.0.0.1:7545"
          );
          const web3 = new Web3(provider);
          console.log("Using Ganache HTTP provider");
          resolve(web3);
        } catch (error) {
          console.error("Error:", error);
          reject(error);
        }
      }
    });
  });

export default getWeb3;
```

---

## Copy-Paste: Validate Connection Pattern

Use this anywhere you need to check Web3/MetaMask:

```javascript
async function validateWeb3Connection() {
  try {
    const web3 = await getWeb3();
    console.log('✓ Web3 available');
    
    const accounts = await web3.eth.getAccounts();
    console.log('✓ Accounts:', accounts);
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No connected accounts');
    }
    
    const userAddress = accounts[0];
    console.log('✓ User address:', userAddress);
    
    const networkId = await web3.eth.net.getId();
    console.log('✓ Network ID:', networkId);
    
    return { web3, accounts, userAddress, networkId };
    
  } catch (error) {
    console.error('Validation failed:', error);
    alert('Connection error: ' + error.message);
    throw error;
  }
}

// Usage
try {
  const { web3, userAddress, networkId } = await validateWeb3Connection();
  console.log('Ready to use!');
} catch (err) {
  console.log('Not ready');
}
```

---

## Copy-Paste: Call Contract Method Safely

```javascript
async function callContractMethod(contract, methodName, userAddress, ...args) {
  try {
    // Validate inputs
    if (!contract) {
      throw new Error('Contract instance is undefined');
    }
    if (!userAddress) {
      throw new Error('User address is undefined');
    }
    if (!contract.methods[methodName]) {
      throw new Error(`Method ${methodName} does not exist on contract`);
    }
    
    // Call method
    console.log(`Calling ${methodName}(${userAddress}, ...)`);
    const result = await contract.methods[methodName](userAddress, ...args).call();
    console.log(`✓ ${methodName} result:`, result);
    return result;
    
  } catch (error) {
    console.error(`❌ Error calling ${methodName}:`, error.message);
    throw error;
  }
}

// Usage Examples
try {
  // Single parameter method
  const isSeller = await callContractMethod(contract, 'isSeller', userAddress);
  
  // Multiple parameter method
  const isVerified = await callContractMethod(contract, 'isVerified', userAddress);
  
} catch (err) {
  alert('Contract call failed: ' + err.message);
}
```

---

## Common Issues & Quick Fixes

### Issue 1: "currentAddress is undefined"
**Current code:**
```javascript
const currentAddress = await web3.currentProvider.selectedAddress;  // ❌
```
**Fix:**
```javascript
const accounts = await web3.eth.getAccounts();
const currentAddress = accounts[0];  // ✅
```

---

### Issue 2: "LandInstance is undefined"
**Current code:**
```javascript
this.setState({ LandInstance: instance });
const seller = await this.state.LandInstance.methods.isSeller(addr).call();  // ❌
```
**Fix:**
```javascript
const instance = new web3.eth.Contract(...);
const seller = await instance.methods.isSeller(addr).call();  // ✅
this.setState({ LandInstance: instance });
```

---

### Issue 3: "Cannot call methods on undefined"
**Current code:**
```javascript
const currentAddress = await web3.currentProvider.selectedAddress;  // undefined!
await contract.methods.isSeller(currentAddress).call();  // ❌ crashes
```
**Fix:**
```javascript
const accounts = await web3.eth.getAccounts();
const currentAddress = accounts[0];  // Always defined if accounts.length > 0
await contract.methods.isSeller(currentAddress).call();  // ✅ works
```

---

### Issue 4: "No accounts found"
**Current code:**
```javascript
const accounts = await web3.eth.getAccounts();
// Might be empty if user hasn't authorized
```
**Fix:**
```javascript
// First request access
await window.ethereum.request({ method: 'eth_requestAccounts' });
// THEN get accounts
const accounts = await web3.eth.getAccounts();
// Now guaranteed to have accounts
```

---

## Testing Checklist

Before using any contract methods, verify:

```javascript
// ✅ Checklist
const web3 = await getWeb3();                    // Defined?
const accounts = await web3.eth.getAccounts();   // Non-empty?
const userAddress = accounts[0];                 // Defined?
const networkId = await web3.eth.net.getId();    // Got network ID?
const deployedNetwork = LandContract.networks[networkId];  // Contract on network?
const instance = new web3.eth.Contract(...);     // Instance created?

// Now safe to call:
const result = await instance.methods.someMethod(userAddress).call();
```

---

## Testing in Browser Console

```javascript
// Test 1: Get accounts
web3.eth.getAccounts().then(acc => console.log('Accounts:', acc));

// Test 2: Get network
web3.eth.net.getId().then(id => console.log('Network:', id));

// Test 3: Call a view method
const Land = window.LandContract;  // Your contract artifact
const networkId = 5777;  // Your network
const deployed = Land.networks[networkId];
const instance = new web3.eth.Contract(Land.abi, deployed.address);
const addr = '0x1E2CF20f8EEaaFb69C2d52719Ea89c2D0d3598FE';
instance.methods.isSeller(addr).call().then(result => console.log('Is Seller:', result));
```

---

## Before & After Summary

| Aspect | BEFORE (Broken) | AFTER (Fixed) |
|--------|-----------------|---------------|
| Get address | `web3.currentProvider.selectedAddress` | `web3.eth.getAccounts()[0]` |
| Result | undefined ❌ | 0x1E2C... ✅ |
| Use in code | Immediately after setState | Use local variable |
| Error handling | None | Comprehensive |
| Contract calls | Fails with undefined | Works correctly |

---

## Files Updated

✅ `client/src/login.component.js` - Fixed componentDidMount
✅ `client/src/getWeb3.js` - Already correct
✅ All other components - Already using correct pattern

---

## Testing After Fix

1. **Open browser to http://localhost:3000**
2. **Press F12 (Developer Console)**
3. **Look for these messages:**
   ```
   ✓ Web3 obtained
   ✓ Current address: 0x1E2C...
   ✓ Is Seller: true/false
   ✓ Is Buyer: true/false
   ```
4. **If all show ✓:** Fix successful! 🎉
5. **If any show error:** Check the error message in console

---

## Key Takeaway

**Never use `web3.currentProvider.selectedAddress`**

**Always use `web3.eth.getAccounts()[0]` to get the user's address**

This is the modern, reliable, recommended pattern for Web3/MetaMask integration.
