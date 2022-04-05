'use strict';

const cacheName = 'pwa-offline-v1';
const contentToCache = ['./bg-offline.png'];

self.addEventListener('fetch', function( event ) {
    //console.log(`Fetching ${event.request.url}`);  
      event.respondWith(
        (async() => {
          try{
            const preload = await event.preloadResponse;
            if (preload) {
              return preload;
            }

            const originalResponse = await fetch(event.request);
            return originalResponse;
          }catch(error){
                  let cache = await caches.open(cacheName);
                  let response = await cache.match('./bg-offline.png');

                  return response;
          }

        })()
        
      );

});


self.addEventListener('install', function(event) {
  event.waitUntil(
     (async () => {
        let cache = await caches.open(cacheName);
        await cache.addAll(contentToCache);
      })()
  );
  self.skipWaiting();
});

self.addEventListener('activate', function( event ) {
  event.waitUntil(
    (async () => {
      if ("navigationPreload" in self.registration) {
        await self.registration.navigationPreload.enable();
      }
    })()
  );

  self.clients.claim();
});