// Complete RegisterSeller.js with Comprehensive deployedNetwork Validation
// This example shows exactly how to check for undefined deployedNetwork

import React, { Component } from 'react'
import LandContract from "./artifacts/Land.json"
import getWeb3 from "./getWeb3"
import ipfs from './ipfs';

import { FormGroup, FormControl, Button, Spinner, FormFile } from 'react-bootstrap'

class RegisterSeller extends Component {
    constructor(props) {
        super(props)
        this.state = {
            LandInstance: undefined,
            account: null,
            web3: null,
            name: '',
            age: '',
            aadharNumber: '',
            panNumber: '',
            landsOwned: '',
            isVerified: false,
            buffer2: null,
            document: '',
        }
        this.captureDoc = this.captureDoc.bind(this);
        this.addDoc = this.addDoc.bind(this);
    }

    componentDidMount = async () => {
        // Refresh page only once
        if (!window.location.hash) {
            window.location = window.location + '#loaded';
            window.location.reload();
        }

        try {
            console.log('=== RegisterSeller componentDidMount ===');
            
            // ==========================================
            // STEP 1: Get Web3 instance
            // ==========================================
            console.log('Step 1: Getting Web3 instance...');
            const web3 = await getWeb3();
            console.log('✓ Web3 instance obtained');

            // ==========================================
            // STEP 2: Get accounts from MetaMask/Ganache
            // ==========================================
            console.log('Step 2: Getting accounts from MetaMask/Ganache...');
            const accounts = await web3.eth.getAccounts();
            console.log('✓ Accounts available:', accounts);
            
            if (!accounts || accounts.length === 0) {
                throw new Error(
                    'No accounts found in MetaMask/Ganache.\n' +
                    'Please:\n' +
                    '1. Unlock MetaMask\n' +
                    '2. Import Ganache account from private key\n' +
                    '3. Ensure MetaMask is connected to Ganache network'
                );
            }
            const userAccount = accounts[0];
            console.log('✓ Using account:', userAccount);

            // ==========================================
            // STEP 3: Get current network ID
            // ==========================================
            console.log('Step 3: Getting current network ID from Ganache/MetaMask...');
            const networkId = await web3.eth.net.getId();
            console.log('✓ Network ID:', networkId);

            // ==========================================
            // STEP 4: Check if contract is deployed on this network
            // ==========================================
            // THIS IS THE CRITICAL STEP that prevents the undefined error
            console.log('Step 4: Checking if contract is deployed on network', networkId);
            console.log('Available networks in Land.json:', Object.keys(LandContract.networks));
            
            // THIS IS THE KEY CHECK:
            // deployedNetwork will be undefined if networkId doesn't exist in the artifact
            const deployedNetwork = LandContract.networks[networkId];
            
            if (!deployedNetwork) {
                // If undefined, the contract was not deployed on this network
                console.error(`✗ Contract NOT deployed on network ${networkId}`);
                console.error('Available networks:', Object.keys(LandContract.networks));
                console.error('Contract artifact paths:');
                Object.keys(LandContract.networks).forEach(netId => {
                    console.error(`  - Network ${netId}: ${LandContract.networks[netId].address}`);
                });
                
                throw new Error(
                    `Contract NOT deployed on network ${networkId}.\n\n` +
                    `Available networks: ${Object.keys(LandContract.networks).join(', ')}\n\n` +
                    `This happens when:\n` +
                    `1. truffle-config.js has network_id: "*" (wildcard) - WRONG!\n` +
                    `2. Contract was deployed to different network\n` +
                    `3. Build artifacts don't match Ganache network\n\n` +
                    `FIX:\n` +
                    `1. Set network_id to ${networkId} in truffle-config.js\n` +
                    `2. Run: truffle migrate --reset --network development\n` +
                    `3. Verify: check build/contracts/Land.json has networks.${networkId}`
                );
            }
            
            // If we get here, deployedNetwork is defined and contract exists on this network
            console.log('✓ Contract found on network', networkId);
            console.log('✓ Contract address:', deployedNetwork.address);
            console.log('✓ Transaction hash:', deployedNetwork.transactionHash);

            // ==========================================
            // STEP 5: Create Web3 contract instance
            // ==========================================
            console.log('Step 5: Creating contract instance from ABI and address...');
            const instance = new web3.eth.Contract(
                LandContract.abi,
                deployedNetwork.address  // Safe to use here because deployedNetwork is defined
            );
            console.log('✓ Contract instance created');

            // ==========================================
            // STEP 6: Set component state
            // ==========================================
            console.log('Step 6: Setting component state...');
            this.setState({ 
                LandInstance: instance, 
                web3: web3, 
                account: userAccount 
            });
            console.log('✓ State updated successfully');
            console.log('🎉 READY TO USE!');
            console.log('=== RegisterSeller componentDidMount completed ===');

        } catch (error) {
            console.error('=== ERROR in RegisterSeller componentDidMount ===');
            console.error('Error message:', error.message);
            console.error('Full error:', error);
            console.error('Stack:', error.stack);
            console.error('=================================');
            
            // Show user-friendly error
            alert(
                `Failed to initialize DApp.\n\n` +
                `${error.message}\n\n` +
                `Check browser console (F12 → Console) for detailed error log.`
            );
        }
    };

