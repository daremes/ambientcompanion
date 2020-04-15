import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import './fonts.css';
//
import Sequencer from './components/Sequencer';

const theme = createMuiTheme({});

function App() {
  return (
    <React.Fragment>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <div style={{ display: 'flex', margin: '8px' }}>
          <Sequencer initGain={0.2} />
        </div>
      </ThemeProvider>
    </React.Fragment>
  );
}

export default App;
