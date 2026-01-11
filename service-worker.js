// Ultra-minimal Service Worker for Wheelhouser LLC
const CACHE_NAME = 'wheelhouser-minimal-v1';

// We only cache the absolute essentials to prevent any install failures
const PRE_CACHE_RESOURCES = [
  '/',
  '/index.html',
  '/offline.html',
  '/css/styles.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRE_CACHE_RESOURCES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Network-first strategy: Try the internet first, fallback to cache
  if (event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request)
            .then((response) => {
              if (response) {
                return response;
              }
              // If it's a page navigation, show the offline page
              if (event.request.mode === 'navigate') {
                return caches.match('/offline.html');
              }
            });
        })
    );
  }
});
