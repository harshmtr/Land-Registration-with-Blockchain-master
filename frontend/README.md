# Frontend

React.js application for the Land Registration DApp.

## Structure

```
frontend/
└── client/
    ├── public/              # Static files served as-is
    ├── src/                 # React source code
    │   ├── components/      # React components
    │   ├── views/           # Page components
    │   ├── contexts/        # React contexts
    │   ├── App.js           # Main app component
    │   └── index.js         # Entry point
    ├── config/              # Webpack and build config
    ├── scripts/             # Build scripts (start, build, test)
    ├── package.json         # Dependencies
    └── .npmrc               # npm configuration
```

## Quick Start

```bash
cd frontend/client
npm install
npm start
```

App runs on `http://localhost:3000`

## Build for Production

```bash
cd frontend/client
npm run build
```

Generates optimized production build in `frontend/client/build/`

## Configuration

**Environment Variables:** `.env.local`
```
REACT_APP_RPC_URL=http://127.0.0.1:7545
REACT_APP_GANACHE_CHAIN_ID=5777
REACT_APP_CONTRACT_ADDRESS=0x...
REACT_APP_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

## Dependencies

- React 17.0.2
- Web3.js - Blockchain interaction
- MetaMask - Wallet provider
- Material-UI - UI components
- Bootstrap - Styling
- IPFS - Document storage

## Available Scripts

- `npm start` - Development server
- `npm run build` - Production build
- `npm test` - Run tests
- `npm run dev` - Development mode (alias for start)
