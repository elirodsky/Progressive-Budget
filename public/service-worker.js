const STATIC_CACHE = 'static-cache-v1';
const CACHE_NAME = 'data-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/index.js',
  '/db.js',
  '/manifest.webmanifest',
  '/styles.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// installion state trying to cache everything I possibly can
self.addEventListener('install', event => {

  // cause the event to stall until everything executed inside of it is finished
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => cache.add("/api/transaction"))
  );

  // precache static data
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then(cache => cache.addAll(FILES_TO_CACHE)) // adding all the files from the array
  );

  self.skipWaiting(); 
});

// activate phase where service worker is about to take over
self.addEventListener('activate', event => {

  // remove old caches
  event.waitUntil(
    caches
      .keys()
      .then(keyList => {
        return Promise.all(
          keyList.map(key => { //going through each of the keys inside the list
            if (key !== STATIC_CACHE && key !== CACHE_NAME) {
              console.log("Old cache data gone");
              return caches.delete(key);
            }
          })
        );
      })
  );

  self.clients.claim()  
});

// listening for fetches
self.addEventListener('fetch', event => {

  // api call
  if (event.request.url.includes("/api/transaction")) {
    event.respondWith(
      caches
        .open(CACHE_NAME)
        .then(cache => {
          return fetch(event.request)

            // place the response as a clone of itself
            .then(response => {
              if (response.status === 200) {
                cache.put(event.request.url, response.clone());
              }
              return response;
            })

            // if it fails it will get back a casched response
            .catch(err => cache.match(event.request));
        })
        .catch(err => console.log(err))
    );
    return;
  }

  // if not an api call will try to find in the cache
  event.respondWith(
    caches
      .open(STATIC_CACHE)
      .then(cache => {
        return cache
          .match(event.request)
          .then(response => {
            return response || fetch(event.request);
          });
      })
      .catch(err => console.log(err))
  );
});