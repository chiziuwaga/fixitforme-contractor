// FixItForMe Mobile PWA Service Worker
// Focused on mobile contractor essential features with offline fallbacks

const CACHE_NAME = 'fixitforme-mobile-v1.3.1'
const STATIC_CACHE = 'fixitforme-static-v1.3.0'

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

  // AUTHENTICATION CACHE BYPASS - CRITICAL FOR LOGIN
  if (url.pathname.includes('/api/auth/') || 
      url.pathname.includes('/login') || 
      url.pathname.includes('/auth/') ||
      url.pathname.includes('/api/send-whatsapp-otp') ||
      url.pathname === '/') {
    console.log('[SW] Bypassing cache for auth route:', url.pathname);
    event.respondWith(fetch(request, { 
      redirect: 'follow',
      cache: 'no-store'  // Force fresh requests for auth
    }));
    return;
  }

  // Skip non-GET requests and external URLs
  if (request.method !== 'GET' || !url.origin.includes(self.location.origin)) {
    return
  }

  // Handle API requests - cache with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request, { redirect: 'follow' })
        .then((response) => {
          // Only cache successful API responses
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone)
              })
          }
          return response
        })
        .catch(() => {
          // Return cached version if network fails
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                console.log('[SW] Serving cached API response:', url.pathname)
                return cachedResponse
              }
              // Return offline fallback for critical contractor APIs
              if (url.pathname.includes('/api/leads')) {
                return new Response(
                  JSON.stringify({
                    leads: [],
                    message: 'Offline - connect to internet for latest leads',
                    offline: true
                  }),
                  {
                    headers: { 'Content-Type': 'application/json' },
                    status: 200
                  }
                )
              }
              return new Response('Offline', { status: 503 })
            })
        })
    )
    return
  }

  // Handle static assets and pages - cache-first strategy
  // Special handling for root route FIRST - never cache, always redirect
  if (url.pathname === '/') {
    console.log('[SW] Root route requested, redirecting to login (bypassing cache)')
    event.respondWith(Response.redirect(new URL('/login', url.origin), 302))
    return
  }

  // Handle Next.js chunks and build assets - ALWAYS fetch fresh (network-first)
  if (url.pathname.includes('/_next/static/chunks/') || url.pathname.includes('/_next/static/css/')) {
    console.log('[SW] Next.js build asset - fetching fresh:', url.pathname)
    event.respondWith(
      fetch(request, { redirect: 'follow' })
        .then((response) => {
          // Cache fresh Next.js assets
          if (response && response.status === 200) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Fallback to cache only if network fails
          return caches.match(request)
        })
    )
    return
  }

  // For other routes (pages, images, etc.), use cache-first strategy
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('[SW] Serving cached asset:', url.pathname)
          return cachedResponse
        }

        // Fetch from network and cache - handle redirects properly
        return fetch(request, { redirect: 'follow' })
          .then((response) => {
            // Only cache successful responses that aren't redirects
            if (response.status === 200 && response.type !== 'opaqueredirect') {
              const responseClone = response.clone()
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone)
                })
            }
            return response
          })
          .catch(() => {
            // Offline fallback for essential contractor pages
            if (url.pathname === '/contractor/dashboard') {
              return caches.match('/contractor/dashboard')
                .then((cached) => cached || new Response(
                  `
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <title>FixItForMe Mobile - Offline</title>
                      <meta name="viewport" content="width=device-width, initial-scale=1">
                      <style>
                        body { 
                          font-family: system-ui; 
                          padding: 20px; 
                          text-align: center;
                          background: #1A2E1A;
                          color: white;
                        }
                        .logo { 
                          width: 80px; 
                          height: 80px; 
                          margin: 20px auto;
                          background: #D4A574;
                          border-radius: 50%;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          font-size: 24px;
                        }
                      </style>
                    </head>
                    <body>
                      <div class="logo">🔧</div>
                      <h1>FixItForMe Mobile</h1>
                      <p>You're offline. Connect to internet to access your contractor dashboard and latest leads.</p>
                      <p>Cached chat history and basic features available.</p>
                      <button onclick="window.location.reload()">Try Again</button>
                    </body>
                  </html>
                  `,
                  { headers: { 'Content-Type': 'text/html' } }
                ))
            }

            return new Response('Offline', { status: 503 })
          })
      })
  )
})

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