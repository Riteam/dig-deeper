import logo from './logo.svg';
import './assets/css/App.css';

import Board from './Board'
import MessagePanel from './MessagePanel'

import { useState } from 'react';
function App() {
  let [score, setScore] = useState(0)
  function ScoreHandler(newScore) {
    console.log('+' + newScore);
    setScore(prev => prev + newScore)
  }
  return (
    <div className="App">
      <MessagePanel score={score}></MessagePanel>
      <Board onScoreSubmit={ScoreHandler}></Board>
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
    </div >
  );
}

export default App;
