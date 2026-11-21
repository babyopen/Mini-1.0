/* main.js · 启动：索引构建、首屏渲染、Service Worker 注册。 */
'use strict';

  /* ---------- 初始化 ---------- */
  tagRows();
  buildIndex();
  renderSearch('');
  renderProfile();
  var confCountEl = document.getElementById('conf-count');
  if(confCountEl){
    var cnt = 0, cKeys = Object.keys(DEFAULT_CONF);
    for(var ci = 0; ci < cKeys.length; ci++){ if(cKeys[ci] !== 'collapsed') cnt++; }
    confCountEl.textContent = cnt + ' 项';
  }

  applyConfig();
  switchView('filter');
  calcCacheSize();
  setTimeout(moveIndicator, 120);
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(moveIndicator);
  /* Service Worker：仅在 http(s) 下注册，file:// 打开时自动跳过 */
  if('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')){
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('sw.js').catch(function(){ /* 离线能力不可用时静默降级 */ });
    });
  }
