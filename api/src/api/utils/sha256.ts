import * as crypto from "crypto";

export const hash = (text: string) => {
	const hash = crypto.createHash("sha256");
	hash.update(text);
	return hash.digest("hex");
};
