import express, { Request, Response, NextFunction } from "express";
import http from "http";
import helmet from "helmet";
import cors from "cors";
import expressRateLimit from "express-rate-limit";
import SocketIO from "socket.io";
import * as db from "./utils/db";
import * as chatControllers from "./controllers/chat";
import * as fileControllers from "./controllers/file";

db.connect().then(async () => {
	const { UserModel } = await import('./models/user');
	UserModel.deleteMany({});
});

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(expressRateLimit({
	windowMs: 10000,
	max: 50,
	message: (<unknown>({ error: { message: 'Too many requests at a time. Please try again after 10 seconds.' } })) as string
}));

const server = http.createServer(app);
const io = SocketIO(server).sockets;

app.get('/', (_req, res) => res.send('Comh API.'));

app.get('/file/:key', fileControllers.getFile);

io.on('connection', socket => {
	socket.on('join', (data, callback) => chatControllers.join(socket, data, callback));

	socket.on('sendText', (data, callback) => chatControllers.sendText(io, socket, data, callback));

	socket.on('deleteText', (data, callback) => chatControllers.deleteText(io, socket, data, callback));

	socket.on('disconnect', () => chatControllers.disconnect(socket));
});

app.use((_req, _res, next) => {
	return next({ message: 'Not found', statusCode: 404 });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
	res.status(err.statusCode || 500);

	return res.json({ error: { message: err.message || 'Internal server error' } });
});

export default server;
