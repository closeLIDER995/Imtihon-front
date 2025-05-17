import React from 'react';
import { Navbar, Nav, NavItem, NavLink, NavbarBrand } from 'reactstrap';
import '../styles/Navbar.css';


const AppNavbar = () => {
  return (
    <Navbar color="primary" dark expand="md" className="px-4">
      <NavbarBrand href="/">SocialApp</NavbarBrand>
      <Nav className="ml-auto" navbar>
        <NavItem><NavLink href="/">Feed</NavLink></NavItem>
        <NavItem><NavLink href="/profile">Profile</NavLink></NavItem>
        <NavItem><NavLink href="/post">Post</NavLink></NavItem>
        <NavItem><NavLink href="/users">Users</NavLink></NavItem>
        <NavItem><NavLink href="/notifications">Notifications</NavLink></NavItem>
        <NavItem><NavLink href="/logout">Logout</NavLink></NavItem>
      </Nav>
    </Navbar>
  );
};

export default AppNavbar;
