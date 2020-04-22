import * as WAAClock from './WAAClock';
import changeNodeVolume from './changeNodeVolume';
import defaultSchedule, {
  getRandomArbitrary,
  getRandomInt,
} from './defaultSchedule';
import soundFiles from './soundFiles';

let irSources = [];
let sampleSources = [];
let audioTrackSources = [];
let decodedIrs = [];
let decodedSamples = [];
let numberOfOsc = 0;
let sampleGainNodes = new Array(defaultSchedule.samples.length);
let sampleDryNodes = new Array(defaultSchedule.samples.length);
let sampleWetNodes = new Array(defaultSchedule.samples.length);

const { irs, samples } = soundFiles;
irs.forEach((ir, index) => {
  irSources[index] = require(`../../sounds/${ir.fileName}`);
});
samples.forEach((sample, index) => {
  sampleSources[index] = require(`../../sounds/${sample.fileName}`);
});

const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const unsupported = iOS || safari;

let step = 0;
let schedule = { ...defaultSchedule };
let stepCount = defaultSchedule.patternLength;
let tempo = defaultSchedule.tempo;
let beatLengthInSeconds = 1 / (tempo / 60);
console.log(beatLengthInSeconds);
let masterGainNode = undefined;
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioContext = new AudioContext();
audioContext.suspend();
let clock = new WAAClock(audioContext);
let reverbNode = undefined;
let isPlaying = false;
let wetGain = undefined;
let dryGain = undefined;
let globalReverb = 0.3;
let justReseted = false;
let modulatorBase = 1;
let modulatorOsc = undefined;
let modulatorGainNode = undefined;
let modulatorDepth = 100;
let fm = false;

const requestAnimationFrame =
  window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame;

const cancelAnimationFrame =
  window.cancelAnimationFrame || window.mozCancelAnimationFrame;

let animationRequest = undefined;

function reSchedule(newSchedule) {
  schedule = { ...newSchedule };
  stepCount = newSchedule.patternLength;
  justReseted = true;
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

// function disconnect(osc, gain) {
//   gain.disconnect();
//   osc.disconnect();
// }

function triggerEvent(is) {
  const event = new CustomEvent('trigger', { detail: { numberOfOsc } });
  window.dispatchEvent(event);
}

function subtract() {
  numberOfOsc -= 1;
}

function onPause() {
  isPlaying = false;
  // step = -1;
  cancelAnimationFrame(animationRequest);
  clock.stop();
  audioContext.suspend();
}

function onResume() {
  isPlaying = true;
  audioContext.resume();

  masterGainNode = audioContext.createGain();
  wetGain = audioContext.createGain();
  dryGain = audioContext.createGain();
  reverbNode = audioContext.createConvolver();
  reverbNode.buffer = decodedIrs[0];
  wetGain.connect(reverbNode);
  reverbNode.connect(masterGainNode);
  dryGain.connect(masterGainNode);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;

  masterGainNode.connect(analyser);

  for (let i = 0; i < sampleGainNodes.length; i += 1) {
    const { reverb, volume } = schedule.samples[i].instrument;
    sampleGainNodes[i] = audioContext.createGain();
    sampleWetNodes[i] = audioContext.createGain();
    sampleDryNodes[i] = audioContext.createGain();
    sampleGainNodes[i].connect(sampleWetNodes[i]);
    sampleGainNodes[i].connect(sampleDryNodes[i]);
    sampleWetNodes[i].connect(wetGain);
    sampleDryNodes[i].connect(dryGain);
    sampleGainNodes[i].gain.value = volume;
    sampleDryNodes[i].gain.value = 1 - reverb;
    sampleWetNodes[i].gain.value = reverb;
  }

  dryGain.gain.value = 1 - globalReverb;
  wetGain.gain.value = globalReverb;

  const compressor = audioContext.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-10, audioContext.currentTime);
  compressor.knee.setValueAtTime(10, audioContext.currentTime);
  compressor.ratio.setValueAtTime(5, audioContext.currentTime);
  compressor.attack.setValueAtTime(0.2, audioContext.currentTime);
  compressor.release.setValueAtTime(0.25, audioContext.currentTime);
  masterGainNode.connect(compressor);
  compressor.connect(audioContext.destination);

  audioContext.resume();
  clock.start();
  clock
    .callbackAtTime(() => {
      handlePlayStep();
    }, 0)
    .repeat(beatLengthInSeconds);
  initializeAnalyzer(analyser);
}

