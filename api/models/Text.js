const mongoose = require('mongoose');

const TextSchema = mongoose.Schema({
	text: {
		type: String,
		required: true
	},
	sender: {
		type: String,
		required: true
	},
	room: {
		type: String,
		required: true
	}
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('Text', TextSchema);
