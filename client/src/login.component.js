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
            //Get network provider and web3 instance
            const web3 = await getWeb3();

            const accounts = await web3.eth.getAccounts();

            const networkId = await web3.eth.net.getId();
            const deployedNetwork = LandContract.networks[networkId];
            const instance = new web3.eth.Contract(
                LandContract.abi,
                deployedNetwork && deployedNetwork.address,
            );

            const currentAddress = await web3.currentProvider.selectedAddress;
            this.setState({ LandInstance: instance, web3: web3, account: accounts[0] });
            var seller = await this.state.LandInstance.methods.isSeller(currentAddress).call();
            console.log(seller);
            this.setState({ seller: seller });
            var buyer = await this.state.LandInstance.methods.isBuyer(currentAddress).call();
            console.log(buyer);
            this.setState({ buyer: buyer });
            var landInspector = await this.state.LandInstance.methods.isLandInspector(currentAddress).call();
            console.log(landInspector);
            this.setState({ landInspector: landInspector });

        } catch (error) {
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
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