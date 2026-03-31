# Copy-Paste Solutions: deployedNetwork Validation

## Your Question
"How to verify deployedNetwork is not undefined in code?"

## Quick Answers

### Answer 1: Simple Check
```javascript
const deployedNetwork = Contract.networks[networkId];

if (!deployedNetwork) {
  throw new Error('Contract not deployed on this network');
}
```

### Answer 2: With Details
```javascript
const deployedNetwork = Contract.networks[networkId];

if (!deployedNetwork) {
  const available = Object.keys(Contract.networks).join(', ');
  throw new Error(
    `Contract not on network ${networkId}. Available: ${available}`
  );
}
```

### Answer 3: With Logging (Best for Debugging)
```javascript
console.log('Network ID:', networkId);
console.log('Available networks:', Object.keys(Contract.networks));

const deployedNetwork = Contract.networks[networkId];

if (!deployedNetwork) {
  console.error('❌ Contract NOT deployed on network', networkId);
  throw new Error(`Contract deployment not found for network ${networkId}`);
}

console.log('✓ Contract found at:', deployedNetwork.address);
```

---

## How to Use In Your Code

### Current (Probably Failing)
```javascript
componentDidMount = async () => {
  try {
    const web3 = await getWeb3();
    const accounts = await web3.eth.getAccounts();
    const networkId = await web3.eth.net.getId();
    
    const deployedNetwork = LandContract.networks[networkId];
    const instance = new web3.eth.Contract(
      LandContract.abi,
      deployedNetwork && deployedNetwork.address  // ← Might be undefined
    );
    this.setState({ LandInstance: instance, web3, account: accounts[0] });
  } catch (error) {
    console.error(error);
  }
};
```

### Fixed Version
```javascript
componentDidMount = async () => {
  try {
    const web3 = await getWeb3();
    const accounts = await web3.eth.getAccounts();
    const networkId = await web3.eth.net.getId();
    
    // ✓ VALIDATE deployedNetwork
    const deployedNetwork = LandContract.networks[networkId];
    if (!deployedNetwork) {
      throw new Error(
        `Contract not found on network ${networkId}. ` +
        `Available: ${Object.keys(LandContract.networks).join(', ')}`
      );
    }
    
    const instance = new web3.eth.Contract(
      LandContract.abi,
      deployedNetwork.address  // ← Safe: deployedNetwork is validated
    );
    this.setState({ LandInstance: instance, web3, account: accounts[0] });
  } catch (error) {
    console.error('Error:', error.message);
    alert('Failed to load DApp: ' + error.message);
  }
};
```

---

## Testing Block (Run in Browser Console)

```javascript
// Paste this to test your setup

async function testDeployment() {
  try {
    // Get Web3
    const web3 = await getWeb3();
    console.log('✓ Web3 loaded');
    
    // Get network
    const networkId = await web3.eth.net.getId();
    console.log('✓ Network ID:', networkId);
    
    // Load contract (adjust path as needed)
    const Land = window.LandArtifact || {}; // Or from import
    console.log('✓ Contract artifact loaded');
    
    // Check networks
    const availableNetworks = Object.keys(Land.networks || {});
    console.log('Available networks:', availableNetworks);
    
    // The KEY check
    const deployed = Land.networks[networkId];
    
    if (!deployed) {
      console.error('❌ FAIL: Contract not on network', networkId);
      console.error('   Expected one of:', availableNetworks);
      return false;
    }
    
    console.log('✓ SUCCESS: Contract at', deployed.address);
    return true;
    
  } catch (err) {
    console.error('Test error:', err);
    return false;
  }
}

// Run it
testDeployment();
```

---

## Conditional Rendering (Show Error to User)

### React Component
```jsx
render() {
  // Show loading while connecting
  if (!this.state.LandInstance) {
    return <div>Connecting to DApp...</div>;
  }
  
  // If LandInstance is set, we know deployed network is valid
  return (
    <div>
      <p>Connected to account: {this.state.account}</p>
      {/* Your form here */}
    </div>
  );
}
```

