const mime = require('mime');
const path = require('path');
const Text = require('../models/text');
const User = require('../models/user');
const Room = require('../models/room');
const storage = require('../utils/storage');
const sha256 = require('../utils/sha256');

exports.join = async (socket, { name, room: roomName, hashedPassword }, callback) => {
	if (!name || !roomName || !hashedPassword) return callback({ error: { message: 'Name, room and password is required ' } });

	const doubleHashedPassword = sha256.hash(hashedPassword);
	let room = await Room.findOne({ name: roomName });
	if (room) {
		if (room.doubleHashedPassword !== doubleHashedPassword) {
			callback({ error: { message: 'Invalid password' } });
		}
	} else {
		room = new Room({
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

	if (await User.exists({ name, room: room._id })) return callback({ error: { message: `A user with the name of ${name} already exists in ${room}` } });

	const user = new User({ _id: socket.id, name, room: room._id });

	try {
		await user.validate();
	} catch (error) {
		if (error) return callback({ error: { message: error._message } });
	}

	await user.save();

	const backup = await Promise.all((await Text.find({ room: room._id }).sort('createdAt')).map(async text => {
		const _text = text.toObject();
		if (_text.tagged) {
			_text.tagged = await Text.findOne({ _id: _text.tagged });
		}
		return _text;
	}));

	socket.broadcast.to(room.name).emit('text', { text: { text: `${name} has joined the chat` }, unencrypted: true });

	socket.join(room.name);
	console.log(`A new user has joined "${room.name}" with the name of "${name}"`);

	callback({ backup: backup.length > 0 ? backup : null });
	socket.emit('text', { text: { text: `Welcome, ${name} to ${room.name}` }, unencrypted: true });
};

exports.sendText = async (io, socket, { text, tagged, media }, callback) => {
	if (text || media) {
		if (text && text.length > 1024 * 5) return callback({ error: { message: 'Text size can\'t be more then 5kb' } });

		const user = await User.findOne({ _id: socket.id });

		if (!user) {
			return callback({ error: { message: 'You weren\'t found in the room. Try to rejoin' } });
		}

		const _text = new Text({
			text,
			sender: user.name,
			room: user.room
		});

		if (media && media.originalname && media.buffer) {
			const extension = path.extname(media.originalname);
			const type = mime.getType(extension).split('/')[0];
			if (type === 'image' || (type === 'video' && ['mp4', 'ogg', 'webm'].includes(extension))) {
				if (media.buffer.byteLength > 1024 * 1024 * 15) {
					return callback({ error: { message: 'Media file too big' } });
				}
				_text.media = await storage.addItem(media);
			} else {
				return callback({ error: { message: 'Invalid media type' } });
			}
		}

		const responseText = _text.toObject();

		if (tagged) {
			const taggedText = await Text.findOne({ _id: tagged });
			if (!taggedText || taggedText.room !== user.room) {
				return callback({ error: { message: 'The tagged text was not found or has been deleted' } });
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

		io.to((await Room.findOne({ _id: user.room })).name).emit('text', { text: responseText });

		return callback({});
	}
};

exports.deleteText = async (io, socket, { _id }, callback) => {
	if (_id) {
		const user = await User.findOne({ _id: socket.id });

		if (!user) return callback({ error: { message: 'Your account was not found. Try rejoining' } });

		const text = await Text.findOne({ _id });

		if (!text) return callback({ error: { message: 'The text was not found or it is already deleted' } });

		if (text.room.toString() !== user.room.toString()) return callback({ error: { message: 'The text was not found in the current room' } });

		if (text.sender !== user.name) return callback({ error: { message: 'You can only delete your own text' } });

		await text.remove();

		io.to((await Room.findOne({ _id: user.room })).name).emit('deletedText', { _id });

		return callback({});
	}
};

exports.disconnect = async socket => {
	const user = await User.findOne({ _id: socket.id });

	if (!user) {
		return console.log('An error occured while trying to get the disconnected user');
	}

	const roomName = (await Room.findOne({ _id: user.room })).name;

	socket.broadcast.to(roomName).emit('text', { text: { text: `${user.name} has left the chat` }, unencrypted: true });

	await User.deleteOne({ _id: user._id });

	console.log(`A user from "${roomName}" and with the name of "${user.name}" has left`);
};
