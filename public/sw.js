function getApproximateCurrentPrayerId() {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  if (mins >= 3 * 60 + 30 && mins < 7 * 60) return "Fajr";
  if (mins >= 7 * 60 && mins < 15 * 60 + 30) return "Dhuhr";
  if (mins >= 15 * 60 + 30 && mins < 19 * 60) return "Asr";
  if (mins >= 19 * 60 && mins < 20 * 60 + 45) return "Maghrib";
  return "Isha";
}
// Service Worker for MuslimPro Warsh - Offline, Push & Full-Screen Alarm Support
const CACHE_NAME = 'warsh-quran-v37';
const AUDIO_CACHE_NAME = 'warsh-audio-v5';
const IMAGE_CACHE_NAME = 'warsh-images-v5';

const ASSETS_TO_CACHE = [
  '/manifest.json',
  '/icon.svg',
  '/icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
  '/adhan.mp3',
  '/kaaba-bg.jpg',
  '/quran-bg.jpg',
  '/warsh-p001.webp',
  '/warsh-p002.webp',
  '/quran-hilites.json',
  '/audio/001001.mp3',
  '/audio/001002.mp3',
  '/audio/001003.mp3',
  '/audio/001004.mp3',
  '/audio/001005.mp3',
  '/audio/001006.mp3',
  '/audio/001007.mp3',
];

// Single unified alarm tag and deduplication timestamp to prevent duplicate notifications
const ALARM_NOTIFICATION_TAG = 'prayer-adhan-alarm';
let lastAlarmNotificationAt = 0;
const prayerFiredTimestamps = new Map();
let swPrayerTimers = [];
let standbyTestTimer = null;

async function canShowAlarmNotification(prayerId) {
  const now = Date.now();
  const key = prayerId || 'generic_prayer';

  // 1. Fast in-memory check
  const lastTime = prayerFiredTimestamps.get(key) || 0;
  if (now - lastTime < 15 * 60 * 1000) {
    return false;
  }
  if (now - lastAlarmNotificationAt < 45000) {
    return false;
  }

  // 2. Persistent cross-restart check using CacheStorage
  try {
    const cache = await caches.open('prayer-alarm-dedup-v2');
    const reqKey = new Request('/__prayer_dedup_' + key);
    const reqGlobal = new Request('/__prayer_dedup_global');

    const [cachedKeyResp, cachedGlobalResp] = await Promise.all([
      cache.match(reqKey).catch(() => null),
      cache.match(reqGlobal).catch(() => null),
    ]);

    if (cachedKeyResp) {
      const data = await cachedKeyResp.json().catch(() => null);
      if (data && data.timestamp && (now - data.timestamp < 15 * 60 * 1000)) {
        return false;
      }
    }

    if (cachedGlobalResp) {
      const gData = await cachedGlobalResp.json().catch(() => null);
      if (gData && gData.timestamp && (now - gData.timestamp < 45000)) {
        return false;
      }
    }

    // Record this execution persistently
    const makeResp = (ts) => new Response(JSON.stringify({ timestamp: ts, prayerId: key }), {
      headers: { 'Content-Type': 'application/json' }
    });
    await Promise.all([
      cache.put(reqKey, makeResp(now)).catch(() => {}),
      cache.put(reqGlobal, makeResp(now)).catch(() => {}),
    ]);
  } catch (e) {
    // Non-critical fallback
  }

  prayerFiredTimestamps.set(key, now);
  lastAlarmNotificationAt = now;
  return true;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS_TO_CACHE.map((url) =>
          cache.add(url).catch(() => {
            // Ignore non-critical pre-cache errors
          })
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (
            name !== CACHE_NAME &&
            name !== AUDIO_CACHE_NAME &&
            name !== IMAGE_CACHE_NAME
          ) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (
    event.request.mode === 'navigate' ||
    url.pathname === '/' ||
    url.pathname === '/index.html' ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.apk') ||
    url.pathname.endsWith('.mobileconfig')
  ) {
    return;
  }

  // Audio cache-first strategy
  if (
    url.pathname.endsWith('.mp3') ||
    url.hostname.includes('everyayah.com') ||
    url.hostname.includes('archive.org') ||
    url.hostname.includes('wikimedia.org') ||
    url.hostname.includes('islamic.network') ||
    url.hostname.includes('islamcan.com') ||
    url.hostname.includes('assabile.com')
  ) {
    event.respondWith(
      caches.open(AUDIO_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => caches.match('/adhan.mp3'));
        });
      })
    );
    return;
  }

  // Image cache-first strategy
  if (
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg') ||
    url.hostname.includes('unsplash.com')
  ) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => caches.match('/kaaba-bg.jpg'));
        });
      })
    );
    return;
  }

  // App shell & assets: network-first with offline cache fallback
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          url.origin === self.location.origin
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

