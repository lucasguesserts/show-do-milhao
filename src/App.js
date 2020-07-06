import React, { useState } from 'react';
import Home from './containers/Home/Home';
import Game from './containers/Game/Game';
import './App.css';

const App = () => {
  // States
  const [gameStarted, setGameStarted] = useState(false);

  // Render
  return gameStarted ? (
    <Game setGameStarted={setGameStarted} />
  ) : (
    <Home setGameStarted={setGameStarted} />
  );
};

export default App;
