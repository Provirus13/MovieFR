// Service Worker pour MovieFR PWA
const CACHE_NAME = 'moviefr-v3.0.2';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/js/app.js',
  '/js/db.js',
  '/manifest.json',
  '/offline.html'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Cache ouvert');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Ancien cache supprimé');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch - Network First, puis Cache
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non-GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Pour les requêtes API
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then((response) => response || new Response('Contenu non disponible hors ligne', { status: 503 }));
        })
    );
  } else {
    // Pour les autres ressources
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request)
            .then((response) => {
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              const clonedResponse = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, clonedResponse);
              });
              return response;
            });
        })
        .catch(() => {
          return caches.match('/offline.html');
        })
    );
  }
});

// Notifications Push (optionnel)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nouveau contenu disponible!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
  };

  event.waitUntil(
    self.registration.showNotification('🎬 MovieFR', options)
  );
});

// Sync pour la synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-watchlist') {
    event.waitUntil(
      syncWatchlist()
        .then(() => console.log('✅ Watchlist synchronisée'))
        .catch(() => console.log('❌ Erreur de synchronisation'))
    );
  }
});

async function syncWatchlist() {
  const db = await openDatabase();
  const watchlist = await getAllFromDB(db, 'watchlist');
  
  // Envoyer au serveur
  const response = await fetch('/api/watchlist/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(watchlist)
  });
  
  return response.json();
}
