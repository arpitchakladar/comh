const crypto = require('crypto');

exports.hash = (text) => {
	const hash = crypto.createHash('sha256');
	hash.update(text);
	return hash.digest('hex');
};
