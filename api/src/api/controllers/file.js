const storage = require('../utils/storage');
const FileType = require('file-type');

exports.getFile = async (req, res, next) => {
	const buffer = await storage.getItem(req.params.key);

	if (!buffer) {
		return next({ message: 'File not found', statusCode: 404 });
	}

	res.contentType((await FileType.fromBuffer(buffer)).mime);

	return res.send(buffer);
};
