// Service Worker for IPL Predictor 2026
// Handles Web Push Notifications and basic PWA requirements

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Leave fetch handling to just go to network for real-time data
    event.respondWith(fetch(event.request));
});

// ─── Web Push Notification Handler ───────────────────────────────
self.addEventListener('push', (event) => {
    let data = { title: '🏏 IPL Predictor', body: 'You have a new notification!' };

    try {
        if (event.data) {
            data = event.data.json();
        }
    } catch (e) {
        console.error('Failed to parse push data:', e);
    }

    const options = {
        body: data.body || 'Check for upcoming matches!',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/'
        },
        actions: [
            { action: 'predict', title: '🎯 Predict Now' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title || '🏏 IPL Predictor', options)
    );
});

// When user clicks the notification, open the app to the relevant match
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'dismiss') {
        return;
    }

    const targetUrl = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If the app is already open, focus it and navigate
            for (const client of clientList) {
                if (client.url.includes(self.location.origin)) {
                    client.navigate(targetUrl);
                    return client.focus();
                }
            }
            // Otherwise open a new window
            return clients.openWindow(targetUrl);
        })
    );
});
