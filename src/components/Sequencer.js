import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import VolumeSlider from './VolumeSlider';
import {
  reSchedule,
  getSchedule,
  handleSequencerSwitch,
  getMasterGainNode,
  getStepCount,
  getStep,
  getSampleRate,
  loadAudioData,
} from '../audioCtx';
import { generateSchedule, getRandomInt } from '../defaultSchedule';
import ImgLoader from '../images/loader.svg';
// import useAnimationFrame from '../useAnimationFrame';
import ICOplay from '../images/play.svg';
import ICOpause from '../images/pause.svg';

export default function Sequencer({ initGain }) {
  const [metro, setMetro] = useState(-1);
  // const [schedule, setSchedule] = useState(getSchedule());
  // const [masterGainNode, setMasterGainNode] = useState(getMasterGainNode());
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepCount, setStepCount] = useState(getStepCount());
  const [infinite, setInfinite] = useState(true);
  // const [sr, setSr] = useState(getSampleRate());
  const [loaded, setLoaded] = useState(false);
  // const [err, setErr] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading audio stuff');
  // const [oscCount, setOscCount] = useState(0);

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

    function tick() {
      // console.log('tick', metro);
      setMetro(metro => metro + 1);
    }
    function onTrigger(e) {
      // setOscCount(e.detail.numberOfOsc);
      tick();
    }
    window.addEventListener('trigger', onTrigger);
    return () => {
      window.removeEventListener('trigger', onTrigger);
    };
  }, []);

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
    if (metro % stepCount === stepCount - 1 && infinite) {
      memoizedHandleReschedule();
    }
  }, [infinite, memoizedHandleReschedule, metro, stepCount]);

  function switchPlay() {
    if (isPlaying === false) {
      handleSequencerSwitch();
      // setMasterGainNode(getMasterGainNode());
      setIsPlaying(true);
    } else {
      memoizedHandleReschedule();
      handleSequencerSwitch();
      setIsPlaying(false);
      // setMetro(0);
    }
  }

  return (
    <div
      style={{
        display: 'block',
        width: '360px',
        boxShadow: '0px 0px 5px 0px rgba(214,214,214,1)',
        padding: '8px',
      }}
    >
      <h1
        style={{
          fontSize: '28px',
          marginBlockEnd: '0',
          marginBlockStart: '0px',
        }}
      >
        AmbientCompanion
      </h1>
      <h2
        style={{
          fontSize: '20px',
          marginBlockEnd: '24px',
          marginBlockStart: '0px',
          fontWeight: 'normal',
          fontColor: '#666',
        }}
      >
        by feline astronauts
      </h2>
      {/* <div style={{ fontSize: '10px' }}>
        <p>Debug | number of active oscillators: {oscCount}</p>
      </div> */}
      {loaded ? (
        <>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
                color='secondary'
                disabled={!isPlaying}
                onClick={() => memoizedHandleReschedule()}
              >
                REGENERATE
              </Button>
            </div>
          </div>
          <CanvasWrapper>
            <CanvasStepper id='stepper' />
          </CanvasWrapper>
          <CanvasWrapper>
            <Canvas id='oscilloscope' />
          </CanvasWrapper>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant='text'
              color='primary'
              onClick={() => setInfinite(prev => !prev)}
            >
              {infinite ? 'INFINITE GENERATOR ON' : 'LOOP PATTERN ON'}
            </Button>
          </div>
        </>
      ) : (
        <LoaderContainer>
          <img src={ImgLoader} alt='' />
          {loadingMessage}
        </LoaderContainer>
      )}
    </div>
  );
}

const LoaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  img {
    max-height: 128px;
  }
`;

const Canvas = styled.canvas`
  width: 90%;
  height: 80px;
  box-shadow: 0px 0px 5px 0px rgba(214, 214, 214, 1);
  border-radius: 5px;
`;

const CanvasStepper = styled.canvas`
  width: 90%;
  height: 95px;
  box-shadow: 0px 0px 5px 0px rgba(214, 214, 214, 1);
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
