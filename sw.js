const CACHE_NAME = 'parfums-premium-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/fond.png',
  '/bois.png',
  '/bakara.png',
  '/aicha.png',
  '/mula.png',
  '/savage.png',
  '/kirke.png',
  '/rose.png',
  '/noir.png'
 
];

// Installation du Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Interception des requêtes fetch
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si trouvé dans le cache, retourner la réponse cachée
        if (response) {
          return response;
        }
        
        // Sinon faire une requête réseau
        return fetch(event.request)
          .then(response => {
            // Vérifier si la réponse est valide
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Cloner la réponse pour pouvoir la mettre en cache
            var responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          })
          .catch(() => {
            // En cas d'erreur réseau, retourner la page hors ligne
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});