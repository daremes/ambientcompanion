import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { makeStyles } from '@material-ui/core/styles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

const useStyles = makeStyles({
  label: {
    fontSize: '14px',
  },
});

export default function InputSwitch({ method, opts, target, label }) {
  const classes = useStyles();
  const [checked, setChecked] = useState(opts[target]);

  useEffect(() => {
    setChecked(opts[target]);
  }, [opts, target]);

  const handleChange = event => {
    const on = !checked;
    setChecked(on);
    if (method) {
      method(on, target);
    }
  };

  return (
    <FormControlLabel
      classes={{
        label: classes.label, // class name, e.g. `classes-nesting-label-x`
      }}
      control={
        <Switch checked={checked} onChange={handleChange} name='checked' />
      }
      label={`${label} ${checked ? 'on' : 'off'}`}
    />
  );
}
