import React, { useState } from 'react';
import styled from 'styled-components';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import RightIcon from '@material-ui/icons/ArrowForward';
import BackIcon from '@material-ui/icons/ArrowBack';

const Step1 = () => (
  <div>
    Meatball fatback shoulder kevin chislic swine pig, alcatra tail salami jowl
    pork. Ribeye chicken picanha, pancetta biltong prosciutto pastrami
    tenderloin meatball pork pork belly. Pancetta pastrami shank, corned beef
    pork chop meatloaf short loin leberkas. Burgdoggen pig pancetta, pork
    andouille spare ribs venison turkey flank turducken kielbasa tenderloin
    shankle.
  </div>
);

const Step2 = () => (
  <div>
    Spicy jalapeno bacon ipsum dolor amet turkey ribeye filet mignon, pork
    t-bone tri-tip frankfurter. Turducken chislic beef chuck rump. Cow beef
    pastrami spare ribs. Swine boudin leberkas ham. Biltong pig strip steak
    t-bone, meatloaf salami fatback tenderloin jerky turducken. Strip steak
    spare ribs kevin, ribeye kielbasa short loin shank porchetta capicola.
    Pancetta bresaola ham hock filet mignon.
  </div>
);

const stepComponents = [<Step1 />, <Step2 />];

export default function Tutorial({ onClose }) {
  const [step, setStep] = useState(0);

  function handleChangeStep(action) {
    if (action === 'next') {
      console.log('next');
      if (step < stepComponents.length - 1) {
        setStep(step => step + 1);
      } else {
        onClose();
      }
    }
    if (action === 'back') {
      console.log('beck');
      setStep(step => step - 1);
    }
  }

  return (
    <Wrapper>
      <Top>
        <IconButton aria-label='close' onClick={onClose} color='inherit'>
          <CloseIcon />
        </IconButton>
      </Top>
      <Content>{stepComponents[step]}</Content>
      <Bottom>
        <ButtonContainer>
          <IconButton
            aria-label='close'
            onClick={() => handleChangeStep('back')}
            color='inherit'
            disabled={step === 0 ? true : false}
          >
            <BackIcon />
          </IconButton>
        </ButtonContainer>
        <ButtonContainer>
          <IconButton
            aria-label='close'
            onClick={() => handleChangeStep('next')}
            color='inherit'
            disabled={false}
          >
            <RightIcon />
          </IconButton>
        </ButtonContainer>
      </Bottom>
    </Wrapper>
  );
}
const Wrapper = styled.div`
  position: absolute;
  color: #fafafa;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 100%;
  background: rgba(0, 0, 0, 0.9);
  z-index: 100;
  animation: fadeIn ease 1s;
  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;

const Content = styled.div`
  padding: 0px 24px 24px;
`;

const Top = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const Bottom = styled.div`
  display: flex;
  justify-content: center;
`;

const ButtonContainer = styled.div`
  width: 48px;
`;
