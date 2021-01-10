import multer from "multer";

export default multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024 * 15 } });
