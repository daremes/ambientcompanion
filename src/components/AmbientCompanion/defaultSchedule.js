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
      on: Math.random() >= 0.8,
      frequency: getRandomTone(),
    };
    arr.push(newStep);
  }
  return arr;
}

export function getSamplesPattern(patternLength, m) {
  const arr = [];
  const { mode, factor, time, withRandomFactor } = m;
  for (let i = 0; i < patternLength; i += 1) {
    let on = false;
    const frequency = getRandomTone();
    if (mode === 'random') {
      on = Math.random() >= 1 - factor / 100;
    }
    if (mode === 'fixed') {
      on = i % time === 0;
      if (withRandomFactor && on) {
        on = Math.random() >= 1 - withRandomFactor / 100;
      }
    }
    const newStep = {
      on,
      frequency,
    };
    arr.push(newStep);
  }
  return arr;
}

export function getSynths(patternLength, synthsCount) {
  const arr = [];
  for (let i = 0; i < synthsCount; i += 1) {
    const synthType = Math.random() >= 0.9 ? 'triangle' : 'sine';
    arr.push(getSynth(patternLength, synthType));
  }
  return arr;
}

export function getSynth(patternLength, synthType) {
  const obj = {
    instrument: {
      voices: 1,
      oscType: synthType ? synthType : 'sine',
      muted: 0,
      volume: 0.3,
      noteLength: 0.25,
      envelope: {
        attack: 0.005,
        decay: 0.01,
        sustain: 70,
        release: 0.3,
      },
    },
    pattern: getPattern(patternLength),
  };
  return obj;
}

export function generateSchedule(
  patternLength,
  tempo,
  synthsCount,
  lessBusyFactor
) {
  if (!patternLength) {
    patternLength = 32;
  }
  if (!tempo) {
    tempo = 124;
  }
  if (!synthsCount) {
    synthsCount = 5;
  }
  if (patternLength % 2 !== 0) {
    patternLength = patternLength + 1;
  }

  return {
    patternLength,
    tempo,
    synths: getSynths(patternLength, synthsCount),
    samples: [
      {
        instrument: {
          track: 0,
          name: soundFiles.samples[0].name,
          volume: 1,
          reverb: 0.1,
          pitchShiftLimit: 0,
          muted: 0,
        },
        pattern: getSamplesPattern(patternLength, {
          mode: 'fixed',
          time: 2,
          withRandomFactor: 80,
        }),
      },
      {
        instrument: {
          track: 1,
          name: soundFiles.samples[1].name,
          volume: 0.3,
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
          factor: 1,
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
          factor: 1,
        }),
      },
      {
        instrument: {
          track: 4,
          name: soundFiles.samples[4].name,
          volume: 0.5,
          reverb: 0.3,
          pitchShiftLimit: 0,
          muted: 0,
        },
        pattern: getSamplesPattern(patternLength, {
          mode: 'random',
          factor: 3,
        }),
      },
    ],
  };
}

const defaultSchedule = generateSchedule();

export default defaultSchedule;