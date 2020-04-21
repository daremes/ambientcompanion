import React from 'react';
import {
  Route,
  BrowserRouter as Router,
  Link,
  // useRouteMatch,
} from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import styled from 'styled-components';
import './fonts.css';
//
import NavBar from './components/NavBar';
import Home from './components/Home';
import AmbientCompanion from './components/AmbientCompanion';

const theme = createMuiTheme({});

function App() {
  return (
    <Router>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <NavBar />
        <DefaultLayout>
          <Route exact path='/'>
            <Home />
          </Route>
          <Route path='/ambientcompanion'>
            <AmbientCompanion />
          </Route>
        </DefaultLayout>
      </ThemeProvider>
    </Router>
  );
}

export default App;

const DefaultLayout = styled.div`
  display: flex;
  margin: 16px;
  justify-content: center;
  @media (max-width: 768px) {
    margin: 4px 4px;
  }
`;
