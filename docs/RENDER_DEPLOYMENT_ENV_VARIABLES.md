# How to Deploy Your DApp to Render with Environment Variables

## Step 1: Prepare Your Local `.env.local` File

Create `client/.env.local` with:
```
REACT_APP_RPC_URL=http://127.0.0.1:7545
REACT_APP_GANACHE_CHAIN_ID=5777
REACT_APP_CONTRACT_ADDRESS=0x76d7235B0D9Cbf0Ced08f6593295A8F1b50d7CD5
REACT_APP_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

**Note:** This file should NOT be committed to Git (add to `.gitignore`)

---

## Step 2: Update Your Code to Use Environment Variables

### In `getWeb3.js`
```javascript
import Web3 from "web3";

const getWeb3 = () =>
  new Promise((resolve, reject) => {
    window.addEventListener("load", async () => {
      // Use RPC URL from environment variable
      const rpcUrl = process.env.REACT_APP_RPC_URL;
      
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          console.log(`✓ MetaMask connected (RPC: ${rpcUrl})`);
          resolve(web3);
        } catch (error) {
          console.error("User denied account access:", error);
          reject(error);
        }
      }
      else if (window.web3) {
        resolve(window.web3);
      }
      else {
        try {
          // Use environment variable RPC URL for fallback
          const provider = new Web3.providers.HttpProvider(rpcUrl);
          const web3 = new Web3(provider);
          console.log(`✓ Using HTTP provider: ${rpcUrl}`);
          resolve(web3);
        } catch (error) {
          console.error("Error connecting to blockchain:", error);
          reject(error);
        }
      }
    });
  });

export default getWeb3;
```

### In Components (e.g., RegisterSeller.js, LoginPage.js)
```javascript
import LandContract from "./artifacts/Land.json"
import getWeb3 from "./getWeb3"

class MyComponent extends React.Component {
  componentDidMount = async () => {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      
      // Use contract address from environment variable
      const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
      
      // Optionally validate
      if (!contractAddress) {
        throw new Error('REACT_APP_CONTRACT_ADDRESS not set in environment');
      }
      
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = LandContract.networks[networkId];
      
      const instance = new web3.eth.Contract(
        LandContract.abi,
        deployedNetwork?.address || contractAddress  // Use env var as fallback
      );
      
      this.setState({ LandInstance: instance, web3, account: accounts[0] });
      
    } catch (error) {
      console.error('Initialization error:', error);
    }
  };
}
```

### In IPFS Configuration (ipfs.js)
```javascript
// If you use the IPFS gateway from environment variable
const IPFS_GATEWAY = process.env.REACT_APP_IPFS_GATEWAY;

// Use when displaying IPFS hashes
const ipfsUrl = `${IPFS_GATEWAY}${ipfsHash}`;
```

---

## Step 3: Push to GitHub (without .env file)

```bash
git add .
git commit -m "Add environment variable support"
git push origin main
```

**Verify `.gitignore` works:**
```bash
git status
# Should NOT show .env files
```

---

## Step 4: Add Environment Variables to Render

### In Render Dashboard:

1. **Create new Web Service** or go to existing service settings
2. **Navigate to "Environment"** tab
3. **Add each variable:**

| Name | Value |
|------|-------|
| `REACT_APP_RPC_URL` | `http://127.0.0.1:7545` or your production RPC |
| `REACT_APP_GANACHE_CHAIN_ID` | `5777` |
| `REACT_APP_CONTRACT_ADDRESS` | `0x76d7235B0D9Cbf0Ced08f6593295A8F1b50d7CD5` |
| `REACT_APP_IPFS_GATEWAY` | `https://ipfs.io/ipfs/` |

**Screenshot of what you'll see in Render:**
```
Environment Variables

NAME_OF_VARIABLE          value
REACT_APP_RPC_URL         http://127.0.0.1:7545
REACT_APP_GANACHE_CHAIN_ID 5777
REACT_APP_CONTRACT_ADDRESS 0x76d7235B0D9Cbf0Ced08f6593295A8F1b50d7CD5
REACT_APP_IPFS_GATEWAY     https://ipfs.io/ipfs/
```

