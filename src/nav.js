import React, { useState } from 'react';
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavLink,
    NavbarText,
} from 'reactstrap';
import curveLogo from './curved.png';

const NavBar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen(!isOpen);

    return (
        <div>
            <Navbar color="transparent" light expand="md">
                <NavbarBrand href="/">
                    <img
                        src={curveLogo}
                        alt="curveLogo"
                        style={{
                            maxWidth: '5vh',
                        }}
                    />
                </NavbarBrand>
                <NavbarBrand href="/">curved cash</NavbarBrand>
                <NavbarToggler onClick={toggle} />
                <Collapse isOpen={isOpen} navbar>
                    <Nav className="mr-auto" navbar />
                    <NavbarText>
                        <NavLink
                            href="https://etherscan.io/address/0x1330aa53F28092Aa1026Bc2679bD63D26f84ced1#code"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            contract on etherscan
                        </NavLink>
                    </NavbarText>
                </Collapse>
            </Navbar>
        </div>
    );
};

export default NavBar;
