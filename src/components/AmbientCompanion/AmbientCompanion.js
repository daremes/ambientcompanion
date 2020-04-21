import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import SettingsIcon from '@material-ui/icons/SettingsInputComponent';
import SettingsMenu from './SettingsMenu';
import Intro from './Intro';
import {
  reSchedule,
  handleSequencerSwitch,
  getMasterGainNode,
  getStepCount,
  getAudioContext,
  onPause,
  loadAudioData,
} from './audioCtx';
import changeNodeVolume from './changeNodeVolume';
import { generateSchedule, getRandomInt } from './defaultSchedule';
import ImgLoader from '../../images/loader.svg';
// import useAnimationFrame from '../useAnimationFrame';
import ICOplay from '../../images/play.svg';
import ICOpause from '../../images/pause.svg';

export default function AmbientCompanion() {
  const [metro, setMetro] = useState(-1);
  // const [masterGainNode, setMasterGainNode] = useState(getMasterGainNode());
  const [masterGain, setMasterGain] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [intro, setIntro] = useState(true);
  const [stepCount, setStepCount] = useState(getStepCount());
  const [infinite, setInfinite] = useState(true);
  const [settingsOpened, setSettingsOpened] = useState(false);
  // const [sr, setSr] = useState(getSampleRate());
  const [loaded, setLoaded] = useState(false);
  // const [err, setErr] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading audio stuff');
  // const [oscCount, setOscCount] = useState(0);
  const memoizedHandleReschedule = useCallback(() => {
    let newPatternLength = getRandomInt(4, 64);
    if (newPatternLength % 2 !== 0) {
      newPatternLength += 1;
    }
    const newSchedule = generateSchedule(newPatternLength);
    reSchedule(newSchedule);
    // setSchedule(newSchedule);
    setStepCount(newPatternLength);
    setMetro(-1);
  }, []);

  useEffect(() => {
    loadAudioData().then(loadingErrors => {
      if (loadingErrors.length === 0) {
        console.log('Audio data loaded!');
        setLoaded(true);
      } else {
        setLoadingMessage(
          `Failed to load audio data. Bummer. Fujtajbl: ${JSON.stringify(
            loadingErrors
          )}`
        );
        console.log('Error loading audio data');
      }
    });
    console.log('Audio data not yet loaded...');
    memoizedHandleReschedule();
    function tick(metro) {
      setMetro(metro => metro + 1);
    }
    function onTrigger(e) {
      // setOscCount(e.detail.numberOfOsc);
      tick();
    }
    window.addEventListener('trigger', onTrigger);
    return () => {
      window.removeEventListener('trigger', onTrigger);
      // const ctx = getAudioContext();
      onPause();
    };
  }, [memoizedHandleReschedule]);

  useEffect(() => {
    changeNodeVolume(getMasterGainNode(), getAudioContext(), masterGain);
  }, [masterGain]);

  useEffect(() => {
    if (metro % stepCount === stepCount - 1 && infinite) {
      memoizedHandleReschedule();
    }
  }, [infinite, memoizedHandleReschedule, metro, stepCount]);

  function switchPlay() {
    if (isPlaying === false) {
      handleSequencerSwitch();
      if (intro) {
        setIntro(false);
      }
      // setMasterGainNode(getMasterGainNode());
      setIsPlaying(true);
    } else {
      memoizedHandleReschedule();
      handleSequencerSwitch();
      setIsPlaying(false);
      // setMetro(0);
    }
  }

  function handleOpenSettings() {
    setSettingsOpened(settingsOpened => !settingsOpened);
  }

  return (
    <Wrapper>
      <Header>AmbientCompanion</Header>
      <SubHeader>by feline astronauts</SubHeader>
      {loaded ? (
        <>
          <Controls>
            <Button
              variant={!isPlaying ? 'contained' : 'text'}
              color='primary'
              onClick={() => switchPlay()}
            >
              {isPlaying ? (
                <PlayIcon src={ICOpause} alt='' />
              ) : (
                <PlayIcon src={ICOplay} alt='' />
              )}
            </Button>
            <Button
              variant='text'
              color='default'
              onClick={() => handleOpenSettings()}
            >
              <SettingsIcon />
            </Button>
            <Button
              variant='text'
              color='secondary'
              disabled={!isPlaying}
              onClick={() => memoizedHandleReschedule()}
            >
              REGENERATE
            </Button>
          </Controls>
          {settingsOpened ? (
            <SettingsMenu
              onClose={handleOpenSettings}
              masterGain={masterGain}
              setMasterGain={setMasterGain}
            />
          ) : null}
          <VisualContent>
            <CanvasWrapper>
              <CanvasStepper id='stepper' />
            </CanvasWrapper>
            <CanvasWrapper>
              <Canvas id='oscilloscope' />
            </CanvasWrapper>
            {intro ? <Intro /> : null}
          </VisualContent>
          <BottomControls>
            <Button
              variant='text'
              color='primary'
              onClick={() => setInfinite(prev => !prev)}
            >
              {infinite ? 'INFINITE GENERATOR ON' : 'LOOP PATTERN ON'}
            </Button>
          </BottomControls>
        </>
      ) : (
        <LoaderContainer>
          <img src={ImgLoader} alt='' />
          {loadingMessage}
        </LoaderContainer>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: block;
  width: 100%;
  max-width: 480px;
  box-shadow: 0px 0px 5px 2px rgba(214, 214, 214, 1);
  padding: 24px;
`;

const Header = styled.h1`
  font-size: 28px;
  margin-block-end: 0;
  margin-block-start: 0;
`;

const SubHeader = styled.h2`
  font-size: 20px;
  margin-block-end: 24px;
  margin-block-start: 0px;
  font-weight: normal;
  color: #666;
`;

const Controls = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const BottomControls = styled.div`
  display: flex;
  justify-content: center;
`;

const LoaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  img {
    max-height: 128px;
  }
`;

const VisualContent = styled.div`
  position: relative;
  display: block;
  width: 100%;
`;

const Canvas = styled.canvas`
  width: 90%;
  height: 80px;
  /* box-shadow: 0px 0px 5px 0px rgba(214, 214, 214, 1); */
  border-radius: 5px;
`;

const CanvasStepper = styled.canvas`
  width: 90%;
  height: 95px;
  /* box-shadow: 0px 0px 5px 0px rgba(214, 214, 214, 1); */
  border-radius: 5px;
`;

const CanvasWrapper = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
`;

// const PatternWrapper = styled.div`
//   display: flex;
//   justify-content: center;
// `;

const PlayIcon = styled.img`
  display: block;
`;
