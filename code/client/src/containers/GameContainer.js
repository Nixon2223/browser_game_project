import React,{useEffect, useState} from 'react';
import GameGrid from '../components/GameGrid'
import HandList from '../components/HandList';
import SideBar from '../components/SideBar';
import Loading from '../components/Loading'
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd'
import { io } from 'socket.io-client'

import {getData} from '../services/FetchService'
import {setUpPlayers} from '../services/GameService'
import SplashContainer from './SplashContainer';

function GameContainer({player, playerObjects, gameType, roomID}) {
  
  const [data, setData] = useState({});
  const [buttonToggle, setButtonToggle] = useState(false)
  const [clickToggle, setClickToggle] = useState(false)
  const [gameState, setGameState] = useState(false)
  const [playerHand, setPlayerHand] = useState([])
  const [deck, setDeck] = useState([])
  const [players, setPlayers] = useState([])
  const [playerTurns, setPlayerTurns] = useState([])
  const [playerTurn, setPlayerTurn] = useState({})
  const [turnToggle, setTurnToggle] = useState(true)
  const [gridState, setGridState] = useState([
      [ {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
      [ {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}], 
      [ {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}], 
      [ {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}], 
      [ {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}], 
      [ {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}], 
      [ {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}]    
  ])

  const socket = io('http://localhost:5000', {
    transports: ["websocket", "polling"],
    rememberUpgrade: true,
    maxHttpBufferSize: 1e8,

  });

  useEffect(() => {
    socket.on('connect', ()=>console.log(socket.id))
    socket.on('connect_error', ()=>{
      setTimeout(()=>socket.connect(),5000)
    })
    return () => socket.off('connect')
}, [])

  useEffect (() => {
    getData()
    .then(data => setData(data[0]));

    setPlayerTurns(playerObjects);
  }, [])
  
  useEffect (() => {
    socket.on('receive-grid-state', gridState => {
      setGridState(gridState)
    })
    socket.on('receive-deck', deck => {
      setDeck(deck)
    })
    return () => {
      socket.off("receive-grid-state");
      socket.off("receive-deck")
    };
  }, [])

  
  useEffect(() => {
    if(Object.keys(data).length !== 0){
      setPlayers(Object.assign([], playerTurns));
      // shift out first object to set the player to start the game
      const playerTurn = playerTurns.shift();
      setPlayerTurn(playerTurn);
      buildDeck();
      placeStartCards();
      
    }
  }, [data])

  const buildDeck = () => {
    const deck = []
    const tile_cardData = Object.values(data.cards.tile_cards)
    // Might need to custimise this to reflect true numbers of individual cards!
    // 5x each tile card
    for (let step = 0; step < 5; step++){
      for (let card of tile_cardData)
        deck.push(Object.assign({}, card))
    }
    const blockerCardData = Object.values(data.cards["blocker-cards"])
    // 1x each blocker
    for (let card of blockerCardData){
      deck.push(Object.assign({}, card))
    }
    //randomize inverted
    for (let card of deck){
      card.inverted = Boolean(Math.round(Math.random()))
    }
    // Shuffle deck
    shuffleArray(deck);
    setDeck(deck);
    socket.emit('update-deck', deck);
  }

  const shuffleArray = (array) => {
    let currentIndex = array.length,  randomIndex
    while (currentIndex !== 0) {
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
    tempArr[3].splice(1, 1, Object.assign({}, data.cards["start-card"]))
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

  const dealCard = () => {
    if(deck.length > 0){
      let tempArr = deck
      const card = tempArr.splice(0,1)
      let tempHand = Object.assign([], playerHand) 
      tempHand.push(card[0])
      setPlayerHand(tempHand)
      setDeck(tempArr)
    } 
  }


  const handleStartClick = () => {
    if(!data) return
    setGameState(true)
    dealHand();
    setButtonToggle(!buttonToggle)
    socket.emit('update-deck', deck)
  }

  const handleEndClick = () => {
    if(window.confirm("Click 'OK' if you are sure you want to leave the game?")){
      window.location.reload(false);
    }
  }

    // controls players turns
    useEffect(() => {
      // Don't Start if false
      if(gameState === false) return
      
      // 
      if(playerTurn.active === false){
        const tempObj = Object.assign({}, playerTurn);
        tempObj.active = true;
        setPlayerTurn(tempObj);
        return
      }
      // if(playerTurn.active === true){
      //   const tempObj = Object.assign({}, playerTurn);
      //   tempObj.active = false;
      //   setPlayerTurn(tempObj);
      //   dealCard();
      //   return
      // }
      
    }, [gameState, turnToggle])
  
  

  const reorderHand = (hand) => {
    setPlayerHand(hand)
  }

  const gridNeighbours = (row, col) => {
    let neighbours = []
    row = Number(row)
    col = Number(col)
    if (gridState[row - 1] !== undefined) {
      gridState[row - 1][col] !== undefined ? neighbours.push(Object.assign({}, gridState[row - 1][col])) : neighbours.push({})
    } else {
      neighbours.push({})
    }
    gridState[row][col + 1] !== undefined ? neighbours.push(Object.assign({}, gridState[row][col + 1])) : neighbours.push({})
    if (gridState[row + 1] !== undefined) {
      gridState[row + 1][col] !== undefined ? neighbours.push(Object.assign({}, gridState[row + 1][col])) : neighbours.push({})
    } else {
      neighbours.push({})
    }
    gridState[row][col- 1] !== undefined ? neighbours.push(Object.assign({}, gridState[row][col - 1])) : neighbours.push({})
    // [top, right, bottom, left]
    // console.log(neighbours)
    return neighbours
  }


  const neighboursEntries = (neighbours) => {
     //connects open or closed (true or false)
    let neighboursEntries = []
    // console.log(neighbours[0])
    // console.log(neighbours[1])
    // console.log(neighbours[2])
    // console.log(neighbours[3])
    if (Object.keys(neighbours[0]).length !== 0){
    neighbours[0].inverted ? neighboursEntries.push(neighbours[0].entries.top) : neighboursEntries.push(neighbours[0].entries.bottom)
    }else{neighboursEntries.push(null)}

    if (Object.keys(neighbours[1]).length !== 0){
    neighbours[1].inverted ? neighboursEntries.push(neighbours[1].entries.right) : neighboursEntries.push(neighbours[1].entries.left)
    }else{neighboursEntries.push(null)}

    if (Object.keys(neighbours[2]).length !== 0){
    neighbours[2].inverted ? neighboursEntries.push(neighbours[2].entries.bottom) : neighboursEntries.push(neighbours[2].entries.top)
    }else{neighboursEntries.push(null)}

    if (Object.keys(neighbours[3]).length !== 0){
    neighbours[3].inverted ? neighboursEntries.push(neighbours[3].entries.left) : neighboursEntries.push(neighbours[3].entries.right)
    }else{neighboursEntries.push(null)}

    // [top, right, bottom, left]
    // null for empty or boarder tiles
    // console.log(neighboursEntries)
    return neighboursEntries
  }

  // helper function for comparing arrays
  function arrayEquals(a, b) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
  }

  const cardFitsNeighbours = (card, neighbours) => {
    let cardEntries = []
    if (card.inverted){
      cardEntries = [card.entries.bottom, card.entries.left, card.entries.top, card.entries.right]
    } else {
      cardEntries = [card.entries.top, card.entries.right, card.entries.bottom, card.entries.left ]
    }
    let resultNeighboursEntries = neighboursEntries(neighbours)

    // console.log(resultNeighboursEntries)
    // console.log(cardEntries)

    let results = []
    let i = 0
    for (let result of resultNeighboursEntries) {
      (result === null) ? results.push(true) : results.push(result === cardEntries[i])
      i += 1
    }
    // console.log(results)
    // console.log(arrayEquals(cardEntries, resultNeighboursEntries))

    return !results.includes(false)
  } 

  const boarderTileCard = (gridRow, gridCol) => {
    for (let neighbour of gridNeighbours(gridRow, gridCol)){
      // console.log(gridNeighbours(gridRow, gridCol))
      if (Object.keys(neighbour).length !== 0){
        // console.log(neighbour)
        if (neighbour["name"].substring(0, 4) === "path" || neighbour["name"].substring(0, 5) === "start") return true
      }
    }
    return false
  }

  const checkIfMakesPath = (card, gridRow, gridCol) => {
    let tempNeighbours = []
    for (let neighbour of gridNeighbours(gridRow, gridCol)){
      if (Object.keys(neighbour).length === 0){
        tempNeighbours.push({})
      }
      else if (neighbour.name.substring(0, 4) !== "path" && neighbour.name.substring(0, 5) !== "start"){
        tempNeighbours.push({})
      }
      else {
        tempNeighbours.push(neighbour)
      }
      }
    let resultNeighboursEntries = neighboursEntries(tempNeighbours)
    let cardEntries = []
    if (card.inverted){
      cardEntries = [card.entries.bottom, card.entries.left, card.entries.top, card.entries.right]
    } else {
      cardEntries = [card.entries.top, card.entries.right, card.entries.bottom, card.entries.left ]
    }
    let results = []
    var i = 0
    for (let result of resultNeighboursEntries) {
      (result === true && cardEntries[i] === true ) ? results.push(true) : results.push(false)
      i += 1
    }
    console.log(results)
    return results.includes(true)
  }


  const checkFlipEndCard = (gridRow, gridCol) => {
    let row = Number(gridRow)
    let col = Number(gridCol)
    let tempGrid = Object.assign({}, gridState)
    let tempNeighbours = gridNeighbours(row, col)
    console.log(tempNeighbours)

      if (Object.keys(tempNeighbours[0]).length !== 0) {
        if (tempNeighbours[0].name.substring(0, 4) === "coal" || tempNeighbours[0].name.substring(0, 4) === "gold"){
          console.log(tempGrid[row + 1][col])
          tempGrid[row + 1][col].flipped = false
        }
      }

      if (Object.keys(tempNeighbours[1]).length !== 0) {
        if (tempNeighbours[1].name.substring(0, 4) === "coal" || tempNeighbours[1].name.substring(0, 4) === "gold"){
          console.log(tempGrid)
          console.log(row)
          console.log(col +1)
          console.log(tempGrid[row][col + 1])
          tempGrid[row][col + 1].flipped = false
        }
      }

      if (Object.keys(tempNeighbours[2]).length !== 0) {
        if (tempNeighbours[2].name.substring(0, 4) === "coal" || tempNeighbours[2].name.substring(0, 4) === "gold"){
          console.log(tempGrid[row + 1][col])
          tempGrid[row - 1][col].flipped = false
        }
      }

      if (Object.keys(tempNeighbours[3]).length !== 0) {
        if (tempNeighbours[3].name.substring(0, 4) === "coal" || tempNeighbours[3].name.substring(0, 4) === "gold"){
          console.log(tempGrid[row + 1][col])
          tempGrid[row][col - 1].flipped = false
        }
      }
    
    console.log(gridNeighbours(row, col))
    setGridState(tempGrid)
  }

  const legalMove = (cardSelected, gridRow, gridCol) => {
    // check that card being placed boarders a tile card
    if (!boarderTileCard(gridRow, gridCol)) return console.log("Cant be placed here!")
    // check if card makes path with at least one bordering card
    if (!checkIfMakesPath(cardSelected, gridRow, gridCol)) return console.log("Cant be placed here!")
    // check if card is already placed in grid location
    if (Object.keys(gridState[gridRow][gridCol]).length !== 0) return console.log("Card already placed here!")
    // check if card fits in grid position with neighbours
    else if (cardFitsNeighbours(cardSelected, gridNeighbours(gridRow, gridCol))){
      // check for end card
      checkFlipEndCard(gridRow, gridCol)
      return true
    } 
    else return false
  }

  function handleOnDragEnd(result){

    const playerID = result.source.droppableId.split("-").pop();

    if (!result.destination) return
    else if (result.destination.droppableId === "discard"){
      if(playerTurn.id === playerID && playerTurn.active === true){
        const items = Array.from(playerHand)
        items.splice(result.source.index, 1)
        reorderHand(items)
        // player places card on the grid -> toggle to trigger end of turn
        setTurnToggle(!turnToggle)
      }
      return
    }
    else if (result.destination.droppableId.split("-").shift() === "cards"){
      const items = Array.from(playerHand)
      const [reorderedItem] = items.splice(result.source.index, 1)
      items.splice(result.destination.index, 0, reorderedItem)
      reorderHand(items)
      return
    }
    else if (result.destination.droppableId.substring(0, 4) === "grid"){
      // if user is active and it's their turn
      if(playerTurn.id === playerID && playerTurn.active === true){
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
          // player places card on the grid -> toggle to trigger end of turn
          setTurnToggle(!turnToggle)
        } 
        
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

  if(Object.keys(data).length === 0){
    return <Loading/>
  } else {
    return (
      <div className= "game-container">

        <DragDropContext onDragEnd= {handleOnDragEnd}>

          <GameGrid  gridState={gridState}/>   
          <HandList player={player} cards={playerHand} reorderHand = {reorderHand} handleOnClickInvert = {handleOnClickInvert}/> 
          <SideBar deck={deck} backs={data.cards.card_backs} startClick={buttonToggle ? handleStartClick : handleStartClick} buttonToggle={buttonToggle} players={players}/>

        </DragDropContext>
        
      </div>
    )
  }
  
}

export default GameContainer;

