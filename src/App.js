import React, {Component} from 'react'

import logo from './logo.svg';
import './App.css';
import getWeb3 from './ethereum/web3';
import BetFactory from './build/BetFactory.json'
import Bet from './build/Bet.json'
import BetForm from './Components/BetForm';
import Web3 from 'web3';
import Layout from './Components/Layout';




class App extends Component {
  state = {
    myVal : 0,
    web3:null,
    accounts:null,
    factoryInstance:null
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
  
  render() {
    console.log(this.state.web3)
    if(!this.state.web3){
      return <div>Loading web3 and components</div>
    } else if(this.state.web3) {
      return (
        <Layout>
          <BetForm/>
        </Layout>
      );
    }

  }
}

export default App;
