import React, {useState, useEffect} from 'react';
import './App.css';
import './css/component_css/GameGrid.css'
import './css/component_css/GameContainer.css'
import './css/component_css/Card.css'
import './css/component_css/GridItems.css'
import './css/component_css/HandList.css'
import './css/component_css/SideBar.css'
import './css/component_css/SplashContainer.css'
import {getCPUPlayers} from './services/GameService'
import SplashContainer from './containers/SplashContainer';
import GameContainer from './containers/GameContainer';
import { io } from 'socket.io-client'


function App() {

  const [enterGame, setEnterGame] = useState(false);
  const [player, setPlayer] = useState(null);
  const [playerNames, setPlayerNames] = useState(null);
  const [gameType, setGameType] = useState(null);
  const [roomID, setRoomID] = useState(null)


  const socket = io('http://localhost:5000', {
    transports: ["websocket", "polling"],
    rememberUpgrade: true,
    maxHttpBufferSize: 1e8,

  });


  const handleEnterClick = (player, game, room) => {
      const players = getCPUPlayers(player);
      setPlayer(player.replace(/\s/g, ''))
      setPlayerNames(players);
      setGameType(game);
      setRoomID(room);
      setEnterGame(true);
  }

  const handleJoinRoomClick = (player, game, room) => {
    console.log(game)
    if (room == roomID) {
      socket.emit('join-room', roomID)
      const players = getCPUPlayers(player);
      setPlayer(player.replace(/\s/g, ''))
      setPlayerNames(players);
      setGameType(game);
      setEnterGame(true);
    }
  }

  if(!enterGame){
    return <SplashContainer handleEnterClick={handleEnterClick} handleJoinRoomClick={handleJoinRoomClick} />
  } else {
  return <GameContainer player={player} playerNames={playerNames} gameType={gameType} roomID={roomID}/>
  }
}

export default App;
