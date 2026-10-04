// sw.js - Service Worker Nivel Produccin (Anti-fallos)
const CACHE_NAME = 'yape-next-v1'; // Cambiado a v1 para Next.js y forzar actualizacin

// Lista VIP de memoria: cacheamos el ncleo de la app
const urlsToCache = [
  '/',
  '/inicio',
  '/login_pin',
  '/monto',
  '/exito',
  '/exito_servicios',
  '/servicios',
  '/opciones',
  '/editar_voucher',
  '/editar_datos',
  '/agregar_contacto',
  '/agregar_qr',
  '/manifest.json'
];

// 1. INSTALACIN (Sin morir en el intento)
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Ignorar errores en rutas individuales al cachear (Next.js usa fetch dinmico a veces)
      return Promise.allSettled(
        urlsToCache.map(url => cache.add(url).catch(err => console.log('Error caching:', url)))
      );
    })
  );
});

// 2. ACTIVACIN (El limpiador de basura vieja)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Borrando cach antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. INTERCEPTOR DE RED
self.addEventListener('fetch', event => {
  // Solo cachear GET requests y no cachear la API ni extensiones chrome
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension')) {
    return;
  }
  
  event.respondWith(
    // Estrategia Stale-While-Revalidate o Network First para Next.js
    fetch(event.request).then(response => {
      // Si la red funciona, actualizamos el cach y devolvemos la respuesta
      const responseClone = response.clone();
      caches.open(CACHE_NAME).then(cache => {
        cache.put(event.request, responseClone);
      });
      return response;
    }).catch(function() {
      // Si no hay internet, intentamos sacar del cach
      return caches.match(event.request);
    })
  );
});
