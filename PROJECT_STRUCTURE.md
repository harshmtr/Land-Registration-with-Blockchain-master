# Project Structure

```
Land-Registration-with-Blockchain/
│
├── frontend/
│   └── client/                          # React.js frontend application
│       ├── public/                      # Static files
│       ├── src/                         # React source code
│       ├── config/                      # Webpack/build configuration
│       ├── scripts/                     # Build scripts
│       ├── package.json                 # Frontend dependencies
│       └── .npmrc                       # npm configuration
│
├── backend/
│   ├── contracts/                       # Solidity smart contracts
│   │   ├── Land.sol                     # Land Registration contract
│   │   └── Migrations.sol               # Migrations contract
│   ├── migrations/                      # Truffle migration scripts
│   │   ├── 1_initial_migration.js
│   │   └── 2_deploy_contracts.js
│   └── test/                            # Smart contract tests
│       └── land.js                      # Land contract tests
│
├── docs/                                # Documentation
│   ├── RENDER_DEPLOYMENT_GUIDE.md       # Render deployment instructions
│   ├── RENDER_QUICK_REFERENCE.md        # Quick deployment reference
│   ├── MODERN_WEB3_METAMASK_PATTERN.md  # Web3 patterns
│   ├── GANACHE_TRUFFLE_REACT_SETUP.md   # Setup guide
│   └── [other guides...]
│
├── package.json                         # Root package (build scripts)
├── truffle-config.js                    # Truffle configuration
├── .gitignore                           # Git ignore rules
├── .npmrc                               # npm configuration
└── README.md                            # Project overview

```

## Frontend Setup

**Location:** `frontend/client/`

To work with frontend:
```bash
cd frontend/client
npm install
npm start
```

## Backend Setup

**Location:** `backend/`

To work with smart contracts:
```bash
# Install Truffle globally
npm install -g truffle

# Compile contracts
truffle compile

# Deploy to Ganache
truffle migrate

# Run tests
truffle test
```

## Building for Production

From root directory:
```bash
npm run build      # Builds frontend to frontend/client/build/
```

## Environment Variables

**Frontend (.env files):** `frontend/client/.env.local`
- `REACT_APP_RPC_URL` - Blockchain RPC endpoint
- `REACT_APP_CONTRACT_ADDRESS` - Deployed contract address
- `REACT_APP_GANACHE_CHAIN_ID` - Network chain ID

**Backend:** `truffle-config.js`
- Configure Ganache network
- Set contract deployment options

