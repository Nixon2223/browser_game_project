import React from 'react';

const MultiplayerHost = ({handleEnterClick}) => {

    const buttonClick = (event) => {
        const name =  document.getElementById('player-name').value
        const val = event.target.value;
        const room = document.getElementById('room-name').value;
        handleEnterClick(name, val, room);
    }
    return (
        <div className='splash-container'>
            <div className='content'> 
                    <div className='button-wrapper'>
                        <input id='player-name' placeholder='Enter Player Name'/>
                        <input id='room-name' placeholder='Enter Room Name'/>
                        <button onClick={buttonClick} className='host' value='host'>To The Mines</button>
                    </div>
            </div>
        </div>
    );
};

export default MultiplayerHost;