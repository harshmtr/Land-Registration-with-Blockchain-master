# Understanding & Validating deployedNetwork

## What is deployedNetwork?

```javascript
const deployedNetwork = LandContract.networks[networkId];
```

This line does ONE thing: **looks up if your contract was deployed on the current network**.

---

## The Data Structure

### Inside your contract artifact (Land.json)

```json
{
  "contractName": "Land",
  "abi": [...],  // Contract methods/events
  "networks": {
    "1337": {
      "address": "0xABC123XYZ789...",
      "transactionHash": "0x...",
      "events": {}
    },
    "5777": {
      "address": "0xDEF456UVW012...",
      "transactionHash": "0x...",
      "events": {}
    }
  }
}
```

### The networks object is a dictionary

```javascript
// Each network ID is a KEY with deployment info as VALUE
LandContract.networks = {
  "1337": { address, transactionHash, events },   // If deployed here
  "5777": { address, transactionHash, events }    // If deployed here  
}

// Looking up by network ID
LandContract.networks["1337"]  // Returns deployment info or undefined
LandContract.networks["5777"]  // Returns deployment info or undefined
LandContract.networks["999"]   // Returns undefined (not deployed)
```

---

## The deployedNetwork Check Explained

### What happens when you run this:
```javascript
const networkId = 1337;  // From Ganache
const deployedNetwork = LandContract.networks[networkId];
```

**Scenario A: Contract IS deployed on network 1337**
```javascript
networkId = 1337

LandContract.networks = {
  "1337": { address: "0xABC...", ... },  // ← EXISTS
  "5777": { address: "0xDEF...", ... }
}

deployedNetwork = LandContract.networks[1337]
// Result: deployedNetwork = { address: "0xABC...", ... }  ✓ Defined
```

**Scenario B: Contract is NOT deployed on network 1337**
```javascript
networkId = 1337

LandContract.networks = {
  "5777": { address: "0xDEF...", ... }  // Only 5777, no 1337
}

deployedNetwork = LandContract.networks[1337]
// Result: deployedNetwork = undefined  ✗ Undefined - KEY NOT FOUND
```

---

## Checking for undefined (CRITICAL!)

### WRONG - Silent Failure
```javascript
const deployedNetwork = LandContract.networks[networkId];
const instance = new web3.eth.Contract(
  LandContract.abi,
  deployedNetwork.address  // ✗ If deployedNetwork is undefined, 
                            // this becomes undefined.address → Error!
);
```

### CORRECT - Explicit Check
```javascript
const deployedNetwork = LandContract.networks[networkId];

if (!deployedNetwork) {
  // Contract not deployed on this network
  throw new Error(
    `Contract not deployed on network ${networkId}. ` +
    `Available: ${Object.keys(LandContract.networks).join(', ')}`
  );
}

// Now safe to use
const instance = new web3.eth.Contract(
  LandContract.abi,
  deployedNetwork.address  // ✓ Safe, deployedNetwork is defined
);
```

### BEST - With Diagnostics
```javascript
console.log('Network ID:', networkId);
console.log('Available networks:', Object.keys(LandContract.networks));

const deployedNetwork = LandContract.networks[networkId];

if (!deployedNetwork) {
  // Helpful error message
  console.error(`✗ Contract NOT deployed on network ${networkId}`);
  
  // Show what networks ARE available
  Object.keys(LandContract.networks).forEach(net => {
    console.log(`  Network ${net}: ${LandContract.networks[net].address}`);
  });
  
  throw new Error(
    `Contract not deployed on network ${networkId}.\n` +
    `Available: ${Object.keys(LandContract.networks).join(', ')}\n` +
    `Update truffle-config.js to network_id: "${networkId}" and redeploy.`
  );
}

console.log('✓ Contract at:', deployedNetwork.address);
```

---

## Common Patterns

### Pattern 1: Just Check Existence
```javascript
if (LandContract.networks[networkId]) {
  // Contract is deployed
  const addr = LandContract.networks[networkId].address;
}
```

### Pattern 2: Check with Fallback
```javascript
const deployedNetwork = LandContract.networks[networkId];
const address = deployedNetwork ? deployedNetwork.address : null;

if (!address) {
  throw new Error('Contract not deployed on this network');
}
```

