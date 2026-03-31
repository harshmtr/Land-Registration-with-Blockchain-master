# Environment Variables Template for Render Deployment
# Copy these variable NAMES to Render, then fill in the VALUES

# ============================================
# RPC CONFIGURATION
# ============================================

# RPC URL - Change based on your blockchain network
# For local Ganache: http://127.0.0.1:7545
# For Sepolia testnet: https://sepolia.infura.io/v3/YOUR_INFURA_KEY
# For Goerli testnet: https://goerli.infura.io/v3/YOUR_INFURA_KEY
REACT_APP_RPC_URL=http://127.0.0.1:7545

# Chain ID of your network
# Ganache: 5777
# Sepolia: 11155111
# Goerli: 5
REACT_APP_GANACHE_CHAIN_ID=5777

# ============================================
# CONTRACT CONFIGURATION  
# ============================================

# Your deployed contract address
REACT_APP_CONTRACT_ADDRESS=0x76d7235B0D9Cbf0Ced08f6593295A8F1b50d7CD5

# ============================================
# IPFS CONFIGURATION
# ============================================

# IPFS Gateway URL
REACT_APP_IPFS_GATEWAY=https://ipfs.io/ipfs/

# ============================================
# API KEYS (if needed)
# ============================================

# Infura Project ID (if using Infura)
# Get from: https://infura.io
REACT_APP_INFURA_PROJECT_ID=your_infura_key_here

# Alchemy API Key (if using Alchemy)
# Get from: https://www.alchemy.com
REACT_APP_ALCHEMY_API_KEY=your_alchemy_key_here
