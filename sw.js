// Service Worker for Mini Science Lab
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Real-time Web Push event handler
self.addEventListener('push', (event) => {
  let data = { title: '🔬 Mini Science Lab', body: 'New science alert received!' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || 'New science mission available in Mini Science Lab!',
    icon: './assets/icons/icon-192.png',
    badge: './assets/icons/icon-192.png',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    data: data.data || { dateOfArrival: Date.now() }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '🔬 Mini Science Lab', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('./index.html');
    })
  );
});
