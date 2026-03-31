const IPFS = require('ipfs-api');

// IPFS Configuration
// Using public gateway with fallback options
let ipfs;

try {
  // Try using ipfs.io first (most reliable)
  ipfs = new IPFS({ 
    host: 'ipfs.io', 
    port: 443, 
    protocol: 'https',
    timeout: 60000
  });
} catch (error) {
  console.error('IPFS initialization error:', error);
  
  // Fallback to gateway.pinata.cloud
  try {
    ipfs = new IPFS({
      host: 'gateway.pinata.cloud',
      port: 443,
      protocol: 'https',
      timeout: 60000
    });
  } catch (fallbackError) {
    console.error('IPFS fallback initialization error:', fallbackError);
    
    // Final fallback to localhost (for local IPFS node)
    ipfs = new IPFS({
      host: 'localhost',
      port: 5001,
      protocol: 'http',
      timeout: 60000
    });
  }
}

export default ipfs;