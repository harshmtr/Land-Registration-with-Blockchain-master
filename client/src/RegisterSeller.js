import React, { Component } from 'react'
import LandContract from "./artifacts/Land.json"
import getWeb3 from "./getWeb3"
import ipfs from './ipfs';

import { FormGroup, FormControl, Button, Spinner, FormFile } from 'react-bootstrap'

//import Navigation from './Navigation'

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
        //For refreshing page only once
        if (!window.location.hash) {
            window.location = window.location + '#loaded';
            window.location.reload();
        }

        try {
            console.log('=== RegisterSeller componentDidMount ===');
            
            // Step 1: Get Web3 instance
            console.log('Step 1: Getting Web3 instance...');
            const web3 = await getWeb3();
            console.log('✓ Web3 instance obtained');

            // Step 2: Get accounts
            console.log('Step 2: Getting accounts...');
            const accounts = await web3.eth.getAccounts();
            console.log('✓ Accounts:', accounts);
            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts available. Please import account in MetaMask from Ganache.');
            }

            // Step 3: Get network ID
            console.log('Step 3: Getting network ID...');
            const networkId = await web3.eth.net.getId();
            console.log('✓ Network ID:', networkId);

            // Step 4: Check contract deployment
            console.log('Step 4: Checking contract deployment...');
            console.log('Available networks in Land.json:', Object.keys(LandContract.networks));
            
            const deployedNetwork = LandContract.networks[networkId];
            if (!deployedNetwork) {
                console.warn(`⚠ Contract NOT deployed on network ${networkId}`);
                console.warn('Available networks:', Object.keys(LandContract.networks).join(', '));
                throw new Error(
                    `Contract not deployed on network ${networkId}. ` +
                    `Available networks: ${Object.keys(LandContract.networks).join(', ')}. ` +
                    `Please deploy contracts: truffle migrate --reset --network development`
                );
            }

            console.log('✓ Contract deployed at:', deployedNetwork.address);

            // Step 5: Create contract instance
            console.log('Step 5: Creating contract instance...');
            const instance = new web3.eth.Contract(
                LandContract.abi,
                deployedNetwork.address
            );
            console.log('✓ Contract instance created');

            // Step 6: Set state
            console.log('Step 6: Setting component state...');
            this.setState({ 
                LandInstance: instance, 
                web3: web3, 
                account: accounts[0] 
            });
            console.log('✓ State updated successfully');
            console.log('=== RegisterSeller componentDidMount completed ===');

        } catch (error) {
            console.error('=== ERROR in RegisterSeller componentDidMount ===');
            console.error('Error message:', error.message);
            console.error('Full error:', error);
            console.error('=================================');
            
            alert(
                `Failed to load web3, accounts, or contract.\n\n` +
                `Error: ${error.message}\n\n` +
                `Please check:\n` +
                `1. Ganache is running on http://127.0.0.1:7545\n` +
                `2. MetaMask is connected to Ganache (Chain ID 1337)\n` +
                `3. Account is imported in MetaMask\n` +
                `4. Contracts are deployed: truffle migrate --reset\n\n` +
                `Check browser console (F12) for more details.`
            );
        }
    };

    addDoc = async () => {
        try {
          if (!this.state.buffer2) {
            console.warn('No file selected, skipping IPFS upload');
            return;
          }

          // Add file to IPFS
          const result = await ipfs.files.add(this.state.buffer2);
          
          if (result && result[0] && result[0].hash) {
            const hash = result[0].hash;
            console.log('IPFS Hash:', hash);
            this.setState({ document: hash });
            alert('Document uploaded successfully! Hash: ' + hash);
          } else {
            throw new Error('Invalid response from IPFS');
          }
        } catch (error) {
          console.error('IPFS error:', error);
          alert('Error uploading document: ' + error.message);
        }
      }

    registerSeller = async () => {
        try {
          // Upload document if one was selected
          if (this.state.buffer2) {
            await this.addDoc();
            // Wait briefly for state update
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

          // Validate inputs
          if (this.state.name == '' || this.state.age == '' || this.state.aadharNumber == '' || this.state.panNumber == '' || this.state.landsOwned == '') {
              alert("All the fields are compulsory!");
              return;
          } else if (!Number(this.state.aadharNumber) || this.state.aadharNumber.length != 12) {
              alert("Aadhar Number should be 12 digits long!");
              return;
          } else if (this.state.panNumber.length != 10) {
              alert("Pan Number should be a 10 digit unique number!");
              return;
          } else if (!Number(this.state.age) || this.state.age < 21) {
              alert("Your age must be a number");
              return;
          }

          // Register on blockchain
          const result = await this.state.LandInstance.methods.registerSeller(
              this.state.name,
              this.state.age,
              this.state.aadharNumber,
              this.state.panNumber,
              this.state.landsOwned, 
              this.state.document)
              .send({
                  from: this.state.account,
                  gas: 2100000
              });

          console.log('Seller registered successfully:', result);
          alert('Registration successful!');
          this.props.history.push("/Seller/SellerDashboard");
          window.location.reload(false);
        } catch (error) {
          console.error('Registration error:', error);
          alert('Registration failed: ' + error.message);
        }
    }

    updateName = event => (
        this.setState({ name: event.target.value })
    )
    updateAge = event => (
        this.setState({ age: event.target.value })
    )
    updateAadhar = event => (
        this.setState({ aadharNumber: event.target.value })
    )
    updatePan = event => (
        this.setState({ panNumber: event.target.value })
    )
    updateOwnedLands = event => (
        this.setState({ landsOwned: event.target.value })
    )
    captureDoc(event) {
        event.preventDefault()
        const file2 = event.target.files[0]
        const reader2 = new window.FileReader()
        reader2.readAsArrayBuffer(file2)
        reader2.onloadend = () => {
          this.setState({ buffer2: Buffer(reader2.result) })
          console.log('buffer2', this.state.buffer2)
        }
        console.log('caoture doc...')
      }

    render() {
        if (!this.state.web3) {
            return (
                <div>
                    <div className="img-wrapper">
                        <img src="https://i.pinimg.com/originals/71/6e/00/716e00537e8526347390d64ec900107d.png" className="logo" />
                        <div className="wine-text-container">
                            <div className="site-title wood-text">Land Registry</div>
                        </div>
                    </div>
                    <div className="auth-wrapper">
                        <div className="auth-inner">
                            <div>
                                <div>
                                    <h1>
                                        <Spinner animation="border" variant="warning" />
                                    </h1>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="bodyC">

                <div className="img-wrapper">
                    <img src="https://i.pinimg.com/originals/71/6e/00/716e00537e8526347390d64ec900107d.png" className="logo" />
                    <div className="wine-text-container">
                        <div className="site-title wood-text">Land Registry</div>
                    </div>
                </div>
                <div className="auth-wrapper">
                    <div className="auth-inner">
                        <div className="App">

                            <div>
                                <div>
                                    <h1 style={{ color: "black" }}>
                                        Seller Registration
                  </h1>
                                </div>
                            </div>



                            <div className="form">
                                <FormGroup>
                                    <div className="form-label">
                                        Enter Name --
                      </div>
                                    <div className="form-input">
                                        <FormControl
                                            input='text'
                                            value={this.state.name}
                                            onChange={this.updateName}
                                        />
                                    </div>
                                </FormGroup>

                                <FormGroup>
                                    <div className="form-label">
                                        Enter Age --
                      </div>
                                    <div className="form-input">
                                        <FormControl
                                            input='text'
                                            value={this.state.age}
                                            onChange={this.updateAge}
                                        />
                                    </div>
                                </FormGroup>

                                <FormGroup>
                                    <div className="form-label">
                                        Enter Aadhar No --
                      </div>
                                    <div className="form-input">
                                        <FormControl
                                            input='text'
                                            value={this.state.aadharNumber}
                                            onChange={this.updateAadhar}
                                        />
                                    </div>
                                </FormGroup>

                                <FormGroup>
                                    <div className="form-label">
                                        Enter Pan no --
                      </div>
                                    <div className="form-input">
                                        <FormControl
                                            input='text'
                                            value={this.state.panNumber}
                                            onChange={this.updatePan}
                                        />
                                    </div>
                                </FormGroup>

                                <FormGroup>
                                    <div className="form-label">
                                        Enter Owned Lands --
                      </div>
                                    <div className="form-input">
                                        <FormControl
                                            input='text'
                                            value={this.state.landsOwned}
                                            onChange={this.updateOwnedLands}
                                        />
                                    </div>
                                </FormGroup>

                                <FormGroup>
                                    <label>Add your Aadhar Card (PDF Format)</label>
                                    <FormFile
                                        id="File2"
                                        onChange={this.captureDoc}
                                    />
                                </FormGroup>


                                <Button onClick={this.registerSeller} className="button-vote">
                                    Register as Seller
                  </Button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        );

    }
}

export default RegisterSeller;
