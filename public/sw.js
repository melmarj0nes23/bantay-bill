self.addEventListener('push', function(event) {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { body: event.data.text() };
    }
  }
  
  const title = data.title || 'BantayBills Reminder';
  const options = {
    body: data.body || 'You have an upcoming bill.',
    icon: '/vite.svg',
    badge: '/vite.svg',
    data: { url: data.url || '/' }
  };
  
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