4. **Click "Deploy"** - Render will redeploy with the new environment variables

---

## Step 5: Verify Environment Variables Work

### In Browser Console
```javascript
console.log('RPC URL:', process.env.REACT_APP_RPC_URL);
console.log('Contract Address:', process.env.REACT_APP_CONTRACT_ADDRESS);
console.log('Chain ID:', process.env.REACT_APP_GANACHE_CHAIN_ID);
```

---

## Different Environments

### Local Development (.env.local)
```
REACT_APP_RPC_URL=http://127.0.0.1:7545
REACT_APP_GANACHE_CHAIN_ID=5777
REACT_APP_CONTRACT_ADDRESS=0x76d7235B0D9Cbf0Ced08f6593295A8F1b50d7CD5
```

### Production on Testnet (in Render Dashboard)
```
REACT_APP_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
REACT_APP_GANACHE_CHAIN_ID=11155111
REACT_APP_CONTRACT_ADDRESS=0x[your_testnet_contract_address]
```

### Production on Mainnet (in Render Dashboard)
```
REACT_APP_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
REACT_APP_GANACHE_CHAIN_ID=1
REACT_APP_CONTRACT_ADDRESS=0x[your_mainnet_contract_address]
```

---

## Important Notes

### ✅ DO:
- Prefix all client-side variables with `REACT_APP_`
- Store these in Render environment variables for production
- Use `.env.local` for local development (not committed)
- Validate environment variables exist before using

### ❌ DON'T:
- Commit `.env` files to Git
- Store private keys in environment variables
- Hardcode contract addresses or RPC URLs
- Share `.env.local` files with screenshots

---

## Troubleshooting

### Environment variables showing as undefined

**Solution 1:** Restart your dev server
```bash
npm start
```

**Solution 2:** Check file location
- Should be: `client/.env.local`
- Not: `.env.local` at root

**Solution 3:** Verify variable prefix
- Must start with `REACT_APP_`
- Example: `REACT_APP_CONTRACT_ADDRESS` ✓
- Wrong: `CONTRACT_ADDRESS` ✗

### Render shows old values after update

**Solution:** Manual redeploy
1. Go to Render Dashboard
2. Your service
3. Click "Manual Deploy"
4. Choose latest commit
5. Click "Deploy"

---

## Example: Complete getWeb3.js with Env Variables

```javascript
import Web3 from "web3";

const getWeb3 = () =>
  new Promise((resolve, reject) => {
    window.addEventListener("load", async () => {
      // Get RPC URL from environment variables
      const rpcUrl = process.env.REACT_APP_RPC_URL;
      
      if (!rpcUrl) {
        console.error('REACT_APP_RPC_URL environment variable is not set');
      }
      
      // Try MetaMask first
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          console.log("✓ MetaMask connected");
          resolve(web3);
        } catch (error) {
          console.error("MetaMask access denied:", error);
          reject(error);
        }
      }
      // Fall back to HTTP RPC URL
      else {
        try {
          const provider = new Web3.providers.HttpProvider(rpcUrl);
          const web3 = new Web3(provider);
          console.log(`✓ Using RPC: ${rpcUrl}`);
          resolve(web3);
        } catch (error) {
          console.error("Error connecting to blockchain:", error);
          reject(error);
        }
      }
    });
  });

export default getWeb3;
```

---

## Summary Checklist

- [ ] Created `client/.env.local` with environment variables
- [ ] Created `.gitignore` to protect `.env` files
- [ ] Updated `getWeb3.js` to use `process.env.REACT_APP_RPC_URL`
- [ ] Updated components to use `process.env.REACT_APP_CONTRACT_ADDRESS`
- [ ] Pushed code to GitHub (without `.env` files)
- [ ] Added environment variables in Render Dashboard
- [ ] Tested by opening browser console and checking `process.env.REACT_APP_RPC_URL`
- [ ] Verified DApp works on Render with new environment variables

**Done!** 🎉 Your DApp can now be deployed to different environments with different configurations.
