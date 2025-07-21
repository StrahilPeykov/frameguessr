const CACHE_NAME = 'frameguessr-v1'
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-icon.png',
  '/placeholder-movie.svg',
  '/og-image.png',
]

// Install event - cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache')
        return cache.addAll(urlsToCache)
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') return

  // Different strategies for different types of requests
  if (url.pathname.startsWith('/api/')) {
    // Network first for API calls
    event.respondWith(networkFirst(request))
  } else if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
    // Cache first for images
    event.respondWith(cacheFirst(request))
  } else if (url.pathname.startsWith('/_next/static/')) {
    // Cache first for static assets
    event.respondWith(cacheFirst(request))
  } else {
    // Network first for HTML pages
    event.respondWith(networkFirst(request))
  }
})

// Cache first strategy
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request)
  
  if (cached) {
    return cached
  }
  
  try {
    const response = await fetch(request)
    
    // Only cache successful responses
    if (response.status === 200) {
      const responseClone = response.clone()
      cache.put(request, responseClone)
    }
    
    return response
  } catch (error) {
    // Return offline page if available
    const offlinePage = await cache.match('/offline.html')
    if (offlinePage) {
      return offlinePage
    }
    
    // Return a basic offline response
    return new Response('Offline - No cached version available', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    })
  }
}

// Network first strategy
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME)
  
  try {
    const response = await fetch(request)
    
    // Only cache successful responses
    if (response.status === 200) {
      const responseClone = response.clone()
      cache.put(request, responseClone)
    }
    
    return response
  } catch (error) {
    // Try cache as fallback
    const cached = await cache.match(request)
    if (cached) {
      return cached
    }
    
    // Return offline page if available
    const offlinePage = await cache.match('/offline.html')
    if (offlinePage) {
      return offlinePage
    }
    
    // Return a basic offline response
    return new Response('Offline - Please check your connection', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    })
  }
}

// Handle background sync for offline guesses
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-guesses') {
    event.waitUntil(syncGuesses())
  }
})

async function syncGuesses() {
  // Get any offline guesses from IndexedDB
  // This is a placeholder - implement based on your needs
  console.log('Syncing offline guesses...')
}

// Handle push notifications (future feature)
self.addEventListener('push', (event) => {
  if (!event.data) return
  
  const data = event.data.json()
  const options = {
    body: data.body || 'New daily challenge available!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'play',
        title: 'Play Now',
        icon: '/icon-192.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('FrameGuessr', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'play') {
    // Open the game
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Periodic background sync for daily challenges
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-challenge') {
    event.waitUntil(checkDailyChallenge())
  }
})

async function checkDailyChallenge() {
  try {
    const response = await fetch('/api/daily')
    if (response.ok) {
      const data = await response.json()
      // Cache the daily challenge data
      const cache = await caches.open(CACHE_NAME)
      cache.put('/api/daily', response.clone())
    }
  } catch (error) {
    console.error('Failed to check daily challenge:', error)
  }
}

// Message handling
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => {
        return self.clients.matchAll()
      }).then((clients) => {
        clients.forEach(client => {
          client.postMessage({ type: 'CACHE_CLEARED' })
        })
      })
    )
  }
})