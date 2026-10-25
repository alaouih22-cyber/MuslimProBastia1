// Unified Service Worker entry point for Firebase Cloud Messaging.
// Delegates all push, alarm, and caching logic to /sw.js to avoid duplicate handlers.
importScripts('/sw.js');