    // OTHER METHODS REMAIN THE SAME
    captureDoc = (event) => {
        event.preventDefault();
        console.log('Capturing document...');
        const file = event.target.files[0];
        const reader = new window.FileReader();
        reader.readAsArrayBuffer(file);
        reader.onloadend = () => {
            this.setState({ buffer2: Buffer.from(reader.result) });
            console.log('Document ready for upload');
        };
    };

    addDoc = async () => {
        try {
            if (!this.state.buffer2) {
                console.warn('No file selected, skipping IPFS upload');
                return;
            }

            console.log('Step 1: Uploading to IPFS...');
            const result = await ipfs.files.add(this.state.buffer2);
            
            if (result && result[0] && result[0].hash) {
                const hash = result[0].hash;
                console.log('✓ IPFS upload successful');
                console.log('✓ IPFS Hash:', hash);
                this.setState({ document: hash });
                alert('Document uploaded successfully!\nHash: ' + hash);
            } else {
                throw new Error('Invalid response from IPFS - no hash returned');
            }
        } catch (error) {
            console.error('IPFS error:', error);
            alert('Error uploading document: ' + error.message);
        }
    }

    registerSeller = async () => {
        try {
            // Check if state is initialized
            if (!this.state.LandInstance) {
                alert('DApp not initialized. Please refresh and wait for web3 to connect.');
                return;
            }

            // Upload document if one was selected
            if (this.state.buffer2) {
                await this.addDoc();
                // Wait for state update
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Validate inputs
            if (this.state.name == '' || this.state.age == '' || this.state.aadharNumber == '' || 
                this.state.panNumber == '' || this.state.landsOwned == '') {
                alert("All the fields are compulsory!");
                return;
            } 
            
            if (!Number(this.state.aadharNumber) || this.state.aadharNumber.length != 12) {
                alert("Please enter valid aadhar number (12 digits)!");
                return;
            }

            console.log('Registering seller...');
            console.log('Account:', this.state.account);

            // Call contract method
            await this.state.LandInstance.methods.registerSeller(
                this.state.name,
                this.state.age,
                this.state.aadharNumber,
                this.state.panNumber,
                this.state.landsOwned,
                this.state.document // IPFS hash
            ).send({ from: this.state.account });

            alert('Seller registered successfully!');
            
        } catch (error) {
            console.error('Error registering seller:', error);
            if (error.message.includes('insufficient funds')) {
                alert('Error: Insufficient funds for transaction. Check account balance in Ganache.');
            } else if (error.message.includes('denied')) {
                alert('Transaction rejected by user.');
            } else {
                alert('Error registering seller: ' + error.message);
            }
        }
    };

    render() {
        // ... render JSX remains the same
        return (
            <div>
                {/* Your form JSX here */}
                {!this.state.LandInstance && (
                    <div style={{padding: '20px', color: 'orange'}}>
                        Connecting to DApp... Please wait.
                    </div>
                )}
                {this.state.LandInstance && (
                    <div>
                        {/* Your form content */}
                    </div>
                )}
            </div>
        );
    }
}

export default RegisterSeller;
