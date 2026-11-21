/* mg-bridge.js · 迁移适配层：把源项目的页面/滚动/弹窗语义接到本项目组件与路由上 */
'use strict';

(function () {
  var bodyBox = document.getElementById('bodyBox');
  var topBox = document.getElementById('topBox');
  var PAGE_VIEWS = ['filter', 'analysis', 'random', 'profile'];

  function isMigratedView(name) {
    return PAGE_VIEWS.indexOf(name) >= 0;
  }

  /* ---------- 独立滚动容器 ---------- */
  ViewFilter.getScrollTop = function () {
    return bodyBox ? bodyBox.scrollTop : 0;
  };
  ViewFilter.backToTop = function () {
    if (bodyBox) bodyBox.scrollTo({ top: 0, behavior: 'smooth' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  ViewFilter.toggleBackTopBtn = function (show) {
    var btn = document.getElementById('backTopBtn');
    if (!btn) return;
    btn.classList.toggle('show', !!show);
    btn.style.display = 'flex';
    btn.style.opacity = show ? '1' : '0';
    btn.style.visibility = show ? 'visible' : 'hidden';
    btn.style.pointerEvents = show ? 'auto' : 'none';
  };
  ViewFilter.scrollToModule = function (targetId) {
    var el = document.getElementById(targetId);
    if (!el) return;
    var top = el.getBoundingClientRect().top - bodyBox.getBoundingClientRect().top + bodyBox.scrollTop - 12;
    bodyBox.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    Business.toggleQuickNav(false);
  };

  if (bodyBox) {
    bodyBox.addEventListener('scroll', function () { Business.handleScroll(); }, { passive: true });
  }

  /* ---------- 页面切换 ---------- */
  var baseSwitchView = window.switchView;
  window.switchView = function (name) {
    if (typeof baseSwitchView === 'function') baseSwitchView(name);
    var migrated = isMigratedView(name);
    if (topBox) topBox.classList.toggle('mg-hidden', name !== 'filter');
    if (bodyBox) bodyBox.classList.toggle('has-top', name === 'filter');
    var qn = document.getElementById('quickNav');
    var nt = document.getElementById('navToggle');
    if (qn) qn.style.display = migrated ? '' : 'none';
    if (nt) nt.style.display = migrated ? '' : 'none';
    if (bodyBox) bodyBox.scrollTop = 0;
    if (name === 'analysis' && window.Business && Business.initAnalysisPage) Business.initAnalysisPage();
    if (name === 'random' && window.Business && Business.initMainTab) Business.initMainTab();
  };

  ViewFilter.switchBottomNavUI = function (index) {
    switchView(PAGE_VIEWS[index] || 'filter');
    var navTabs = document.getElementById('navTabs');
    if (navTabs) navTabs.innerHTML = '';
    ViewFilter.refreshQuickNav(PAGE_VIEWS[index] || 'filter');
  };

  /* ---------- 底部导航（项目组件 → 源业务） ---------- */
  var navItems = Array.prototype.slice.call(document.querySelectorAll('.tab-item[data-nav]'));
  navItems.forEach(function (el) {
    el.addEventListener('click', function () {
      var idx = PAGE_VIEWS.indexOf(el.getAttribute('data-nav'));
      if (idx >= 0) Business.switchBottomNav(idx);
      else switchView(el.getAttribute('data-nav'));
    });
  });

  /* ---------- 我的页子 tab ---------- */
  var profileTabs = Array.prototype.slice.call(document.querySelectorAll('.zodiac-tab-btn[data-profile-tab]'));
  var profileSeg = profileTabs.length ? profileTabs[0].closest('.segmented') : null;
  profileTabs.forEach(function (btn, i) {
    btn.addEventListener('click', function () {
      var tab = btn.getAttribute('data-profile-tab');
      profileTabs.forEach(function (b) { b.classList.toggle('active', b === btn); });
      if (profileSeg && typeof layoutSeg === 'function') layoutSeg(profileSeg, i);
      EventBinder._switchProfileTab(tab);
    });
  });

  function layoutAllSegs() {
    document.querySelectorAll('.mg-tabs').forEach(function (seg) {
      var items = seg.querySelectorAll('.seg-item');
      var active = seg.querySelector('.seg-item.active');
      var idx = Array.prototype.indexOf.call(items, active);
      if (typeof layoutSeg === 'function') layoutSeg(seg, idx < 0 ? 0 : idx);
    });
  }

  /* 分析/资料页签切换后同步分段滑块 */
  ['analysis', 'random'].forEach(function (viewName) {
    var view = document.querySelector('.view[data-view="' + viewName + '"]');
    if (!view) return;
    view.addEventListener('click', function (e) {
      if (e.target.closest('.seg-item')) setTimeout(layoutAllSegs, 0);
    });
  });

  document.getElementById('openSettingsRow') && document.getElementById('openSettingsRow').addEventListener('click', function () {
    switchView('settings');
  });
  document.getElementById('openComponentsRow') && document.getElementById('openComponentsRow').addEventListener('click', function () {
    switchView('components');
  });

  /* ---------- 弹窗适配：输入 / 确认 ---------- */
  GIONGBETA_INPUT_MODAL.init = function () {};
  GIONGBETA_INPUT_MODAL.show = function (title, placeholder, defaultValue, callback) {
    confirmDialog({
      title: title || '请输入',
      input: true,
      value: defaultValue || '',
      placeholder: placeholder || '',
      onOk: function (v) { if (typeof callback === 'function') callback(v); }
    });
  };
  GIONGBETA_INPUT_MODAL.hide = function () {
    var cancel = document.getElementById('dlg-cancel');
    if (cancel) cancel.click();
  };

  GIONGBETA_CONFIRM_MODAL.init = function () {};
  GIONGBETA_CONFIRM_MODAL.show = function (message, callback) {
    confirmDialog({
      title: '确认操作',
      desc: message || '',
      danger: true,
      onOk: function () { if (typeof callback === 'function') callback(true); }
    });
  };

  /* ---------- 清理源弹窗注入的样式表，统一由 styles.css 接管 ---------- */
  function stripSourceStyles() {
    Array.prototype.slice.call(document.querySelectorAll('head style')).forEach(function (style) {
      var css = style.textContent || '';
      if (css.indexOf('.zodiac-stat') >= 0 || css.indexOf('.unrec-source') >= 0 || css.indexOf('#overlapModal') >= 0) {
        style.remove();
      }
    });
  }
  stripSourceStyles();

  /* ---------- 启动后校正 ---------- */
  window.addEventListener('load', function () {
    layoutAllSegs();
    ViewFilter.refreshQuickNav('filter');
    var mask = document.getElementById('loadingMask');
    if (mask) { mask.classList.remove('show'); mask.style.display = 'none'; }
    stripSourceStyles();
  });
})();
