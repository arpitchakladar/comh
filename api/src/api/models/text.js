const mongoose = require('mongoose');
const storage = require('../utils/storage');

const TextSchema = mongoose.Schema({
	text: {
		type: String,
		required: true,
		maxlength: 255
	},
	sender: {
		type: String
	},
	room: {
		type: String,
		required: true
	},
	tagged: mongoose.Schema.Types.ObjectId,
	image: String
}, { timestamps: { createdAt: true, updatedAt: false } });

TextSchema.pre('remove', async function() {
	if (this.image) {
		storage.deleteItem(this.image);
	}
});

TextSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });

TextSchema.statics.toJSON = async function() {
	const obj = this.toObject();

	if (obj.tagged)	obj.tagged = await this.findOne({ _id: obj.tagged });

	return obj;
};

module.exports = mongoose.model('Text', TextSchema);
