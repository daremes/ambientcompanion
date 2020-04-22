import React, { useState } from 'react';
import Slider from '@material-ui/core/Slider';
//
export default function InputSlider({ method, opts, target, min, max, step }) {
  const [value, setValue] = useState(opts[target]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    if (method) {
      method(newValue, target);
    }
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
        min={min}
        max={max}
        step={step ? step : 1}
      />
    </div>
  );
}
