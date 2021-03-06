import React, { useState } from 'react';
import Slider from '@material-ui/core/Slider';
import VolumeDown from '@material-ui/icons/VolumeDown';
import VolumeUp from '@material-ui/icons/VolumeUp';
import FormControlLabel from '@material-ui/core/FormControlLabel';

//
export default function ContinuousSlider({ masterGain, method }) {
  const [value, setValue] = useState(masterGain * 100);

  const handleChange = (event, newValue) => {
    const volume = (Math.exp(newValue / 100) - 1) / (Math.E - 1);
    if (method) {
      method(volume);
    }
    setValue(newValue);
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexGrow: 1,
      }}
    >
      <Slider
        value={value}
        onChange={handleChange}
        aria-labelledby='continuous-slider'
      />
    </div>
  );
}