function handleSequencerSwitch() {
  if (!isPlaying) {
    onResume();
  } else {
    masterGainNode.gain.setTargetAtTime(0, audioContext.currentTime, 0.005);
    setTimeout(() => onPause(), 50);
  }
}

function setOptions({ fmBase, fmDepth, fmOn }) {
  modulatorBase = fmBase;
  modulatorDepth = fmDepth;
  fm = fmOn;
}

function getOptions() {
  return {
    fmBase: modulatorBase,
    fmDepth: modulatorDepth,
    fmOn: fm,
  };
}

function handlePlayStep() {
  if (audioContext.state === 'running' && isPlaying) {
    triggerEvent();
    const s = step % stepCount;

    // console.log(`${s}/${stepCount}`);
    for (let count = 0; count < schedule.samples.length; count += 1) {
      if (schedule.samples[count].pattern.length > s) {
        const { on } = schedule.samples[count].pattern[s];
        const { pitchShiftLimit } = schedule.samples[count].instrument;
        if (on) {
          let playbackRate = 1;
          audioTrackSources[count] = audioContext.createBufferSource();
          audioTrackSources[count].buffer = decodedSamples[count];
          audioTrackSources[count].connect(sampleGainNodes[count]);
          if (pitchShiftLimit) {
            playbackRate =
              Math.random() * (1 - pitchShiftLimit) + (1 - pitchShiftLimit);
          }
          audioTrackSources[count].playbackRate.value = playbackRate;

          audioTrackSources[count].start();
          // max, to stop
        }
      }
    }

    for (let count = 0; count < schedule.synths.length; count += 1) {
      if (schedule.synths[count].pattern.length > s) {
        if (schedule.synths[count].pattern[s].on) {
          const osc = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          const panNode = !unsupported
            ? audioContext.createStereoPanner()
            : audioContext.createPanner();

          const { frequency } = schedule.synths[count].pattern[s];

          osc.connect(gainNode);
          gainNode.connect(panNode);
          panNode.connect(dryGain);
          panNode.connect(wetGain);

          // schedule.synths[count].instrument.reverbRatio;

          osc.type = schedule.synths[count].instrument.oscType;
          osc.frequency.value = frequency;
          const pan = frequency > 200 ? getRandomArbitrary(-1, 1) : 0;

          // FM Synthesis
          if (fm) {
            modulatorOsc = audioContext.createOscillator();
            modulatorGainNode = audioContext.createGain();
            modulatorOsc.frequency.value = frequency * modulatorBase;
            modulatorGainNode.gain.value = modulatorDepth;
            modulatorOsc.connect(modulatorGainNode);
            modulatorGainNode.connect(osc.frequency);
          }
          // < FM Synthesis

          if (!unsupported) {
            panNode.pan.setValueAtTime(pan, audioContext.currentTime);
          } else {
            panNode.panningModel = 'equalpower';
            panNode.setPosition(pan, 0, 1 - Math.abs(pan));
          }

          const { volume, envelope, noteLength } = schedule.synths[
            count
          ].instrument;
          const { attack, decay, sustain, release } = envelope;
          const dynamics = (Math.random() * 50 * volume) / 100;
          let humanize = count * 0.02;
          const now = audioContext.currentTime + humanize;
          const sustainLevel = ((volume - dynamics) * sustain) / 100;
          const timeToStartDecay = now + attack * 5;
          const noteLengthInSeconds = noteLength * beatLengthInSeconds;
          const timeToStartRelease =
            now + attack * 5 + decay * 5 + noteLengthInSeconds;

          // gainNode.gain.setTargetAtTime(0, now, 0); not working in safari
          gainNode.gain.value = 0;

          gainNode.gain.setTargetAtTime(volume - dynamics, now, attack);

          gainNode.gain.setTargetAtTime(sustainLevel, timeToStartDecay, decay);

          gainNode.gain.setTargetAtTime(0, timeToStartRelease, release);

          const stopTime =
            noteLength * beatLengthInSeconds +
            attack * 5 +
            decay * 5 +
            release * 5;

          if (fm) {
            modulatorOsc.start(now);
          }
          osc.start(now);

          // numberOfOsc += 1;
          if (fm) {
            // console.log(modulatorOsc.frequency.value, osc.frequency.value);

            modulatorOsc.stop(now + stopTime);
          }
          osc.stop(now + stopTime);
          // setTimeout(() => subtract(), 1500);
        }
      }
    }
    step += 1;
  }
}

