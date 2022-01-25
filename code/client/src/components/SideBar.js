import React from 'react';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd'
import ChatForm from './ChatForm';

const SideBar = ({deck, startClick,  socket}) => {

    const handleClick = () => {
        startClick();
    }
    return (
        <div className='menu-container'>
            <div className='deck-container'>
                <div id='deck'>{deck.length} </div> 
                <div id='deck'>{deck.length} </div> 
                <div id='deck'>{deck.length} </div> 
            </div>
            <div className='player-container'>
                <h4>Who's Playing</h4>
                <p>player 1</p>
                <p>player 2</p>
                <p>player 3</p>
                <p>player 4</p>
                <p>player 5</p>
                <p>player 6</p>
                <p>player 7</p>
                <p>player 8</p>

            </div>
            <div className="chat-form">
          <ChatForm socket={socket} />
        </div>
            <div className='button-container'>
                <button className='start' onClick={handleClick}>Start Game</button> 
            </div>
        </div>
    );
};

export default SideBar;