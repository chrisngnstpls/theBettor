import React,{Component, useEffect} from "react"
import { Menu } from "semantic-ui-react"
import './Header.css'

const HeaderComponent = (props) => {
    return (
        <Menu pointing secondary style = {{marginTop : '10px'}}>
            <Menu.Item>
                <img alt='logo' src="./logo192.png"/>
            </Menu.Item>
            <Menu.Item position="left">
                <p className="address">{props.address}</p>
            </Menu.Item>
            <Menu.Item position="right">
                <p className="appName"> the Bettor</p>
            </Menu.Item>
        </Menu>
    )
}

export default HeaderComponent

