const CACHE_NAME = 'eletrize-cache-v2025.01.23.002';
const ASSETS = [
  './',
  './index.html?v=1737455925',
  './styles.css?v=1737455925',
  './script.js?v=1737455925',
  './scenes.js?v=1737455925',
  './images/pwa/app-icon-192.png'
];

// Detectar mobile para cache mais agressivo
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isHubitat = /cloud\.hubitat\.com$/i.test(url.hostname) || /\/apps\/api\//i.test(url.pathname);

  // Nunca interceptar/cachear chamadas ao Hubitat ou cross-origin
  if (!isSameOrigin || isHubitat) {
    event.respondWith(fetch(req));
    return;
  }

  // Network-first para HTML, CSS, JS para sempre ter versão mais nova
  if (req.mode === 'navigate' || 
      (req.headers.get('accept') || '').includes('text/html') ||
      req.url.includes('.css') || 
      req.url.includes('.js')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Cache-first para assets estáticos do mesmo domínio
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      }).catch(() => cached);
    })
  );
});
