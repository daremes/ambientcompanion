import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

export default function InputSwitch({ method, opts, target }) {
  const [checked, setChecked] = useState(opts[target]);

  const handleChange = event => {
    const on = !checked;
    setChecked(on);
    if (method) {
      method(on, target);
    }
  };

  return (
    <FormControlLabel
      control={
        <Switch checked={checked} onChange={handleChange} name='checked' />
      }
      label={`FM: ${checked ? 'on' : 'off'}`}
    />
  );
}
