import logo from './logo.svg';
import './assets/css/App.css';

import Board from './Board'
import messagePanel from './flip'

import { useState } from 'react';
function App() {
  // let [score, setScore] = useState(0)
  // function ScoreHandler(newScore) {
  //   setScore(prev => prev + newScore)
  // }
  return (
    <div className="App">
      {/* <messagePanel score={score}></messagePanel> */}
      <Board></Board>
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
