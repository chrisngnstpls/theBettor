import React from "react"
import { Menu } from "semantic-ui-react"

const HeaderComponent = (props) => {
    return (
        <Menu style = {{marginTop : '10px'}}>
            <Menu.Menu position="right">
                <a className="item">the Bettor</a>
            </Menu.Menu>
        </Menu>
    )
}

export default HeaderComponent;