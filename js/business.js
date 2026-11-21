/* business.js · 数据与算法层：配置 schema、默认值、区间、存储读写、颜色/主色计算。
   不含任何 DOM 操作与渲染。 */
'use strict';

  var STORE_KEY = 'lgSettingsV4';
  var WALL_KEY = 'lgWallpaperV1';

  /* 深色 / 浅色各存一套玻璃材质参数 */
  var VARIANT_KEYS = ['tintColor','opacity','blur','saturation','borderAlpha','highlight','grain','shadow','indicatorColor'];

  /* 滑块存的是「相对基准的偏移」：0 = 默认外观，负 = 减弱，正 = 增强 */
  var DEFAULT_VARIANTS = {
    dark: {
      tintColor: '#5a5a5a', opacity: 0, blur: 0, saturation: 0,
      borderAlpha: 0, highlight: 0, grain: 0, shadow: 0,
      indicatorColor: '#328cff'
    },
    light: {
      tintColor: '#f4f4f8', opacity: 0, blur: 0, saturation: 0,
      borderAlpha: 0, highlight: 0, grain: 0, shadow: 0,
      indicatorColor: '#0a84ff'
    }
  };

  /* 基准值：滑块为 0 时真正生效的外观（深浅两套各自不同） */
  var BASE_VARIANTS = {
    dark:  { opacity: 0.35, blur: 28, saturation: 120, borderAlpha: 0.10, highlight: 0.55, grain: 0.12, shadow: 0.32 },
    light: { opacity: 0.55, blur: 26, saturation: 135, borderAlpha: 0.18, highlight: 0.78, grain: 0.07, shadow: 0.18 }
  };
  var BASE_CONF = {
    chroma: 0, radius: 999, cardRadius: 20, bottom: 16, gap: 12,
    iconScale: 1, tabMin: 72, animSpeed: 1, fontScale: 1, groupFont: 12, h1Font: 30, wallBlur: 0, wallDim: 0.35,
    soloW: 44, soloIcon: 26, soloRadius: 999
  };
  /* 实际生效值的合法区间（偏移算出后夹紧，避免负数把界面调崩） */
  var LIMIT = {
    opacity: [0.03, 0.9], blur: [0, 60], saturation: [0, 250], borderAlpha: [0, 0.5],
    highlight: [0, 1], grain: [0, 0.45], shadow: [0, 0.9], chroma: [0, 8],
    radius: [0, 999], cardRadius: [0, 40], bottom: [-60, 90], gap: [0, 32],
    iconScale: [0.4, 1.9], tabMin: [40, 130], animSpeed: [0.2, 2.5], fontScale: [0.85, 1.35],
    groupFont: [9, 20], h1Font: [22, 44],
    wallBlur: [0, 44], wallDim: [0, 0.9],
    soloW: [28, 92], soloIcon: [14, 44], soloRadius: [0, 999]
  };

  function clampNum(v, lim){
    if(!lim) return v;
    return Math.min(lim[1], Math.max(lim[0], v));
  }

  /* 偏移 → 实际生效值 */
  function eff(key){
    var base;
    if(VARIANT_KEYS.indexOf(key) >= 0){
      var pal = effectiveTheme();
      base = BASE_VARIANTS[pal] ? BASE_VARIANTS[pal][key] : 0;
    } else {
      base = BASE_CONF[key];
    }
    if(base === undefined) base = 0;
    return clampNum(base + (Number(conf[key]) || 0), LIMIT[key]);
  }

  function fmtOff(v, digits){
    var n = Number(v) || 0;
    if(Math.abs(n) < Math.pow(10, -(digits + 1))) n = 0;
    var t = n.toFixed(digits);
    if(n > 0) t = '+' + t;
    return t;
  }

  var DEFAULT_CONF = {
    theme: 'dark',
    tintColor: '#5a5a5a',
    opacity: 0,
    blur: 0,
    saturation: 0,
    borderAlpha: 0,
    highlight: 0,
    grain: 0,
    chroma: 0,
    shadow: 0,
    radius: 0,
    cardRadius: 0,
    bottom: 0,
    gap: 0,
    iconScale: 0,
    showLabel: true,
    tabMin: 0,
    activeScale: false,
    animSpeed: 0,
    fontScale: 0,
    groupFont: 0,
    h1Font: 0,
    perfMode: false,
    wallpaper: '',
    wallPreset: '',
    wallBlur: 0,
    wallDim: 0,
    soloW: 0,
    soloIcon: 0,
    soloRadius: 0,
    indicatorColor: '#328cff',
    indicatorStyle: 'fill',
    notify: false,
    haptic: true,
    motion: true,
    autoHide: true,
    swipeNav: true,
    fontFamily: 'system',
    collapsed: []
  };

  var FONT_STACK = {
    system: '-apple-system,BlinkMacSystemFont,"SF Pro Text","PingFang SC","Segoe UI",sans-serif',
    rounded: '"SF Pro Rounded","Hiragino Maru Gothic ProN","PingFang SC","Segoe UI",sans-serif',
    serif: '"New York","Songti SC",Georgia,"Times New Roman",serif'
  };
  var FACE_ORDER = ['system','rounded','serif'];
  var FACE_LABEL = { system:'系统', rounded:'圆润', serif:'衬线' };

  function cloneVariants(){
    var o = {};
    for(var p in DEFAULT_VARIANTS){
      if(!DEFAULT_VARIANTS.hasOwnProperty(p)) continue;
      o[p] = {};
      for(var i = 0; i < VARIANT_KEYS.length; i++){
        var k = VARIANT_KEYS[i];
        o[p][k] = DEFAULT_VARIANTS[p][k];
      }
    }
    return o;
  }

  function cloneDefaults(){
    var o = JSON.parse(JSON.stringify(DEFAULT_CONF));
    o.variants = cloneVariants();
    return o;
  }

  function loadConf(){
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if(!raw) return cloneDefaults();
      var obj = JSON.parse(raw);
      var merged = cloneDefaults();
      for(var k in obj){
        if(!obj.hasOwnProperty(k) || k === 'variants') continue;
        merged[k] = obj[k];
      }
      if(obj.variants && typeof obj.variants === 'object'){
        for(var p in obj.variants){
          if(!merged.variants[p] || !obj.variants[p]) continue;
          for(var i = 0; i < VARIANT_KEYS.length; i++){
            var vk = VARIANT_KEYS[i];
            if(obj.variants[p].hasOwnProperty(vk)) merged.variants[p][vk] = obj.variants[p][vk];
          }
        }
      }
      return merged;
    } catch(e){
      return cloneDefaults();
    }
  }

  var conf = loadConf();

  /* 壁纸单独存储：不参与配置序列化，拖动滑块不再重复处理大字符串 */
  (function(){
    try {
      if(conf.wallpaper){
        localStorage.setItem(WALL_KEY, conf.wallpaper);   /* 旧版本迁移 */
      } else {
        conf.wallpaper = localStorage.getItem(WALL_KEY) || '';
      }
    } catch(e){ conf.wallpaper = ''; }
  })();

  function saveConf(){
    try {
      var copy = {};
      for(var k in conf){
        if(!conf.hasOwnProperty(k) || k === 'wallpaper') continue;
        copy[k] = conf[k];
      }
      localStorage.setItem(STORE_KEY, JSON.stringify(copy));
    } catch(e){}
  }

  /* 写入防抖：拖动滑块时不再逐帧落盘 */
  var saveTimer = null;
  function scheduleSave(){
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function(){ saveTimer = null; saveConf(); }, 200);
  }

  function saveWall(data){
    try {
      if(data) localStorage.setItem(WALL_KEY, data);
      else localStorage.removeItem(WALL_KEY);
      return true;
    } catch(e){ return false; }
  }

  /* ---------- 颜色工具 ---------- */
  function hexToRgb(hex){
    var h = String(hex || '#5a5a5a').replace('#','');
    if(h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var r = parseInt(h.slice(0,2),16); if(isNaN(r)) r = 90;
    var g = parseInt(h.slice(2,4),16); if(isNaN(g)) g = 90;
    var b = parseInt(h.slice(4,6),16); if(isNaN(b)) b = 90;
    return { r:r, g:g, b:b };
  }
  function rgbStr(hex){ var c = hexToRgb(hex); return c.r + ',' + c.g + ',' + c.b; }
  function rgbaStr(hex, a){ var c = hexToRgb(hex); return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + a + ')'; }
  function lightenStr(hex, ratio){
    var c = hexToRgb(hex);
    var r = Math.round(c.r + (255 - c.r) * ratio);
    var g = Math.round(c.g + (255 - c.g) * ratio);
    var b = Math.round(c.b + (255 - c.b) * ratio);
    return r + ',' + g + ',' + b;
  }

  /* ---------- 提取壁纸主色 ---------- */
  function pad2(n){
    var s = n.toString(16);
    return s.length < 2 ? '0' + s : s;
  }

  document.getElementById('btn-pick-color').addEventListener('click', function(){
    if(conf.wallpaper){
      var img = new Image();
      img.onload = function(){
        try {
          var c = document.createElement('canvas');
          c.width = 24; c.height = 24;
          var ctx = c.getContext('2d');
          ctx.drawImage(img, 0, 0, 24, 24);
          var data = ctx.getImageData(0, 0, 24, 24).data;
          var r = 0, g = 0, b = 0, n = 0, k;
          for(k = 0; k < data.length; k += 4){
            if(data[k + 3] < 40) continue;
            r += data[k]; g += data[k + 1]; b += data[k + 2]; n++;
          }
          if(!n){ toast('无法提取颜色'); return; }
          r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);

          var max = Math.max(r, g, b);
          if(max < 140 && max > 0){
            var ratio = 140 / max;
            r = Math.min(255, Math.round(r * ratio));
            g = Math.min(255, Math.round(g * ratio));
            b = Math.min(255, Math.round(b * ratio));
          }

          conf.indicatorColor = '#' + pad2(r) + pad2(g) + pad2(b);
          applyConfig();
          toast('已应用壁纸主色');
        } catch(e){
          toast('提取失败');
        }
      };
      img.onerror = function(){ toast('图片读取失败'); };
      img.src = conf.wallpaper;
      return;
    }
    if(conf.wallPreset && PRESETS[conf.wallPreset]){
      conf.indicatorColor = PRESETS[conf.wallPreset].color;
      applyConfig();
      toast('已应用预设主色');
      return;
    }
    toast('请先设置背景壁纸');
  });
