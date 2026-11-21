/* ui.js · 公共 UI 层：DOM 引用、Toast、居中弹窗、复制、手势、键盘适配。 */
'use strict';

  /* ---------- DOM ---------- */
  var root = document.documentElement;
  var body = document.body;
  var tabbar = document.getElementById('tabbar');
  var indicator = document.getElementById('indicator');
  var toastEl = document.getElementById('toast');

  var rOpacity = document.getElementById('r-opacity');
  var rBlur = document.getElementById('r-blur');
  var rSat = document.getElementById('r-sat');
  var rBorder = document.getElementById('r-border');
  var rHighlight = document.getElementById('r-highlight');
  var rChroma = document.getElementById('r-chroma');
  var rGrain = document.getElementById('r-grain');
  var rShadow = document.getElementById('r-shadow');
  var rRadius = document.getElementById('r-radius');
  var rCardRadius = document.getElementById('r-card-radius');
  var rBottom = document.getElementById('r-bottom');
  var rGap = document.getElementById('r-gap');
  var rIcon = document.getElementById('r-icon');
  var rWallBlur = document.getElementById('r-wall-blur');
  var rWallDim = document.getElementById('r-wall-dim');
  var rTabMin = document.getElementById('r-tabmin');
  var rSpeed = document.getElementById('r-speed');
  var rFont = document.getElementById('r-font');
  var rGroupFont = document.getElementById('r-group-font');
  var rH1Font = document.getElementById('r-h1-font');
  var rSoloW = document.getElementById('r-solo-w');
  var rSoloIcon = document.getElementById('r-solo-icon');
  var rSoloRadius = document.getElementById('r-solo-radius');
  var presetEls = document.querySelectorAll('.swatch[data-preset]');
  var cfTint = document.getElementById('cf-tint');
  var cfIndicator = document.getElementById('cf-indicator');
  var cTint = document.getElementById('c-tint');
  var cIndicator = document.getElementById('c-indicator');

  var wallpaperEl = document.getElementById('wallpaper');
  var wallDimEl = document.getElementById('wall-dim');
  var wallState = document.getElementById('wall-state');
  var wallFile = document.getElementById('wall-file');
  var importFile = document.getElementById('import-file');

  var valOpacity = document.getElementById('val-opacity');
  var valBlur = document.getElementById('val-blur');
  var valSat = document.getElementById('val-sat');
  var valBorder = document.getElementById('val-border');
  var valHighlight = document.getElementById('val-highlight');
  var valGrain = document.getElementById('val-grain');
  var valShadow = document.getElementById('val-shadow');
  var valRadius = document.getElementById('val-radius');
  var valCardRadius = document.getElementById('val-card-radius');
  var valBottom = document.getElementById('val-bottom');
  var valGap = document.getElementById('val-gap');
  var valIcon = document.getElementById('val-icon');
  var valChroma = document.getElementById('val-chroma');
  var valWallBlur = document.getElementById('val-wall-blur');
  var valWallDim = document.getElementById('val-wall-dim');
  var valTabMin = document.getElementById('val-tabmin');
  var valSpeed = document.getElementById('val-speed');
  var valFont = document.getElementById('val-font');
  var valGroupFont = document.getElementById('val-group-font');
  var valH1Font = document.getElementById('val-h1-font');
  var valFace = document.getElementById('val-face');
  var valSoloW = document.getElementById('val-solo-w');
  var valSoloIcon = document.getElementById('val-solo-icon');
  var valSoloRadius = document.getElementById('val-solo-radius');
  var segFace = document.getElementById('seg-face');

  var dlgEl = document.getElementById('dlg');
  var dlgMask = document.getElementById('dlg-mask');
  var dlgTitle = document.getElementById('dlg-title');
  var dlgDesc = document.getElementById('dlg-desc');
  var dlgField = document.getElementById('dlg-field');
  var dlgInput = document.getElementById('dlg-input');
  var dlgOk = document.getElementById('dlg-ok');
  var dlgCancel = document.getElementById('dlg-cancel');

  var segTheme = document.getElementById('seg-theme');
  var valThemeMode = document.getElementById('val-theme-mode');
  var segIndicator = document.getElementById('seg-indicator');
  var themeItems = segTheme.querySelectorAll('.seg-item');
  var styleItems = segIndicator.querySelectorAll('.seg-item');
  var switches = document.querySelectorAll('.switch[data-switch]');
  var faceItems = document.querySelectorAll('#seg-face .seg-item');
  var settingsRoot = document.querySelector('.view[data-view="settings"]');
  var groupTitles = Array.prototype.slice.call(settingsRoot.querySelectorAll('.group-title'));

  var viewSections = document.querySelectorAll('.view');
  var navItems = document.querySelectorAll('.tab-item[data-nav]');
  var groupItems = document.querySelectorAll('.glass-capsule:not(.solo) .tab-item');

  var toastTimer = null;
  var currentNav = 'settings';

  function toast(msg, type){
    toastEl.textContent = msg;
    if(type) toastEl.setAttribute('data-type', type);
    else toastEl.removeAttribute('data-type');
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toastEl.classList.remove('show'); }, type ? 2000 : 1600);
  }

  /* ---------- 分段控件布局 ---------- */
  function layoutSeg(seg, idx){
    var thumb = seg.querySelector('.seg-thumb');
    var n = seg.querySelectorAll('.seg-item').length;
    if(!thumb || !n) return;
    thumb.style.width = 'calc((100% - 6px)/' + n + ')';
    thumb.style.left = 'calc(3px + (100% - 6px)/' + n + ' * ' + idx + ')';
  }

  /* ---------- 居中确认弹窗 ---------- */
  var dlgState = null, dlgLast = null;

  function confirmDialog(opts){
    opts = opts || {};
    dlgTitle.textContent = opts.title || '确认操作';
    var hasDesc = !!opts.desc;
    dlgDesc.textContent = opts.desc || '';
    dlgDesc.style.display = hasDesc ? '' : 'none';
    dlgOk.textContent = opts.okText || '确定';
    dlgOk.className = 'btn ' + (opts.danger ? 'danger' : 'primary');
    var withInput = !!opts.input;
    dlgField.classList.toggle('show', withInput);
    if(withInput){
      dlgInput.value = opts.value || '';
      dlgInput.placeholder = opts.placeholder || '';
    }
    dlgState = { onOk: opts.onOk || null, input: withInput };
    dlgLast = document.activeElement;
    dlgMask.classList.add('show');
    dlgEl.classList.add('show');
    dlgEl.setAttribute('aria-hidden', 'false');
    setTimeout(function(){
      try{ (withInput ? dlgInput : dlgEl).focus({ preventScroll:true }); }catch(e){}
    }, 60);
  }

  function closeDialog(){
    dlgEl.classList.remove('show');
    dlgMask.classList.remove('show');
    dlgEl.setAttribute('aria-hidden', 'true');
    dlgState = null;
    var back = dlgLast; dlgLast = null;
    if(back && back.focus && back.isConnected){ try{ back.focus({ preventScroll:true }); }catch(e){} }
  }

  dlgOk.addEventListener('click', function(){
    if(!dlgState) return;
    var cb = dlgState.onOk;
    if(dlgState.input){
      var v = dlgInput.value.trim();
      if(!v){ dlgInput.focus(); return; }
      closeDialog();
      if(cb) cb(v);
    } else {
      closeDialog();
      if(cb) cb(true);
    }
  });
  dlgCancel.addEventListener('click', closeDialog);
  dlgMask.addEventListener('click', closeDialog);

  document.addEventListener('keydown', function(e){
    if(!dlgEl.classList.contains('show')) return;
    if(e.key === 'Escape'){ closeDialog(); return; }
    if(e.key === 'Enter'){ e.preventDefault(); dlgOk.click(); }
  });
  dlgEl.addEventListener('keydown', function(e){
    if(e.key !== 'Tab') return;
    var list = dlgEl.querySelectorAll('button, input');
    if(!list.length) return;
    var first = list[0], last = list[list.length - 1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); try{ last.focus(); }catch(err){} }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); try{ first.focus(); }catch(err){} }
  });

  /* ---------- 点击复制 ---------- */
  function copyText(text, label){
    function done(){ toast('已复制：' + (label || text), 'ok'); }
    function fail(){ toast('复制失败，请长按选择文本', 'err'); }
    function fallback(){
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-999px;left:-999px;opacity:0;';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try{ ok = document.execCommand('copy'); }catch(e){ ok = false; }
      document.body.removeChild(ta);
      ok ? done() : fail();
    }
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(done, fallback);
    } else fallback();
  }
  document.querySelectorAll('.row[data-copy]').forEach(function(row){
    row.addEventListener('click', function(){ copyText(row.getAttribute('data-copy')); });
  });

  /* ---------- 左右滑动切换页面 ---------- */
  var mainEl = document.querySelector('main');
  var NAV_ORDER = ['source','app','module','settings'];
  var swX = 0, swY = 0, swT = 0, swOn = false;

  if(mainEl){
    mainEl.addEventListener('touchstart', function(e){
      if(!conf.swipeNav || e.touches.length !== 1) return;
      var t = e.target;
      if(t.closest && t.closest('.sheet, .dlg, .segmented, .swatches, .filter-preview, input[type="range"], input[type="color"], .search-input')) return;
      swX = e.touches[0].clientX; swY = e.touches[0].clientY; swT = Date.now(); swOn = true;
    }, { passive:true });

    mainEl.addEventListener('touchend', function(e){
      if(!swOn) return;
      swOn = false;
      if(!conf.swipeNav) return;
      var t = e.changedTouches && e.changedTouches[0];
      if(!t) return;
      var dx = t.clientX - swX, dy = t.clientY - swY;
      if(Date.now() - swT > 700) return;
      if(Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
      var i = NAV_ORDER.indexOf(currentNav);
      if(i < 0) return;
      var next = dx < 0 ? i + 1 : i - 1;
      if(next < 0 || next >= NAV_ORDER.length) return;
      switchView(NAV_ORDER[next]);
      if(conf.haptic && navigator.vibrate){ try{ navigator.vibrate(6); }catch(e){} }
    }, { passive:true });
  }

  /* ---------- 手势与点击隔离（滑动结束后忽略合成 click） ---------- */
  var lastScrollAt = 0, clickBlockUntil = 0;
  (function guardSwipeClick(){
    var st = { y:0, sy:0, moved:false, t:0 };
    window.addEventListener('touchstart', function(e){
      if(!e.touches || !e.touches.length) return;
      st = { x:e.touches[0].clientX, y:e.touches[0].clientY, sy:window.scrollY, moved:false, t:Date.now() };
    }, { passive:true });
    window.addEventListener('touchmove', function(e){
      if(!e.touches || !e.touches.length) return;
      /* 只用手指位移判定，避免程序滚动/惯性滚动把正常点击误伤 */
      if(Math.abs(e.touches[0].clientY - st.y) > 14 || Math.abs(e.touches[0].clientX - st.x) > 14) st.moved = true;
    }, { passive:true });
    window.addEventListener('touchend', function(){
      if(st.moved) clickBlockUntil = Date.now() + 450;
    }, { passive:true });
    document.addEventListener('click', function(e){
      if(Date.now() < clickBlockUntil){
        clickBlockUntil = 0;
        e.stopPropagation();
        e.preventDefault();
      }
    }, true);
    window.addEventListener('scroll', function(){ lastScrollAt = Date.now(); }, { passive:true });
  })();

  /* ---------- 滚动收起 ---------- */
  var lastScrollY = window.scrollY;
  window.addEventListener('scroll', function(){
    if(!conf.autoHide){ tabbar.classList.remove('hidden'); lastScrollY = window.scrollY; return; }
    var y = window.scrollY;
    if(y > lastScrollY + 10 && y > 80) tabbar.classList.add('hidden');
    else if(y < lastScrollY - 10) tabbar.classList.remove('hidden');
    lastScrollY = y;
  }, { passive:true });

  window.addEventListener('resize', function(){ if(typeof moveIndicator === 'function') moveIndicator(); });

  /* ---------- 移动端键盘适配 ---------- */
  (function bindKeyboard(){
    var vv = window.visualViewport;
    var rootEl = document.documentElement;
    if(!vv){
      rootEl.style.setProperty('--kb', '0px');
      return;
    }
    var rafId = 0;
    function update(){
      rafId = 0;
      var kb = Math.round(window.innerHeight - vv.height - vv.offsetTop);
      if(kb < 60) kb = 0;                       /* 地址栏收起等噪声不算键盘 */
      rootEl.style.setProperty('--kb', kb + 'px');
      document.body.classList.toggle('kb-open', kb > 0);
    }
    function queue(){ if(!rafId) rafId = requestAnimationFrame(update); }
    vv.addEventListener('resize', queue);
    vv.addEventListener('scroll', queue);
    window.addEventListener('orientationchange', function(){ setTimeout(update, 350); });
    update();
  })();

  /* 输入框聚焦后滚到可视区（键盘遮挡时也能看到正在输入的内容） */
  document.addEventListener('focusin', function(e){
    var t = e.target;
    if(!t || !t.matches || !t.matches('input[type="text"], input[type="email"], input[type="search"], textarea')) return;
    setTimeout(function(){
      try{
        t.scrollIntoView({ block:'center', behavior:'smooth' });
      }catch(err){ try{ t.scrollIntoView(); }catch(e2){} }
    }, 320);
  });
