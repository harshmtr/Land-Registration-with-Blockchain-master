import React, { Component } from "react";
import './login.css';
import './index.css';
import history from './history';
import { Redirect } from 'react-router-dom';
import getWeb3 from "./getWeb3"
import LandContract from "./artifacts/Land.json"
import { Button } from "reactstrap";

export default class Login extends Component {
    constructor() {
        super();
        this.state = {
            role: null,
            redirect: null,
            landInspector: '',
            seller: '',
            buyer: '',
        }
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    componentDidMount = async () => {
        if (!window.location.hash) {
            window.location = window.location + '#loaded';
            window.location.reload();
        }

        try {
            console.log('=== Login componentDidMount ===');
            
            // Step 1: Get Web3 instance
            console.log('Step 1: Getting Web3 instance...');
            const web3 = await getWeb3();
            console.log('✓ Web3 obtained');

            // Step 2: Get accounts using the correct Web3 method
            console.log('Step 2: Getting accounts...');
            const accounts = await web3.eth.getAccounts();
            console.log('✓ Accounts:', accounts);
            
            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts found. Please ensure MetaMask is connected and account is imported.');
            }
            
            // Step 3: Use first account (CORRECT WAY - NOT web3.currentProvider.selectedAddress)
            const currentAddress = accounts[0];
            console.log('✓ Current address:', currentAddress);

            // Step 4: Get network ID and contract instance
            console.log('Step 3: Getting network and contract...');
            const networkId = await web3.eth.net.getId();
            console.log('✓ Network ID:', networkId);
            
            const deployedNetwork = LandContract.networks[networkId];
            if (!deployedNetwork) {
                throw new Error(`Contract not deployed on network ${networkId}`);
            }
            
            const instance = new web3.eth.Contract(
                LandContract.abi,
                deployedNetwork.address,
            );
            console.log('✓ Contract instance created');

            // Step 5: Set initial state with Web3 and account
            this.setState({ LandInstance: instance, web3: web3, account: currentAddress });
            console.log('✓ State updated with Web3 instance');

            // Step 6: Check user roles (isSeller, isBuyer, isLandInspector)
            console.log('Step 4: Checking user roles...');
            
            try {
                const seller = await instance.methods.isSeller(currentAddress).call();
                console.log('✓ Is Seller?', seller);
                this.setState({ seller: seller });
            } catch (err) {
                console.warn('Error checking seller status:', err.message);
                this.setState({ seller: false });
            }
            
            try {
                const buyer = await instance.methods.isBuyer(currentAddress).call();
                console.log('✓ Is Buyer?', buyer);
                this.setState({ buyer: buyer });
            } catch (err) {
                console.warn('Error checking buyer status:', err.message);
                this.setState({ buyer: false });
            }
            
            try {
                const landInspector = await instance.methods.isLandInspector(currentAddress).call();
                console.log('✓ Is Land Inspector?', landInspector);
                this.setState({ landInspector: landInspector });
            } catch (err) {
                console.warn('Error checking land inspector status:', err.message);
                this.setState({ landInspector: false });
            }
            
            console.log('=== Login componentDidMount completed ===');

        } catch (error) {
            console.error('=== ERROR in Login componentDidMount ===');
            console.error('Error message:', error.message);
            console.error('Full error:', error);
            
            alert(
                `Failed to load web3, accounts, or contract.\n\n` +
                `Error: ${error.message}\n\n` +
                `Please check:\n` +
                `1. Ganache is running on http://127.0.0.1:7545\n` +
                `2. MetaMask is connected to Ganache\n` +
                `3. Account is imported in MetaMask\n` +
                `4. Contracts are deployed\n\n` +
                `Check browser console (F12) for details.`
            );
        }
    };

    handleInputChange(event) {
        this.setState({
            role: event.target.value,
            redirect: "/Register" + event.target.value
        });
    }
    submit() {
        this.props.history.push(this.state.redirect);
        window.location.reload(false);

    }

    render() {
        if (this.state.seller || this.state.buyer || this.state.landInspector) {
            return (
                <div className="bodyC">
                    <div className="img-wrapper">
                        <img src="https://i.pinimg.com/originals/71/6e/00/716e00537e8526347390d64ec900107d.png" className="logo" alt="Logo" />
                        <div className="wine-text-container">
                            <div className="site-title">Land Registry</div>
                        </div>
                    </div>
                    <div className="auth-wrapper">
                        <div className="auth-inner">
                            <h1>Welcome Back!</h1>
                            <p style={{color: "var(--dark-gray)"}}>Select your dashboard below</p>
                            <Button href="/Seller/SellerDashboard" disabled={!this.state.seller} className="btn-block">Seller Dashboard</Button>
                            <Button href="/admin/dashboard" disabled={!this.state.buyer} className="btn-block">Buyer Dashboard</Button>
                            <Button href="/LI/LIdashboard" disabled={!this.state.landInspector} className="btn-block">Land Inspector Dashboard</Button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="bodyC">
                <a href="/Help" className="faq">
                    <h3>Help?</h3>
                </a>
                <div className="img-wrapper">
                    <img src="https://i.pinimg.com/originals/71/6e/00/716e00537e8526347390d64ec900107d.png" className="logo" alt="Logo" />
                    <div className="wine-text-container">
                        <div className="site-title">Land Registry</div>
                    </div>
                </div>
                <div className="auth-wrapper">
                    <div className="auth-inner">
                        <h1>Welcome!</h1>
                        <h4>Managing land registration with blockchain</h4>
                        <hr />

                        <div className="form-group">
                            <label className="control-label">Select Role</label>
                            <select className="form-control" onChange={this.handleInputChange}>
                                <option defaultChecked disabled>Select Role</option>
                                <option value="Buyer">Buyer</option>
                                <option value="Seller">Seller</option>
                            </select>
                        </div>

                        <button onClick={() => this.submit()} className="btn btn-primary">Register</button>
                    </div>
                </div>
            </div>
        );
    }
}