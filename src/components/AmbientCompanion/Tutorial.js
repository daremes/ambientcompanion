import React, { useState } from 'react';
import styled from 'styled-components';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import RightIcon from '@material-ui/icons/ArrowForward';
import BackIcon from '@material-ui/icons/ArrowBack';
import SettingsIcon from '@material-ui/icons/SettingsInputComponent';

const Step1 = () => (
  <Info>
    <h1>Welcome to AmbientCompanion</h1>
    <p>
      Ok, so you're going to try this weird little app with a silly name. If you
      don't mind, you can read a few lines explaining what the hell is this all
      about. Otherwise, go ahead and close this window and I won't bother you
      again.
    </p>
    <p>
      You can always read the introduction later when you find out that you
      actually care to do so. Just click the Info button in Advanced Audio
      Settings <SettingsIcon />.
    </p>
  </Info>
);

const Step2 = () => (
  <Info>
    <h1>What is this?!</h1>
    <p>
      AmbientCompanion is a part of my collection of multimedia experiments
      strongly biased towards sound and generative art.
    </p>
    <p>
      This one can be considered a proof-of-concept - or a tech demonstration if
      you will - of sound synthesis and other audio capabilities of your web
      browser.
    </p>
  </Info>
);

const Step3 = () => (
  <Info>
    <p>
      That being said, AmbientCompanion is just a simple web application that
      plays random (to some extent) patterns of synthesized and sampled sounds.
    </p>
    <p>
      Hopefully, someone who's into web technology, digital audio processing,
      sound-design and other funny stuff like that can find it interesting.
    </p>
    <p>
      And, of course, ladies and gentlemen who appreciate ambient and
      experimental music are more than welcome. And others? You can be sure it
      will put you to sleep in a few minutes!
    </p>
  </Info>
);

const Step4 = () => (
  <Info>
    <h1>Tech gibberish</h1>
    <p>
      AmbientCompanion uses WebAudio API and a popular Javascript library for
      building user interfaces called React. (Think of your Facebook, Instagram
      and many others). Also, it takes advantage of HTML Canvas to display
      oscilloscope and other components. UI controls are based on customized
      Material UI. Boring.
    </p>
    <p>
      It will run on your kick-ass laptop using current browsers. I prefer
      Chrome and Safari. It was tested on iOS devices and some Android phones.
      Probably, it won't work in Internet Explorer. And that's a good thing,
      grandpa!
    </p>
  </Info>
);

const Step5 = () => (
  <Info>
    <h1>Audio mumbo-jumbo</h1>
    <p>
      Fm Synthesis is short for frequency modulation synthesis. It allows to
      generate pretty complex timbres by modulating the frequency of one
      oscillator with another. You can try to switch FM synthesis on/off to hear
      the difference between a simple sine/triangle wave and a modulated one. I
      recommend to take a look at the Solo Mode in the Settings where you can
      experiment with FM synthesis a little further.
    </p>
    <p>
      Does it sound a bit echoey? It's a convolution reverb using a custom
      impulse response.
    </p>
  </Info>
);

const stepComponents = [<Step1 />, <Step2 />, <Step3 />, <Step4 />, <Step5 />];

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

const Info = styled.div`
  h1 {
    font-size: 18px;
    font-family: 'Roboto Slab', serif;
    /* font-family: 'Raleway', sans-serif; */
  }
  svg {
    height: 16px;
    vertical-align: middle;
  }
`;
