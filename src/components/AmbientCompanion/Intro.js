import React from 'react';
import styled, { keyframes } from 'styled-components';
import Logo from '../../images/cat-knob.svg';

export default function Intro({ start }) {
  return (
    <>
      <Wrapper>
        <img src={Logo} alt='' onClick={start} />
      </Wrapper>
    </>
  );
}

const Wrapper = styled.div`
  position: absolute;
  margin: auto;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 120px;
  height: 120px;
  img {
    max-width: 100%;
    max-height: 100%;
    height: auto;
    cursor: pointer;
  }
`;
