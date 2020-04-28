import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import defaultTheme from '../../defaultTheme';

const {
  primary,
  secondary,
  additional1,
  additional2,
  additional3,
} = defaultTheme.palette;

export default function NavBar() {
  return (
    <Nav>
      <Link to='/'>Home</Link>
      <Link to={'/ambientcompanion'}>AmbientCompanion</Link>
    </Nav>
  );
}

const Nav = styled.nav`
  /* background-color: ${additional3.main}; */
  box-shadow: 0 2px 4px -1px rgba(0,0,0,0.25);
  display: flex;
  align-items: center;
  height: 64px;
  transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  a {
    font-family: 'Roboto Slab', serif;
    /* font-family: 'Raleway', sans-serif; */
    color: rgba(0, 0, 0, 0.87);
    /* color: rgba(255, 255, 255, 0.87); */
    text-decoration: none;
    padding: 0px 32px;
    @media (max-width: 768px) {
      padding: 0px 16px;
    }
  }
`;
