const CACHE_NAME = 'GDS_PUPPIES_CACHE_V1';

// Define the assets to cache
// IMPORTANT: Placeholder asset names are used for JS/CSS.
// In a real build process (e.g., with Vite and vite-plugin-pwa),
// these would be replaced with the actual hashed filenames.
const assetsToCache = [
  '/',
  '/index.html', // Explicitly cache index.html
  '/manifest.json',
  '/favicon.ico', // Standard favicon path
  '/images/logo.png', // Common logo path, adjust if different
  // Placeholder for main JavaScript bundle
  '/assets/index.js', // Replace with actual hashed name like /assets/index-abcdef.js
  // Placeholder for main CSS bundle
  '/assets/index.css',  // Replace with actual hashed name like /assets/index-123456.css
  // Add other important public assets if known (e.g., fonts, key images not covered by runtime caching)
];

// Install event: Open cache and add assets.
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching app shell:', assetsToCache);
        return cache.addAll(assetsToCache)
          .catch(error => {
            console.error('[ServiceWorker] Failed to cache app shell during install:', error);
            // If any of assetsToCache fails, addAll rejects.
            // For critical assets, this might be desired. For non-critical,
            // consider caching them individually and handling errors.
          });
      })
      .then(() => {
        console.log('[ServiceWorker] App shell cached successfully.');
        return self.skipWaiting(); // Activate new SW immediately
      })
  );
});

// Activate event: Clean up old caches.
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[ServiceWorker] Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      console.log('[ServiceWorker] Activated successfully and old caches cleaned.');
      return self.clients.claim(); // Take control of all open clients
    })
  );
});

// Fetch event: Implement cache-first strategy.
self.addEventListener('fetch', (event) => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  // For navigation requests, try network first, then cache, then offline page (if any).
  // This is a common strategy for SPAs to ensure users get the latest HTML.
  // However, for this subtask, a generic cache-first is requested.

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Cache hit - return response
        if (cachedResponse) {
          // console.log('[ServiceWorker] Returning response from cache:', event.request.url);
          return cachedResponse;
        }

        // Not in cache - fetch from network
        // console.log('[ServiceWorker] Fetching from network:', event.request.url);
        return fetch(event.request).then(
          (networkResponse) => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                // console.log('[ServiceWorker] Caching new resource:', event.request.url);
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(error => {
          console.warn('[ServiceWorker] Fetch failed; returning offline fallback if available or error for:', event.request.url, error);
          // Optional: Return an offline fallback page if the request is for a navigation.
          // if (event.request.mode === 'navigate') {
          //   return caches.match('/offline.html'); // You would need to cache an offline.html
          // }
          // For other assets, just let the error propagate or return a generic error response.
        });
      })
  );
});
