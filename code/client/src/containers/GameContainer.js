import React,{useEffect, useState} from 'react';
import GameGrid from '../components/GameGrid'
import HandList from '../components/HandList';
import SideBar from '../components/SideBar';
import Splash from './SplashContainer';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd'
import { io } from 'socket.io-client'

import {getData} from '../services/FetchService'
import {handleOnDragEnd, setUpPlayers} from '../services/GameService'

function GameContainer({playerNames, gameType, roomID}) {
  
  const [data, setData] = useState({});
  const [clickToggle, setClickToggle] = useState(false)
  const [gameState, setGameState] = useState(false)
  const [playerHand, setPlayerHand] = useState([])
  const [deck, setDeck] = useState([])
  const [players, setPlayers] = useState([])
  const [gridState, setGridState] = useState([
      [ {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
      [ {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}], 
      [ {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}], 
      [ {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}], 
      [ {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}], 
      [ {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}], 
      [ {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}]    
  ])

  const socket = io('http://localhost:5000');

  useEffect(()=>{
    
    socket.on('connect', ()=>console.log(socket.id))
    socket.on('connect_error', ()=>{
      setTimeout(()=>socket.connect(),5000)
    })
  },[])

  useEffect (() => {
    getData()
    .then(data => setData(data[0]));
    const data = setUpPlayers(playerNames);
    setPlayers(data)
  },[])
  
  

  useEffect(() => {
    if(!players) return 
    
  }, [players])
  
  useEffect(() => {
    if(gameState === true && Object.keys(data).length !== 0){
    buildDeck();
    placeStartCards()
    }
  }, [gameState])

  const buildDeck = () => {
    const deck = []
    const cardData = Object.values(data.cards.tile_cards)
    // Might need to custimise this to reflect true numbers of individual cards!
    for (let step = 0; step < 5; step++){ 
      for (let card of cardData)
        deck.push(Object.assign({}, card))
    }
    // Shuffle deck
    shuffleArray(deck);
    setDeck(deck);
    socket.emit('update-deck', deck);
  }

  const shuffleArray = (array) => {
    let currentIndex = array.length,  randomIndex
    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    setDeck(deck)
    
    return array
  }

  const placeStartCards = () => {
    const tempArr = gridState
    let startCardsArray = []
    startCardsArray.push(Object.assign({}, data.cards.gold_card))
    startCardsArray.push(Object.assign({}, data.cards.coal_card))
    startCardsArray.push(Object.assign({}, data.cards.coal_card))
    shuffleArray(startCardsArray)
    tempArr[3].splice(1, 1, data.cards.tile_cards[7])
    tempArr[1].splice(9, 1, startCardsArray[0])
    tempArr[3].splice(9, 1, startCardsArray[1])
    tempArr[5].splice(9, 1, startCardsArray[2])
    setGridState(tempArr)
    socket.emit('update-grid-state', gridState)
  }

  const dealHand = () => {
    let tempArr = deck
    const hand = tempArr.splice(0,5)
    setPlayerHand(hand)
    setDeck(tempArr)
  }

  const handleStartClick = () => {
    if(!data) return
    dealHand();
    setGameState(true);
    setClickToggle(!clickToggle);

  }

  const reorderHand = (hand) => {
    setPlayerHand(hand)
  }

  const gridNeighbours = (row, col) => {
    let neighbours = []
    row = Number(row)
    col = Number(col)
    if (gridState[row - 1] !== undefined) {
      gridState[row - 1][col] !== undefined ? neighbours.push(gridState[row - 1][col]) : neighbours.push(null)
    } else {
      neighbours.push(null)
    }
    gridState[row][col + 1] !== undefined ? neighbours.push(gridState[row][col + 1]) : neighbours.push(null)
    if (gridState[row + 1] !== undefined) {
      gridState[row + 1][col] !== undefined ? neighbours.push(gridState[row + 1][col]) : neighbours.push(null)
    } else {
      neighbours.push(null)
    }
    gridState[row][col- 1] !== undefined ? neighbours.push(gridState[row][col - 1]) : neighbours.push(null)
    // [top, right, bottom, left]
    return neighbours
    }
  
    const legalMove = (cardSelected, gridRow, gridCol) => {
      if (Object.keys(gridState[gridRow][gridCol]).length !== 0) return console.log("Card already placed here!")
      return console.log(gridNeighbours(gridRow, gridCol))
      // else if ({
      //   const neighbours = gridNeighbours(gridRow, gridCol)
      //  for (let i = 0; i < neighbours(gridRow, gridCol).length; i++) {
      //     if (neighbours(gridRow, gridCol)[i] <= 0) {
      //         result = false;
      //         break;
      // }){return false}
  
  
  
  
      // else return true
    } 

  function handleOnDragEnd(result){
    if (!result.destination) return
    else if (result.destination.droppableId === "discard"){
      const items = Array.from(playerHand)
      items.splice(result.source.index, 1)
      reorderHand(items) 
      return
    }
    else if (result.destination.droppableId === "cards"){
      const items = Array.from(playerHand)
      const [reorderedItem] = items.splice(result.source.index, 1)
      items.splice(result.destination.index, 0, reorderedItem)
      reorderHand(items)
      return
    }
    else if (result.destination.droppableId.substring(0, 4) === "grid"){
      const cardBeingPickedUp = playerHand[result.source.index]
      const row = result.destination.droppableId.substring(5,6)
      const col = result.destination.droppableId.substring(7)
      if (legalMove(cardBeingPickedUp, row, col) === true){
        const tempArr = gridState
        tempArr[row].splice([col], 1, playerHand[result.source.index])
        setGridState(tempArr)
        socket.emit('update-grid-state', gridState)
        //Discard from hand
        const items = Array.from(playerHand)
        items.splice(result.source.index, 1)
        reorderHand(items)
      } 
      
      return
    }
  }

  const handleOnClickInvert = (indexInHand) => {
    const tempArr = playerHand
    let card = tempArr[indexInHand]
    card.inverted = !card.inverted
    tempArr.splice(indexInHand, 1, card)
    setPlayerHand(tempArr)
    setClickToggle(!clickToggle);
  }

  socket.on('receive-grid-state', gridState => {
    setGridState(gridState)
  })
  socket.on('receive-deck', deck => {
    setDeck(deck)
  })

  return (
    <div className= "game-container">

      <DragDropContext onDragEnd= {handleOnDragEnd}>

        <GameGrid  gridState={gridState}/>   
        <HandList cards={playerHand} reorderHand = {reorderHand} handleOnClickInvert = {handleOnClickInvert}/> 
        <SideBar deck={deck} startClick={handleStartClick} players={players}/>

      </DragDropContext>
      
    </div>
  )
}

export default GameContainer;

