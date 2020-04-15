import { note, interval, transpose, distance } from 'tonal';

const scale = ['d', 'e', 'f', 'g', 'a', 'a#', 'c'];

function getRandomTone() {
  const octave = getRandomInt(2, 8);
  const chooseNote = `${scale[getRandomInt(0, 7)]}${octave}`;
  return note(chooseNote).freq;
}

export function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

export function getPattern(patternLength) {
  const arr = [];
  for (let i = 0; i < patternLength; i += 1) {
    const newStep = {
      on: Math.random() >= 0.75,
      frequency: getRandomTone(),
    };
    arr.push(newStep);
    // arr.fill({ on: Math.random() >= 0.5, frequency: 220 });
  }
  return arr;
}

export function generateSchedule(patternLength, tempo) {
  if (!patternLength) {
    patternLength = 64;
  }
  if (!tempo) {
    tempo = 120;
  }
  return {
    patternLength: patternLength,
    tempo: tempo,
    synths: [
      {
        instrument: {
          voices: 1,
          oscType: 'sine',
          envelope: {
            attack: 0.1,
            decay: 0.2,
            sustain: 0.5,
            release: 0.1,
          },
        },
        pattern: getPattern(patternLength),
      },
    ],
  };
}

const defaultSchedule = generateSchedule();
export default defaultSchedule;
