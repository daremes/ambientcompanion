import React from 'react';
import styled from 'styled-components';
import VolumeSlider from './VolumeSlider';

export default function SettingsMenu({ onClose, masterGain, setMasterGain }) {
  return (
    <>
      {/* <div>settings/menu</div>
      <button onClick={() => onClose()}>X</button> */}
      <VolumeSlider masterGain={masterGain} setMasterGain={setMasterGain} />
    </>
  );
}