async function broadcastPlayAthan(prayerId, athanVoice) {
  const clientList = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  });
  const resolvedPrayerId = (prayerId && prayerId !== 'prayerId' && prayerId !== 'Fajr_fallback') ? prayerId : getApproximateCurrentPrayerId();
  for (const client of clientList) {
    client.postMessage({
      type: 'PLAY_ATHAN',
      prayerId: resolvedPrayerId,
      athanVoice: athanVoice || (resolvedPrayerId === 'Fajr' ? 'fajr' : 'makkah'),
    });
  }
}

async function showAlarmNotificationAndNotifyClients(title, body, prayerId, athanVoice) {
  const resolvedPrayerId = (prayerId && prayerId !== 'prayerId' && prayerId !== 'Fajr_fallback') ? prayerId : getApproximateCurrentPrayerId();

  const allowed = await canShowAlarmNotification(resolvedPrayerId);
  if (!allowed) {
    return;
  }

  try {
    const existing = await self.registration.getNotifications({ tag: ALARM_NOTIFICATION_TAG });
    if (existing && existing.length > 0) {
      return;
    }
  } catch {}

  const prayerNameMap = {
    Fajr: 'Fajr (Alba)',
    Dhuhr: 'Dhuhr (Mezzogiorno)',
    Asr: 'Asr (Pomeriggio)',
    Maghrib: 'Maghrib (Tramonto)',
    Isha: 'Isha (Notte)',
  };
  const prayerNameArMap = {
    Fajr: 'الفجر',
    Dhuhr: 'الظهر',
    Asr: 'العصر',
    Maghrib: 'المغرب',
    Isha: 'العشاء',
  };

  const resolvedTitle = title && !title.includes('undefined') ? title : `🕌 صلاة ${prayerNameArMap[resolvedPrayerId] || resolvedPrayerId} • ${prayerNameMap[resolvedPrayerId] || resolvedPrayerId}`;
  const resolvedBody = body && !body.includes('undefined') ? body : `È arrivato il tempo della preghiera di ${prayerNameMap[resolvedPrayerId] || resolvedPrayerId}. Tocca per aprire a schermo intero con l'Adhan.`;

  await self.registration.showNotification(resolvedTitle, {
    body: resolvedBody,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: ALARM_NOTIFICATION_TAG,
    renotify: false,
    requireInteraction: true,
    silent: false,
    vibrate: [500, 250, 500, 250, 800, 300, 1000],
    data: {
      url: `/?playAthan=1&prayerId=${encodeURIComponent(resolvedPrayerId)}`,
      prayerId: resolvedPrayerId,
      athanVoice: athanVoice || (resolvedPrayerId === 'Fajr' ? 'fajr' : 'makkah'),
    },
    actions: [
      { action: 'open', title: '🕌 Apri Sveglia Adhan' },
      { action: 'stop', title: '⏹ Ferma Audio' },
    ],
  });
}

