import React from 'react';
import styled from 'styled-components';
import VolumeSlider from './VolumeSlider';
import InputSwitch from './InputSwitch';
import InputSlider from './InputSlider';

export default function SettingsMenu({
  onClose,
  masterGain,
  setMasterGain,
  handleChangeOptions,
  opts,
}) {
  return (
    <Wrapper>
      {/* <div>settings/menu</div>
      <button onClick={() => onClose()}>X</button> */}
      <Control>
        {'Master volume'}
        <VolumeSlider masterGain={masterGain} method={setMasterGain} log />
      </Control>
      <Control>
        <InputSwitch method={handleChangeOptions} opts={opts} target='fmOn' />
      </Control>
      <Control>
        {`FM Depth: ${opts.fmDepth}`}
        <InputSlider
          color='secondary'
          method={handleChangeOptions}
          opts={opts}
          target='fmDepth'
          max={1000}
          min={0}
        />
      </Control>
      <Control>
        {`FM Detune: ${opts.fmBase}`}
        <InputSlider
          color='secondary'
          method={handleChangeOptions}
          opts={opts}
          target='fmBase'
          max={2}
          min={0}
          step={0.005}
        />
      </Control>
    </Wrapper>
  );
}
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Control = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 12px;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
`;
