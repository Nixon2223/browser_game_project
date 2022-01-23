const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const cors = require('cors')
const MongoClient = require('mongodb').MongoClient
const createRouter = require('./helpers/create_router');

app.use(cors());
app.use(express.json());

io.on('connection', socket => {
  console.log(socket.id)
})


MongoClient.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true })
  .then((client) => {
    const db = client.db('saboteur');
    const gameCollection = db.collection('game');
    const gameRouter = createRouter(gameCollection);
    app.use('/api/game', gameRouter);
  })
  .catch(console.err);

app.listen(5000, function () {
  console.log(`Listening on port ${ this.address().port }`);

}); 