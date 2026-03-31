# DApp Troubleshooting Index - What To Read

## Your Problem
**Error:** "Failed to load web3, accounts, or contract"

## Quick Navigation

### 🚀 I Just Want It Fixed (5 Minutes)
Read: **QUICK_FIX_CHECKLIST.md**
- 5 step checklist
- Expected outcomes  
- Verification steps
- Most likely to solve your problem immediately

---

### 🔍 I Want to Understand Why This Happens
Read: **COMPLETE_DAPP_DEBUG_GUIDE.md**
- Full explanation of the flow
- Scenario A: Network ID mismatch
- Scenario B: Correct setup
- Step-by-step verification
- Common patterns

---

### 📋 I Want to Run a Diagnostic
Run: **diagnostic-script.ps1**
```powershell
.\diagnostic-script.ps1
```
- Checks Ganache is running
- Verifies truffle-config.js
- Inspects build artifacts
- Shows what networks have contracts
- Lists recommended fixes

---

### 💻 I Want to Fix the Code (deployedNetwork Check)
Read: **DEPLOYED_NETWORK_SOLUTIONS.md**
- Copy-paste solutions
- Shows wrong vs correct code
- Testing blocks you can run
- Utility functions you can reuse
- Debugging checklist

---

### 🎓 I Want Deep Knowledge About deployedNetwork
Read: **DEPLOYED_NETWORK_GUIDE.md**
- What is deployedNetwork?
- The data structure explained
- All checking patterns
- Real-world debug flow
- Key takeaways table

---

### 📝 I Want to Update My Component
Copy From: **COMPONENT_EXAMPLE_REGISTERED_SELLER.js**
- Complete working example
- Extensive comments explaining each step
- Shows how to check deployedNetwork
- Has helpful error messages
- Production-ready code

---

## The 3 Main Issues & Solutions

### Issue 1: Network ID Mismatch
**Ganache Chain ID ≠ Truffle network_id**

Where to read:
- COMPLETE_DAPP_DEBUG_GUIDE.md → "The Problem: Contract Network ID Mismatch"
- QUICK_FIX_CHECKLIST.md → Step 2 (Update truffle-config.js)

Quick fix:
```javascript
// truffle-config.js
networks: {
  development: {
    network_id: "1337",  // Match your Ganache chain ID
  }
}

// Then:
// truffle migrate --reset --network development
```

---

### Issue 2: deployedNetwork is Undefined
**Contract not deployed on current network**

Where to read:
- DEPLOYED_NETWORK_SOLUTIONS.md → "Your Question" section
- DEPLOYED_NETWORK_GUIDE.md → "The deployedNetwork Check Explained"

Quick fix:
```javascript
const deployedNetwork = Contract.networks[networkId];

if (!deployedNetwork) {
  throw new Error(`Contract not on network ${networkId}`);
}

// Now safe to use deployedNetwork.address
```

---

### Issue 3: Contract Artifact Mismatch
**Frontend artifact doesn't match what was deployed**

Where to read:
- COMPLETE_DAPP_DEBUG_GUIDE.md → Step 4 "Verify Contract Artifacts"
- QUICK_FIX_CHECKLIST.md → Step 4 (Verify Deployment)

Quick fix:
```powershell
# 1. Redeploy contracts
rm -r build/
truffle migrate --reset --network development

# 2. Copy updated artifact to frontend
Copy-Item build/contracts/Land.json client/src/artifacts/Land.json

# 3. Restart React
cd client
rm -r node_modules/.cache
npm start
```

---

## File Purpose Quick Reference

| File | Purpose | Read Time |
|------|---------|-----------|
| **QUICK_FIX_CHECKLIST.md** | 5-step immediate fix | 5 min |
| **COMPLETE_DAPP_DEBUG_GUIDE.md** | Comprehensive guide | 15 min |
| **diagnostic-script.ps1** | Run diagnostic tool | 2 min |
| **DEPLOYED_NETWORK_SOLUTIONS.md** | Copy-paste code fixes | 10 min |
| **DEPLOYED_NETWORK_GUIDE.md** | Deep dive explanation | 20 min |
| **COMPONENT_EXAMPLE_REGISTERED_SELLER.js** | Reference implementation | 10 min |

---

## Workflow by Situation

### Situation A: "I have no idea what's wrong"
1. Run `diagnostic-script.ps1` (2 min)
2. Read what it tells you
3. Choose one of the issues above
4. Follow its "Where to read" link

### Situation B: "I'm getting deployedNetwork errors"
1. Read: DEPLOYED_NETWORK_SOLUTIONS.md (10 min)
2. Copy the appropriate solution into your code
3. Restart React and test

### Situation C: "I want to understand the whole flow"
1. Read: COMPLETE_DAPP_DEBUG_GUIDE.md (15 min)
2. Read: DEPLOYED_NETWORK_GUIDE.md (20 min)
3. Read: COMPONENT_EXAMPLE_REGISTERED_SELLER.js (10 min)
4. Now you understand everything

### Situation D: "I just want this to work NOW"
1. Read: QUICK_FIX_CHECKLIST.md (5 min)
2. Follow the 5 steps exactly
3. If still broken, run diagnostic-script.ps1

---

## The Root Cause (In One Paragraph)

Your DApp connects to Ganache which is running on a Chain ID (usually 1337 or 5777). When you deploy contracts with Truffle, they get recorded in the contract JSON artifact along with which network they're deployed on. When React loads, it checks if the contract exists on the current network by looking for that network ID in the artifact. If the network ID doesn't match (because truffle-config.js had "network_id: *" or you're on the wrong MetaMask network), the lookup returns `undefined` and the error is thrown.

**Solution:** Make sure truffle config's network_id exactly matches your Ganache Chain ID, then redeploy.

---

## Testing Your Fix

After following one of the guides:

1. Open browser to http://localhost:3001
2. Press F12 to open Developer Console
3. Look for output like this:
   ```
   === RegisterSeller componentDidMount ===
   Step 1: Getting Web3 instance...
   ✓ Web3 instance obtained
   Step 2: Getting accounts from MetaMask/Ganache...
   ✓ Accounts available: [0x...]
   Step 3: Getting current network ID from Ganache/MetaMask...
   ✓ Network ID: 1337
   Step 4: Checking if contract is deployed on network 1337
   Available networks in Land.json: 1337
   ✓ Contract found on network 1337
   ✓ Contract address: 0x...
   Step 5: Creating contract instance from ABI and address...
   ✓ Contract instance created
   Step 6: Setting component state...
   ✓ State updated successfully
   🎉 READY TO USE!
   ```

4. All green ✓ checkmarks = Success
5. Any ✗ or error red text = Problem, debug using the guides

---

## Can't Find What You Need?

**Error type:** Look at COMPLETE_DAPP_DEBUG_GUIDE.md → "If Still Failing"

**Code question:** Look at DEPLOYED_NETWORK_SOLUTIONS.md → "Copy-Paste Solutions"

**Explanation needed:** Look at DEPLOYED_NETWORK_GUIDE.md → "Key Takeaways"

**Need working reference:** Look at COMPONENT_EXAMPLE_REGISTERED_SELLER.js → Copy the componentDidMount function

---

## Still Stuck?

Collect this information:

1. Output from browser console (F12)
2. Output from `diagnostic-script.ps1`
3. Content of `truffle-config.js` (networks section only)
4. Output from:
   ```powershell
   $c = Get-Content build/contracts/Land.json | ConvertFrom-Json
   $c.networks | Get-Member -Type NoteProperty
   ```

With this info, the problem will be immediately obvious.
