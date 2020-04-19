import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [schedule, setSchedule] = useState(getSchedule());
  const [masterGainNode, setMasterGainNode] = useState(getMasterGainNode());
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepCount, setStepCount] = useState(getStepCount());
  const [infinite, setInfinite] = useState(true);
  // const [sr, setSr] = useState(getSampleRate());
  const [loaded, setLoaded] = useState(false);
  // const [err, setErr] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading audio stuff');
  const [oscCount, setOscCount] = useState(0);
  // const divTest = useRef();
  // const cnt = useRef(0);
  // let playing = useRef();
  // playing = isPlaying;

  // useAnimationFrame(deltaTime => {
  //   const howMany = getStepCount();
  //   if (cnt.current < howMany && playing) {
  //     cnt.current += getStep() / howMany;
  //   } else {
  //     cnt.current = 0;
  //   }
  //   divTest.current.style.top = `${Math.round(cnt.current - 5)}px`;
  // });

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
      setOscCount(e.detail.numberOfOsc);
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
    setSchedule(newSchedule);
    setStepCount(newPatternLength);
    setMetro(-1);
  }, []);

  useEffect(() => {
    // console.log(metro % stepCount);
    if (metro % stepCount === stepCount - 1 && infinite) {
      memoizedHandleReschedule();
    }
  }, [infinite, memoizedHandleReschedule, metro, stepCount]);

  function switchPlay() {
    if (isPlaying === false) {
      handleSequencerSwitch();
      setMasterGainNode(getMasterGainNode());
      setIsPlaying(true);
    } else {
      // memoizedHandleReschedule();
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
          {/* <div
            ref={divTest}
            style={{
              position: 'absolute',
              left: '-8px',
              width: '10px',
              height: '10px',
              color: 'red',
              display: isPlaying ? 'block' : 'none',
            }}
          >
            <img src={ICOplay} alt='.' />
          </div> */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant={!isPlaying ? 'contained' : 'default'}
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
            {/* <div>sample rate: {sr}</div> */}
            {/* <div style={{ width: '100%', maxWidth: '360px' }}>
              <VolumeSlider
                initGain={0.5}
                gainNode={masterGainNode}
                name='Master volume'
              />
            </div> */}
          </div>
          {/* <div style={{}}>{`Step ${(metro % stepCount) +
            1} / ${stepCount}`}</div> */}
          {/* <div style={{ position: 'relative', height: '100px' }}>

            {metro > -1 && stepCount > metro % stepCount ? (
              <>
                {schedule.synths.map((s, index) => (
                  <div key={s + index}>
                    {s.pattern[metro % stepCount].on ? (
                      <>
                        <div
                          style={{
                            width: `${schedule.synths[index].pattern[
                              metro % stepCount
                            ].frequency / 12}px`,
                            height: '5px',
                            borderRadius: '5px',
                            background: `#${Math.floor(
                              Math.random() * 16777216
                            ).toString(16)}`,
                            position: 'absolute',
                            top: `${30 + index * 12}px`,
                          }}
                        />
                      </>
                    ) : null}
                  </div>
                ))}
              </>
            ) : null}
          </div> */}
          {/* <div style={{}}>Pattern</div> */}
          {/* <PatternWrapper>
            {stepCount > metro % stepCount ? (
              <div
                style={{
                  position: 'relative',
                  overflowX: 'auto',
                  height: '100px',
                  whiteSpace: 'nowrap',
                }}
              >
                {schedule.synths.map((synth, index) => (
                  <div style={{ height: '5px', margin: '3px' }}>
                    {synth.pattern.map((pattern, i) => (
                      <div
                        style={{
                          display: 'inline-block',
                          height: '2px',
                          width: '2px',
                          marginRight: '1px',
                          background: pattern.on ? '#666' : 'transparent',
                        }}
                      />
                    ))}
                  </div>
                ))}
                {schedule.samples.map((sample, index) => (
                  <div style={{ height: '5px', margin: '3px' }}>
                    {sample.pattern.map((pattern, i) => (
                      <div
                        style={{
                          display: 'inline-block',
                          height: '2px',
                          width: '2px',
                          marginRight: '1px',
                          background: pattern.on ? 'red' : 'transparent',
                        }}
                      />
                    ))}
                  </div>
                ))}
                <div
                  style={{
                    position: 'absolute',
                    width: '2px',
                    height: '84px',
                    background: 'rgba(0,0,0,0.1)',
                    top: '10px',
                    left: `${(metro % stepCount) * 3 + 3}px`,
                  }}
                />
              </div>
            ) : null}
          </PatternWrapper> */}
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
              {infinite ? 'InfiniteMode On' : 'LoopMode On'}
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

const PatternWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const PlayIcon = styled.img`
  display: block;
`;
