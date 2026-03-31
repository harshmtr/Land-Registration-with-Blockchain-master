import Web3 from "web3";

const getWeb3 = () =>
  new Promise((resolve, reject) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener("load", async () => {
      // Modern dapp browsers (MetaMask, etc.)...
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          // Request account access if needed
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          console.log("MetaMask detected and connected");
          resolve(web3);
        } catch (error) {
          console.error("User denied account access or error connecting to MetaMask:", error);
          reject(error);
        }
      }
      // Legacy dapp browsers (Mist)...
      else if (window.web3) {
        const web3 = window.web3;
        console.log("Injected web3 detected (legacy).");
        resolve(web3);
      }
      // Fallback to local Ganache (port 7545 - default Ganache port)
      else {
        try {
          const provider = new Web3.providers.HttpProvider(
            "http://127.0.0.1:7545"
          );
          const web3 = new Web3(provider);
          console.log("No web3 instance injected, using local Ganache (http://127.0.0.1:7545)");
          resolve(web3);
        } catch (error) {
          console.error("Error connecting to Ganache:", error);
          reject(error);
        }
      }
    });
  });

export default getWeb3;
