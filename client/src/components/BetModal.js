
import React, { Component } from 'react'
import { Modal, Header, Button, Table, Form, Segment, Message, Dropdown, Menu } from 'semantic-ui-react'
import Bet from '../contracts/Bet.json'
import Web3 from 'web3'
import './Modal.css'

// import PropTypes from 'prop-types'

class BetModal extends Component {

    constructor(props) {
        super(props)
        // console.log('props inside bet modal', props)

        this.state = {
            keymasterAddress: '',   //address of keymaster
            initiator: '',      //addres of initiator
            acceptor: '',       //address of acceptor
            keyMasterFee: '',   //keymaser fee as set on creation
            gas: props.gas,     //aproximate gas estimate
            betWinner: '',      //value to hold before calling resolve
            betInstance: null, //bet contract instance
            syncedAddress: props.myAddress, //address synced
            web3: props.web3,
            contractLocation: props.contractLocation,
            contractBalance: props.balance,     //balance of the bet contract
            betStatus: props.status,        //Initiated, running , resolved
            betReason: props.reason,        //Reason as set on creation
            cancelInitiator: null,      //has initiator canceled the bet? 0-1
            cancelAcceptor: null,       //has acceptor canceled the bet? 0-1
            disableAcceptButton: false,
            disableRevertButton:false,
            disableResolveButton:false,
            disableCancelButton:false

        }
    }


    convertEth = async (_value) => {
        let finalValue = Web3.utils.fromWei(_value, 'ether');
        return await finalValue;
    }

    /**
     * Storage reading : 
     * [0] blockunbmer
     * [1] initiator address
     * [2] acceptor address
     * [3] factory contract address
     * [4] bet amount
     * [5] bet reason (hexToAscii)
     * [6] keymaster address (private)
     * [7] initiator canceled (bool)
     * [8] acceptor canceled (bool)
     * [9] keymaster Fee
     * 
     */

    componentDidMount = async () => {
        const web3 = this.state.web3;
        const _betInstance = await new this.state.web3.eth.Contract(
            Bet.abi, this.state.contractLocation
        )
        /***
         * Read bet contract storage & convert
         * 
         * 
         */
        let _initiatorAddress = await web3.eth.getStorageAt(this.state.contractLocation, 1, (err, res) => {
            if (err) throw err;
            return res;
        });
        let _acceptorAddress = await web3.eth.getStorageAt(this.state.contractLocation, 2, (err, res) => {
            if (err) throw err;
            return res;
        });
        let _keyMasterAddress = await web3.eth.getStorageAt(this.state.contractLocation, 6, (err, res) => {
            if (err) throw err;
            return res;
        });

        let cancelStausInit = await web3.eth.getStorageAt(this.state.contractLocation, 7, (err, res) => {
            if (err) throw err;
            return res;
        })
        let cancelStatusAccept = await web3.eth.getStorageAt(this.state.contractLocation, 8, (err, res) => {
            if (err) throw err;
            return res;
        })

        let initClean = _initiatorAddress.length >= 40 ? _initiatorAddress.replace('000000000000000000000000', '') : _initiatorAddress;
        let acceptorClean = _acceptorAddress.length >= 40 ? _acceptorAddress.replace('000000000000000000000000', '') : _acceptorAddress;
        let keymasterClean = _keyMasterAddress.length >= 40 ? _keyMasterAddress.replace('000000000000000000000000', '') : _keyMasterAddress;
        let initCancel = Web3.utils.hexToNumberString(cancelStausInit);
        let acceptCancel = Web3.utils.hexToNumberString(cancelStatusAccept);
        this.setState({
            betInstance: _betInstance,
            initiator: initClean,
            acceptor: acceptorClean,
            keymasterAddress: keymasterClean,
            cancelInitiator: initCancel,
            cancelAcceptor: acceptCancel
        });


        /**
         * Run buttons actions
         * 
         */
        this.disableAccept();
        this.disableRevert();
        this.disableResolve();
        this.disableCancel();
    }



    confirmClick = (event, data) => {
        //console.log('state values : ' + this.state.betWinner)
        this.props.handleClose();
    }

