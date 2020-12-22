const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
	_id: {
		type: String,
		required: [true, 'User id is required']
	},
	name: {
		type: String,
		maxlength: [32, 'User name can\'t be more than 32 characters long'],
		required: [true, 'User name is required']
	},
	room: {
		type: mongoose.Schema.Types.ObjectId,
		required: [true, 'User room is required']
	}
}, { _id: false, timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('User', UserSchema);
