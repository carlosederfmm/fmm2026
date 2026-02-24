const CACHE_NAME = 'fmm-sme-v1';
const ASSETS_TO_CACHE = [
  '/',
  'index.html',
  '/sidebar.js',
  '/assets/js/supabase_client.js',
  '/assets/icon_fmm.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
];

// Instalação e Cache inicial
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Estratégia de Cache: Network First (Prioriza internet para dados do Supabase)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});