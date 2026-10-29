// Root Service Worker wrapper for GitHub Pages & root hosting compatibility
try {
  importScripts('./public/sw.js');
} catch (e) {
  try {
    importScripts('/public/sw.js');
  } catch (e2) {
    self.addEventListener('install', function() { self.skipWaiting(); });
    self.addEventListener('activate', function(event) { event.waitUntil(self.clients.claim()); });
  }
}
