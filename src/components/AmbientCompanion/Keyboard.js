import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { createKeyboard } from './audioCtx';
//
let fx = null;
let toneNumber = 0;
let toneOctave = 0;

export default function Keyboard() {
  useEffect(() => {
    const element = document.getElementById('keyboard');
    const elWidth = element.offsetWidth;
    const elHeight = element.offsetHeight;
    const keyboard = createKeyboard();
    let isPlaying = false;
    let currentNote = null;

    function onMouseDown(e) {
      const xPosition = e.offsetX;
      const yPosition = e.offsetY;
      const remap = function(value, istart, istop, ostart, ostop) {
        return (
          ostart + (ostop - ostart) * ((value - istart) / (istop - istart))
        );
      };
      isPlaying = true;
      const numberOfTones = 7;
      const numberOfOctaves = 6;
      toneNumber = Math.round(remap(xPosition, 0, elWidth, 0, numberOfTones));
      toneOctave = Math.round(
        remap(yPosition, 0, elHeight, numberOfOctaves, 0)
      );
      fx = document.createElement('DIV');
      fx.className = 'fx';
      fx.style.left = `${xPosition - 14}px`;
      fx.style.top = `${yPosition - 14}px`;
      element.appendChild(fx);
      currentNote = keyboard.playNote(toneNumber, toneOctave);
    }
    function onMouseUp(e) {
      //   var xPosition = e.offsetX;
      //   var yPosition = e.offsetY;
      if (isPlaying) {
        keyboard.releaseNote(currentNote);
        fx.remove();
        isPlaying = false;
      }
    }

    element.addEventListener('mousedown', onMouseDown);
    element.addEventListener('mouseup', onMouseUp);
    element.addEventListener('mouseleave', onMouseUp);
    element.addEventListener('touchstart', onMouseDown);
    element.addEventListener('touchend', onMouseUp);
    element.addEventListener('touchmove', onMouseUp);
  }, []);

  return <Pad id='keyboard' />;
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
