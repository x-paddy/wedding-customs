const CACHE_NAME = 'wedding-traditions-v1';
                const urlsToCache = [
                    '/',
                    '/cdn/css/wedding-traditions-combined.min.css',
                    '/cdn/js/wedding-traditions-combined.min.js',
                    '/cdn/css/ab-test-h1-spans.min.css',
                    '/cdn/css/review-cards-swoosh.min.css',
                    '/cdn/css/discover7-dynamic-spacing.min.css'
                ];

                self.addEventListener('install', function(event) {
                    event.waitUntil(
                        caches.open(CACHE_NAME)
                        .then(function(cache) {
                            return cache.addAll(urlsToCache);
                        })
                    );
                });

                self.addEventListener('fetch', function(event) {
                    event.respondWith(
                        caches.match(event.request)
                        .then(function(response) {
                            if (response) {
                                return response;
                            }
                            return fetch(event.request);
                        })
                    );
                });