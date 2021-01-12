declare global {
	interface Window {
		comhApiUri: "http://localhost:8081" | "https://comh-api.herokuapp.com";
		comhUri: "http://localhost:8080" | "https://comh.now.sh";
		env: "production" | "development";
	}
}

export {}
