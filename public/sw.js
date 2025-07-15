// FixItForMe Mobile PWA Service Worker
// Focused on mobile contractor essential features with offline fallbacks

const CACHE_NAME = 'fixitforme-mobile-v1.4.0'
const STATIC_CACHE = 'fixitforme-static-v1.4.0'

// Essential files for mobile contractor experience
// Note: Excluding '/' since it redirects to '/login' - causes service worker conflicts
const STATIC_ASSETS = [
  '/login',
  '/contractor/dashboard',
  '/contractor/mobile-chat',
  '/contractor/leads',
  '/manifest.json',
  '/logo.png',
  '/favicon.ico'
]

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing FixItForMe Mobile PWA Service Worker')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets for mobile contractors')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('[SW] Mobile contractor PWA ready for offline use')
        return self.skipWaiting()
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating FixItForMe Mobile PWA v1.3.0 - FORCE CACHE REFRESH')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Delete ALL old caches, including current ones to force refresh
              return cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE
            })
            .map((cacheName) => {
              console.log('[SW] Removing old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      })
      .then(() => {
        // Also clear current caches to force fresh downloads
        return Promise.all([
          caches.delete(CACHE_NAME),
          caches.delete(STATIC_CACHE)
        ])
      })
      .then(() => {
        console.log('[SW] All caches cleared - forcing fresh asset downloads')
        return self.clients.claim()
      })
  )
})

// Fetch event - serve cached content with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Bypass ALL navigation requests - let the browser handle them completely
  // This prevents service worker interference with authentication redirects
  if (request.mode === 'navigate') {
    console.log('[SW] Allowing browser to handle navigation to:', url.pathname);
    return; // Don't intercept navigation at all
  }

  // Bypass cache for all API calls to ensure fresh data
  if (url.pathname.startsWith('/api/')) {
    console.log('[SW] Bypassing cache for API route:', url.pathname);
    event.respondWith(fetch(request));
    return;
  }

  // Cache-first strategy for static assets only (images, CSS, JS)
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }
        return fetch(request).then((response) => {
          if (response.status === 200 && response.type === 'basic') {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag)
  
  if (event.tag === 'contractor-leads-sync') {
    event.waitUntil(
      // Sync lead updates when back online
      fetch('/api/leads/sync', { method: 'POST' })
        .then(() => {
          console.log('[SW] Lead data synced successfully')
          return self.registration.showNotification('FixItForMe Mobile', {
            body: 'Lead data updated - new opportunities available!',
            icon: '/logo.png',
            tag: 'leads-sync'
          })
        })
        .catch((error) => {
          console.error('[SW] Lead sync failed:', error)
        })
    )
  }
})

// Push notifications for contractor alerts
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received')
  
  const options = {
    body: event.data ? event.data.text() : 'New contractor notification',
    icon: '/logo.png',
    badge: '/logo.png',
    tag: 'contractor-alert',
    actions: [
      {
        action: 'view',
        title: 'View Dashboard'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('FixItForMe Mobile', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action)
  
  event.notification.close()

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/contractor/dashboard')
    )
  }
})

console.log('[SW] FixItForMe Mobile PWA Service Worker loaded successfully')

  // Clear browser storage on auth errors to prevent login issues
  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CLEAR_AUTH_CACHE') {
      console.log('[SW] Clearing authentication cache');
      caches.delete(CACHE_NAME);
      caches.delete(STATIC_CACHE);
      
      // Notify all clients to clear localStorage
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'CLEAR_LOCAL_STORAGE' });
        });
      });
    }
  });