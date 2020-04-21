import React from 'react';
import styled from 'styled-components';

export default function Intro() {
  return (
    <>
      <Wrapper>
        <img
          src='https://www.vettedpetcare.com/vetted-blog/wp-content/uploads/2017/09/How-To-Travel-With-a-Super-Anxious-Cat-square.jpeg'
          alt=''
        />
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
  }
`;
