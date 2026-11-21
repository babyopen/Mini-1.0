/* sw.js · 应用外壳缓存：首屏离线可用，配置改动后改 CACHE 版本号即可换新 */
const CACHE = 'liquidglass-v1.7.5';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './js/business.js',
  './js/ui.js',
  './js/view-settings.js',
  './js/view-search.js',
  './js/view-components.js',
  './js/lg/mg-shell.js',
  './js/mg/core/config.js',
  './js/mg/core/utils.js',
  './js/mg/platform/web/toast.js',
  './js/mg/platform/web/dom.js',
  './js/mg/data/data-query.js',
  './js/mg/core/state.js',
  './js/mg/core/storage.js',
  './js/mg/platform/web/render.js',
  './js/mg/data/filter.js',
  './js/mg/platform/web/modals/input-modal.js',
  './js/mg/platform/web/modals/confirm-modal.js',
  './js/mg/platform/web/modals/zodiac-stat-modal.js',
  './js/mg/platform/web/modals/unrec-source-modal.js',
  './js/mg/business/business-cross-exclusion.js',
  './js/mg/business/business-main.js',
  './js/mg/business/business-filter-group.js',
  './js/mg/business/zodiac/business-zodiac-prediction.js',
  './js/mg/business/zodiac/business-zodiac-scores.js',
  './js/mg/business/zodiac/business-zodiac-miss.js',
  './js/mg/business/zodiac/business-zodiac-zones.js',
  './js/mg/business/zodiac/business-zodiac-stats.js',
  './js/mg/business/zodiac/business-zodiac-backtest.js',
  './js/mg/business/business-ultimate.js',
  './js/mg/business/business-giong.js',
  './js/mg/business/sliding-window/business-sliding-window.js',
  './js/mg/business/sliding-window/business-sliding-window-history.js',
  './js/mg/views/view-sliding-window-history.js',
  './js/mg/views/view-common.js',
  './js/mg/views/view-filter.js',
  './js/mg/views/view-filter-group.js',
  './js/mg/views/modals/view-batch-modal.js',
  './js/mg/views/view-quick-nav.js',
  './js/mg/views/modals/view-overlap-modal.js',
  './js/mg/views/analysis/view-analysis.js',
  './js/mg/views/analysis/view-analysis-history.js',
  './js/mg/views/analysis/view-analysis-full.js',
  './js/mg/views/analysis/view-analysis-zodiac.js',
  './js/mg/views/zodiac/view-zodiac-predict.js',
  './js/mg/views/zodiac/view-zodiac-main.js',
  './js/mg/views/zodiac/view-zodiac-giong.js',
  './js/mg/views/zodiac/view-zodiac-giong-size.js',
  './js/mg/views/zodiac/view-zodiac-giong-oddeven.js',
  './js/mg/views/zodiac/view-zodiac-giong-wuxing.js',
  './js/mg/views/zodiac/view-zodiac-giong-color.js',
  './js/mg/views/zodiac/view-zodiac-ultimate.js',
  './js/mg/views/view-profile.js',
  './js/mg/event.js',
  './js/lg/mg-bridge.js',
  './js/mg/app.js',
  './js/main.js'
];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }).then(function(){ return self.skipWaiting(); }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener('fetch', function(e){
  const req = e.request;
  if(req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  /* 页面导航：优先网络，断网回落到缓存中的 index */
  if(req.mode === 'navigate'){
    e.respondWith(
      fetch(req).catch(function(){ return caches.match('./index.html'); })
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(function(hit){
      return hit || fetch(req).then(function(res){
        const copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put(req, copy); });
        return res;
      }).catch(function(){ return hit; });
    })
  );
});
