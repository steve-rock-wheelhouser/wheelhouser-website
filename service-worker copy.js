const PRECACHE = 'wheelhouser-precache-v5';
const RUNTIME = 'wheelhouser-runtime-v3';
const OFFLINE_URL = '/offline.html';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/css/styles.css',
  '/js/main.js',
  '/manifest.json',
  '/icons.html',
  '/images/wheelhouser-W/web/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== PRECACHE && key !== RUNTIME) {
          return caches.delete(key);
        }
      })
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(RUNTIME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      });
    }).catch(() => {
      if (event.request.mode === 'navigate') {
        return caches.match(OFFLINE_URL);
      }
    })
  );
});
