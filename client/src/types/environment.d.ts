declare global {
	const COMH_API_URI: "http://localhost:8081" | "https://comh-api.herokuapp.com";
	const COMH_URI: "http://localhost:8080" | "https://comh.now.sh";

	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: "development" | "production";
		}
	}
}

export {}