    /**
     * Bet contract interactions :
     *  >Resolve Bet (only keymaster)
     *  >Accept Bet (anyone but initiator and keymaster)
     *  >Agreed Cancel (only initiator or acceptor)
     *  >Revert Bet (only initiator and before anyone accepting)
     *  >Get balance (obsolete, will remove)
     *  >Get status (obsolete will remove)
     * 
     */
    resolveBet = async (event, data) => {
        const _winner = this.state.betWinner;
        try {
            if (Web3.utils.isAddress(_winner)) {

                await this.state.betInstance.methods.resolveBet(_winner).send({ from: this.props.syncedAddress[0], gas: this.state.gas })
                    .on('transactionHash', (hash) => {
                        console.log('transaction hash : ', hash);

                    })
                    .on('error', (err) => {
                        console.log('error : ', err);
                    })
            } else {
                alert('Invalid choice');
            }
        } catch (err) {
            console.log(err);
        }
    }

    acceptBet = async (event, data) => {
        try {
            //console.log(this.props)
            let stringValue = Web3.utils.toWei(this.state.contractBalance)
            await this.state.betInstance.methods.acceptBet().send({ from: this.props.syncedAddress[0], gas: this.state.gas, value: stringValue })
                .on('transactionHash', (hash) => {
                    console.log('transaction hash : ', hash);

                })
                .on('error', (err) => {
                    console.log('error : ', err);
                })
        } catch (err) {
            alert(await err.message);
        }
    }

    agreedCancel = async (event, data) => {
        try {
            //console.log(this.state.gas)
            await this.state.betInstance.methods.agreedCancel().send({ from: this.props.syncedAddress[0] })
                .on('transactionHash', (hash) => {
                    console.log('transaction hash : ', hash);

                })
                .on('error', (err) => {
                    console.log('error : ', err);
                })
        } catch (err) {
            alert(await err.message);
        }

    }

    revertBet = (event, data) => {
        try {
            this.state.betInstance.methods.revertBet().send({ from: this.props.syncedAddress[0], gas: this.state.gas })
                .on('transactionHash', (hash) => {
                    console.log('transaction hash : ', hash);

                })
                .on('error', (err) => {
                    console.log('error : ', err);
                })
        } catch (err) {
            alert(err.message);
        }
    }

    getContractBalance = async (event, data) => {
        try {
            const _contractBalance = await this.state.betInstance.methods.getBalance().call({ gas: this.state.gas });
            const final = Web3.utils.fromWei(_contractBalance, 'ether');
            this.setState({ contractBalance: final });
        } catch (err) {
            alert(await err.message);
        }
    }

    getBetStatus = async (event, data) => {

        try {
            let status;
            const _betStatus = await this.state.betInstance.methods.getBetStatus().call({ gas: this.state.gas });

            if (_betStatus === 0) {
                status = 'Initiated';
            } else if (_betStatus === 1) {
                status = 'Running';
            } else if (_betStatus === 2) {
                status = 'Resolved';
            }
            this.setState({ betStatus: status });
        } catch (err) {
            console.log(err);
            alert(await err.message);
        }
    }

    keyMasterSign = async (event, data) => {
        const _add = await this.state.storage;
        console.log(_add);
    }

    /***
     * Button disabling handling
     * 
     * 
     */

    disableAccept = async () => {
        //console.log('\ninitiator : ', this.state.initiator,"\ncurrent address : ", this.props.syncedAddress[0],"\nkeymaster : ",  this.state.keymasterAddress)
        let initiator = this.state.initiator.toLowerCase().toString();
        let currentAdd = this.props.syncedAddress[0].toLowerCase().toString();
        let keymaster = this.state.keymasterAddress.toLowerCase().toString();

        try {
            if ((initiator === currentAdd) || (keymaster === currentAdd)) {
                this.setState({ disableAcceptButton: true });
            } else if (this.state.betStatus != 'Initiated') {
                this.setState({ disableAcceptButton: true });
            } else {
                this.setState({ disableAcceptButton: false });

            }
        } catch (err) {
            console.log(err);
        }
    }

    disableRevert = async() => {
        let initiator = this.state.initiator.toLowerCase().toString();
        let currentAdd = this.props.syncedAddress[0].toLowerCase().toString();
        try{
            if((initiator === currentAdd) && (this.state.betStatus === 'Initiated')){
                this.setState({disableRevertButton : false});
            } else {
                this.setState({disableRevertButton:true});
            }
        }catch(err){
            console.log(err)
        }
    }

