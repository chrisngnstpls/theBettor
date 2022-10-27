import React, {Component} from "react";
import {Button, Table, TableCell, TableBody, TableRow, TableHeader} from 'semantic-ui-react'
import BetModalSection from "./BetModalSection";


class BetRow extends Component {
    showDetails(location){
        console.log(location)
    }
    render() {
        
        const {Row, Cell} = Table;
        const {id, location, initiator, accounts, gas, handleFromParent, web3} = this.props;

        console.log(this.props)
        console.log('user from betrow', accounts[0])
        return ([
                    <Table.Row key='betrow' textAlign='center'>
                        <Table.Cell colSpan='1'>{id}</Table.Cell>
                        <Table.Cell colSpan='1'>{location}</Table.Cell>
                        <Table.Cell colSpan='1'>{initiator}</Table.Cell>
                        
                        <Table.Cell colSpan='1' textAlign="center"><BetModalSection web3={web3} gas={gas} location={location} rowKey={id} initiator={initiator} myAddress={accounts}/></Table.Cell>
                    </Table.Row>                
        ])
    }
}

export default BetRow;

//'<Cell><Button onClick={()=>handleFromParent(location)}>View</Button></Cell>'