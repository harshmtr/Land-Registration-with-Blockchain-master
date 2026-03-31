# QUICK REFERENCE: Web3 Connection Fix

## Your Current Issue

`Land.json` has contract deployed on **Network 5777** but you're running Ganache on **Network 1337** — they don't match!

```
Land.json (current):  networks.5777 ✓
Ganache (running):    Chain ID 1337 ✗
Result:               Connection fails because addresses don't match
```

---

## Immediate Action Items (Do These Now)

### 1. Verify Chain ID Match

```bash
# What Chain ID is Ganache showing?
# (Check Ganache GUI top-right corner)
```

### 2. Update truffle-config.js

```javascript
networks: {
  development: {
    host: "127.0.0.1",
    port: 7545,
    network_id: "1337",  // ← MUST match Ganache Chain ID
  },
}
```

### 3. Redeploy Contracts

```bash
cd [project-root]
rm -r build/
truffle migrate --reset --network development
```

### 4. Verify Fix

```bash
# Check if networks.1337 now exists in contract artifact
Get-Content client/src/artifacts/Land.json | Select-String '"1337"'
# Should return a match
```

### 5. Restart Everything

```bash
# Clear React cache
cd client
rm -r node_modules/.cache

# Restart app
npm start
```

---

## What to Expect After Fix

**Before** (now):
```
⚠️ Failed to load web3, accounts, or contract
```

**After** (expected):
```
✓ Web3 instance obtained
✓ Accounts: ['0x...']
✓ Network ID: 1337
✓ Contract deployed at: 0x...
✓ Contract instance created
```

---

## Browser Console Debugging

After applying fixes, open `F12` → Console and look for log sequence:

```javascript
// ✓ All green = Working
=== RegisterSeller componentDidMount ===
Step 1: Getting Web3 instance... ✓
Step 2: Getting accounts... ✓
Step 3: Getting network ID... ✓ Network ID: 1337
Step 4: Checking contract deployment... ✓
Step 5: Creating contract instance... ✓
Step 6: Setting component state... ✓

// ✗ Red errors = Needs fixing
```

---

## Common Mistakes to Avoid

❌ **WRONG**: Setting network_id to "*" (wildcard) without checking deployment  
✅ **RIGHT**: Set network_id to exact value matching Ganache (1337)

❌ **WRONG**: Forgetting to redeploy after changing network_id  
✅ **RIGHT**: Always run `truffle migrate --reset` after config changes

❌ **WRONG**: Not clearing React cache after contract changes  
✅ **RIGHT**: Delete `node_modules/.cache` before restarting

---

## Need More Help?

See full guide: [FIX_WEB3_CONNECTION.md](FIX_WEB3_CONNECTION.md)
