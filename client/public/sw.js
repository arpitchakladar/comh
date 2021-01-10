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
	"https://fonts.googleapis.com/css2?family=Montserrat&display=swap"
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
		caches.match(event.request).then(cachedResponse => {
			if (cachedResponse) {
				return cachedResponse;
			}

			return caches.open(RUNTIME).then(cache => {
				return fetch(event.request).then(response => {
					cache.put(event.request, response.clone());
					return response;
				});
			});
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
