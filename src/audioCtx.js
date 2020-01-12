import { createContext } from 'react';
import * as WAAClock from './WAAClock';
import changeNodeVolume from './changeNodeVolume';
import defaultSchedule, {
  generateSchedule,
  getRandomArbitrary,
} from './defaultSchedule';
import VintageNoise from './sounds/vintageNoise.mp3';
import Ir1 from './sounds/IR-1.m4a';

import BufferLoader from './bufferLoader';

const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const unsupported = iOS || safari;

let step = -1;
let schedule = defaultSchedule;
let stepCount = defaultSchedule.patternLength;
let tempo = defaultSchedule.tempo;
let beatLengthInSeconds = 1 / (tempo / 60);
console.log(beatLengthInSeconds);
let masterGainNode = undefined;
let panNode = undefined;
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioContext = new AudioContext();
let clock = new WAAClock(audioContext);
let reverbNode = undefined;
let bufferLoader = undefined;
let isPlaying = false;
let sourceAudio = [];
let wetGain = undefined;
let dryGain = undefined;
let globalReverb = 0.2;
let stepperEvent = undefined;

function reSchedule(newSchedule) {
  schedule = { ...newSchedule };
  stepCount = schedule.patternLength;
  step = 0;
  return schedule;
}

function getSchedule() {
  return schedule;
}

function initLoadingSamples() {
  // Fix up prefixing
  bufferLoader = new BufferLoader(
    audioContext,
    [Ir1, VintageNoise],
    finishedLoading
  );

  bufferLoader.load();
}

function finishedLoading(bufferList) {
  console.log('sound sources loaded');
  sourceAudio[0] = audioContext.createBufferSource();
  sourceAudio[1] = audioContext.createBufferSource();
  sourceAudio[0].buffer = bufferList[0];
  sourceAudio[1].buffer = bufferList[1];

  // source1.connect(masterGainNode);
  // source2.connect(masterGainNode);
  // source1.start(0);
  // source2.start(0);
}

initLoadingSamples();

function handlePlayStep() {
  triggerEvent(isPlaying);
  step = (step + 1) % stepCount;
  for (let count = 0; count < schedule.synths.length; count += 1) {
    if (schedule.synths[count].pattern.length > step) {
      if (schedule.synths[count].pattern[step].on) {
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        panNode = !unsupported
          ? audioContext.createStereoPanner()
          : audioContext.createPanner();
        gainNode.gain.value = 0;
        const { frequency } = schedule.synths[count].pattern[step];

        osc.connect(gainNode);
        gainNode.connect(panNode);
        panNode.connect(dryGain);
        panNode.connect(wetGain);

        // schedule.synths[count].instrument.reverbRatio;

        dryGain.gain.value = 1.0 - globalReverb;
        wetGain.gain.value = globalReverb;

        osc.type = schedule.synths[count].instrument.oscType;
        osc.frequency.setValueAtTime(frequency, audioContext.currentTime);

        if (!unsupported) {
          panNode.pan.setValueAtTime(
            getRandomArbitrary(-1, 1),
            audioContext.currentTime
          );
          panNode.pan.setTargetAtTime(
            getRandomArbitrary(-1, 1),
            audioContext.currentTime + 0.1,
            0.5
          );
        } else {
          const pan = getRandomArbitrary(-1, 1);
          panNode.panningModel = 'equalpower';
          panNode.setPosition(pan, 0, 1 - Math.abs(pan));
        }

        gainNode.gain.setTargetAtTime(0.3, audioContext.currentTime, 0.001);
        gainNode.gain.setTargetAtTime(
          0.05,
          audioContext.currentTime + 0.1,
          0.01
        );
        gainNode.gain.setTargetAtTime(0, audioContext.currentTime + 0.15, 1);

        osc.start();
        osc.stop(audioContext.currentTime + 4);
        // osc.onended = () => osc.disconnect();
      }
    }
  }
}

function triggerEvent(is) {
  const event = new CustomEvent('trigger', { detail: { isPlaying: is } });
  window.dispatchEvent(event);
}

function handleSequencerSwitch() {
  if (!isPlaying) {
    isPlaying = true;
    audioContext = !audioContext ? new AudioContext() : audioContext;
    clock = !clock ? new WAAClock(audioContext) : clock;

    masterGainNode = audioContext.createGain();
    wetGain = audioContext.createGain();
    dryGain = audioContext.createGain();
    reverbNode = audioContext.createConvolver();
    reverbNode.buffer = sourceAudio[0].buffer;

    wetGain.connect(reverbNode);
    reverbNode.connect(masterGainNode);
    dryGain.connect(masterGainNode);
    masterGainNode.connect(audioContext.destination);

    audioContext.resume();
    clock.start();
    stepperEvent = clock
      .callbackAtTime(() => {
        handlePlayStep();
      }, 0)
      .repeat(beatLengthInSeconds);
  } else {
    masterGainNode.gain.setTargetAtTime(0, audioContext.currentTime, 1);
    isPlaying = false;
    step = -1;
    audioContext.close().then(() => {
      audioContext = new AudioContext();
      clock = new WAAClock(audioContext);
    });
  }
}

function getClock() {
  return clock;
}

function getMasterGainNode() {
  return masterGainNode;
}

function getAudioContext() {
  return audioContext;
}

function getStepCount() {
  return stepCount;
}

function getIsPlaying() {
  return isPlaying;
}

function getStep() {
  return step;
}

const audioCtx = createContext({
  getAudioContext,
  getMasterGainNode,
  clock,
  schedule,
  handlePlayStep,
  reSchedule,
  getSchedule,
  getIsPlaying,
  handleSequencerSwitch,
  getClock,
  getStepCount,
  getStep,
  unsupported,
});

export default audioCtx;
