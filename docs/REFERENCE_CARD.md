# One-Page DApp Debugging Reference Card

## The Problem
```
Error: "Failed to load web3, accounts, or contract"
Usually caused by: Network ID mismatch between Ganache and contract deployment
```

---

## Quick Diagnosis (30 seconds)

Run this in browser console (F12):
```javascript
(async () => {
  const web3 = await getWeb3();
  const networkId = await web3.eth.net.getId();
  console.log('Network ID:', networkId);
  console.log('Networks in artifact:', Object.keys(window.LandContract?.networks || {}));
  console.log('Network found?', !!window.LandContract?.networks[networkId]);
})();
```

**If last line says false:** Contract not deployed on this network. Your Job:
1. Update truffle-config.js network_id to match networkId above
2. Run: `truffle migrate --reset --network development`
3. Restart React

---

## Complete 5-Step Fix

### Step 1: Find Your Ganache Chain ID
- Open Ganache GUI
- Look top-right → Note the Chain ID (probably 1337 or 5777)

### Step 2: Create truffle-config.js snippet
```javascript
// FILE: truffle-config.js
networks: {
  development: {
    host: "127.0.0.1",
    port: 7545,
    network_id: "1337",  // ← Use YOUR chain ID
  }
}
```

### Step 3: Redeploy
```powershell
rm -r build/
truffle migrate --reset --network development
```

### Step 4: Verify
```powershell
$c = Get-Content build\contracts\Land.json | ConvertFrom-Json
$c.networks | Get-Member -Type NoteProperty
# Should show: 1337 (or your chain ID)
```

### Step 5: Restart
```powershell
# Kill npm start (Ctrl+C), then:
cd client
rm -r node_modules/.cache
npm start
```

---

## The deployedNetwork Check

### WRONG ❌
```javascript
const deployedNetwork = LandContract.networks[networkId];
const addr = deployedNetwork.address;  // Fails if undefined!
```

### RIGHT ✓
```javascript
const deployedNetwork = LandContract.networks[networkId];

if (!deployedNetwork) {
  throw new Error(`Contract not on network ${networkId}`);
}

const addr = deployedNetwork.address;  // Now safe
```

---

## Core Concept

```
1. Ganache runs
   └─ Has Chain ID (1337 or 5777)

2. Truffle reads truffle-config.js
   └─ Sees network_id setting
   └─ network_id should = Ganache Chain ID

3. Truffle deploys contracts
   └─ Saves to build/contracts/Land.json
   └─ Includes "networks": { "[network_id]": { address, ... } }

4. React loads
   └─ Gets current network ID from Ganache
   └─ Looks up LandContract.networks[networkId]
   └─ If found → contract exists ✓
   └─ If not found → undefined ✗
```

---

## Common Network IDs

| Ganache | Truffle config | Status |
|---------|---|---|
| Chain ID 1337 | network_id: "1337" | ✓ Matches |
| Chain ID 5777 | network_id: "5777" | ✓ Matches |
| Chain ID 1337 | network_id: "*" | ✗ Mismatch |
| Chain ID 1337 | network_id: "5777" | ✗ Mismatch |

---

## Error Messages Decoded

| Error | Meaning | Fix |
|-------|---------|-----|
| `Cannot read property 'address' of undefined` | deployedNetwork = undefined | Redeploy with correct network_id |
| `Contract not deployed on network 1337` | networks object missing 1337 | Update truffle-config to "1337" and redeploy |
| `Object is not iterable` | Contract artifact corrupted | Delete build/ and redeploy |

---

## Verification Checklist

- [ ] Ganache running: http://127.0.0.1:7545 works in browser
- [ ] Chain ID noted: ____ (write it down)
- [ ] truffle-config.js: network_id = "____"
- [ ] Redeployed: `truffle migrate --reset --network development` ✓
- [ ] Verified: build/contracts/Land.json has networks.____
- [ ] Frontend updated: React artifact copied/redeployed
- [ ] Cache cleared: `rm -r client/node_modules/.cache`
- [ ] Server restarted: `npm start` in client/

---

## In Code

```javascript
// At start of component initialization:

// Get network ID
const networkId = await web3.eth.net.getId();

// Look up deployment
const deployedNetwork = LandContract.networks[networkId];

// VALIDATE before using
if (!deployedNetwork) {
  throw new Error(
    `Contract not deployed on network ${networkId}. ` +
    `Should be on: ${Object.keys(LandContract.networks).join(', ')}`
  );
}

// Now safe to use
const instance = new web3.eth.Contract(
  LandContract.abi,
  deployedNetwork.address  // ← Safe, no undefined
);
```

---

## Windows PowerShell Cheat Sheet

```powershell
# Delete folder
rm -r foldername

# Check file exists
Test-Path ".\path\file.json"

# Read JSON
$dat = Get-Content file.json | ConvertFrom-Json

# Check object keys
$dat.myobject | Get-Member -Type NoteProperty
```

---

## Recovery Steps (If Completely Broken)

```powershell
# 1. Delete everything rebuilt-able
rm -r build/
rm -r client/node_modules/.cache

# 2. Redeploy fresh
truffle compile
truffle migrate --reset --network development

# 3. Restart React
cd client
npm start
```

---

## 60-Second Test

1. From project root: `.\diagnostic-script.ps1`
2. Read output
3. If it says "Network ID" doesn't match contracts: Update truffle-config
4. If it says ports don't respond: Start Ganache
5. If it says no contracts: Run truffle migrate

---

## Remember

- Network ID is in Ganache GUI (top-right)
- truffle-config.js network_id must = Ganache network_id
- After changing truffle-config: MUST redeploy (truffle migrate)
- After deploying: Clear React cache & restart
- Check browser console (F12) for actual error messages

The fix is always one of these three:
1. Update truffle-config network_id
2. Redeploy contracts (truffle migrate)
3. Clear React cache and restart

If none work, provide diagnostic output to someone helping you.
