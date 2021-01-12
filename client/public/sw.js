const CACHE_NAME = "comh-cache-v1.1";
const urlsToCache = [
	"/",
	"/style.css",
	"/manifest.json",
	"/bundle.js",
	"/favicon.png",
	"/favicon.ico",
	"/assets/notify.mp3",
	"https://fonts.googleapis.com/css2?family=Montserrat&display=swap",
	"https://fonts.gstatic.com/s/montserrat/v15/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2",
	"https://unpkg.com/react@17.0.1/umd/react.production.min.js",
	"https://unpkg.com/react-dom@17.0.1/umd/react-dom.production.min.js"
];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME)
			.then((cache) => {
				return Promise.all(urlsToCache.map((url) => {
					return cache.add(url).catch((reason) => {
						console.log(`Failed to add ${url} to service worker due to reason "${reason}"`);
					});
				}));
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
