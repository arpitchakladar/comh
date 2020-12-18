const Text = require('../models/text');
const User = require('../models/user');
const storage = require('../utils/storage');
const FileType = require('file-type');

exports.join = async (socket, { name, room }, callback) => {
	if (!name || !room) return callback({ name: 'Invalid name or room' });

	if (await User.exists({ name, room })) return callback({ error: { message: `A user with the name of ${name} already exists in ${room}` } });

	const user = new User({ _id: socket.id, name, room });

	try {
		await user.validate();
	} catch (error) {
		if (error) return callback({ error: { message: error._message } });
	}

	await user.save();

	const backup = await Promise.all((await Text.find({ room }).sort('createdAt')).map(async text => {
		if (text.tagged) {
			const t = text.toObject();

			const taggedText = await Text.findOne({ _id: t.tagged });

			if (taggedText) {
				t.tagged = taggedText;
			} else {
				t.tagged = undefined;
			}

			return t;
		} else return text.toObject();
	}));

	if (backup.length > 0) {
		socket.emit('backup', { backup });
	}

	socket.emit('text', { text: { text: `Welcome, ${name} to ${room}` } });

	socket.broadcast.to(room).emit('text', { text: { text: `${name} has joined the chat` } });

	socket.join(room);
	console.log(`A new user has joined "${room}" with the name of "${name}"`);

	callback({});
};

exports.sendText = async (io, socket, { text, tagged, file }, callback) => {
	if (text) {
		if (text.length > 255) return callback({ error: { message: 'Text can\'t be more then 255 charaters long' } });

		const user = await User.findOne({ _id: socket.id });

		if (!user) {
			return callback({ error: { message: 'Your account was not found in the room' } });
		}

		const _text = new Text({
			text,
			sender: user.name,
			room: user.room
		});

		if (file && file.originalname && file.buffer) {
			const type = (await FileType.fromBuffer(file.buffer)).mime.split('/')[0];
			if (type === 'image') {
				if (file.buffer.byteLength > 1024 * 2028) {
					return callback({ error: { message: 'File too big...' } });
				}
				_text.image = await storage.addItem(file);
			} else {
				return callback({ error: { message: 'Invalid file type' } });
			}
		}

		const responseText = _text.toObject();

		if (tagged) {
			const taggedText = await Text.findOne({ _id: tagged });
			if (!taggedText || taggedText.room !== user.room) {
				return callback({ error: { message: 'The text you tagged was not found or was deleted' } });
			}
			responseText.tagged = taggedText.toObject();
			_text.tagged = tagged;
		}

		await _text.save();

		io.to(user.room).emit('text', { text: responseText });

		return callback({});
	}
};

exports.deleteText = async (io, socket, { _id }, callback) => {
	if (_id) {
		const user = await User.findOne({ _id: socket.id });

		if (!user) return callback({ error: { message: 'Your account was not found' } });

		const text = await Text.findOne({ _id });

		if (!text) return callback({ error: { message: 'The text was not found or it is already deleted' } });

		if (text.room !== user.room) return callback({ error: { message: 'The text was not found in the current room' } });

		if (text.sender !== user.name) return callback({ error: { message: 'You can only delete your own text' } });

		await text.remove();

		io.to(user.room).emit('deletedText', { _id });

		return callback({});
	}
};

exports.disconnect = async socket => {
	const user = await User.findOne({ _id: socket.id });

	if (!user) {
		return console.log('An error occured while trying to get the disconnected user');
	}

	socket.broadcast.to(user.room).emit('text', { text: { text: `${user.name} has left the chat` } });

	await User.deleteOne({ _id: user._id });

	console.log(`A user from "${user.room}" and with the name of "${user.name}" has left`);
};
