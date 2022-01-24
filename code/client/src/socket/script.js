import { io } from 'socket.io-client'
    
const socket = io('http://localhost:3000');

socket.on('popup', function(msg){
    console.log("hello: ", msg)
    socket.emit('id', socket.id);    
});
socket.on('connect', function() {
    console.log("client connected");
    console.log(socket.socket.connected);
    console.log(socket.socket.connecting);
    socket.emit('id', socket.id);    
});

socket.on('connect_error', function(err) {
    console.log("client connect_error: ", err);
});

socket.on('connect_timeout', function(err) {
    console.log("client connect_timeout: ", err);
});