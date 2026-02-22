// Import Workbox from CDN (for simplicity)
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

if (workbox) {
  // Cache static assets (HTML, CSS, JS, images)
  workbox.routing.registerRoute(
    ({request}) => request.destination === 'document' ||
                   request.destination === 'script' ||
                   request.destination === 'style' ||
                   request.destination === 'image',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'static-resources',
    })
  );

  // Cache API responses (adjust the URL pattern as needed)
  workbox.routing.registerRoute(
    ({url}) => url.pathname.startsWith('/api/'),
    new workbox.strategies.NetworkFirst({
      cacheName: 'api-cache',
      networkTimeoutSeconds: 5,
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 60 * 60, // 1 hour
        }),
      ],
    })
  );

  // Optionally, fallback to offline page
  workbox.routing.setCatchHandler(async ({event}) => {
    if (event.request.destination === 'document') {
      return caches.match('/offline.html');
    }
    return Response.error();
  });

  // Precache the offline page
  workbox.precaching.precacheAndRoute([
    {url: '/offline.html', revision: null},
  ]);
}