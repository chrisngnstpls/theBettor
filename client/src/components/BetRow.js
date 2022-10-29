import React, {Component} from "react";
import {Table} from 'semantic-ui-react'
import BetModalSection from "./BetModalSection";


class BetRow extends Component {
    showDetails(location){
        console.log(location)
    }
    render() {
        
        const {id, location, initiator, accounts, gas, handleFromParent, web3,reason,balance,status} = this.props;
        
        function shortHand(_input){
            let first = _input.substring(0,6)
            let second = _input.substring(37,44)
            let final = first + '...' + second
            return final
        }
        
        let final = shortHand(initiator)

        return ([
                    <Table.Row key='betrow' textAlign='center'>
                        <Table.Cell colSpan='1'>{id}</Table.Cell>
                        <Table.Cell colSpan='1'>{final}</Table.Cell>
                        <Table.Cell colSpan='1'>{reason}</Table.Cell>
                        <Table.Cell colSpan='1' textAlign="right">{balance} ⟠ Eth</Table.Cell>
                        <Table.Cell colSpan='1'>{status}</Table.Cell>
                        <Table.Cell colSpan='1' textAlign="center"><BetModalSection 
                            web3={web3} 
                            gas={gas} 
                            location={location} 
                            rowKey={id} 
                            initiator={initiator} 
                            myAddress={accounts}
                            balance={balance}
                            reason={reason}
                            status={status}
                        /></Table.Cell>
                    </Table.Row>                
        ])
    }
}

export default BetRow;

//'<Cell><Button onClick={()=>handleFromParent(location)}>View</Button></Cell>'


//0xa1843eed85A4eF623464D6ceC7482a79dFDFF308