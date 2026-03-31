// Very basic service worker to satisfy PWA install requirements
// We bypass caching entirely so users always see the latest live scores/predictions
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Leave fetch handling empty to just go to network, ensuring the fastest real-time updates
    event.respondWith(fetch(event.request));
});
