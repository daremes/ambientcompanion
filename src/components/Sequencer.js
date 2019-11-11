import React, { useState, useEffect, useContext, useCallback } from 'react';
import Button from '@material-ui/core/Button';
import VolumeSlider from './VolumeSlider';
import audioCtx from '../audioCtx';
import { generateSchedule, getRandomInt } from '../defaultSchedule';

export default function Sequencer({ initGain }) {
  const {
    reSchedule,
    getSchedule,
    handleSequencerSwitch,
    getMasterGainNode,
    getStepCount,
    getStep,
  } = useContext(audioCtx);
  const [metro, setMetro] = useState(getStep());
  const [schedule, setSchedule] = useState(getSchedule());
  const [masterGainNode, setMasterGainNode] = useState(getMasterGainNode());
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepCount, setStepCount] = useState(getStepCount());
  const [infinite, setInfinite] = useState(false);

  useEffect(() => {
    function tick() {
      setMetro(metro => metro + 1);
    }
    function onTrigger() {
      tick();
    }
    window.addEventListener('trigger', onTrigger);
    return () => {
      window.removeEventListener('trigger', onTrigger);
    };
  }, []);

  const memoizedHandleReschedule = useCallback(() => {
    const newPatternLength = getRandomInt(4, 129);
    const newSchedule = generateSchedule(newPatternLength);
    reSchedule(newSchedule);
    setSchedule(newSchedule);
    setStepCount(newPatternLength);
    setMetro(getStep());
  }, [getStep, reSchedule]);

  useEffect(() => {
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
      memoizedHandleReschedule();
      handleSequencerSwitch();
      setIsPlaying(false);
      setMetro(-1);
    }
  }

  return (
    <div style={{ display: 'block', width: '360px' }}>
      <h1
        style={{
          fontSize: '28px',
          marginBlockEnd: '0',
          marginBlockStart: '12px',
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
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant={!isPlaying ? 'contained' : 'outlined'}
            color="primary"
            onClick={() => switchPlay()}
          >
            {isPlaying ? 'MUTE' : 'UNMUTE'}
          </Button>
          <Button
            variant="text"
            color="secondary"
            onClick={() => memoizedHandleReschedule()}
          >
            RESCHEDULE
          </Button>
        </div>
        <div style={{ width: '100%', maxWidth: '360px' }}>
          <VolumeSlider
            initGain={0.5}
            gainNode={masterGainNode}
            name="Master volume"
          />
        </div>
      </div>
      <div style={{ position: 'relative', height: '100px' }}>
        <div style={{}}>{`Step ${(metro % stepCount) + 1} / ${stepCount}`}</div>
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
      </div>
      <div style={{}}>Pattern</div>
      {stepCount > metro % stepCount ? (
        <div
          style={{ position: 'relative', overflowX: 'auto', height: '60px' }}
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
          <div
            style={{
              position: 'absolute',
              width: '2px',
              height: '45px',
              background: 'rgba(0,0,0,0.1)',
              top: '10px',
              left: `${(metro % stepCount) * 3 + 3}px`,
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
