// Haven Service Worker — Push notifications + offline cache shell
'use strict';

var CACHE_NAME = 'haven-v1';

// Install: cache the app shell
self.addEventListener('install', function(e) {
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', function(e) {
    e.waitUntil(self.clients.claim());
});

// Handle notification clicks — focus or open the app
self.addEventListener('notificationclick', function(e) {
    e.notification.close();
    e.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clients) {
            // Focus existing window if any
            for (var i = 0; i < clients.length; i++) {
                if (clients[i].url.includes('index.html') || clients[i].url.endsWith('/haven/')) {
                    return clients[i].focus();
                }
            }
            // Otherwise open a new window
            return self.clients.openWindow('./index.html');
        })
    );
});

// Handle push events (for future server-sent push)
self.addEventListener('push', function(e) {
    var data = { title: 'Haven', body: 'Something awaits you!', icon: '⬡' };
    if (e.data) {
        try { data = e.data.json(); } catch (err) { data.body = e.data.text(); }
    }
    e.waitUntil(
        self.registration.showNotification(data.title || 'Haven', {
            body: data.body,
            icon: data.icon || undefined,
            badge: data.badge || undefined,
            tag: data.tag || 'haven-push',
            data: data.data || {}
        })
    );
});
