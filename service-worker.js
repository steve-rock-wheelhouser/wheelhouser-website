const PRECACHE = 'wheelhouser-precache-v2';
const RUNTIME = 'wheelhouser-runtime-v1';
const OFFLINE_URL = '/offline.html';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/css/style.css',
  '/js/main.js',
  '/manifest.json',
  '/icons.html',
  '/favicon.ico',
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
  '/assets/images/Ad-Images/Marquee-Magic-Ad_06-1200.webp',
  '/assets/images/Ad-Images/Marquee-Magic-Ad_06-800.webp',
  '/assets/images/Ad-Images/Marquee-Magic-Ad_06-480.webp',
  '/assets/images/Ad-Images/Marquee-Magic-Ad_06-1200.png',
  '/assets/images/Ad-Images/Marquee-Magic-Ad_06-800.png',
  '/assets/images/Ad-Images/Marquee-Magic-Ad_06-480.png'
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
        if (key !== PRECACHE && key !== RUNTIME) return caches.delete(key);
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

  // Navigation: network-first, fallback to cache, then offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(PRECACHE).then((cache) => cache.put(request, copy));
        return response;
      }).catch(() => caches.match(request).then((r) => r || caches.match(OFFLINE_URL)))
    );
    return;
  }

  const url = new URL(request.url);

  // Images: stale-while-revalidate (return cache if present, update in background)
  if (request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|webp|svg|gif)$/i)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request).then((resp) => {
          if (resp && resp.status === 200) {
            const respClone = resp.clone();
            caches.open(RUNTIME).then((cache) => cache.put(request, respClone));
          }
          return resp;
        }).catch(() => {});
        return cached || networkFetch;
      })
    );
    return;
  }

  // CSS/JS/Font: cache-first (they are precached), fallback to network
  if (request.destination === 'style' || request.destination === 'script' || request.destination === 'font') {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((resp) => {
        if (resp && resp.status === 200) {
          const respClone = resp.clone();
          caches.open(RUNTIME).then((cache) => cache.put(request, respClone));
        }
        return resp;
      }))
    );
    return;
  }

  // Default: network-first, fallback to cache
  event.respondWith(
    fetch(request).then((resp) => {
      if (request.method === 'GET' && resp && resp.status === 200) {
        const respClone = resp.clone();
        caches.open(RUNTIME).then((cache) => cache.put(request, respClone));
      }
      return resp;
    }).catch(() => caches.match(request))
  );
});
