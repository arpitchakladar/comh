const mongoose = require('mongoose');

const WhatsNewSchema = mongoose.Schema({
  description: {
    type: String,
    required: true
  }
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('whatsnew', WhatsNewSchema);
