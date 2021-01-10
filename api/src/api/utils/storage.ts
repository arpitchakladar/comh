import crypto from "crypto";
import path from "path";
import ibmCosSDK from "ibm-cos-sdk";

const cos = new ibmCosSDK.S3({
	endpoint: process.env.IBM_COS_ENDPOINT,
	apiKeyId: process.env.IBM_COS_API_KEY,
	serviceInstanceId: process.env.IBM_COS_SERVICE_INSTANCE_ID,
});

console.log("Successfully connected to IBM cloud object storage");

export type File = {
	originalname: string;
	buffer: Buffer
}

export const addItem = async (file: File, _path: string) => {
	const key = crypto.randomBytes(20).toString("hex") + path.extname(file.originalname);

	await cos.putObject({
		Bucket: process.env.IBM_COS_BUCKET, 
		Key: key, 
		Body: file.buffer
	}).promise();

	return `${process.env.DOMAIN}/${_path}/${key}`;
};

export const checkItemExists = async (_path: string) => {
	const key = path.basename(_path);

	try {
		await cos.headObject({
			Bucket: process.env.IBM_COS_BUCKET,
			Key: key
		}).promise();

		return true;
	} catch (err) {
		if (err.code === "NoSuchKey") {
			return false;
		}

		throw err;
	}
};

export const getItem = async (key: string) => {
	const body = (await cos.getObject({
		Bucket: process.env.IBM_COS_BUCKET,
		Key: key
	}).promise()).Body;

	return Buffer.from(body as any);
};

export const deleteItem = async (_path: string) => await cos.deleteObject({
	Bucket: process.env.IBM_COS_BUCKET,
	Key: path.basename(_path)
}).promise();
