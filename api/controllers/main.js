const Text = require('../models/Text');
const User = require('../models/User');
const WhatsNew = require('../models/WhatsNew');

exports.join = async (socket, { name, room }, callback) => {
  if (await User.exists({ name, room })) return callback({ error: { message: `A user with the name of ${name} already exists in ${room}` } });

  const user = await new User({ _id: socket.id, name, room });

  try {
    await user.validate();
  } catch (error) {
    if (error) return callback({ error: { message: error._message } });
  }

  await user.save();

  const backup = await Text.find({ room }).sort('createdAt');
  
  if (backup.length > 0) {
    socket.emit('backup', { backup });
  }

  socket.emit('text', { text: { text: `Welcome, ${name} to ${room}` } });
  socket.broadcast.to(room).emit('text', { text: { text: `${name} has joined the chat` } });

  socket.join(room);
  console.log(`A new user has joined "${room}" with the name of "${name}"`);

  callback({});
};

exports.sendText = async (io, socket, text) => {
	if (text) {
	  const user = await User.findOne({ _id: socket.id });

	  const _text = new Text({
	  	text,
      sender: user.name,
      room: user.room
	  });

    await _text.save();

	  io.to(user.room).emit('text', { text: { text, sender: user.name } });
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

exports.addWhatsNew = async (req, res) => {
  if (!req.body.password) {
    res.status(401);
    return res.json({ error: { message: 'Password is required', statusCode: 401 } });
  }

  if (!req.body.description) {
    res.status(400);
    return res.json({ error: { message: 'Description is required', statusCode: 400 } });
  }

  if (process.env.ADMIN_PASSWORD !== req.body.password) {
    res.status(401);
    return res.json({ error: { message: 'Password dosen\'t match', statusCode: 401 } });
  }

  await WhatsNew.create({ description: req.body.description });

  return res.json({ message: 'Successfully added whats new' });
};

exports.getWhatsNew = async (req, res) => res.json({ whatsnew: (await WhatsNew.find({}, {}, { sort: { createdAt: 1 } })).filter(w => w.createdAt > (Date.now() - (1000 * 60 * 60 * 24 * 7))) });
