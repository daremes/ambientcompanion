import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { createKeyboard } from './audioCtx';
//
let fx = null;
let toneNumber = 0;
let toneOctave = 0;

export default function Keyboard() {
  const element = useRef(null);
  const [keyboardSize, setKeyboardSize] = useState({ x: 0, y: 0 });

  const createMatrix = () => {
    let matrix = [];
    const xOffset = keyboardSize.x / 6;
    const yOffset = keyboardSize.y / 6;

    for (let i = 1; i < 7; i++) {
      matrix.push(
        <div
          key={`horizontal-${i}`}
          style={{
            position: 'absolute',
            height: '1px',
            border: '1px solid rgba(0,0,0,0.1)',
            width: '100%',
            top: `${i * yOffset}px`,
            zIndex: '-1',
            pointerEvents: 'none',
          }}
        />
      );
    }
    for (let j = 1; j < 7; j += 1) {
      matrix.push(
        <div
          key={`vertical-${j}`}
          style={{
            position: 'absolute',
            height: '100%',
            border: '1px solid rgba(0,0,0,0.1)',
            width: '1px',
            left: `${j * xOffset}px`,
            zIndex: '-1',
            pointerEvents: 'none',
          }}
        />
      );
    }

    return matrix;
  };

  useEffect(() => {
    // const element = document.getElementById('keyboard');
    const el = element.current;
    const elWidth = el.offsetWidth;
    const elHeight = el.offsetHeight;
    setKeyboardSize({ x: elWidth, y: elHeight });
    const keyboard = createKeyboard();
    let isPlaying = false;
    let currentNote = null;
    const rect = el.getBoundingClientRect();

    function onMouseDown(e) {
      e.preventDefault();
      if (!isPlaying) {
        const xPosition = e.touches
          ? e.touches[0].clientX - rect.left
          : e.offsetX;
        const yPosition = e.touches
          ? e.touches[0].clientY - rect.top
          : e.offsetY;

        const remap = function(value, istart, istop, ostart, ostop) {
          return (
            ostart + (ostop - ostart) * ((value - istart) / (istop - istart))
          );
        };
        isPlaying = true;
        const numberOfTones = 6;
        const numberOfOctaves = 6;
        toneNumber = Math.floor(remap(xPosition, 0, elWidth, 0, numberOfTones));
        toneOctave = Math.floor(
          remap(yPosition, 0, elHeight, numberOfOctaves, 0)
        );
        console.log(toneOctave);

        fx = document.createElement('DIV');
        fx.className = 'fx';
        fx.style.left = `${xPosition - 14}px`;
        fx.style.top = `${yPosition - 14}px`;
        el.appendChild(fx);
        currentNote = keyboard.playNote(toneNumber, toneOctave);
      }
    }
    function onMouseUp(e) {
      e.preventDefault();

      //   var xPosition = e.offsetX;
      //   var yPosition = e.offsetY;
      if (isPlaying) {
        keyboard.releaseNote(currentNote.osc, currentNote.gainNode);
        fx.remove();
        isPlaying = false;
      }
    }
    el.addEventListener('touchstart', onMouseDown);
    el.addEventListener('touchend', onMouseUp);
    el.addEventListener('touchmove', onMouseUp);
    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mouseleave', onMouseUp);
    return () => {
      el.removeEventListener('touchstart', onMouseDown);
      el.removeEventListener('touchend', onMouseUp);
      el.removeEventListener('touchmove', onMouseUp);
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mouseleave', onMouseUp);
    };
  }, []);

  return <Pad ref={element}>{createMatrix()}</Pad>;
}

const Pad = styled.div`
  position: absolute;
  color: #fafafa;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 50;
  animation: fadeIn ease 1s;
  cursor: pointer;
  .fx {
    width: 28px;
    height: 28px;
    background: #333;
    position: absolute;
    border-radius: 50%;
    animation: fxA ease 1s;
    opacity: 0.3;
  }
  @keyframes fxA {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.3;
    }
  }
  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;
