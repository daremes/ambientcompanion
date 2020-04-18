import * as WAAClock from './WAAClock';
import changeNodeVolume from './changeNodeVolume';
import defaultSchedule, {
  generateSchedule,
  getRandomArbitrary,
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
  irSources[index] = require(`./sounds/${ir.fileName}`);
});
samples.forEach((sample, index) => {
  sampleSources[index] = require(`./sounds/${sample.fileName}`);
});

const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const unsupported = iOS || safari;

let step = 0;
let schedule = defaultSchedule;
let stepCount = defaultSchedule.patternLength;
let tempo = defaultSchedule.tempo;
let beatLengthInSeconds = 1 / (tempo / 60);
console.log(beatLengthInSeconds);
let masterGainNode = undefined;
let panNode = undefined;
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioContext = new AudioContext();
audioContext.suspend();
let clock = new WAAClock(audioContext);
let reverbNode = undefined;
let isPlaying = false;
let wetGain = undefined;
let dryGain = undefined;
let globalReverb = 0.35;
let stepperEvent = undefined;

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
  // audioContext = !audioContext ? new AudioContext() : audioContext;
  // clock = !clock ? new WAAClock(audioContext) : clock;
  masterGainNode = audioContext.createGain();
  // sampleGainNode = audioContext.createGain();
  wetGain = audioContext.createGain();
  dryGain = audioContext.createGain();
  reverbNode = audioContext.createConvolver();
  reverbNode.buffer = decodedIrs[0];
  wetGain.connect(reverbNode);
  reverbNode.connect(masterGainNode);
  dryGain.connect(masterGainNode);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  const samplesAuxGain = audioContext.createGain();
  samplesAuxGain.connect(dryGain);

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
  compressor.attack.setValueAtTime(0.1, audioContext.currentTime);
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
          panNode = !unsupported
            ? audioContext.createStereoPanner()
            : audioContext.createPanner();
          const { frequency } = schedule.synths[count].pattern[s];

          osc.connect(gainNode);
          gainNode.connect(panNode);
          panNode.connect(dryGain);
          panNode.connect(wetGain);

          // schedule.synths[count].instrument.reverbRatio;

          osc.type = schedule.synths[count].instrument.oscType;
          osc.frequency.setValueAtTime(frequency, audioContext.currentTime);

          if (!unsupported) {
            panNode.pan.setValueAtTime(
              frequency > 120 ? getRandomArbitrary(-1, 1) : 0,
              audioContext.currentTime
            );
            // panNode.pan.setTargetAtTime(
            //   getRandomArbitrary(-1, 1),
            //   audioContext.currentTime + 0.1,
            //   0.5
            // );
          } else {
            const pan = frequency > 200 ? getRandomArbitrary(-1, 1) : 0;
            panNode.panningModel = 'equalpower';
            panNode.setPosition(pan, 0, 1 - Math.abs(pan));
          }

          const { volume, envelope, noteLength } = schedule.synths[
            count
          ].instrument;
          const { attack, decay, sustain, release } = envelope;
          const dynamics = (Math.random() * (50 * volume)) / 100;
          const now = audioContext.currentTime;

          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.setTargetAtTime(volume - dynamics, now, attack);
          gainNode.gain.setTargetAtTime(
            (volume - dynamics * sustain) / 100,
            now + attack,
            decay
          );
          // gainNode.gain.setValueAtTime(
          //   (volume * sustain) / 100,
          //   now + attack + decay
          // );
          gainNode.gain.setTargetAtTime(
            0,
            now + attack + decay + noteLength * beatLengthInSeconds,
            release
          );

          osc.start();
          numberOfOsc += 1;
          osc.stop(audioContext.currentTime + 2.5);
          setTimeout(() => subtract(), 2000);

          // osc.onended = () => osc.disconnect();
        }
      }
    }
    step += 1;
  }
}

function initializeAnalyzer(analyser) {
  const canvas = document.getElementById('oscilloscope');
  const canvasCtx = canvas.getContext('2d');
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    animationRequest = requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    canvasCtx.strokeStyle = 'rgb(0, 0, 0, 0.3';

    canvasCtx.lineWidth = 2;

    canvasCtx.beginPath();

    const sliceWidth = (canvas.width * 1.0) / bufferLength;

    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v - 1.0) * 2.0 * canvas.height + canvas.height / 2;
      // console.log(v);

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
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
