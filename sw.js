const CACHE_NAME = 'fmm-sme-v2';
const ASSETS_TO_CACHE = [
  'index.html',
  'sidebar.js',
  'assets/js/supabase_client.js',
  'assets/icon_fmm.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});