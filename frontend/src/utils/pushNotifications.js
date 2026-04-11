import api from '../api';

/**
 * Check if the browser supports Web Push Notifications
 */
export function isPushSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/**
 * Get current notification permission state
 * Returns: 'granted', 'denied', or 'default'
 */
export function getPermissionState() {
    if (!isPushSupported()) return 'unsupported';
    return Notification.permission;
}

/**
 * Convert a base64 VAPID key string to a Uint8Array (required by the Push API)
 */
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**
 * Subscribe the user to push notifications.
 * This will:
 * 1. Register/update the service worker
 * 2. Request notification permission
 * 3. Get the VAPID public key from the backend
 * 4. Create a push subscription with the browser
 * 5. Send the subscription to the backend to store
 */
export async function subscribeToPush() {
    if (!isPushSupported()) {
        throw new Error('Push notifications are not supported in this browser');
    }

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        throw new Error('Notification permission denied');
    }

    // Register the service worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    // Get the VAPID public key from the backend
    const { data } = await api.get('/api/notifications/vapid-key');
    const vapidPublicKey = data.public_key;

    // Subscribe to push through the browser's Push API
    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    // Extract keys from the subscription
    const subJSON = subscription.toJSON();
    const subscriptionData = {
        endpoint: subJSON.endpoint,
        p256dh: subJSON.keys.p256dh,
        auth: subJSON.keys.auth,
    };

    // Send subscription to our backend
    await api.post('/api/user/notifications/subscribe', subscriptionData);

    return subscription;
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
        // Tell our backend to remove it
        await api.post('/api/user/notifications/unsubscribe', {
            endpoint: subscription.endpoint,
        });
        // Unsubscribe from the browser
        await subscription.unsubscribe();
    }
}

/**
 * Check if the user currently has an active push subscription in the browser
 */
export async function isCurrentlySubscribed() {
    if (!isPushSupported()) return false;

    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;

    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
}
