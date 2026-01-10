// =====================================================
// Service Worker per Push Notifications (PWA)
// =====================================================

const CACHE_NAME = '22club-v1'
const urlsToCache = ['/', '/login', '/home', '/dashboard', '/notifiche', '/manifest.json']

// Install event
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...')

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching app shell...')
        return cache.addAll(urlsToCache)
      })
      .then(() => {
        console.log('✅ Service Worker installed')
        return self.skipWaiting()
      }),
  )
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...')

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log('✅ Service Worker activated')
        return self.clients.claim()
      }),
  )
})

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request)
    }),
  )
})

// =====================================================
// Push Notifications
// =====================================================

// Push event - ricevi notifica
self.addEventListener('push', (event) => {
  console.log('📱 Push notification received:', event)

  let notificationData = {
    title: '22Club',
    body: 'Hai ricevuto una nuova notifica',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: '22club-notification',
    data: {},
  }

  // Parsing dei dati push se disponibili
  if (event.data) {
    try {
      const pushData = event.data.json()
      notificationData = {
        ...notificationData,
        ...pushData,
      }
    } catch (error) {
      console.error('Error parsing push data:', error)
    }
  }

  // Mostra la notifica
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      actions: [
        {
          action: 'view',
          title: 'Visualizza',
          icon: '/action-view.png',
        },
        {
          action: 'dismiss',
          title: 'Ignora',
          icon: '/action-dismiss.png',
        },
      ],
      requireInteraction: false,
      silent: false,
      vibrate: [200, 100, 200],
    }),
  )

  // Invia messaggio al client per aggiornare il contatore
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'NOTIFICATION_RECEIVED',
        data: notificationData,
      })
    })
  })
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('📱 Notification clicked:', event)

  event.notification.close()

  const notificationData = event.notification.data || {}
  const action = event.action

  if (action === 'dismiss') {
    // Notifica ignorata, non fare nulla
    return
  }

  // Determina l'URL di destinazione
  let targetUrl = '/'

  if (notificationData.link) {
    targetUrl = notificationData.link
  } else if (notificationData.type) {
    switch (notificationData.type) {
      case 'allenamento':
        targetUrl = '/home/allenamenti'
        break
      case 'documento':
        targetUrl = '/home/documenti'
        break
      case 'progressi':
        targetUrl = '/home/progressi'
        break
      case 'lezioni':
        targetUrl = '/home/pagamenti'
        break
      case 'sistema':
        targetUrl = '/dashboard/statistiche'
        break
      default:
        targetUrl = '/notifiche'
    }
  }

  // Apri o focusa la finestra
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // Cerca una finestra esistente
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          client.navigate(targetUrl)
          return
        }
      }

      // Se non c'è una finestra aperta, aprine una nuova
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    }),
  )

  // Invia messaggio al client per tracking
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'NOTIFICATION_CLICKED',
        data: {
          ...notificationData,
          targetUrl,
          action,
        },
      })
    })
  })
})

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('📱 Notification closed:', event)

  // Opzionale: tracking per analytics
  const notificationData = event.notification.data || {}

  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'NOTIFICATION_CLOSED',
        data: notificationData,
      })
    })
  })
})

// =====================================================
// Background Sync (opzionale)
// =====================================================

self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event.tag)

  if (event.tag === 'notification-sync') {
    event.waitUntil(
      // Sincronizza notifiche non lette
      syncNotifications(),
    )
  }
})

async function syncNotifications() {
  try {
    // Implementa logica di sincronizzazione se necessario
    console.log('📱 Syncing notifications...')
  } catch (error) {
    console.error('Error syncing notifications:', error)
  }
}

// =====================================================
// Message handling
// =====================================================

self.addEventListener('message', (event) => {
  console.log('📨 Message received in SW:', event.data)

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// =====================================================
// Error handling
// =====================================================

self.addEventListener('error', (event) => {
  console.error('❌ Service Worker error:', event.error)
})

self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Service Worker unhandled rejection:', event.reason)
})
