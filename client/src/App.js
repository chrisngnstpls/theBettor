import React, { Component } from 'react'
import { Form, Input, Button,Table,Header, Card, Segment, Container, Image } from 'semantic-ui-react'
import './App.css';
import getWeb3 from './ethereum/web3';
import BetFactory from './contracts/BetFactory.json'
import Bet from './contracts/Bet.json'
import BetRow from './components/BetRow';
import Web3 from 'web3';
import Layout from './components/Layout';
import BetModel from './models/BetModel';



class App extends Component {
  state = {
    keyMaster:0x0000000000000000000000000000000000000000,
    syncedAddress : '',
    myVal : 0,
    web3:null,
    accounts:null,
    factoryInstance:null,
    betInstance:null,
    reason:'',
    fee:0,
    gas:2500000,
    betValue:0,
    allBets:[],
    showModal:false
  }
  componentDidMount = async() => {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = BetFactory.networks[networkId];
      const betDeployedNetwork = Bet.networks[networkId];
      
      /***
       * uncomment for local testnet
       * 
       */

      // const factoryInstance = await new web3.eth.Contract(
      //   BetFactory.abi, deployedNetwork && process.env.REACT_APP_FACTORY_CONTRACT_ADDRESS_GANACHE
      // );

      /***
       * Uncomment for goerli testnet
       * 
       */
      const factoryInstance = await new web3.eth.Contract(
        BetFactory.abi, process.env.REACT_APP_FACTORY_CONTRACT_ADDRESS_TESTNET
      );
      
      const syncedAddress = accounts[0]

      this.setState({web3, accounts, factoryInstance, syncedAddress});
      this.getAllBets()
      .then(console.log('Bets loaded'))

    }catch(err){
      throw(err);
    }
  };
  
  toggleModal = () => {
    this.setState({
      showModal: !this.state.showModal
    })
  
  }

  connectWallet = async(event) => {
    await window.ethereum.enable().then(()=>{window.location.reload()})

  }

  onSubmit = async (event) =>{

    event.preventDefault();
    // this does not work make sure to convert value to wei gwei or what have you *** error 32603
    const{accounts,gas, keyMaster, factoryInstance, fee, reason, betValue} = this.state

    let correctAddress = Web3.utils.isAddress(keyMaster)
    
    const checkLength = (_length) =>{
      if((_length.length > 1) && (_length.length < 127)){
        return true 
       } else {
        return false
       }
    }

    if((keyMaster !== 0x0000000000000000000000000000000000000000) && (checkLength(reason)) && (betValue > 0.00001) && correctAddress) {
      
      try {
        const cleanBet = Web3.utils.toWei(betValue, 'ether')
        await factoryInstance.methods.createBet(reason, keyMaster, fee).send({from:accounts[0], gas:3000000, value:cleanBet})
          .on('transactionHash', (hash) => {
            console.log('Transaction hash :' ,hash)
          })
          .on('confirmation', (conf) => {
            console.log('number of confirmations : ', conf)
          })
          .on('error', (err) => {
            console.log(err)
          })
      } catch(err){
        console.log(err)
      }

    } else {
      alert('Invalid values')
    }
    //let correctAddress =await Web3.utils.toChecksumAddress(keyMaster);


  }


  getAllBets = async () => {
    // function Bet(_id, _location, _initiator, _balance, _reason, _status){
    //   this.id = _id
    //   this.location = _location
    //   this.initiator = _initiator
    //   this.balance = _balance
    //   this.reason = _reason
    //   this.status = _status
    // }
    
    const{allBets,gas,factoryInstance,web3} = this.state;
    
    let _allBets = await factoryInstance.methods.allBets().call({gas:gas})
    let betListLength = _allBets.length
    let cleanStatus;
    
    
    for (let i = 0; i<betListLength; i++){
      let betDetails = new web3.eth.Contract(Bet.abi, _allBets[i].location)
      let _contractBalance = await betDetails.methods.getBalance().call({gas:this.state.gas})
      let _betStatus = await betDetails.methods.getBetStatus().call({gas:this.state.gas})
      let _betReason = await betDetails.methods.reason().call({gas:this.state.gas})
      let ethBalance = Web3.utils.fromWei(_contractBalance, 'ether')
      
      if (_betStatus === '0'){
          cleanStatus = 'Initiated'
          } else if (_betStatus === '1'){
              cleanStatus = 'Running'
          } else if (_betStatus === '2'){
              cleanStatus = 'Resolved'
      }
      
      let _bet = new BetModel(_allBets[i].betIndex, _allBets[i].location, _allBets[i].initiator,ethBalance,_betReason,cleanStatus)
      
      allBets.push(_bet)
    }
    this.setState({allBets})

  }
  
  handleFromParent = async (location) => {
    this.toggleModal()
    async function showIt(info){
      console.log(info)
      let details =  await info.methods.getBetStatus().call({gas:gas})
      console.log(details)
      
    }
    console.log('location :', location)
    const {gas, web3} = this.state
    const _betInstance = await new web3.eth.Contract(
      Bet.abi, location
    )
    this.setState({betInstance : _betInstance})
    showIt(this.state.betInstance)
    //console.log(await _betInstance)

    // let details =  await betInstance.methods.getBalance().call({gas:gas})
    // console.log(await details)
  }



  renderBets(){
    const {allBets} = this.state;
    // console.log(allBets)
    // console.log('inside render bets', this.state.accounts)
    return allBets.map((i, k) => {
      
      return(
        <BetRow
          positive
          key={k}
          id={i.id}
          location={i.location}
          initiator={i.initiator}
          balance={i.balance}
          reason={i.reason}
          status={i.status}
          accounts = {this.state.accounts}
          handleFromParent={this.handleFromParent}
          web3={this.state.web3}
          gas={this.state.gas}
        />
      )
    })
  }


  render() {
    const {allBets} = this.state;
    if(this.state.accounts == null){
      
      return (
            <Segment raised placeholder className='segment centered'>
              <Segment.Group style={{padding:'10px'}}>
              <Card centered>
              <Image alt='logo' src="./pepeLoad.png"/>
              <Card.Content>
                <Card.Header>theBettor</Card.Header>
                <Card.Meta>bet a fren</Card.Meta>

                <Card.Description>
                  The fastest way to lose your money on silly bets
                </Card.Description>
              </Card.Content>
              <Card.Content>
                <Button onClick={this.connectWallet}>Connect</Button>
              </Card.Content>
              </Card>
              </Segment.Group>
            </Segment>
        )
    
    } else if(this.state.web3) {
      return (
        <Layout address={this.state.syncedAddress} web3={this.state.web3}>
          <Form onSubmit={this.onSubmit}>
            <Segment  raised>
              <Segment.Group>
                <Header as ='h3' id='mainHeaders' block textAlign="center" >Create new Bet</Header>
              </Segment.Group>
              
            </Segment>
            
            <Form.Group widths="equal">
            <Form.Field
              key='keymaster'
              id="form-input-control-address"
              type='text'
              value={this.state.keyMaster}
              control={Input}
              maxLength='42'
              label='Keymaster address'
              placeholder = 'Address'
              onChange={event => this.setState({keyMaster : event.target.value})}
            />
            <Form.Field
              key='reason'
              label = 'Reason'
              type='text'
              id="form-input-control-name"
              value={this.state.reason}
              control = {Input}
              maxLength="32"
              placeholder = "reason"
              onChange={event => this.setState({reason:event.target.value})}
            />
            <Form.Field
              key='fee'
              id="form-input-control-fee"
              control = {Input}
              label = "Keymaster Fee"
              placeholder="fee"
              type='number'
              min='0'
              max='99'
              value={this.state.fee}
              onChange={event => this.setState({fee:event.target.value})}
            />
            <Form.Field 
              key='amount'
              id="form-input-control-bet-size"
              control={Input}
              placeholder=''
              min='.000001'
              step='0.000001'
              type='number'
              value={this.state.betValue}
              onChange={event => this.setState({betValue:event.target.value})}
              content="Bet size"
              label="Bet size"
            />
            <Button color='red'>Create</Button>
            </Form.Group>
          
          </Form>
          <Container>
          
            <Segment>
              <Segment.Group raised>
                <Header id='mainHeaders' as='h3' block textAlign='center'>
                  Current Bets
                </Header>
              </Segment.Group>
            
            </Segment>

              <Table structured compact='very' celled id='table' columns={4}>
                <Table.Header>
                  <Table.Row textAlign='center'>
                    <Table.HeaderCell colSpan='1' key='id' textAlign='center'>ID</Table.HeaderCell>
                    <Table.HeaderCell colSpan='1' key='initiator'textAlign='center'>Initiator</Table.HeaderCell>
                    <Table.HeaderCell colSpan='1' key='reason'textAlign='center'>Reason</Table.HeaderCell>
                    <Table.HeaderCell colSpan='1' key='balance'textAlign='center'>Balance</Table.HeaderCell>
                    <Table.HeaderCell colSpan='1' key='status'textAlign='center'>Status</Table.HeaderCell>
                    <Table.HeaderCell colSpan='1' key='nana'textAlign='center'> 🍌</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {this.renderBets()}
                </Table.Body>
              </Table>
            </Container>
        </Layout>
      );
    }

  }
}

export default App;
