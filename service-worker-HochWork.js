

const PRECACHE = 'sw-preCache';
const RUNTIME = 'runtime';

// every check-in should change this value for refresh cache.
let hash = '1/29:8:00/2020';

self.addEventListener('install', (event) => {
    console.debug("service-worker::install event", event);
    event.waitUntil(
        caches.open(PRECACHE)
        .then(cache => {
            cache.addAll(files_to_cache);
        })
        .then(self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    console.debug("service-worker::activate event", event);
    // New service worker upgrade, then delete caches other than whitelist..
    const whiteList = [];  // const whiteList = [PRECACHE];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return cacheNames.filter(cacheName => !whiteList.includes(cacheName));
        }).then(cachesToDelete => {
            return Promise.all(cachesToDelete.map(cacheToDelete => {
                return caches.delete(cacheToDelete);
            }));
        }).then(() => self.clients.claim())
    );
});

function truncate_string(str, length) {
	if (!length) {
		length = 100;
	}
	if (str.length > length) {
		return str.substring(0, length - 3) + "...";
	}
	return str;
}

function tryReadFile(file) {
    try {
        var reader = new FileReader();
        reader.addEventListener('load', function(e) {
	    var text = e.target.result;
	    console.debug("Read file '", file, "': ", truncate_string(text));
	});
        reader.addEventListener('error', function() {
	    console.warn("Failed to read file '", file, "'");
	});
        reader.readAsText(file);
    } catch (ex) {
        console.warn("Failed to start reading file '", file, "'");
    }
}

self.addEventListener('fetch', (event) => {
    console.debug("service-worker::fetch event", event);
    // Only worry about processing events targeting this origin
    if (event.request.url.startsWith(self.location.origin)) {
		// If this is a POST event, log what was sent and re-process as a GET event
		if (event.request.method === "POST") {
			event.respondWith((async () => {
				try {
					const formData = await event.request.clone().formData();
					var stringifiedFormData = "service-worker::fetch > event.formData() > entries:\r\n";
					for (var entry of formData) {
						stringifiedFormData += entry.toString() + "\r\n";
						if (entry[1] instanceof File) {
							tryReadFile(entry[1]);
						}
						if (entry[1] instanceof FileList) {
							for (var file of entry[1]) {
								tryReadFile(file);
							}
						}
					}
					console.debug(stringifiedFormData);
				} catch (e) {
					console.warn("service-worker::fetch > event.formData() failed: ", e);
				}
				return fetch(event.request.url);
			})());
			return;
		}

		// If this is a GET event, check if it is for a file in our cache list
        var path = event.request.url;
        if (files_to_cache.indexOf(path) !== -1) {
			// If so, check if it is in the cache
			event.respondWith(
				caches.open(RUNTIME).then(function(cache) {
					return cache.match(event.request).then(function (response) {
						// If it is in the cache return that result, but regardless
						// execute a new fetch to to update the cache with (and return
						// that result if the original cache result was not available).
						return response || fetch(event.request).then(function(response) {
							// If we didn't receive a recognized valid response, there's nothing to cache, so just return it
							if(!response || response.status !== 200 || response.type !== 'basic') {
								return response;
							}
						
							// Cache a clone of the response
							cache.put(event.request, response.clone());
							
							// Return the response to the browser
							return response;
						});
					});
				})
			);
        }
    }
});

var files_to_cache = [
    "https://mhochk.github.io/hochs-pwa/service-worker.js"
]

