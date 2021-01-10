const CACHE_NAME = "comh-cache-v1.1";
const urlsToCache = [
	"/",
	"/style.css",
	"/manifest.json",
	"/bundle.js",
	"/favicon.png",
	"/favicon.ico",
	"/assets/loading.gif",
	"/assets/notify.mp3",
	"https://fonts.googleapis.com/css2?family=Montserrat&display=swap",
	"https://fonts.gstatic.com/s/montserrat/v15/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2"
];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME)
			.then((cache) => {
				return cache.addAll(urlsToCache);
			})
	);
});

self.addEventListener("fetch", (event) => {
	event.respondWith(
		caches.match(event.request)
			.then((response) => {
				if (response) {
					return response;
				}

				return fetch(event.request);
			})
	);
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((key) => {
					if(key !== CACHE_NAME) {
						return caches.delete(key);
					}
				})
			);
		})
	);
});