    disableResolve = async() => {
        let currentAdd = this.props.syncedAddress[0].toLowerCase().toString();
        let keymaster = this.state.keymasterAddress.toLowerCase().toString();
        try{
            if((currentAdd === keymaster) && (this.state.betStatus === 'Running')){
                this.setState({disableResolveButton:false});
            } else {
                this.setState({disableResolveButton:true});
            }
        } catch(err){
            console.log(err);
        }

    }

    disableCancel = async() => {
        let initiator = this.state.initiator.toLowerCase().toString();
        let currentAdd = this.props.syncedAddress[0].toLowerCase().toString();
        let acceptor = this.state.acceptor.toLowerCase().toString();
        let acceptorCanceled = this.state.cancelAcceptor
        let initiatorCanceled = this.state.cancelInitiator


        if(this.state.betStatus === 'Running'){
            //console.log( `Bet with reason ${this.state.betReason} is running`)
            if((initiator === currentAdd) || (acceptor === currentAdd)){
                //console.log('Address match found')
                if((initiator === currentAdd) && (initiatorCanceled==='1')){
                    //console.log('user is initiator and he has canceled')
                    this.setState({disableCancelButton:true})
                
                } else if((acceptor === currentAdd) &&(acceptorCanceled === '1')){
                    //console.log('user is the acceptor and has canceled')
                    this.setState({disableCancelButton:true})
                
                } else {
                    
                    this.setState({disableCancelButton:false})
                }
            } else {
                this.setState({disableCancelButton:false})
            }


        } else {
            //console.log(`Bet with reason ${this.state.betReason} is not running`)
            this.setState({disableCancelButton:true})
        }
    }


