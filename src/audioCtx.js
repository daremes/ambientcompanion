import * as WAAClock from './WAAClock';
import changeNodeVolume from './changeNodeVolume';
import defaultSchedule, {
  generateSchedule,
  getRandomArbitrary,
} from './defaultSchedule';
import soundFiles from './soundFiles';

let irSources = [];
let sampleSources = [];
let decodedIrs = [];
let decodedSamples = [];

const { irs, samples } = soundFiles;
irs.forEach((ir, index) => {
  irSources[index] = require(`./sounds/${ir.fileName}`);
});
samples.forEach((sample, index) => {
  sampleSources[index] = require(`./sounds/${sample.fileName}`);
});

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
let isPlaying = false;
let wetGain = undefined;
let dryGain = undefined;
let globalReverb = 0.35;
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

async function getFile(ctx, filepath) {
  const response = await fetch(filepath);
  const arrayBuffer = await response.arrayBuffer();
  // safari hack
  if (ctx.decodeAudioData.length === 2) {
    return new Promise(resolve => {
      audioContext.decodeAudioData(
        arrayBuffer,
        buffer => {
          return resolve(buffer);
        },
        () => {
          console.log('Error during decoding: ', filepath);
          return resolve({ error: true });
        }
      );
    });
  } else {
    return await ctx.decodeAudioData(arrayBuffer).catch(err => {
      console.log('Error during decoding: ', filepath);
      return { error: true };
    });
  }
}

async function loadAudioData() {
  let loadingErrors = [];
  for (let index = 0; index < irs.length; index++) {
    const filePath = irSources[index];
    const sample = await getFile(audioContext, filePath);
    if (sample.error) {
      loadingErrors.push(irs[index]);
    }
    decodedIrs[index] = sample;
  }
  for (let index = 0; index < samples.length; index++) {
    const filePath = sampleSources[index];
    const sample = await getFile(audioContext, filePath);
    if (sample.error) {
      loadingErrors.push(samples[index]);
    }
    decodedSamples[index] = sample;
  }
  console.log('ALL DONE');
  return loadingErrors;
}

// Fix up prefixing
// bufferLoader = new BufferLoader(
//   audioContext,
//   [Ir1, VintageNoise],
//   finishedLoading
// );

// bufferLoader.load();

// function finishedLoading(bufferList) {
//   console.log('sound sources loaded');
//   sourceAudio[0] = audioContext.createBufferSource();
//   sourceAudio[1] = audioContext.createBufferSource();
//   sourceAudio[0].buffer = bufferList[0];
//   sourceAudio[1].buffer = bufferList[1];
//   // source1.connect(masterGainNode);
//   // source2.connect(masterGainNode);
//   // source1.start(0);
//   // source2.start(0);
// }

function disconnect(osc, gain) {
  gain.disconnect();
  osc.disconnect();
}

function triggerEvent(is) {
  // const event = new CustomEvent('trigger', { detail: { isPlaying: is } });
  const event = new Event('trigger');
  window.dispatchEvent(event);
}

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
        // setTimeout(() => disconnect(osc, gainNode), 4000);

        // osc.onended = () => osc.disconnect();
      }
    }
  }
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
    reverbNode.buffer = decodedIrs[0];

    wetGain.connect(reverbNode);
    reverbNode.connect(masterGainNode);
    dryGain.connect(masterGainNode);
    masterGainNode.connect(audioContext.destination);

    audioContext.resume();
    clock.start();
    clock
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

const getStep = () => step;

function getSampleRate() {
  return audioContext.sampleRate;
}

export {
  getAudioContext,
  getMasterGainNode,
  getSampleRate,
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
  loadAudioData,
};
