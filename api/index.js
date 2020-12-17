const express = require('express');

if (process.env.NODE_ENV !== 'production') require('dotenv').config();
require('./utils/db').connect();

const app = express();

app.use(require('helmet')());
app.use(require('cors')());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(require('express-rate-limit')({
	windowMs: 10000,
	max: 50,
	message: { error: { message: 'Too many requests at one time. Please try again after 10 seconds.' } }
}));

const server = require('http').createServer(app);
const io = require('socket.io')(server).sockets;

const chatControllers = require('./controllers/chat');
const fileController = require('./controllers/file');

app.get('/', (req, res) => res.send('Comh API.'));

app.get('/file/:key', fileController.getFile);

io.on('connection', socket => {
	socket.on('join', ({ name, room }, callback) => chatControllers.join(socket, { name, room }, callback));

	socket.on('sendText', (data, callback) => chatControllers.sendText(io, socket, data, callback));

	socket.on('deleteText', (data, callback) => chatControllers.deleteText(io, socket, data, callback));

	socket.on('disconnect', () => chatControllers.disconnect(socket));
});

app.use((req, res, next) => {
	return next({ message: 'Not found', statusCode: 404 });
});

app.use((err, req, res, next) => {
	res.status(err.statusCode || 500);

	return res.json({ error: { message: err.message || 'Internal server error' } });
});

module.exports = server;
