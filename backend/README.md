# Backend

Solidity smart contracts and Truffle configuration for the Land Registration DApp.

## Structure

```
backend/
├── contracts/           # Solidity smart contracts
│   ├── Land.sol         # Main Land Registry contract
│   └── Migrations.sol   # Migrations contract
├── migrations/          # Truffle migration scripts
│   ├── 1_initial_migration.js
│   └── 2_deploy_contracts.js
└── test/                # Contract tests
    └── land.js          # Land contract unit tests
```

## Quick Start

```bash
# Install Truffle (global)
npm install -g truffle

# Navigate to root (where truffle-config.js is)
cd ../

# Compile contracts
truffle compile

# Deploy to Ganache
truffle migrate

# Run tests
truffle test
```

## Smart Contracts

### Land.sol
Main smart contract handling:
- Land registration
- Ownership transfer
- Role management (seller, buyer, inspector)
- Transaction processing

**Key Functions:**
- `registerLand()` - Register new land
- `transferLand()` - Transfer ownership
- `approveLandTransfer()` - Approve transfer
- `isSeller()` - Check if user is seller
- `isBuyer()` - Check if user is buyer
- `isLandInspector()` - Check if user is inspector

## Network Configuration

**Ganache (Development):**
- RPC: http://127.0.0.1:7545
- Chain ID: 5777
- Network ID: 5777

Set in `truffle-config.js`:
```javascript
networks: {
  ganache: {
    host: "127.0.0.1",
    port: 7545,
    network_id: "5777"
  }
}
```

## Deployment

**Local Ganache:**
```bash
truffle migrate --network ganache
```

**Render Production:**
```bash
truffle migrate --network render
```

## Testing

```bash
# Run all tests
truffle test

# Run specific test
truffle test test/land.js
```

## Contract Artifacts

After deployment, contract artifacts are stored in:
```
frontend/client/src/artifacts/
```

These are imported by the React frontend for Web3 interaction.

## Environment Setup

1. Start Ganache
   ```bash
   ganache-cli --deterministic --port 7545
   ```

2. Compile contracts
   ```bash
   truffle compile
   ```

3. Deploy contracts
   ```bash
   truffle migrate --reset
   ```

4. Frontend will automatically connect to deployed contract
