import React from 'react';
import styled, { keyframes } from 'styled-components';
import { ReactComponent as Logo } from '../../images/cat-noknob.svg';

export default function Intro({ start }) {
  return (
    <>
      <Wrapper>
        <AnimatedLogo onClick={start} />
      </Wrapper>
    </>
  );
}

const rotate = keyframes`
  0% { transform: rotateZ(0deg); }
  70% { transform: rotateZ(200deg); }
  100% { transform: rotateZ(0deg); }
`;

const AnimatedLogo = styled(Logo)`
  cursor: pointer;
  #KnobTop {
    animation: ${rotate} 5 4s ease-in-out;
    transform-origin: 407px 137px;
  }
`;

const Wrapper = styled.div`
  position: absolute;
  margin: auto;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 160px;
  height: 160px;
  img {
    max-width: 100%;
    max-height: 100%;
    height: auto;
  }
`;
