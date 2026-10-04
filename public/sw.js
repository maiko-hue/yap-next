// sw.js - Service Worker Nivel Producción (Anti-fallos)
const CACHE_NAME = 'yape-v5'; // Cambiado a v5 para forzar la actualización de todos los íconos

// Lista VIP de memoria: cacheamos todo el núcleo de la app para que cargue en 0 segundos
const urlsToCache = [
  '/',
  '/index.html',
  '/inicio.html',
  '/login_pin.html',
  '/escanear.html',
  '/yapear.html',
  '/monto.html',
  '/exito.html',
  '/exito_editable.html',
  '/exito_servicios.html',
  '/servicios.html',
  '/perfil.html',
  '/opciones.html',
  '/sobre.html',
  '/style.css',
  '/seguridad.js',
  '/manifest.json',

  // --- BÓVEDA TOTAL DE IMÁGENES Y MULTIMEDIA ---
  // Banners y Fondos
  '/img/10.jpg',
  '/img/20.jpg',
  '/img/50.jpg',
  '/img/100.jpg',
  '/img/200.jpg',
  '/img/h_fondo1.jpg',
  '/img/h_fondo2.jpg',
  '/img/h_fondo3.jpg',
  '/img/h_fondo4.jpg',
  '/img/h_fondo5.jpg',
  '/img/h_fondo6.jpg',

  // Promociones y Publicidad (WEBP y JPG)
  '/img/prom-1.jpg',
  '/img/prom-3.jpg',
  '/img/prom-4.jpg',
  '/img/prom-6.jpg',
  '/img/cnjvw02u0kiizr7cmdze.webp',
  '/img/dfxexhqz0ljgixgrc71s.webp',
  '/img/hbi3k6wkz09e5sggstxp.webp',
  '/img/hgdybgbebofngmi3q8dr.webp',
  '/img/lntvtu6siosxnkxwyazk.webp',
  '/img/n2htnzpfyn7wlwixuchk.webp',
  '/img/nrewunfzaog5j43g4ned.webp',
  '/img/oy0kuhvapnkwtazyyozh.webp',
  '/img/u3d0lfltdyebjxhsma8s.webp',
  '/img/ugv4arfcb4mmsk8t600y.webp',
  '/img/xyj9w83jmmimoiqipld7.webp',
  '/img/ygfgjoyhfhxkdbqtrsvk.jpg',
  '/img/z9xriezpfzkwylyqfpdt.webp',
  '/img/zhx1nztq3y8bocojgtol.webp',

  // Íconos Principales de Botones (Cuadrícula)
  '/img/icono1.png',
  '/img/icono2.png',
  '/img/icono3.png',
  '/img/icono4.png',
  '/img/icono5.png',
  '/img/icono6.png',
  '/img/icono7.png',
  '/img/icono8.png',
  '/img/icono9.png',
  '/img/icono10.png',
  '/img/icono11.png',
  '/img/icono12.png',
  '/img/icono_yapear.png',
  '/img/icono_movimientos.png',
  
  // Íconos de Opciones y Menú (SVG)
  '/img/anuncio1.svg',
  '/img/anuncio2.svg',
  '/img/anuncio3.svg',
  '/img/anuncio4.svg',
  '/img/anuncio5.svg',
  '/img/anuncio6.svg',
  '/img/aprende-yape-icon.svg',
  '/img/arrows.svg',
  '/img/bell.svg',
  '/img/campana-icon.svg',
  '/img/cerrar-cuenta-icon.svg',
  '/img/codigo-seguridad-icon.svg',
  '/img/fecha-icon.svg',
  '/img/flecha-icon.svg',
  '/img/fonoicon.svg',
  '/img/headphones.svg',
  '/img/hora-icon.svg',
  '/img/huella-dactilar.svg',
  '/img/iconservv.svg',
  '/img/LogoYape.svg',
  '/img/lupanueva.svg',
  '/img/mp-biometria-icon.svg',
  '/img/mp-compras-icon.svg',
  '/img/mp-datos-icon.svg',
  '/img/mp-direcciones-icon.svg',
  '/img/mp-eliminar-icon.svg',
  '/img/mp-informacion-icon.svg',
  '/img/mp-limites-icon.svg',
  '/img/mp-notificaciones-icon.svg',
  '/img/mp-qr-icon.svg',
  '/img/ojo-abierto-icon.svg',
  '/img/person.svg',
  '/img/politica-icon.svg',
  '/img/promos-il-icon.svg',
  '/img/qr-icon.svg',
  '/img/seguros-icon.svg',
  '/img/soporte-icon.svg',
  '/img/subir-imagen-icon.svg',
  '/img/terminos-icon.svg',

  // Interfaz General y Modales
  '/img/favicon.png',
  '/img/icon-96x96.png',
  '/img/logo_splash.png',
  '/img/logo_yape_header.png',
  '/img/iconoperfil.png',
  '/img/mascota.png',
  '/img/popup.png',
  '/img/qr_login.png',
  '/img/secondlogo.png',
  '/img/header_opciones.png',
  '/img/errorfix.png',
  '/img/change_password.webp',
  '/img/opseguridad.png',

  // Comprobante y Transacciones
  '/img/check_exito.png',
  '/img/codigo-seguridad.png',
  '/img/compartiricon.png',
  '/img/fechaicon.png',
  '/img/hora-icon.png',
  '/img/mensaje-icon1.png',
  '/img/ojo_abierto.png',
  '/img/ojo_abierto.webp',
  '/img/ojo_cerrado.png',

  // GIFs y Animaciones
  '/img/animationyape.gif',
  '/img/descarga.gif',
  '/img/homeanim1.gif',
  '/img/loginanim1.gif',

  // Confeti de Éxito
  '/img/download.png',
  '/img/download1.png',
  '/img/download2.png',
  '/img/download3.png',
  '/img/download4.png',
  '/img/download5.png',
  '/img/download6.png',
  '/img/download7.png',
  '/img/download8.png',
  '/img/download9.png',
  '/img/download10.png',
  '/img/download11.png',
  '/img/download13.png',
  '/img/download14.png',

  // Audio
  '/img/ysnid.mp3'
];

// 1. INSTALACIÓN (Sin morir en el intento)
self.addEventListener('install', event => {
  self.skipWaiting(); // Fuerza a que la nueva versión tome el control de inmediato
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('Error al cachear, pero seguimos vivos:', err))
  );
});

// 2. ACTIVACIÓN (El limpiador de basura vieja)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Si encuentra un caché viejo, lo destruye
          if (cacheName !== CACHE_NAME) {
            console.log('Borrando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Toma el control de todas las pantallas abiertas
  );
});

// 3. INTERCEPTOR DE RED
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devuelve lo del caché si existe, si no, lo busca en internet normalmente
        return response || fetch(event.request);
      })
  );
});