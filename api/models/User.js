const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
	_id: {
		type: String,
		required: true
	},
	name: {
		type: String,
		maxlength: 32,
		required: true
	},
	room: {
		type: String,
		maxlength: 50,
		required: true
	}
}, { _id: false, timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('Users', UserSchema);
