declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: "development" | "production";
			PORT?: string;
			DOMAIN: string;
			IBM_COS_BUCKET: string;
			IBM_COS_ENDPOINT: string;
			IBM_COS_SERVICE_INSTANCE_ID: string;
			MONGODB_URI: string;
		}
	}
}

export {}
