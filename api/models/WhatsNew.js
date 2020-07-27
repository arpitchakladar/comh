const mongoose = require('mongoose');

const WhatsNewSchema = mongoose.Schema({
  description: {
    type: String,
    required: true
  }
}, { timestamps: { createdAt: true, updatedAt: false } });

WhatsNewSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });

module.exports = mongoose.model('whatsnew', WhatsNewSchema);
