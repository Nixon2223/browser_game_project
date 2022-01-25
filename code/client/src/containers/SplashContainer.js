import React, { useState } from 'react';
import SplashMenu from '../components/SplashMenu';
import SingleLogin from '../components/SingleLogin';
import MultiplayerHost from '../components/MultiplayerHost';
import MultiplayerJoin from '../components/MultiplayerJoin';

const SplashContainer = ({handleEnterClick, handleJoinRoomClick})=>  {

    const[selector, setSelector] = useState("menu");

    const handleClick = (value) => {
        setSelector(value);
    }

    if(selector === "menu"){

        return <SplashMenu handleClick={handleClick}/>

    } else if (selector === "single"){
        return <SingleLogin handleEnterClick={handleEnterClick}/>
    } else if (selector === "host") {
        return <MultiplayerHost handleEnterClick={handleEnterClick} />
    }
    else if (selector === "join") {
        return <MultiplayerJoin handleJoinRoomClick={handleJoinRoomClick} />
    }
    
}


export default SplashContainer;