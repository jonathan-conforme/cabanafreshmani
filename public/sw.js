/*
 | Service Worker — Cabaña Fresh Maní PWA
 | Estrategia conservadora para no romper Inertia/Laravel:
 |  - Navegaciones (HTML): network-first, con caída a la última página cacheada u offline.html
 |  - Assets versionados de Vite (/build/): cache-first (son inmutables por su hash)
 |  - Imágenes propias: stale-while-revalidate
 |  - Todo lo demás (APIs, POST, otros orígenes): pasa directo a la red
 | Sube CACHE_VERSION para forzar limpieza de cachés viejas.
*/
const CACHE_VERSION = 'v2';
const SHELL_CACHE = `cfm-shell-${CACHE_VERSION}`;
const ASSET_CACHE = `cfm-assets-${CACHE_VERSION}`;
const IMAGE_CACHE = `cfm-img-${CACHE_VERSION}`;

const PRECACHE = [
    '/offline.html',
    '/manifest.json',
    '/pwa-192.png',
    '/pwa-512.png',
    '/apple-touch-icon.png',
    '/images/cabana-fresh-mani-logo.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(SHELL_CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
    );
});

self.addEventListener('activate', (event) => {
    const keep = [SHELL_CACHE, ASSET_CACHE, IMAGE_CACHE];
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => !keep.includes(k)).map((k) => caches.delete(k))))
            .then(() => self.clients.claim()),
    );
});

self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
    const { request } = event;

    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    // 1. Navegaciones de página → siempre red, con offline.html como respaldo.
    //    No se cachea el HTML: son páginas autenticadas y este POS se usa en
    //    equipos compartidos, así que guardarlas filtraría datos entre sesiones.
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() => caches.match('/offline.html')),
        );
        return;
    }

    // 2. Assets compilados por Vite → cache-first (inmutables por hash)
    if (url.pathname.startsWith('/build/') && url.pathname !== '/build/manifest.json') {
        event.respondWith(
            caches.open(ASSET_CACHE).then(async (cache) => {
                const hit = await cache.match(request);
                if (hit) return hit;
                const response = await fetch(request);
                if (response.ok) cache.put(request, response.clone());
                return response;
            }),
        );
        return;
    }

    // 3. Imágenes propias → stale-while-revalidate
    if (request.destination === 'image') {
        event.respondWith(
            caches.open(IMAGE_CACHE).then(async (cache) => {
                const hit = await cache.match(request);
                const network = fetch(request)
                    .then((response) => {
                        if (response.ok) cache.put(request, response.clone());
                        return response;
                    })
                    .catch(() => hit);
                return hit || network;
            }),
        );
        return;
    }

    // 4. Resto → red directa
});
