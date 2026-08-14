const CACHE_NAME = 'scanner-v2';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://unpkg.com/html5-qrcode',
  'https://unpkg.com/vanilla-masker@1.2.0/build/vanilla-masker.min.js'
];

// Instala a nova versão
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Remove caches antigos e assume o controle imediatamente
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Estratégia de carregamento
self.addEventListener('fetch', (event) => {

  // Para HTML: sempre tenta buscar a versão atual no servidor
  if (event.request.mode === 'navigate') {

    event.respondWith(
      fetch(event.request)
        .then((response) => {

          // Atualiza o HTML armazenado no cache
          const responseClone = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put('./index.html', responseClone);
          });

          return response;
        })
        .catch(() => {
          // Sem internet: usa a versão armazenada
          return caches.match('./index.html');
        })
    );

    return;
  }

  // Para os demais arquivos:
  // primeiro usa cache, depois tenta a rede
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
  );
});
