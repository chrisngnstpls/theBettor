import React,{Component, useEffect} from "react"
import { Menu } from "semantic-ui-react"
import Web3 from "web3"
import getWeb3 from "../ethereum/web3"

const HeaderComponent = (props) => {
    return (
        <Menu pointing secondary style = {{marginTop : '10px'}}>
            <Menu.Menu position="right">
                <p className="item">{props.address}</p>
                <p className="item"> the Bettor</p>
            </Menu.Menu>
        </Menu>
    )
}

export default HeaderComponent

