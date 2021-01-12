declare global {
	const COMH_API_URI: string;
	const COMH_URI: string;

	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: string;
		}
	}
}

export {}
