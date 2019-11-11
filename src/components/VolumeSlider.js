import React, { useState, useEffect, useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import Card from '@material-ui/core/Card';
import VolumeDown from '@material-ui/icons/VolumeDown';
import VolumeUp from '@material-ui/icons/VolumeUp';
//
import audioCtx from '../audioCtx';
import changeNodeVolume from '../changeNodeVolume';

const useStyles = makeStyles({
  root: {
    padding: '12px 12px',
  },
  title: {
    fontSize: '12px',
  },
});

export default function ContinuousSlider({
  gainNode,
  initGain,
  disabled,
  name,
}) {
  const { getAudioContext } = useContext(audioCtx);
  const classes = useStyles();
  const [value, setValue] = useState(initGain * 100);

  useEffect(() => {
    setValue(initGain * 100);
    if (gainNode) {
      changeNodeVolume(gainNode, getAudioContext(), initGain);
    }
  }, [disabled, gainNode, getAudioContext, initGain]);

  const handleChange = (event, newValue) => {
    const volume = newValue / 100;
    changeNodeVolume(gainNode, getAudioContext(), volume);
    setValue(newValue);
  };

  return (
    <Card style={{ marginTop: '24px' }}>
      <div className={classes.root}>
        <Typography
          id="continuous-slider"
          className={classes.title}
          gutterBottom
        >
          {name} {value / 100}
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <VolumeDown />
          </Grid>
          <Grid item xs>
            <Slider
              disabled={disabled}
              value={value}
              onChange={handleChange}
              aria-labelledby="continuous-slider"
            />
          </Grid>
          <Grid item>
            <VolumeUp />
          </Grid>
        </Grid>
      </div>
    </Card>
  );
}
