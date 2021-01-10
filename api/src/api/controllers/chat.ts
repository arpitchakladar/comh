import { Socket, Namespace } from "socket.io";
import { TextModel } from "../models/text";
import { UserModel } from "../models/user";
import { RoomModel } from "../models/room";
import * as sha256 from "../utils/sha256";
import * as storage from "../utils/storage";

interface JoinParams {
	name: string;
	room: string;
	hashedPassword: string;
};

interface SendTextParams {
	text: string;
	tagged: string;
	media: string;
};

interface DeleteTextParams {
	_id: string;
};

type SocketCallback = (data: any) => void;

export const join = async (socket: Socket, { name, room: roomName, hashedPassword }: JoinParams, callback: SocketCallback) => {
	if (!name || !roomName || !hashedPassword) return callback({ error: { message: "Name, room and password is required " } });

	const doubleHashedPassword = sha256.hash(hashedPassword);
	let room = await RoomModel.findOne({ name: roomName });
	if (room) {
		if (room.doubleHashedPassword !== doubleHashedPassword) {
			callback({ error: { message: "Invalid password" } });
		}
	} else {
		room = new RoomModel({
			name: roomName,
			doubleHashedPassword
		});

		try {
			await room.validate();
		} catch (error) {
			if (error) return callback({ error: { message: error._message } });
		}

		room.save();
	}

	if (await UserModel.exists({ name, room: room._id })) return callback({ error: { message: `A user with the name of ${name} already exists in ${room.name}` } });

	const user = new UserModel({ _id: socket.id, name, room: room._id });

	try {
		await user.validate();
	} catch (error) {
		if (error) return callback({ error: { message: error._message } });
	}

	await user.save();

	const backup = await Promise.all((await TextModel.find({ room: room._id }).sort("createdAt")).map(async text => {
		const _text = text.toObject();
		if (_text.tagged) {
			_text.tagged = await TextModel.findOne({ _id: _text.tagged });
		}
		return _text;
	}));

	socket.broadcast.to(room.name).emit("text", { text: { text: `${name} has joined the chat` }, unencrypted: true });

	socket.join(room.name);
	console.log(`A new user has joined "${room.name}" with the name of "${name}" and socket id "${socket.id}"`);

	callback({ backup: backup.length > 0 ? backup : null });
	socket.emit("text", { text: { text: `Welcome, ${name} to ${room.name}` }, unencrypted: true });
};

export const sendText = async (io: Namespace, socket: Socket, { text, tagged, media }: SendTextParams, callback: SocketCallback) => {
	if (text || media) {
		if (text && text.length > 1024 * 5) return callback({ error: { message: "Text size can't be more then 5kb" } });

		const user = await UserModel.findOne({ _id: socket.id });

		if (!user) {
			return callback({ error: { message: "You weren't found in the room. Try to rejoin" } });
		}

		const room = await RoomModel.findOne({ _id: user.room });

		if (!room) {
			return callback({ error: { message: "Your current room wasn't found or has been deleted" } });
		}

		const _text = new TextModel({
			text,
			sender: user.name,
			room: user.room
		});

		if (media) {
			if (await storage.checkItemExists(media)) {
				_text.media = media;
			} else {
				return callback({ error: { message: "An error occured while trying to find the media of the text" } });
			}
		}

		const responseText = _text.toObject();

		if (tagged) {
			const taggedText = await TextModel.findOne({ _id: tagged });
			if (!taggedText || taggedText.room.toString() !== user.room.toString()) {
				return callback({ error: { message: "The tagged text was not found or has been deleted" } });
			}
			responseText.tagged = taggedText.toObject();
			_text.tagged = tagged;
		}

		try {
			await _text.validate();
		} catch (error) {
			if (error) return callback({ error: { message: error._message } });
		}

		await _text.save();

		io.to(room.name).emit("text", { text: responseText });

		return callback({});
	} else {
		return callback({ error: { message: "Text or media is required" } });
	}
};

export const deleteText = async (io: Namespace, socket: Socket, { _id }: DeleteTextParams, callback: SocketCallback) => {
	if (_id) {
		const user = await UserModel.findOne({ _id: socket.id });

		if (!user) return callback({ error: { message: "Your account was not found. Try rejoining" } });

		const text = await TextModel.findOne({ _id });

		if (!text) return callback({ error: { message: "The text wasn't found or it is already deleted" } });

		if (text.room.toString() !== user.room.toString()) return callback({ error: { message: "The text was not found in the current room" } });

		if (text.sender !== user.name) return callback({ error: { message: "You can only delete your own text" } });

		const room = await RoomModel.findOne({ _id: user.room });

		if (!room) {
			return callback({ error: { message: "Your current room wasn't found or has been deleted" } });
		}

		await text.remove();

		if (text.media) {
			try {
				await storage.deleteItem(text.media);
			} catch {
			}
		}

		io.to(room.name).emit("deletedText", { _id });

		return callback({});
	} else {
		return callback({ error: { messsage: "Text _id is required" } });
	}
};

export const disconnect = async (socket: Socket) => {
	const user = await UserModel.findOne({ _id: socket.id });

	if (user) {
		const room = await RoomModel.findOne({ _id: user.room });

		if (room) {
			socket.broadcast.to(room.name).emit("text", { text: { text: `${user.name} has left the chat` }, unencrypted: true });

			console.log(`A user with the name of "${user.name}" from room "${room.name}" has left, with socket id "${socket.id}"`);

			await UserModel.deleteOne({ _id: user._id });
		} else {
			console.log(`A user named "${user.name}" from a undefined or deleted room has left, with socket id "${socket.id}"`);
		}
	} else {
		console.log(`Failed to get the name of disconnected user, with socket id "${socket.id}"`);
	}
};
