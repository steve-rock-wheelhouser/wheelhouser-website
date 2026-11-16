// Ultra-minimal Service Worker for Wheelhouser LLC (v10 — Dedicated Core Suite Page & Streamlined Homepage)
const CACHE_NAME = 'wheelhouser-minimal-v10';

const PRE_CACHE_RESOURCES = [
  '/',
  '/index.html',
  '/core-suite.html',
  '/services.html',
  '/about.html',
  '/offline.html',
  '/css/styles.css?v=2.0.4',
  '/js/main.js?v=2.0.1',
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
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
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
              if (event.request.mode === 'navigate') {
                return caches.match('/offline.html');
              }
            });
        })
    );
  }
});