// Service Worker Message Handler
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  if (event.data.type === 'CLEAR_ALARM_NOTIFICATION') {
    self.registration.getNotifications({ tag: ALARM_NOTIFICATION_TAG }).then((notifications) => {
      notifications.forEach((n) => n.close());
    });
    return;
  }

  // Schedule upcoming prayer notifications inside Service Worker
  if (event.data.type === 'SCHEDULE_PRAYER_NOTIFICATIONS') {
    swPrayerTimers.forEach((id) => clearTimeout(id));
    swPrayerTimers = [];

    const prayers = event.data.prayers || [];
    const locationName = event.data.locationName || 'Bastia Umbra';
    const now = Date.now();

    prayers.forEach((p) => {
      if (!p.triggerTimestamp || p.mode === 'mute' || p.id === 'Sunrise') return;
      const delay = p.triggerTimestamp - now;
      if (delay > 0 && delay <= 24 * 60 * 60 * 1000) {
        const timerId = setTimeout(() => {
          showAlarmNotificationAndNotifyClients(
            `🕌 È l'ora di ${p.nameIt || p.id} (${p.nameAr || ''})`,
            `Orario preghiera per ${locationName}: ${p.time}. Tocca per aprire la sveglia Adhan a schermo intero.`,
            p.id,
            p.id === 'Fajr' ? 'fajr' : 'makkah'
          );
        }, delay);
        swPrayerTimers.push(timerId);
      }
    });
  }

  // Standby test fallback inside Service Worker
  if (event.data.type === 'TRIGGER_STANDBY_TEST') {
    if (standbyTestTimer) {
      clearTimeout(standbyTestTimer);
      standbyTestTimer = null;
    }
    const delayMs = event.data.delayMs || 10000;
    const prayerId = event.data.prayerId || getApproximateCurrentPrayerId();
    const prayerName = event.data.prayerName || (prayerId === 'Fajr' ? 'Fajr' : prayerId === 'Dhuhr' ? 'Dhuhr' : prayerId === 'Asr' ? 'Asr' : prayerId === 'Maghrib' ? 'Maghrib' : 'Isha');
    const prayerNameAr = event.data.prayerNameAr || (prayerId === 'Fajr' ? 'الفجر' : prayerId === 'Dhuhr' ? 'الظهر' : prayerId === 'Asr' ? 'العصر' : prayerId === 'Maghrib' ? 'المغرب' : 'العشاء');
    standbyTestTimer = setTimeout(() => {
      standbyTestTimer = null;
      showAlarmNotificationAndNotifyClients(
        `🕌 صلاة ${prayerNameAr} • ${prayerName}`,
        `È l'ora della preghiera di ${prayerName}! Tocca per aprire la sveglia Adhan a schermo intero.`,
        prayerId,
        prayerId === 'Fajr' ? 'fajr' : 'makkah'
      );
    }, delayMs);
  }
});

// Handle incoming Web Push / FCM Push Notifications
self.addEventListener('push', (event) => {
  const currentApproxPrayer = getApproximateCurrentPrayerId();
  let payload = {
    title: '🕌 Sveglia Adhan — MuslimPro Warsh',
    body: 'È l\'ora della preghiera! Tocca per aprire la sveglia Adhan a schermo intero.',
    prayerId: currentApproxPrayer,
    sound: currentApproxPrayer === 'Fajr' ? 'fajr' : 'makkah',
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      const notification = parsed.notification || {};
      const data = parsed.data || {};
      payload = {
        title: parsed.title || notification.title || data.title || payload.title,
        body: parsed.body || notification.body || data.body || payload.body,
        prayerId: (parsed.prayerId || data.prayerId || payload.prayerId),
        sound: parsed.sound || data.sound || payload.sound,
      };
    } catch {
      payload.body = event.data.text() || payload.body;
    }
  }

  // Cancel any pending local standby test timer so it doesn't fire a second time after Web Push
  if (standbyTestTimer) {
    clearTimeout(standbyTestTimer);
    standbyTestTimer = null;
  }

  event.waitUntil(
    showAlarmNotificationAndNotifyClients(
      payload.title,
      payload.body,
      payload.prayerId,
      payload.sound
    )
  );
});

// Handle Notification Click -> Open Full-Screen Adhan Alarm or Stop Audio
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const prayerId = (data.prayerId && data.prayerId !== 'prayerId') ? data.prayerId : getApproximateCurrentPrayerId();
  const athanVoice = data.athanVoice || (prayerId === 'Fajr' ? 'fajr' : 'makkah');

  if (event.action === 'stop') {
    event.waitUntil(
      self.clients
        .matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          for (const client of clientList) {
            client.postMessage({ type: 'STOP_ATHAN' });
          }
        })
    );
    return;
  }

  const targetUrl = `/?playAthan=1&prayerId=${encodeURIComponent(prayerId)}`;

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(async (clientList) => {
        // Broadcast PLAY_ATHAN to open clients
        for (const client of clientList) {
          try {
            client.postMessage({
              type: 'PLAY_ATHAN',
              prayerId,
              athanVoice,
            });
          } catch {}
        }

        // On iOS and desktop: bring window to front and navigate to trigger full screen
        for (const client of clientList) {
          if ('focus' in client) {
            try {
              await client.focus();
              if ('navigate' in client) {
                await client.navigate(targetUrl);
              }
              return client;
            } catch {}
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
