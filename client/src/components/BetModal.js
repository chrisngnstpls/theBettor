
import React, {Component} from 'react'
import {Modal, Header, Button, Icon, Table, Form, Input, Label, Segment, TableBody, TableCell, TableRow, Menu, Dropdown} from 'semantic-ui-react'
import Bet from '../contracts/Bet.json'
import getWeb3 from '../ethereum/web3'
import Web3 from 'web3'
import './Modal.css'

// import PropTypes from 'prop-types'

class BetModal extends Component {
    
    constructor(props){
        super(props)
        // console.log('props inside bet modal', props)
        
        this.state = {
            keymasterAddress:'',
            initiator:'',
            acceptor:'',
            keyMasterFee:'',
            gas:props.gas,
            betWinner:'',
            betInstance:null,
            betStatus:null,
            syncedAddress:props.myAddress,
            web3:props.web3,
            contractLocation:props.contractLocation,
            contractBalance:0,
            betStatus:null,
            betReason:'',
            cancelInitiator:null,
            cancelAcceptor:null
            
        }
    }
    

    convertEth = async(_value) => {
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

    componentDidMount = async() => {
        const web3 = this.state.web3
        const _betInstance = await new this.state.web3.eth.Contract(
            Bet.abi, this.state.contractLocation
        )
        let _contractBalance = await _betInstance.methods.getBalance().call({gas:this.state.gas})
        let _betStatus = await _betInstance.methods.getBetStatus().call({gas:this.state.gas})
        let _betReason = await _betInstance.methods.reason().call({gas:this.state.gas})
        let finalValue = Web3.utils.fromWei(_contractBalance, 'ether')
        
        let _initiatorAddress = await web3.eth.getStorageAt(this.state.contractLocation, 1, (err,res) => {
            if(err) throw err;
            return res;
        });
        let _acceptorAddress = await web3.eth.getStorageAt(this.state.contractLocation, 2, (err,res) => {
            if(err) throw err;
            return res
        });
        let _keyMasterAddress = await web3.eth.getStorageAt(this.state.contractLocation, 6, (err,res) => {
            if(err) throw err;
            return res
        });

        let cancelStausInit = await web3.eth.getStorageAt(this.state.contractLocation, 7, (err,res) => {
            if(err) throw err;
            return res
        })
        let cancelStatusAccept = await web3.eth.getStorageAt(this.state.contractLocation, 8, (err,res) => {
            if(err) throw err;
            return res
        })

        let initClean = _initiatorAddress.length >= 40 ? _initiatorAddress.replace('000000000000000000000000', '') : _initiatorAddress
        let acceptorClean = _acceptorAddress.length >= 40 ? _acceptorAddress.replace('000000000000000000000000', '') : _acceptorAddress
        let keymasterClean = _keyMasterAddress.length >= 40 ? _keyMasterAddress.replace('000000000000000000000000', '') : _keyMasterAddress
        let initCancel = Web3.utils.hexToNumberString(cancelStausInit)
        let acceptCancel = Web3.utils.hexToNumberString(cancelStatusAccept)
        this.setState({ 
            betInstance:_betInstance, 
            contractBalance:finalValue, 
            betReason:_betReason, 
            initiator:initClean,
            acceptor:acceptorClean,
            keymasterAddress:keymasterClean,
            cancelInitiator:initCancel,
            cancelAcceptor:acceptCancel
        })
        this.getBetStatus()
    }



    confirmClick = (event, data) => {
        //console.log('state values : ' + this.state.betWinner)
        this.props.handleClose();
    }
    resolveBet = (event, data) => {
        console.log(this.state.cancelInitiator, this.state.cancelAcceptor)
        
    }

    acceptBet = async (event, data) => {
        try{
            //console.log(this.props)
            let stringValue = Web3.utils.toWei(this.state.contractBalance)
            await this.state.betInstance.methods.acceptBet().send({from:this.props.syncedAddress[0], gas:this.state.gas, value:stringValue})
            .on('transactionHash', (hash) => {
                console.log('transaction hash : ', hash)

            })
            .on('error', (err) => {
                console.log('error : ',err )
            })
        } catch(err){
            alert(await err.message)

        }

    }

    agreedCancel = async(event, data) => {
        try{
            //console.log(this.state.gas)
            await this.state.betInstance.methods.agreedCancel().send({from:this.props.syncedAddress[0]})
            .on('transactionHash', (hash) => {
                console.log('transaction hash : ', hash)

            })
            .on('error', (err) => {
                console.log('error : ',err )
            })
        } catch(err){
            alert(await err.message)
        }

    }

    revertBet = (event,data) => {
        try{
            this.state.betInstance.methods.revertBet().send({from:this.props.syncedAddress[0],gas:this.state.gas})
            .on('transactionHash', (hash) => {
                console.log('transaction hash : ', hash)

            })
            .on('error', (err) => {
                console.log('error : ',err )
            })
        } catch(err){
            alert( err.message)
        }

    }

    getContractBalance = async(event, data) => {
        try{
            const _contractBalance = await this.state.betInstance.methods.getBalance().call({gas:this.state.gas}) 
            const final = Web3.utils.fromWei(_contractBalance, 'ether')
            this.setState({contractBalance:final})
        } catch(err){
            alert(await err.message)
        }

        
    }
    
    getBetStatus = async(event, data) => {

        try{
            let status;
            const _betStatus = await this.state.betInstance.methods.getBetStatus().call({gas:this.state.gas})
            
            if (_betStatus == 0){
                status = 'Initiated'
            } else if (_betStatus == 1){
                status = 'Running'
            } else if (_betStatus == 2){
                status = 'Resolved'
            }
            this.setState({betStatus:status})
        } catch(err){
            console.log(err)
            alert(await err.message)
        }


    }

    keyMasterSign = async(event, data) =>{
        const _add = await this.state.storage
        console.log(_add)
    }

    render() {
        const {Cell, Row} = Table
        const acceptor = this.state.acceptor

        const dropDownOptions = [
            {
                key:'initiatorOption',
                text:'Initiator',
                value:this.state.initiator
            },
            {
                key:'acceptorOption',
                text:'Acceptor',
                value:this.state.acceptor
            }
        ]

        
        return (
            <Modal
                open={this.props.modalOpen}
                size='small'
                closeOnEscape={false}
                id='wholeModal'
            >
            <Segment>
                <Segment.Group style={{padding:'10px'}} raised>                
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
                                <img alt='logo' src="./logo192.png"/>
                            </Menu.Item>
                        </Menu>
                    </Segment.Group>
                    <Segment.Group style={{padding:'3px'}}>
                        <Header as={'h4'}>Initiator : {this.state.initiator}</Header>
                    </Segment.Group>
                    <Segment.Group style={{padding:'3px'}}>
                        <Header as={'h4'}>Acceptor : {this.state.acceptor == '0x0000000000000000000000000000000000000000' ? 'Not yet accepted' : this.state.acceptor.replace('000000000000000000000000', '')}</Header>
                    </Segment.Group>
                    <Segment.Group style={{padding:'3px'}}>
                        <Header as={'h4'}>KeyMaster : {this.state.keymasterAddress}</Header>
                </Segment.Group>
                </Segment>
                    <Segment raised>
                        <Segment.Group>
                            <Table celled columns={4}>
                                <Table.Body style={{overflow:'auto'}}>
                                    <Table.Row  mobile={16} tablet={8} computer={5} textAlign='center'>
                                        <Table.Cell>
                                            <Button color='green' onClick={this.acceptBet}>Accept Bet</Button>
                                        </Table.Cell>
                                        
                                        <Table.Cell>
                                            <Segment>
                                                <Segment.Group style={{padding:'10px'}}>
                                                    <Header as={'h4'}> Bet parties </Header>
                                                    <p>Initiator : {this.state.cancelInitiator == 0 ? <p style={{color:'green'}}>Not canceled</p> :  <p style={{color:'red'}}>Has canceled</p>}</p>
                                                    <p>Acceptor : {this.state.cancelInitiator == 0 ?  <p style={{color:'green'}}>Not canceled</p> :  <p style={{color:'red'}}>Has canceled</p>}</p>
                                                </Segment.Group>
                                                    <Button color = 'yellow' onClick={this.agreedCancel}>Aggreed Cancel</Button>
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
                                                    onChange={(event,{value}) => this.setState({betWinner:value})}
                                                    
                                                /> 
                                                </Form.Group>
                                                </Segment>
                                                <Segment><Button color='red'>Resolve Bet</Button></Segment>
                                            </Form>
                                        </Table.Cell>
                                    </Table.Row>
                                    <Table.Row textAlign='center'>
                                        <Table.Cell>
                                            <Button onClick={this.revertBet}>Revert Bet</Button>
                                        </Table.Cell>
                                        
                                        <Table.Cell>
                                            <Table.Row>
                                                <Table.Cell>
                                                    <h4>{this.state.contractBalance} ⟠ Eth </h4>
                                                </Table.Cell>
                                            </Table.Row>
                                            <Table.Row>
                                                <Table.Cell><Button onClick={this.getContractBalance}>Get Balance</Button></Table.Cell>
                                            </Table.Row>
                                        </Table.Cell>
                                        
                                        <Table.Cell>
                                            <Table.Row>
                                                <Table.Cell>
                                                    <h4>{this.state.betStatus}</h4>                                            
                                                </Table.Cell>
                                            </Table.Row>                                 
                                            <Table.Row>
                                                <Table.Cell><Button onClick={this.getBetStatus}>Get Status</Button></Table.Cell>
                                            </Table.Row> 
                                        </Table.Cell>
                                    </Table.Row>
                                    <Table.Row textAlign='center'>
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


export default BetModal