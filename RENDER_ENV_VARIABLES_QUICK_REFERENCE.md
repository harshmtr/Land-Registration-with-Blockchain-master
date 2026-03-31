# Quick Reference: Add Environment Variables to Render

## 🎯 Exactly What to Add to Render Dashboard

When you see this screen in Render:

```
Environment Variables
┌─────────────────────────────────────────────────────────────┐
│ NAME_OF_VARIABLE          │  value                          │
├─────────────────────────────────────────────────────────────┤
│ [Add Environment Variable] [Add from .env]                 │
└─────────────────────────────────────────────────────────────┘
```

**Add these 4 variables:**

### Variable 1: RPC URL
```
NAME:  REACT_APP_RPC_URL
VALUE: http://127.0.0.1:7545
```

### Variable 2: Chain ID
```
NAME:  REACT_APP_GANACHE_CHAIN_ID
VALUE: 5777
```

### Variable 3: Contract Address
```
NAME:  REACT_APP_CONTRACT_ADDRESS
VALUE: 0x76d7235B0D9Cbf0Ced08f6593295A8F1b50d7CD5
```

### Variable 4: IPFS Gateway
```
NAME:  REACT_APP_IPFS_GATEWAY
VALUE: https://ipfs.io/ipfs/
```

---

## ✅ Final Result Should Look Like:

| NAME | VALUE |
|------|-------|
| REACT_APP_RPC_URL | http://127.0.0.1:7545 |
| REACT_APP_GANACHE_CHAIN_ID | 5777 |
| REACT_APP_CONTRACT_ADDRESS | 0x76d7235B0D9Cbf0Ced08f6593295A8F1b50d7CD5 |
| REACT_APP_IPFS_GATEWAY | https://ipfs.io/ipfs/ |

---

## 📝 Steps in Render:

1. **Login to Render.com**
2. **Go to your Web Service**
3. **Click "Environment"** tab
4. **Click "+ Add Environment Variable"** for each variable above
5. **Enter NAME and VALUE** (copy-paste from above)
6. **Click "Save"**
7. **Render will redeploy automatically**

---

## ⚠️ Important Notes

- ✅ All names must start with `REACT_APP_`
- ✅ Use exactly these variable names (case-sensitive)
- ✅ These values are for local Ganache - change for production
- ✅ Render will restart your service after saving

---

## 🔄 If You Need Different Values for Different Environments

### For Goerli Testnet:
```
REACT_APP_RPC_URL=https://goerli.infura.io/v3/YOUR_INFURA_KEY
REACT_APP_GANACHE_CHAIN_ID=5
REACT_APP_CONTRACT_ADDRESS=0x[your_goerli_contract]
```

### For Sepolia Testnet:
```
REACT_APP_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
REACT_APP_GANACHE_CHAIN_ID=11155111
REACT_APP_CONTRACT_ADDRESS=0x[your_sepolia_contract]
```

### For Ethereum Mainnet:
```
REACT_APP_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
REACT_APP_GANACHE_CHAIN_ID=1
REACT_APP_CONTRACT_ADDRESS=0x[your_mainnet_contract]
```

---

## 🧪 Verify It Works

After adding variables to Render and it redeploys:

1. Open your Render app in browser
2. Press **F12** (Developer Console)
3. Type:
   ```javascript
   console.log(process.env.REACT_APP_RPC_URL)
   ```
4. Should print: `http://127.0.0.1:7545`

If it shows `undefined`, the deployment hasn't picked up the changes - wait a minute and refresh.

---

## 📁 Local Development (.env.local)

Also create `client/.env.local` with same values:

```
REACT_APP_RPC_URL=http://127.0.0.1:7545
REACT_APP_GANACHE_CHAIN_ID=5777
REACT_APP_CONTRACT_ADDRESS=0x76d7235B0D9Cbf0Ced08f6593295A8F1b50d7CD5
REACT_APP_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

- Don't commit this file
- For `npm start` locally
- Each developer can have their own
