import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client'



function ChatForm({socket}) {

const [state, setState] = useState({message: "", name: ""})
const [chat, setChat] = useState ([])



  socket.on("message", ({ name, message }) => {
    setChat([...chat, {name, message}])
    
})
  socket.on('recieve-message', ({name, message}) => {
    setChat([...chat, {name, message}])
  })

  
	const onTextChange = (e) => {
		setState({ ...state, [e.target.name]: e.target.value })
	}

	const onMessageSubmit = (e) => {
		const { name, message } = state
		socket.emit("message", { name, message })
		e.preventDefault()
		setState({ message, name })

	}

    const renderChat = () => {
		return chat.map(({ name, message }, index) => (
			<div key={index}>
				<h3>
					{name}<br/>
                    {message}
				</h3>
			</div>
		))

        }

  return (
    <div className="chat-box">
    <form onSubmit={onMessageSubmit}>
        {/* <h1>Messenger</h1> */}
        <div className="name-field">
            <label for = "name">Name</label><br/>
            <input name="name" onChange={(e) => onTextChange(e)} value={state.name} />
        </div>
        <div className="message-field">
        <label for = "message">Message</label><br/>
            <input
                name="message"
                onChange={(e) => onTextChange(e)}
                value={state.message}
                id="outlined-multiline-static"
                
            />
        </div>
        <button id ="button">Send Message</button>
    </form>
    <div className="render-chat">
				{/* <h4>Chat Log</h4> */}
				{renderChat()}
			</div>
    </div>
  )
}

export default ChatForm;
