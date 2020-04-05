import React, { Component } from 'react';
import {
    Card,
    Button,
    CardHeader,
    CardDeck,
    CardBody,
    CardText,
    InputGroup,
    Input,
    InputGroupAddon,
} from 'reactstrap';
import PropTypes from 'prop-types';
import BN from 'bignumber.js';

class BuySellCards extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ccBuy: '',
            ccSell: '',
            ethBuy: '',
            ethSell: '',
        };
    }

    resetSell() {
        this.setSell({
            ccSell: '',
            ethSell: '',
        });
    }

    resetBuy() {
        this.setSell({
            ccBuy: '',
            ethBuy: '',
        });
    }

    async buy() {
        const data = this.props.contract.methods
            .buy(this.state.ccBuy)
            .encodeABI();
        window.web3.eth.sendTransaction(
            {
                data,
                to: this.props.contract._address,
                value: this.state.ethBuy,
            },
            console.log
        );
    }

    async sell() {
        const data = this.props.contract.methods
            .sell(this.state.ccSell)
            .encodeABI();
        window.web3.eth.sendTransaction(
            {
                data,
                to: this.props.contract._address,
            },
            console.log
        );
    }

    toCCNative(s) {
        s = (s * 10 ** 6).toFixed(0);
        return this.props.BN(s);
    }

    fromCCNative(s) {
        return s.toNumber() / 10 ** 6;
    }

    handleBuyInputChange(e) {
        if (+e.target.value && !Number.isNaN(e.target.value)) {
            const ccBuy = this.toCCNative(e.target.value);
            this.recalcBuySection(ccBuy);
        }
    }

    handleMaxBuyClick() {
        let eth = this.props.ethUserBalance;
        if (eth.cmp(this.props.BN(10).pow(this.props.BN(16))) === 1) {
            eth = eth.sub(this.props.BN(10).pow(this.props.BN(16)));
            const supply = this.props.ccSupply;
            let cc = supply.mul(supply).add(eth);
            cc = new BN(cc.toString());
            cc = cc.squareRoot();
            cc = cc.toString();
            cc = cc.substr(0, cc.indexOf('.'));
            cc = this.props.BN(cc.toString());
            cc = cc.sub(supply);
            setTimeout(() => this.recalcBuySection(cc), 0);
        }
    }

    handleMaxSellClick() {
        const cc = this.props.ccUserBalance;
        setTimeout(() => this.recalcSellSection(cc), 0);
    }

    handleSellInputChange(e) {
        if (+e.target.value && !Number.isNaN(e.target.value)) {
            const ccBuy = this.toCCNative(e.target.value);
            this.recalcSellSection(ccBuy);
        }
    }

    recalcBuySection(ccBuy) {
        const ethBuy = this.props.ccSupply
            .mul(ccBuy)
            .mul(this.props.BN(2))
            .add(ccBuy.pow(this.props.BN(2)));
        console.log('ccBuy', ccBuy.toString(10));
        console.log('ethBuy', ethBuy.toString(10));
        this.setState({
            ccBuy,
            ethBuy,
        });
    }

    recalcSellSection(ccSell) {
        if (ccSell && ccSell.cmp(this.props.BN(0)) === 1) {
            const ethSell = ccSell
                .mul(this.props.ethInContract)
                .div(this.props.ccSupply);
            console.log('ccSell', ccSell.toString(10));
            console.log('ethSell', ethSell.toString(10));
            this.setState({
                ccSell,
                ethSell,
            });
        }
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.ethInContract &&
            this.props.ethInContract &&
            prevProps.ethInContract.toString() !==
                this.props.ethInContract.toString()
        ) {
            if (this.state.ccBuy) {
                this.recalcBuySection(this.state.ccBuy);
            }
        }
    }

    render() {
        return (
            <CardDeck className="buysell-section">
                <Card>
                    <CardHeader>Buy</CardHeader>
                    <CardBody>
                        <div>
                            <InputGroup size="normal">
                                <InputGroupAddon addonType="prepend">
                                    CC amount
                                </InputGroupAddon>
                                <Input
                                    min={0}
                                    max={10000000000000}
                                    type="number"
                                    step="0.01"
                                    value={
                                        this.state.ccBuy
                                            ? this.fromCCNative(
                                                  this.state.ccBuy
                                              )
                                            : ''
                                    }
                                    onChange={e => this.handleBuyInputChange(e)}
                                />
                                <InputGroupAddon addonType="append">
                                    <Button
                                        onClick={() => this.handleMaxBuyClick()}
                                    >
                                        max
                                    </Button>
                                </InputGroupAddon>
                            </InputGroup>
                        </div>
                        <CardText />
                        <p>
                            Sum{' '}
                            {Number(
                                this.props.fromWei(this.state.ethBuy, 'ether')
                            ).toFixed(3)}{' '}
                            ETH
                        </p>
                        <p>
                            1 CC ={' '}
                            {this.state.ethBuy
                                ? this.state.ethBuy
                                      .div(this.state.ccBuy)
                                      .toNumber() /
                                  10 ** 12
                                : '???'}{' '}
                            ETH
                        </p>
                        <Button
                            style={{
                                backgroundColor: '#007FFF',
                                border: 'none',
                            }}
                            onClick={async () => await this.buy()}
                        >
                            Buy
                        </Button>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>Sell</CardHeader>
                    <CardBody>
                        <div>
                            <InputGroup size="normal">
                                <InputGroupAddon addonType="prepend">
                                    CC amount
                                </InputGroupAddon>
                                <Input
                                    min={0}
                                    max={10000000000000}
                                    type="number"
                                    step="0.01"
                                    value={
                                        this.state.ccSell
                                            ? this.fromCCNative(
                                                  this.state.ccSell
                                              )
                                            : ''
                                    }
                                    onChange={e =>
                                        this.handleSellInputChange(e)
                                    }
                                />
                                <InputGroupAddon addonType="append">
                                    <Button
                                        onClick={() =>
                                            this.handleMaxSellClick()
                                        }
                                    >
                                        max
                                    </Button>
                                </InputGroupAddon>
                            </InputGroup>
                        </div>
                        <CardText />
                        <p>
                            Sum{' '}
                            {Number(
                                this.props.fromWei(this.state.ethSell, 'ether')
                            ).toFixed(3)}{' '}
                            ETH
                        </p>

                        <p>
                            1 CC ={' '}
                            {this.props.ethInContract &&
                            this.props.ethInContract.cmp(this.props.BN(0)) === 1
                                ? this.props.ethInContract
                                      .div(this.props.ccSupply)
                                      .toNumber() /
                                  10 ** 12
                                : '???'}{' '}
                            ETH
                        </p>
                        <Button
                            style={{
                                backgroundColor: '#007FFF',
                                border: 'none',
                            }}
                            onClick={async () => await this.sell()}
                        >
                            Sell
                        </Button>
                    </CardBody>
                </Card>
            </CardDeck>
        );
    }
}

BuySellCards.propTypes = {
    contract: PropTypes.object,
    user: PropTypes.string,
    ethInContract: PropTypes.object,
    ccUserBalance: PropTypes.object,
    ethUserBalance: PropTypes.object,
    ccSupply: PropTypes.object,
    BN: PropTypes.func,
    fromWei: PropTypes.func,
    toWei: PropTypes.func,
};

export default BuySellCards;
