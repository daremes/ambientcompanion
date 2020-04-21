import React, { useState, useEffect, useContext } from 'react';
import Slider from '@material-ui/core/Slider';
import VolumeDown from '@material-ui/icons/VolumeDown';
import VolumeUp from '@material-ui/icons/VolumeUp';
//
export default function ContinuousSlider({ masterGain, setMasterGain }) {
  const [value, setValue] = useState(masterGain * 100);

  const handleChange = (event, newValue) => {
    const volume = (Math.exp(newValue / 100) - 1) / (Math.E - 1);
    setMasterGain(volume);
    setValue(newValue);
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '24px 0',
      }}
    >
      <VolumeDown style={{ margin: '0 8px' }} />
      <Slider
        value={value}
        onChange={handleChange}
        aria-labelledby='continuous-slider'
      />
      <VolumeUp style={{ margin: '0 8px' }} />
    </div>
  );
}