    render() {
        const dropDownOptions = [
            {
                key: 'initiatorOption',
                text: 'Initiator',
                value: this.state.initiator
            },
            {
                key: 'acceptorOption',
                text: 'Acceptor',
                value: this.state.acceptor
            }
        ]

        if (this.state.betStatus === 'Resolved') {

            return (
                <Modal
                    open={this.props.modalOpen}
                    size='small'
                    closeOnEscape={false}
                    id='wholeModal'
                >
                    <Modal.Content>


                        <Segment raised>
                            <Segment.Group style={{ padding: '10px' }}>
                                <Header id='modalHeader' as={'h3'} conent={'confirm?'}>This Bet has been resolved</Header>
                            </Segment.Group>
                            <Segment.Group>
                                <Menu secondary>
                                    <Menu.Item position='left'>
                                        <Modal.Header as={'h3'} id='modalReason'> Bet Reason: {this.state.betReason}</Modal.Header>
                                    </Menu.Item>
                                    <Menu.Item position='right' as={'h4'}>
                                        <img alt='logo' src="./logo192.png" />
                                    </Menu.Item>
                                </Menu>
                            </Segment.Group>

                        </Segment>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button
                            positive
                            type='button'
                            icon='checkmark'
                            onClick={this.confirmClick}
                            conent='EISAI PETSA'
                        />
                    </Modal.Actions>

                </Modal>
            )

        } else {

            return (
                <Modal
                    open={this.props.modalOpen}
                    size='small'
                    closeOnEscape={false}
                    id='wholeModal'
                >
                    <Segment>
                        <Segment.Group style={{ padding: '10px' }} raised>
                            <Header id='modalHeader' as={'h3'} conent={'confirm?'}>Bet : {this.state.contractLocation}</Header>
                        </Segment.Group>
                    </Segment>

                    <Modal.Content>
                        <Segment raised>
                            <Segment.Group>
                                <Menu secondary>
                                    <Menu.Item position='left'>
                                        <Modal.Header as={'h3'} id='modalReason'> Reason: {this.state.betReason}</Modal.Header>
                                    </Menu.Item>
                                    <Menu.Item position='right' as={'h4'}>
                                        <img alt='logo' src="./logo192.png" />
                                    </Menu.Item>
                                </Menu>
                            </Segment.Group>
                            <Segment.Group style={{ padding: '3px' }}>
                                <Header as={'h4'}>Initiator : {this.state.initiator}</Header>
                            </Segment.Group>
                            <Segment.Group style={{ padding: '3px' }}>
                                <Header as={'h4'}>Acceptor : {this.state.acceptor === '0x0000000000000000000000000000000000000000' ? 'Not yet accepted' : this.state.acceptor.replace('000000000000000000000000', '')}</Header>
                            </Segment.Group>
                            <Segment.Group style={{ padding: '3px' }}>
                                <Header as={'h4'}>KeyMaster : {this.state.keymasterAddress}</Header>
                            </Segment.Group>
                        </Segment>
                        <Segment raised>
                            <Segment.Group>
                                <Table celled columns={4}>
                                    <Table.Body style={{ overflow: 'auto' }}>
                                        <Table.Row mobile={16} tablet={8} computer={5} textAlign='center'>
                                            <Table.Cell>
                                                <Button color='green' disabled={this.state.disableAcceptButton} onClick={this.acceptBet}>Accept Bet</Button>
                                            </Table.Cell>

                                            <Table.Cell>
                                                <Segment>
                                                    <Segment.Group style={{ padding: '10px' }}>
                                                        <Header as={'h4'}> Bet parties </Header>
                                                        <Message>Initiator : {this.state.cancelInitiator === '0' ? <Header as={'h4'} style={{ color: 'green' }}>Not canceled</Header> : <Header as={'h4'} style={{ color: 'red' }}>Has canceled</Header>}</Message>
                                                        <Message>Acceptor : {this.state.cancelAcceptor === '0' ? <Header as={'h4'} style={{ color: 'green' }}>Not canceled</Header> : <Header as={'h4'} style={{ color: 'red' }}>Has canceled</Header>}</Message>
                                                    </Segment.Group>
                                                    <Button color='yellow' disabled={this.state.disableCancelButton} onClick={this.agreedCancel}>Aggreed Cancel</Button>
                                                </Segment>

                                            </Table.Cell>
                                            <Table.Cell>
                                                <Form onSubmit={this.resolveBet}>
                                                    <Segment >
                                                        <Header id='winnerHeader' as={'h4'}>Bet Winner</Header>
                                                        <Form.Group widths="equal">
                                                            {/*<Form.Field
                                                                    id="form-input-control-betWinner"
                                                                    value={this.state.betWinner}
                                                                    type='text'
                                                                    control={Input}
                                                                    maxLength='42'
                                                                    placeholder='0x00...00'
                                                                    onChange={event => this.setState({betWinner:event.target.value})}
                                                                />*/}
                                                            <Dropdown
                                                                placeholder='Select Winner'
                                                                fluid
                                                                selection
                                                                options={dropDownOptions}
                                                                value={this.state.betWinner}
                                                                onChange={(event, { value }) => this.setState({ betWinner: value })}

                                                            />
                                                        </Form.Group>
                                                    </Segment>
                                                    <Segment><Button disabled={this.state.disableResolveButton} color='red'>Resolve Bet</Button></Segment>
                                                </Form>
                                            </Table.Cell>
                                        </Table.Row>
                                        <Table.Row textAlign='center'>
                                            <Table.Cell>
                                                <Button primary disabled={this.state.disableRevertButton} onClick={this.revertBet}>Revert Bet</Button>
                                            </Table.Cell>

                                            <Table.Cell>
                                                <Table.Row>
                                                    <Table.Cell>
                                                        <Header as={'h4'}>{this.state.contractBalance} ⟠ Eth </Header>
                                                    </Table.Cell>
                                                </Table.Row>
                                                <Table.Row>
                                                    <Table.Cell><Button onClick={this.getContractBalance}>Get Balance</Button></Table.Cell>
                                                </Table.Row>
                                            </Table.Cell>

                                            <Table.Cell>
                                                <Table.Row>
                                                    <Table.Cell>
                                                        <Header as={'h4'}>{this.state.betStatus}</Header>
                                                    </Table.Cell>
                                                </Table.Row>
                                                <Table.Row>
                                                    <Table.Cell><Button onClick={this.getBetStatus}>Get Status</Button></Table.Cell>
                                                </Table.Row>
                                            </Table.Cell>
                                        </Table.Row>
                                    </Table.Body>
                                </Table>
                            </Segment.Group>
                        </Segment>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button
                            positive
                            type='button'
                            icon='remove'
                            onClick={this.props.handleClose}
                            content='Cancel'
                        />
                        <Button
                            positive
                            type='button'
                            icon='checkmark'
                            onClick={this.confirmClick}
                            conent='EISAI PETSA'
                        />

                    </Modal.Actions>

                </Modal>
            )
        }

    }
}


export default BetModal