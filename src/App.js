import React, {Component} from 'react'
import { Form, Input, TextArea, Button, Select } from 'semantic-ui-react'
import logo from './logo.svg';
import './App.css';
import getWeb3 from './ethereum/web3';
import BetFactory from './build/BetFactory.json'
import Bet from './build/Bet.json'

import Web3 from 'web3';
import Layout from './Components/Layout';




class App extends Component {
  state = {
    keyMaster:0x0000000000000000000000000000000000000000,
    myVal : 0,
    web3:null,
    accounts:null,
    factoryInstance:null,
    reason:'',
    fee:0,
    gas:2500000,
    betValue:0
  }
  componentDidMount = async() => {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = BetFactory.networks[networkId];
      const factoryInstance = await new web3.eth.Contract(
        BetFactory.abi, deployedNetwork && "0x7db27AC73810ad204F6c0bF133576Ab327B2B122"
      );
      this.setState({web3, accounts, factoryInstance});


    }catch(err){
      throw(err);
    }
  };
  onSubmit = async (event) =>{

    event.preventDefault();
    // this does not work make sure to convert value to wei gwei or what have you *** error 32603
    const{accounts,gas, keyMaster, factoryInstance, fee, reason, betValue} = this.state
    //let correctAddress =await Web3.utils.toChecksumAddress(keyMaster);
    await factoryInstance.methods.createBet(reason, keyMaster, fee).send({from:accounts[0], gas:3000000, value:betValue})

  }
  render() {
    if(!this.state.web3){
      return <div>Loading web3 and components</div>
    } else if(this.state.web3) {
      return (
        <Layout>
          <form onSubmit={this.onSubmit}>
          <Input
            label='Keymaster address'
            type='text'
            value={this.state.keyMaster}
            maxLength='42'
            onChange={event => this.setState({keyMaster : event.target.value})}
          />
          <Input 
            label = 'Reason'
            type='text'
            value={this.state.reason}
            maxLength="32"
            onChange={event => this.setState({reason:event.target.value})}
          />
          <Input 
            label = "fee"
            type='number'
            value={this.state.fee}
            onChange={event => this.setState({fee:event.target.value})}
          />
          <Input 
            label='Bet size'
            type='number'
            value={this.state.betValue}
            onChange={event => this.setState({betValue:event.target.value})}
          />

          <Button color='red'>Start Bet</Button>
          
          </form>
        </Layout>
      );
    }

  }
}

export default App;
