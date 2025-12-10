const CACHE_NAME = 'wheelhouser-static-v1';
const OFFLINE_URL = '/offline.html';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/css/style.css',
  '/js/main.js',
  '/manifest.json',
  '/icons.html',
  '/images/wheelhouser-icon/resized_icons/wheelhouser-icon_32x32.png',
  '/images/wheelhouser-icon/resized_icons/wheelhouser-icon_64x64.png',
  '/images/wheelhouser-icon/resized_icons/wheelhouser-icon_256x256.png',
  '/images/wheelhouser-icon/resized_icons/wheelhouser-icon_512x512.png',
  '/images/wheelhouser-icon/resized_icons/wheelhouser-icon_16x16.webp',
  '/images/wheelhouser-icon/resized_icons/wheelhouser-icon_32x32.webp',
  '/images/wheelhouser-icon/resized_icons/wheelhouser-icon_64x64.webp',
  '/images/wheelhouser-icon/resized_icons/wheelhouser-icon_128x128.webp',
  '/images/wheelhouser-icon/resized_icons/wheelhouser-icon_256x256.webp',
  '/images/wheelhouser-icon/resized_icons/wheelhouser-icon_512x512.webp',
  '/images/wheelhouser-icon/resized_icons/wheelhouser-icon_1024x1024.webp',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))).then(() => self.clients.claim())
  );
});

// Listen for messages from the client (e.g., skip waiting)
self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Always try navigation requests from network first, fallback to cache then offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then((response) => {
        // Put a copy in the cache for next time
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      }).catch(() => caches.match(request).then((r) => r || caches.match(OFFLINE_URL)))
    );
    return;
  }

  // For other requests, respond with cache first, then network
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((resp) => {
      // store fetched resource for later
      if (request.method === 'GET' && resp && resp.status === 200 && resp.type !== 'opaque') {
        const respClone = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, respClone));
      }
      return resp;
    }).catch(() => {
      // If it's an image request and offline, we could return a data URI or leave it
      return cached;
    }))
  );
});
