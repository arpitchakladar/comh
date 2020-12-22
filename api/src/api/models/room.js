const mongoose = require('mongoose');

const RoomSchema = mongoose.Schema({
	name: {
		type: String,
		maxlength: [50, 'Room name can\'t be more than 50 characters long'],
		required: [true, 'Room name is required']
	},
	doubleHashedPassword: {
		type: String,
		required: [true, 'Room password is required']
	}
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('Room', RoomSchema);
