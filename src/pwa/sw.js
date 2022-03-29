'use strict';

const cacheName = 'pwa-cache';
const contentToCache = ['./icons/icon-192x192.png'];

self.addEventListener('fetch', function( event ) {
    //console.log(`Fetching ${event.request.url}`);    
      event.respondWith( 
        fetch( event.request )
        .catch(err => {
          console.log(1235);
          return caches.match(event.request);
        })
      );
});

self.addEventListener('install', function(event) {
  console.log('[Service Worker] Install');
  event.waitUntil(async () => {
    let cache = await caches.open(cacheName);
    return await cache.addAll(contentToCache);
  })
  console.log("Installed");
  self.skipWaiting();
});