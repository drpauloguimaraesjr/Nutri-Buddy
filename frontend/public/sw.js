// Service Worker for NutriBuddy PWA
// Incrementar a versão quando fizer mudanças importantes
const CACHE_NAME = 'nutribuddy-v2';
const URLS_TO_CACHE = [
  '/',
  '/dashboard',
  '/dashboard/meals',
  '/dashboard/water',
  '/dashboard/exercises',
  '/dashboard/goals',
  '/dashboard/chat',
  '/dashboard/fasting',
  '/dashboard/measurements',
  '/dashboard/reports',
  '/dashboard/recipes',
  '/dashboard/glucose',
  '/dashboard/benefits'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(URLS_TO_CACHE).catch((error) => {
        console.log('Cache addAll error:', error);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip non-HTTP(S) requests (chrome-extension, etc)
  try {
    const url = new URL(event.request.url);
    if (!url.protocol.startsWith('http')) {
      return;
    }
  } catch (error) {
    // Invalid URL, skip
    return;
  }

  // Skip API calls (let them go to network)
  if (event.request.url.includes('/api/')) {
    return;
  }

  // Skip Firebase Realtime Database requests (channel, .json, etc)
  if (event.request.url.includes('firebaseio.com') || 
      event.request.url.includes('/channel?') ||
      event.request.url.includes('.firebaseapp.com/channel')) {
    return;
  }

  // Skip chrome-extension and other unsupported schemes
  if (event.request.url.startsWith('chrome-extension://') ||
      event.request.url.startsWith('moz-extension://') ||
      event.request.url.startsWith('safari-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }

      // Clone the request
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest).then((response) => {
        // Check if valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Don't cache chrome-extension or other unsupported schemes
        try {
          const responseUrl = new URL(response.url);
          if (!responseUrl.protocol.startsWith('http')) {
            return response;
          }
        } catch (error) {
          // Invalid URL, return response as-is
          return response;
        }

        // Skip caching Firebase and API responses
        if (response.url.includes('firebaseio.com') || 
            response.url.includes('/api/') ||
            response.url.includes('/channel?')) {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          try {
            cache.put(event.request, responseToCache);
          } catch (error) {
            console.log('Cache put error (ignored):', error);
          }
        });

        return response;
      }).catch((error) => {
        // Network error - try to serve from cache or return error
        console.log('Fetch error (SW):', error);
        return caches.match(event.request).catch(() => {
          // No cache match, return network error
          return new Response('Network error', { status: 408 });
        });
      });
    }).catch(() => {
      // Offline fallback
      return caches.match('/offline.html');
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-meals') {
    event.waitUntil(syncMeals());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do NutriBuddy',
    icon: '/icon-192x192.png',
    badge: '/icon-96x96.png',
    vibrate: [200, 100, 200],
    tag: 'nutribuddy-notification',
    requireInteraction: false,
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'close', title: 'Fechar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('NutriBuddy', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper function for syncing meals
async function syncMeals() {
  // This would sync pending meals from IndexedDB to the server
  console.log('Syncing meals...');
  // Implementation would go here
}

