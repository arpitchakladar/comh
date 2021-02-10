import express from "express";
import * as fileControllers from "@/api/controllers/media";
import upload from "@/api/utils/upload";

const router = express.Router();

router.post('/upload', upload.single("media"), fileControllers.uploadMedia);

router.get('/:key', fileControllers.getMedia);

export default router;
