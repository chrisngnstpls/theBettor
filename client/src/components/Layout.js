import React from "react";
import { Container } from 'semantic-ui-react';
import HeaderComponent from "./Header";

const Layout = (props) => {
    return (
        <Container>
            <HeaderComponent address={props.address}/>
            {props.children}

        </Container>
    )
}

export default Layout;