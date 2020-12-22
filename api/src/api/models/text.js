const mongoose = require('mongoose');
const storage = require('../utils/storage');

const TextSchema = mongoose.Schema({
	text: {
		type: String,
		maxlength: [1024 * 5, 'Text size can\'t be more then 5kb']
	},
	sender: {
		type: String,
		required: true
	},
	room: {
		type: mongoose.Schema.Types.ObjectId,
		required: [true, 'Text room is required']
	},
	tagged: {
		type: mongoose.Schema.Types.ObjectId
	},
	media: {
		type: String
	}
}, { timestamps: { createdAt: true, updatedAt: false } });

TextSchema.pre('remove', async function() {
	if (this.media) {
		await storage.deleteItem(this.media);
	}
});

TextSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });

TextSchema.pre('validate', function(next) {
	if (!(this.text || this.media)) next(new Error("Text content or media is required"));
	next();
});

module.exports = mongoose.model('Text', TextSchema);
