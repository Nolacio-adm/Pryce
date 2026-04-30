const CACHE_NAME = 'scanner-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
  // CORREÇÃO: Ignorar requisições para o domínio do Google Script
  if (e.request.url.includes('script.google.com')) {
    return; // Deixa o navegador lidar diretamente, sem passar pelo cache
  }
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
