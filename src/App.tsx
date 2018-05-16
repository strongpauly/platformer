import * as React from 'react';
import {Provider} from 'react-redux';
import './App.css';
import Game from './components/Game';
import store from './state/store';

class App extends React.Component {
  public render() {
    return (
      <Provider store={store}>
          <Game />
      </Provider>
    );
  }
}

export default App;
