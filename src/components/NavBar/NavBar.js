import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

export default function NavBar() {
  return (
    <Nav>
      <Link to='/'>Home</Link>
      <Link to={'/ambientcompanion'}>AmbientCompanion</Link>
    </Nav>
  );
}

const Nav = styled.nav`
  background-color: #000;
  display: flex;
  align-items: center;
  height: 64px;
  a {
    color: #fff;
    text-decoration: none;
    padding: 0px 32px;
    @media (max-width: 768px) {
      padding: 0px 16px;
    }
  }
`;
