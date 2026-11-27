/* عامل الخدمة: يحفظ الكتاب وصوره وأصواته ليعمل التطبيق دون إنترنت بعد أول فتح */
const CACHE = 'arabiyya-kitab-v1';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll([
    './', 'kitab.html', 'manifest.webmanifest', 'assets/vendor/lucide.min.js', 'assets/js/common.js',
    'data/curriculum.js', 'data/sample-unit.js', 'data/sample-unit-tr.js', 'data/vocab-img.js', 'audio/manifest.js',
    'assets/img/app-icon-192.png', 'assets/img/app-icon-512.png'
  ]).catch(() => {})));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
/* الشبكة أولاً، ثم النسخة المحفوظة عند انقطاع الإنترنت */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(r => {
    if (r && r.ok && (new URL(e.request.url).origin === location.origin || /fonts\.(googleapis|gstatic)\.com/.test(e.request.url))) {
      const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp));
    }
    return r;
  }).catch(() => caches.match(e.request)));
});
