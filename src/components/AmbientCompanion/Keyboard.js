import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { createKeyboard } from './audioCtx';
//
let fx = null;
let toneNumber = 0;
let toneOctave = 0;

export default function Keyboard() {
  const element = useRef(null);

  useEffect(() => {
    // const element = document.getElementById('keyboard');
    const el = element.current;
    const elWidth = el.offsetWidth;
    const elHeight = el.offsetHeight;
    const keyboard = createKeyboard();
    let isPlaying = false;
    let currentNote = null;

    function onMouseDown(e) {
      if (!isPlaying) {
        const xPosition = e.offsetX;
        const yPosition = e.offsetY;
        const remap = function(value, istart, istop, ostart, ostop) {
          return (
            ostart + (ostop - ostart) * ((value - istart) / (istop - istart))
          );
        };
        isPlaying = true;
        const numberOfTones = 5;
        const numberOfOctaves = 5;
        toneNumber = Math.round(remap(xPosition, 0, elWidth, 0, numberOfTones));
        toneOctave = Math.round(
          remap(yPosition, 0, elHeight, numberOfOctaves, 0)
        );
        fx = document.createElement('DIV');
        fx.className = 'fx';
        fx.style.left = `${xPosition - 14}px`;
        fx.style.top = `${yPosition - 14}px`;
        el.appendChild(fx);
        currentNote = keyboard.playNote(toneNumber, toneOctave);
      }
    }
    function onMouseUp(e) {
      //   var xPosition = e.offsetX;
      //   var yPosition = e.offsetY;
      if (isPlaying) {
        keyboard.releaseNote(currentNote.osc, currentNote.gainNode);
        fx.remove();
        isPlaying = false;
      }
    }
    el.addEventListener('touchstart', onMouseDown, { passive: true });
    el.addEventListener('touchend', onMouseUp, { passive: true });
    el.addEventListener('touchmove', onMouseUp, { passive: true });
    el.addEventListener('mousedown', onMouseDown, { passive: true });
    el.addEventListener('mouseup', onMouseUp, { passive: true });
    el.addEventListener('mouseleave', onMouseUp, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onMouseDown);
      el.removeEventListener('touchend', onMouseUp);
      el.removeEventListener('touchmove', onMouseUp);
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mouseleave', onMouseUp);
    };
  }, []);

  return <Pad ref={element} />;
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