### With Error Message
```jsx
render() {
  if (!this.state.LandInstance && !this.state.error) {
    return <div>Loading...</div>;
  }
  
  if (this.state.error) {
    return <div style={{color: 'red'}}>Error: {this.state.error}</div>;
  }
  
  return <div>DApp Ready</div>;
}

// In componentDidMount:
componentDidMount = async () => {
  try {
    // ... your setup code ...
    const deployedNetwork = LandContract.networks[networkId];
    if (!deployedNetwork) {
      throw new Error(`Contract not on network ${networkId}`);
    }
    // ... continue ...
  } catch (error) {
    this.setState({ error: error.message });
  }
};
```

---

## Utility Helper Function

Create this in its own file (e.g., `utils/contractValidator.js`):

```javascript
/**
 * Validates that a contract is deployed on the given network
 * @param {Object} contractArtifact - The contract artifact (import from ./artifacts/Contract.json)
 * @param {Number} networkId - The network ID to check
 * @returns {Object} The deployment info if found
 * @throws {Error} If contract not deployed on network
 */
export function validateContractDeployment(contractArtifact, networkId) {
  const deployedNetwork = contractArtifact.networks[networkId];
  
  if (!deployedNetwork) {
    const available = Object.keys(contractArtifact.networks);
    throw new Error(
      `Contract not deployed on network ${networkId}. ` +
      `Available networks: ${available.join(', ')}`
    );
  }
  
  if (!deployedNetwork.address) {
    throw new Error(
      `Contract on network ${networkId} has no address`
    );
  }
  
  return deployedNetwork;
}

/**
 * Checks if contract is deployed without throwing
 */
export function isContractDeployed(contractArtifact, networkId) {
  return (
    contractArtifact.networks &&
    contractArtifact.networks[networkId] &&
    contractArtifact.networks[networkId].address
  );
}

/**
 * Gets all networks a contract is deployed on
 */
export function getAvailableNetworks(contractArtifact) {
  return Object.keys(contractArtifact.networks || {}).map(netId => ({
    id: netId,
    address: contractArtifact.networks[netId].address
  }));
}
```

### Usage:
```javascript
import { validateContractDeployment, isContractDeployed } from './utils/contractValidator';
import LandContract from './artifacts/Land.json';

// In componentDidMount:
const deployedNetwork = validateContractDeployment(LandContract, networkId);
// ✓ Safe - if we get here, contract is deployed

// Or check without throwing:
if (isContractDeployed(LandContract, networkId)) {
  // Safe to proceed
}

// See all available networks:
const networks = getAvailableNetworks(LandContract);
console.log('Contract deployed on:', networks);
// Output: [{ id: '1337', address: '0xABC...' }, { id: '5777', address: '0xDEF...' }]
```

---

## Debugging Checklist

Use this if you get "deployedNetwork is undefined" error:

- [ ] Check `build/contracts/Land.json` exists
  ```powershell
  Test-Path ".\build\contracts\Land.json"
  ```

- [ ] Check networks section in artifact
  ```powershell
  $contract = Get-Content build/contracts/Land.json | ConvertFrom-Json
  $contract.networks | Get-Member -Type NoteProperty
  ```

- [ ] Check what network Ganache is using
  ```
  Open http://127.0.0.1:7545 in browser
  Note the Chain ID shown
  ```

- [ ] Check what network truffle-config.js uses
  ```
  Open truffle-config.js
  Find: network_id: ...
  Should match Ganache's Chain ID
  ```

- [ ] If mismatch, redeploy:
  ```powershell
  rm -r build/
  truffle migrate --reset --network development
  ```

- [ ] Check artifact was updated
  ```powershell
  $new = Get-Content build/contracts/Land.json | ConvertFrom-Json
  $new.networks | Get-Member -Type NoteProperty
  # Should show the network ID you redeployed to
  ```

- [ ] Copy to frontend if needed
  ```powershell
  Copy-Item build/contracts/Land.json client/src/artifacts/Land.json
  ```

- [ ] Restart React
  ```powershell
  # Kill npm start (Ctrl+C)
  cd client
  rm -r node_modules/.cache
  npm start
  ```

---

## What Each Error Means

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot read property 'address' of undefined` | `deployedNetwork` is undefined | Redeploy with correct network_id |
| `Contract not deployed on network 1337` | Artifact only has network 5777 | Update truffle-config.js to "5777" or redeploy to 1337 |
| `networks is undefined` | Contract.json is corrupted | Delete and redeploy |
| `No networks found in artifact` | No contracts deployed | Run `truffle migrate --reset` |

