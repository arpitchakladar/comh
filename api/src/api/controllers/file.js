const mime = require('mime');
const path = require('path');
const storage = require('../utils/storage');

exports.getFile = async (req, res, next) => {
	const buffer = await storage.getItem(req.params.key);

	if (!buffer) {
		return next({ message: 'File not found', statusCode: 404 });
	}

	res.contentType(mime.getType(path.extname(req.params.key)).split('/')[0]);

	return res.send(buffer);
};
