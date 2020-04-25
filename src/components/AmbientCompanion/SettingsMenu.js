import React from 'react';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import VolumeSlider from './VolumeSlider';
import InputSwitch from './InputSwitch';
import InputSlider from './InputSlider';

export default function SettingsMenu({
  onClose,
  masterGain,
  setMasterGain,
  handleChangeOptions,
  handleResetOptions,
  opts,
}) {
  return (
    <Wrapper>
      {/* <div>settings/menu</div>
      <button onClick={() => onClose()}>X</button> */}
      <Control>
        {'Master volume'}
        <VolumeSlider masterGain={masterGain} method={setMasterGain} log />
        <ButtonRow>
          <InputSwitch
            method={handleChangeOptions}
            opts={opts}
            target='samplesOn'
            label='Sampled audio'
          />
          <Button onClick={handleResetOptions}>RESET</Button>
        </ButtonRow>
      </Control>
      <Control>
        {`Reverb ${opts.reverb}`}
        <InputSlider
          color='secondary'
          method={handleChangeOptions}
          opts={opts}
          target='reverb'
          max={1}
          min={0}
          step={0.01}
        />
      </Control>
      <Control>
        <InputSwitch
          method={handleChangeOptions}
          opts={opts}
          target='fmOn'
          label='FM synthesis'
        />
      </Control>
      <Control>
        {`FM depth ${opts.fmDepth}`}
        <InputSlider
          color='secondary'
          method={handleChangeOptions}
          opts={opts}
          target='fmDepth'
          max={1000}
          min={0}
          disabled={!opts.fmOn}
        />
      </Control>
      <Control>
        {`FM ratio ${opts.fmBase}`}
        <InputSlider
          color='secondary'
          method={handleChangeOptions}
          opts={opts}
          target='fmBase'
          max={2}
          min={-2}
          step={0.001}
          disabled={!opts.fmOn}
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

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;
