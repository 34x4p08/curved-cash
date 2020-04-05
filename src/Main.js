import React, { Component } from 'react';
import { Spinner } from 'reactstrap';

import BuySellCards from './buysell';

import Web3 from 'web3';
import abi from './contract/abi';

// connect to Infura node
const web3 = new Web3(
    new Web3.providers.HttpProvider(
        'https://mainnet.infura.io/v3/786ade30f36244469480aa5c2bf0743b'
    )
);

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const BN = n => web3.utils.toBN(n.toString());

class Main extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ccSupply: null,
            ethInContract: null,
            ccUserBalance: null,
            ethUserBalance: null,
            opacity: 0,
            initialized: false,
            contract: new web3.eth.Contract(
                abi,
                '0x1330aa53F28092Aa1026Bc2679bD63D26f84ced1'
            ),
        };
    }

    async componentDidMount() {
        await this.connecting();

        await this.statsLoop();
    }

    acc() {
        return window.ethereum && window.ethereum.selectedAddress;
    }

    async statsLoop() {
        const ccSupply = BN(
            await this.state.contract.methods.totalSupply().call()
        );
        const user = this.acc();
        const ethInContract = BN(
            await web3.eth.getBalance(this.state.contract._address)
        );
        const ethUserBalance = user
            ? BN(await web3.eth.getBalance(user))
            : BN(0);
        const ccUserBalance = user
            ? BN(await this.state.contract.methods.balanceOf(user).call())
            : BN(0);

        this.setState({
            ccSupply,
            ethInContract,
            ethUserBalance,
            ccUserBalance,
            initialized: true,
        });

        await new Promise(r => setTimeout(r, 3000));
        await this.statsLoop();
    }

    async connecting() {
        let up = true;
        const opacityIterator = setInterval(() => {
            if (this.state.initialized) {
                clearInterval(opacityIterator);
            }

            let opacity = this.state.opacity;

            if (up) {
                opacity += 0.01;
            } else {
                opacity -= 0.01;
            }

            if (opacity >= 1) {
                up = false;
            }

            if (opacity <= 0) {
                up = true;
            }

            this.setState({
                opacity,
            });
        }, 9);

        if (window.ethereum) {
            await window.ethereum.enable();
        }
    }

    showCC = val => {
        if (val === null) {
            return <Spinner color="primary" />;
        }
        return numberWithCommas(val.toNumber() / 10 ** 6);
    };

    showETH = val => {
        if (val === null) {
            return <Spinner color="primary" />;
        }
        return `${numberWithCommas(
            (val.div(BN(10).pow(BN(9))).toNumber() / 10 ** 9).toFixed(3)
        )}`;
    };

    render() {
        const title = (
            <div>
                <div className="stats-section borderred">
                    <h1>{this.showCC(this.state.ccSupply)}</h1>
                    <p>Total Tokens Purchased </p>
                </div>
                <div className="stats-section borderred">
                    <h1>{this.showETH(this.state.ethInContract)}</h1>
                    <p>Eth in contract</p>
                </div>
                <div className="stats-section">
                    <h1>{this.showCC(this.state.ccUserBalance)}</h1>
                    <p>Your share, CC</p>
                </div>
            </div>
        );
        if (!window.ethereum && !this.acc()) {
            return (
                <div>
                    {title}
                    <br />
                    <br />
                    <a
                        href="https://metamask.io/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        MetaMask needed
                    </a>
                </div>
            );
        }
        if (!this.acc())
            return (
                <div>
                    {title}
                    <br />
                    <br />
                    <p style={{ opacity: this.state.opacity }}>
                        Connecting to the wallet...
                    </p>
                </div>
            );
        return (
            <div>
                {title}
                <br />
                <br />

                <BuySellCards
                    contract={this.state.contract}
                    user={this.acc()}
                    ethUserBalance={this.state.ethUserBalance}
                    ethInContract={this.state.ethInContract}
                    ccUserBalance={this.state.ccUserBalance}
                    ccSupply={this.state.ccSupply}
                    BN={BN}
                    fromWei={web3.utils.fromWei}
                    toWei={web3.utils.toWei}
                />
            </div>
        );
    }
}

export default Main;