function initializeAnalyzer(analyser) {
  const oCanvas = document.getElementById('oscilloscope');
  const sCanvas = document.getElementById('stepper');
  sCanvas.width = sCanvas.offsetWidth;
  sCanvas.height = sCanvas.offsetHeight;
  oCanvas.width = oCanvas.offsetWidth;
  oCanvas.height = oCanvas.offsetHeight;
  const oCanvasCtx = oCanvas.getContext('2d');
  const sCanvasCtx = sCanvas.getContext('2d');
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  let startTime = null;
  let mover = step % stepCount;
  let transition;

  const playingColor = `#f50057`;
  const playingSampleColor = `#3fb5a3`;
  const scheduledColor = `#3f51b5`;
  const playedColor = `rgb(0, 0, 0, ${0.3})`;

  function draw(timestamp) {
    if (!startTime) startTime = timestamp;
    const runtime = timestamp - startTime;
    if (!justReseted) {
      mover = runtime / (beatLengthInSeconds * 1000);
    } else {
      justReseted = false;
      // mover = step % stepCount;
      startTime = timestamp;
    }

    if (mover > schedule.patternLength) {
      mover = step % stepCount;
      startTime = timestamp;
    }

    analyser.getByteTimeDomainData(dataArray);

    oCanvasCtx.clearRect(0, 0, oCanvas.width, oCanvas.height);
    sCanvasCtx.clearRect(0, 0, sCanvas.width, sCanvas.height);

    oCanvasCtx.strokeStyle = playedColor;

    oCanvasCtx.lineWidth = 2;

    oCanvasCtx.beginPath();

    const sliceWidth = (oCanvas.width * 1.0) / bufferLength;

    let x = 0;

    transition = mover > schedule.patternLength - 1 ? true : false;

    // if (transition) {
    //   const progOneToZero = stepCount % mover;
    //   sCanvasCtx.fillStyle = `rgb(245, 0, 87, ${
    //     progOneToZero < 0.5 ? progOneToZero : 1 - progOneToZero
    //   })`;
    //   sCanvasCtx.fillRect(0, 0, sCanvas.width, sCanvas.height);
    // }

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v - 1.0) * 2.0 * oCanvas.height + oCanvas.height / 2;

      if (i === 0) {
        oCanvasCtx.moveTo(x, y);
      } else {
        oCanvasCtx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    oCanvasCtx.lineTo(oCanvas.width, oCanvas.height / 2);
    oCanvasCtx.stroke();

    sCanvasCtx.fillStyle = 'rgb(0, 0, 0, 0.2)';
    sCanvasCtx.textAlign = 'center';
    for (let l = 0; l < schedule.patternLength; l += 1) {
      for (let i = 0; i < schedule.synths.length; i += 1) {
        if (schedule.synths[i].pattern[l].on) {
          if (l === (step % stepCount) - 1) {
            sCanvasCtx.fillStyle = playingColor;
          } else if (l > (step % stepCount) - 1) {
            sCanvasCtx.fillStyle = scheduledColor;
          } else {
            sCanvasCtx.fillStyle = playedColor;
          }
          sCanvasCtx.fillRect(
            sCanvas.width / 2 + l * 10 + 5 - mover * 10,
            i * 10,
            transition ? (stepCount % mover) * 5 : 5,
            transition ? (stepCount % mover) * 5 : 5
          );
        }
      }
      for (let i = 0; i < schedule.samples.length; i += 1) {
        if (schedule.samples[i].pattern[l].on) {
          if (l === (step % stepCount) - 1) {
            sCanvasCtx.fillStyle = playingColor;
          } else if (l > (step % stepCount) - 1) {
            sCanvasCtx.fillStyle = playingSampleColor;
          } else {
            sCanvasCtx.fillStyle = playedColor;
          }
          sCanvasCtx.fillRect(
            sCanvas.width / 2 + l * 10 + 5 - mover * 10,
            i * 10 + schedule.synths.length * 10,
            transition ? (stepCount % mover) * 5 : 5,
            transition ? (stepCount % mover) * 5 : 5
          );
        }
      }
    }
    animationRequest = requestAnimationFrame(draw);
  }
  draw();
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

function getIsPlaying() {
  return isPlaying;
}

const getStep = () => step;
const getStepCount = () => stepCount;

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
  onPause,
  unsupported,
  loadAudioData,
  fm,
  setOptions,
  getOptions,
};
