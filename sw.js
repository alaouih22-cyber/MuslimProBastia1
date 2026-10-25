// Root Service Worker wrapper for GitHub Pages & root hosting compatibility
try {
  importScripts('./public/sw.js');
} catch (e) {
  self.addEventListener('install', function() { self.skipWaiting(); });
  self.addEventListener('activate', function(event) { event.waitUntil(self.clients.claim()); });
}
