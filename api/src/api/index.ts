import express, { Request, Response, NextFunction } from "express";
import http from "http";
import helmet from "helmet";
import cors from "cors";
import expressRateLimit from "express-rate-limit";
import { Server as SocketIOServer, Socket } from "socket.io";
import * as db from "@/api/utils/db";
import * as chatControllers from "@/api/controllers/chat";
import mediaRoute from "@/api/routes/media";

db.connect().then(async () => {
	const { UserModel } = await import("@/api/models/user");
	UserModel.deleteMany({});
});

const app = express();

app.use(expressRateLimit({
	windowMs: 10000,
	max: 50,
	message: (<unknown>({ error: { message: "Too many requests at a time. Please try again after 10 seconds." } })) as string
}));

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const server = http.createServer(app);
const io = new SocketIOServer(server, {
	cors: {
		origin: ["https://comh.now.sh"]
	}
}).sockets;

app.get("/", (_req, res) => res.send("Comh API."));

app.use("/media", mediaRoute);

io.on("connection", (socket: Socket) => {
	socket.on("join", (data, callback) => chatControllers.join(socket, data, callback));

	socket.on("sendText", (data, callback) => chatControllers.sendText(io, socket, data, callback));

	socket.on("deleteText", (data, callback) => chatControllers.deleteText(io, socket, data, callback));

	socket.on("disconnect", () => chatControllers.disconnect(socket));
});

app.use((_req, _res, next) => {
	return next({ message: "Not found", statusCode: 404 });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
	res.status(err.statusCode || 500);

	return res.json({ error: { message: err.message || "Internal server error" } });
});

export default server;
