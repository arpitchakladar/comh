const express = require('express');
const socketio = require('socket.io');
const http = require('http');

if (process.env.NODE_ENV !== 'production') require('dotenv').config();
require('./db').connect();

const mainController = require('./controllers/main');

const PORT = process.env.PORT || 4200;

const app = express();
app.use(require('cors')());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const server = http.createServer(app);
const io = socketio(server).sockets;

app.get('/', (req, res) => res.send('Comh API.'));

app.get('/whatsnew', mainController.getWhatsNew);

app.post('/whatsnew', mainController.addWhatsNew);

io.on('connection', socket => {
  socket.on('join', ({ name, room }, callback) => mainController.join(socket, { name, room }, callback));

  socket.on('sendText', data => mainController.sendText(io, socket, data));

  socket.on('disconnect', () => mainController.disconnect(socket));
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
