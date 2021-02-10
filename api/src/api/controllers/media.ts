import { Request, Response, NextFunction } from "express";
import mime from "mime";
import path from "path";
import * as storage from "@/api/utils/storage";

export const getMedia = async (req: Request, res: Response, next: NextFunction) => {
	const buffer = await storage.getItem(req.params.key);

	if (!buffer) {
		return next({ message: 'Media file not found', statusCode: 404 });
	}

	res.contentType(mime.getType(path.extname(req.params.key))?.split('/')[0] || "text/plain");

	return res.send(buffer);
};

export const uploadMedia = async (req: Request, res: Response, next: NextFunction) => {
	if (req.file && req.file.originalname && req.file.buffer) {
		const extension = path.extname(req.file.originalname);
		const type = mime.getType(extension)?.split("/")[0];
		if (type === "image" || (type === "video" && [".mp4", ".ogg", ".webm"].includes(extension.toLocaleLowerCase()))) {
			if (req.file.buffer.byteLength > 1024 * 1024 * 15) {
				return next({ message: "Media file too big", statusCode: 400 });
			}

			return res.status(200).json({
				url: await storage.addItem(req.file, "media")
			});
		} else {
			return next({ message: "Invalid media type", statusCode: 400 });
		}
	} else {
		return next({ message: "No media file was found", statusCode: 400 });
	}
};
