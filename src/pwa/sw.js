'use strict';

const cacheName = 'pwa-offline';
const contentToCache = ['../pages/guide/guide.html', '../pages/guide/guide.scss'];
const offlineUrl = "./offline.html";

self.addEventListener('fetch', function( event ) {
    console.log(`Fetching ${event.request.url}`);  
    if(event.request.mode == "navigate"){  
      console.log("NAVIGATION");
      /*event.respondWith( 
        caches.match(event.request).then(function(response){
          return response || fetch(event.request)
        })

      );*/
      event.respondWith(
        (async() => {
           return fetch(event.request)
              .catch(async (error) =>{
                console.log("ERROR");
                let cache = await caches.open(cacheName);
                console.log(cache);
                let response = await cache.match(offlineUrl);
                return response;
              })
        })()
        
      );
              
    }
});

/*fetch( event.request )
        .catch(err => {
          console.log(1235);
          return caches.match(event.request);
        })*/

self.addEventListener('install', function(event) {
  event.waitUntil(
     (async () => {
        let cache = await caches.open(cacheName);
        await cache.add(new Request(offlineUrl, { cache: "reload"}));
      })()
  );
  self.skipWaiting();
});