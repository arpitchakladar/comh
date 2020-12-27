import { Request, Response, NextFunction } from "express";
import mime from "mime"
import path from "path"
import * as storage from "../utils/storage"

export const getFile = async (req: Request, res: Response, next: NextFunction) => {
	const buffer = await storage.getItem(req.params.key);

	if (!buffer) {
		return next({ error: { message: 'File not found', statusCode: 404 } });
	}

	res.contentType(mime.getType(path.extname(req.params.key))?.split('/')[0] || "text/plain");

	return res.send(buffer);
};
