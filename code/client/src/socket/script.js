import { io } from 'socket.io-client'

const socket = io('http://localhost:3000')


socket.on('connection', () => {
    console.log(`You connected with id: ${socket.id}`)
})