### Pattern 3: Check with Default/Alternative
```javascript
// Try current network, fall back to 1337 if not found
const deployedNetwork = 
  LandContract.networks[networkId] || 
  LandContract.networks["1337"];

if (!deployedNetwork) {
  throw new Error('Contract not found on any known network');
}
```

### Pattern 4: Loop Through Available Networks
```javascript
// Check if ANY network has the contract
const availableNetworks = Object.keys(LandContract.networks);

if (availableNetworks.length === 0) {
  throw new Error('Contract not deployed to any network');
}

// See if we're on one of them
const deployedNetwork = LandContract.networks[networkId];
if (!deployedNetwork) {
  throw new Error(
    `You're on network ${networkId}, but contract is on: ` +
    `${availableNetworks.join(', ')}`
  );
}
```

---

## Real-World Debug Flow

### User Reports: "Failed to load web3, accounts, or contract"

```javascript
// Step 1: Log what we're working with
const networkId = await web3.eth.net.getId();
console.log('Current network ID:', networkId);
console.log('Networks in artifact:', Object.keys(LandContract.networks));

// Step 2: Try the lookup
const deployedNetwork = LandContract.networks[networkId];

// Step 3: Check result
if (deployedNetwork === undefined) {
  console.error('❌ deployedNetwork is undefined');
  console.error('This means: Contract was NOT deployed on network', networkId);
  console.error('To fix:');
  console.error('1. Check truffle-config.js network_id');
  console.error('2. Run: truffle migrate --reset --network development');
  console.error('3. Verify networks section in build/contracts/Land.json');
  return;
}

if (!deployedNetwork.address) {
  console.error('❌ deployedNetwork exists but has no address');
  console.error('This usually means deployment failed');
  console.error('Redeploy with: truffle migrate --reset --network development');
  return;
}

console.log('✓ Contract found at:', deployedNetwork.address);
```

---

## Key Takeaways

| Scenario | deployedNetwork | Result | Solution |
|----------|-----------------|--------|----------|
| Contract on network 1337, looking for 1337 | Defined object | ✓ Works | None needed |
| Contract on network 5777, looking for 1337 | undefined | ✗ Error | Redeploy to 1337 |
| Contract not deployed at all | undefined | ✗ Error | Run truffle migrate |
| Ganache on 1337, but truffle config has `*` | Depends | Often ✗ | Change network_id to "1337" |

---

## Testing Your Check

### Run This in Browser Console

```javascript
// Import your contract artifact
const Land = window.LandContract; // Or however it's available

// Check structure
console.log('Contract object:', Land);
console.log('Networks object:', Land.networks);
console.log('Available network IDs:', Object.keys(Land.networks));

// Test the lookup
const testNetworkId = 1337;
const result = Land.networks[testNetworkId];
console.log(`Lookup for ${testNetworkId}:`, result);

// Test with different network ID
const testNetworkId2 = 5777;
const result2 = Land.networks[testNetworkId2];
console.log(`Lookup for ${testNetworkId2}:`, result2);

// Check for undefined
if (!result) {
  console.error('Network 1337 not found!');
}
if (result) {
  console.log('Network 1337 found! Address:', result.address);
}
```

---

## Preventing the Error

### Before calling any contract methods:

```javascript
// ALWAYS do this check first
function validateContractDeployment(contract, networkId) {
  const deployed = contract.networks[networkId];
  
  if (!deployed) {
    throw new Error(
      `Contract not deployed on network ${networkId}. ` +
      `Deploy with: truffle migrate --reset --network development`
    );
  }
  
  if (!deployed.address) {
    throw new Error(
      `Contract found but missing address on network ${networkId}`
    );
  }
  
  return deployed;
}

// Usage:
try {
  const deployment = validateContractDeployment(LandContract, networkId);
  const instance = new web3.eth.Contract(LandContract.abi, deployment.address);
  // Now you can safely use instance
} catch (error) {
  console.error('Contract validation failed:', error.message);
  // Handle error - show user message, etc.
}
```

