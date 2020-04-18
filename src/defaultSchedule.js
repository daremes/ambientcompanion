import { note, interval, transpose, distance } from 'tonal';
import soundFiles from './soundFiles';

export function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

const scale = ['d', 'e', 'f', 'g', 'a', 'a#', 'c'];

function getRandomTone(octaveMin, octaveMax) {
  const octave = getRandomInt(
    octaveMin ? octaveMin : 1,
    octaveMax ? octaveMax : 7
  );
  const chooseNote = `${scale[getRandomInt(0, 7)]}${octave}`;
  return note(chooseNote).freq;
}

export function getPattern(patternLength, probability) {
  const arr = [];
  for (let i = 0; i < patternLength; i += 1) {
    const newStep = {
      on: Math.random() >= 0.75,
      frequency: getRandomTone(),
    };
    arr.push(newStep);
  }
  return arr;
}

export function getSamplesPattern(patternLength, m) {
  const arr = [];
  const { mode, factor, time } = m;
  for (let i = 0; i < patternLength; i += 1) {
    let on = false;
    const frequency = getRandomTone();
    if (mode === 'random') {
      on = Math.random() >= 1 - factor / 100;
    }
    if (mode === 'fixed') {
      on = i % time === 0;
    }
    const newStep = {
      on,
      frequency,
    };
    arr.push(newStep);
  }
  return arr;
}

export function getSynths(patternLength, tempo, synthsCount) {
  const arr = [];
  for (let i = 0; i < synthsCount; i += 1) {
    arr.push(getSynth(patternLength, tempo));
  }
  return arr;
}

export function getSynth(patternLength, probability) {
  const obj = {
    instrument: {
      voices: 1,
      oscType: 'sine',
      muted: 0,
      volume: 0.7,
      noteLength: 0.25,
      envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 80,
        release: 0.1,
      },
    },
    pattern: getPattern(patternLength),
  };
  return obj;
}

export function generateSchedule(patternLength, tempo, synthsCount) {
  if (!patternLength) {
    patternLength = 32;
  }
  if (!tempo) {
    tempo = 120;
  }
  if (!synthsCount) {
    synthsCount = 4;
  }
  if (patternLength % 2 !== 0) {
    patternLength = patternLength + 1;
  }
  return {
    patternLength,
    tempo,
    synths: getSynths(patternLength, tempo, synthsCount),
    samples: [
      {
        instrument: {
          track: 0,
          name: soundFiles.samples[0].name,
          volume: 1,
          reverb: 0.1,
          pitchShiftLimit: 0.1,
          muted: 0,
        },
        pattern: getSamplesPattern(patternLength, {
          mode: 'fixed',
          time: 2,
          withRandomFactor: 25,
        }),
      },
      {
        instrument: {
          track: 1,
          name: soundFiles.samples[1].name,
          volume: 0.5,
          reverb: 0.3,
          pitchShiftLimit: 0.3,
          muted: 0,
        },
        pattern: getSamplesPattern(patternLength, {
          mode: 'random',
          factor: 15,
        }),
      },
      {
        instrument: {
          track: 2,
          name: soundFiles.samples[2].name,
          volume: 0.5,
          reverb: 0.3,
          pitchShiftLimit: 0,
          muted: 0,
        },
        pattern: getSamplesPattern(patternLength, {
          mode: 'random',
          factor: 10,
        }),
      },
      {
        instrument: {
          track: 3,
          name: soundFiles.samples[3].name,
          volume: 0.5,
          reverb: 0.3,
          pitchShiftLimit: 0,
          muted: 0,
        },
        pattern: getSamplesPattern(patternLength, {
          mode: 'random',
          factor: 5,
        }),
      },
      {
        instrument: {
          track: 4,
          name: soundFiles.samples[4].name,
          volume: 0.5,
          reverb: 1,
          pitchShiftLimit: 0,
          muted: 0,
        },
        pattern: getSamplesPattern(patternLength, {
          mode: 'random',
          factor: 2,
        }),
      },
    ],
  };
}

const defaultSchedule = generateSchedule();

export default defaultSchedule;
