/* view-settings.js · 设置视图：主题/壁纸/配置应用/滑块/开关/账户面板/分组/导入导出。 */
'use strict';

  /* ---------- 主题 ---------- */
  var mql = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;
  var reducedMql = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  function effectiveTheme(){
    return (conf.theme === 'light' || (conf.theme === 'auto' && mql && mql.matches)) ? 'light' : 'dark';
  }

  /* 写入材质参数：同时写进「当前主题」那一套，深浅两套互不覆盖 */
  function setMat(key, val){
    conf[key] = val;
    var p = effectiveTheme();
    if(conf.variants && conf.variants[p]) conf.variants[p][key] = val;
  }

  function pullVariant(){
    var p = effectiveTheme();
    if(!conf.variants || !conf.variants[p]) return;
    for(var i = 0; i < VARIANT_KEYS.length; i++){
      var k = VARIANT_KEYS[i];
      if(conf.variants[p].hasOwnProperty(k)) conf[k] = conf.variants[p][k];
    }
  }

  function applyTheme(){
    var light = effectiveTheme() === 'light';
    body.classList.toggle('light', light);

    /* 跟随系统时把系统实际模式显示出来，避免「看不出有没有生效」 */
    if(valThemeMode){
      var sysLight = !!(mql && mql.matches);
      valThemeMode.textContent = conf.theme === 'auto'
        ? ('系统 · ' + (sysLight ? '浅色' : '深色'))
        : (conf.theme === 'light' ? '固定 · 浅色' : '固定 · 深色');
    }

    var idx = conf.theme === 'light' ? 1 : (conf.theme === 'auto' ? 2 : 0);
    themeItems.forEach(function(el, i){ el.classList.toggle('active', i === idx); });
    layoutSeg(segTheme, idx);
  }

  if(mql){
    var onScheme = function(){
      if(conf.theme !== 'auto') return;
      applyConfig();
      toast('已跟随系统切换为' + ((mql && mql.matches) ? '浅色' : '深色'), 'info');
    };
    if(mql.addEventListener) mql.addEventListener('change', onScheme);
    else if(mql.addListener) mql.addListener(onScheme);
  }
  if(reducedMql){
    var onReduce = function(){ applyConfig(); };
    if(reducedMql.addEventListener) reducedMql.addEventListener('change', onReduce);
    else if(reducedMql.addListener) reducedMql.addListener(onReduce);
  }

  /* ---------- 壁纸 ---------- */
  var PRESETS = {
    aurora: { css:'linear-gradient(140deg,#2b1b6b,#5b3cc4 45%,#00d4ff)', color:'#5b3cc4' },
    sunset: { css:'linear-gradient(140deg,#3d1b4f,#ff6a3d 55%,#ffd36e)', color:'#ff6a3d' },
    ocean:  { css:'linear-gradient(140deg,#04213a,#0a6a8c 50%,#4fd1c5)', color:'#2aa6b8' },
    sand:   { css:'linear-gradient(140deg,#3a2f26,#b08a5a 55%,#ecd6b0)', color:'#b08a5a' },
    mono:   { css:'linear-gradient(140deg,#101014,#3a3a44 55%,#6f6f7a)', color:'#6f6f7a' }
  };

  function applyWallpaper(){
    var css = '';
    if(conf.wallpaper) css = 'url("' + conf.wallpaper + '")';
    else if(conf.wallPreset && PRESETS[conf.wallPreset]) css = PRESETS[conf.wallPreset].css;

    wallpaperEl.style.backgroundImage = css || '';
    body.classList.toggle('has-wall', !!css);


    presetEls.forEach(function(el){
      el.classList.toggle('active',
        !conf.wallpaper && el.getAttribute('data-preset') === conf.wallPreset);
    });
  }

  /* ---------- 应用配置 ---------- */
  function applyConfig(){
    pullVariant();
    var vBlur = eff('blur'), vOpacity = eff('opacity'), vSat = eff('saturation');
    var vBorder = eff('borderAlpha'), vHigh = eff('highlight'), vGrain = eff('grain');
    var vShadow = eff('shadow'), vChroma = eff('chroma');
    var vRadius = eff('radius'), vCard = eff('cardRadius'), vBottom = eff('bottom');
    var vGap = eff('gap'), vIcon = eff('iconScale'), vTabMin = eff('tabMin');
    var vSpeed = eff('animSpeed'), vFont = eff('fontScale');
    var vGroupFont = eff('groupFont'), vH1Font = eff('h1Font');
    var vWallBlur = eff('wallBlur'), vWallDim = eff('wallDim');
    var vSoloW = eff('soloW'), vSoloIcon = eff('soloIcon'), vSoloRadius = eff('soloRadius');

    root.style.setProperty('--lg-blur', vBlur + 'px');
    root.style.setProperty('--lg-opacity', vOpacity);
    root.style.setProperty('--lg-saturation', vSat + '%');
    root.style.setProperty('--lg-tint', rgbStr(conf.tintColor));
    root.style.setProperty('--lg-tint-light', lightenStr(conf.tintColor, 0.82));
    root.style.setProperty('--lg-border-a', vBorder);
    root.style.setProperty('--lg-highlight', vHigh);
    root.style.setProperty('--lg-grain', vGrain);
    root.style.setProperty('--lg-shadow', vShadow);
    root.style.setProperty('--lg-chroma', vChroma);
    root.style.setProperty('--lg-chroma-a', Math.min(0.55, vChroma * 0.09));
    root.style.setProperty('--wall-blur', vWallBlur + 'px');
    root.style.setProperty('--wall-dim-a', vWallDim);

    root.style.setProperty('--bar-radius', vRadius + 'px');
    root.style.setProperty('--card-radius', vCard + 'px');
    root.style.setProperty('--bar-bottom', vBottom + 'px');
    root.style.setProperty('--bar-gap', vGap + 'px');
    root.style.setProperty('--tab-icon', (26 * vIcon) + 'px');

    root.style.setProperty('--indicator-color', rgbaStr(conf.indicatorColor, 0.32));
    root.style.setProperty('--indicator-strong', rgbaStr(conf.indicatorColor, 0.8));
    root.style.setProperty('--thumb-on', conf.indicatorColor);
    root.style.setProperty('--tab-min', vTabMin + 'px');
    root.style.setProperty('--solo-w', vSoloW + 'px');
    root.style.setProperty('--solo-icon', vSoloIcon + 'px');
    root.style.setProperty('--solo-radius', vSoloRadius + 'px');
    root.style.setProperty('--fs-row', (15 * vFont).toFixed(1) + 'px');
    root.style.setProperty('--fs-tab', (13 * vFont).toFixed(1) + 'px');
    root.style.setProperty('--fs-group', vGroupFont.toFixed(1) + 'px');
    root.style.setProperty('--fs-h1', vH1Font.toFixed(1) + 'px');

    var reduce = !!(reducedMql && reducedMql.matches);
    var dur = (0.32 * vSpeed).toFixed(2);
    root.style.setProperty('--ind-anim', (conf.motion && !reduce)
      ? 'all ' + dur + 's cubic-bezier(.34,1.56,.64,1)'
      : 'none');

    body.classList.toggle('no-label', !conf.showLabel);
    body.classList.toggle('active-scale', !!conf.activeScale);
    body.classList.toggle('perf', !!conf.perfMode);
    /* 顶部状态栏/地址栏颜色跟随页面背景，避免出现黑块 */
    var isLight = (effectiveTheme() === 'light');
    var bgBase = isLight ? '#f8f9fd' : '#0b0b14';
    document.documentElement.style.background = bgBase;
    var themeMeta = document.querySelector('meta[name="theme-color"]');
    if(themeMeta) themeMeta.setAttribute('content', bgBase);
    indicator.classList.toggle('ring', conf.indicatorStyle === 'ring');

    applyTheme();
    applyWallpaper();

    /* 同步控件（滑块显示的是偏移量） */
    rOpacity.value = conf.opacity;
    rBlur.value = conf.blur;
    rSat.value = conf.saturation;
    rBorder.value = conf.borderAlpha;
    rHighlight.value = conf.highlight;
    rChroma.value = conf.chroma;
    rGrain.value = conf.grain;
    rShadow.value = conf.shadow;
    rRadius.value = conf.radius;
    rCardRadius.value = conf.cardRadius;
    rBottom.value = conf.bottom;
    rGap.value = conf.gap;
    rIcon.value = conf.iconScale;
    rTabMin.value = conf.tabMin;
    rSpeed.value = conf.animSpeed;
    rFont.value = conf.fontScale;
    rGroupFont.value = conf.groupFont;
    rH1Font.value = conf.h1Font;
    rWallBlur.value = conf.wallBlur;
    rWallDim.value = conf.wallDim;
    rSoloW.value = conf.soloW;
    rSoloIcon.value = conf.soloIcon;
    rSoloRadius.value = conf.soloRadius;
    cTint.value = conf.tintColor;
    if(cfTint) cfTint.style.background = conf.tintColor;
    cIndicator.value = conf.indicatorColor;
    if(cfIndicator) cfIndicator.style.background = conf.indicatorColor;

    valOpacity.textContent = fmtOff(conf.opacity, 2);
    valBlur.textContent = fmtOff(conf.blur, 0) + ' px';
    valSat.textContent = fmtOff(conf.saturation, 0) + ' %';
    valBorder.textContent = fmtOff(conf.borderAlpha, 2);
    valHighlight.textContent = fmtOff(conf.highlight, 2);
    valGrain.textContent = fmtOff(conf.grain, 2);
    valShadow.textContent = fmtOff(conf.shadow, 2);
    valRadius.textContent = fmtOff(conf.radius, 0) + ' px';
    valCardRadius.textContent = fmtOff(conf.cardRadius, 0) + ' px';
    valBottom.textContent = fmtOff(conf.bottom, 0) + ' px';
    valGap.textContent = fmtOff(conf.gap, 0) + ' px';
    valIcon.textContent = fmtOff(conf.iconScale, 2) + ' ×';
    valChroma.textContent = fmtOff(conf.chroma, 1);
    valWallBlur.textContent = fmtOff(conf.wallBlur, 0) + ' px';
    valWallDim.textContent = fmtOff(conf.wallDim, 2);
    valTabMin.textContent = fmtOff(conf.tabMin, 0) + ' px';
    valSpeed.textContent = fmtOff(conf.animSpeed, 2) + ' ×';
    valFont.textContent = fmtOff(conf.fontScale, 2) + ' ×';
    valGroupFont.textContent = fmtOff(conf.groupFont, 0) + ' px';
    valH1Font.textContent = fmtOff(conf.h1Font, 0) + ' px';
    valSoloW.textContent = fmtOff(conf.soloW, 0) + ' px';
    valSoloIcon.textContent = fmtOff(conf.soloIcon, 0) + ' px';
    valSoloRadius.textContent = fmtOff(conf.soloRadius, 0) + ' px';
    wallState.textContent = conf.wallpaper ? '自定义图片' : (conf.wallPreset ? '预设渐变' : '默认渐变');

    switches.forEach(function(el){
      el.classList.toggle('on', !!conf[el.getAttribute('data-switch')]);
    });

    var styleIdx = conf.indicatorStyle === 'ring' ? 1 : 0;
    styleItems.forEach(function(el, i){ el.classList.toggle('active', i === styleIdx); });
    layoutSeg(segIndicator, styleIdx);

    root.style.setProperty('--font-family', FONT_STACK[conf.fontFamily] || FONT_STACK.system);
    if(valFace) valFace.textContent = FACE_LABEL[conf.fontFamily] || FACE_LABEL.system;
    var faceIdx = FACE_ORDER.indexOf(conf.fontFamily);
    if(!(faceIdx >= 0)) faceIdx = 0;
    faceItems.forEach(function(el, i){ el.classList.toggle('active', i === faceIdx); });
    if(segFace) layoutSeg(segFace, faceIdx);
    applyGroups();

    scheduleSave();
    requestAnimationFrame(moveIndicator);
  }

  /* ---------- 指示器 ---------- */
  function moveIndicator(){
    var targetIndex = -1;
    for(var i = 0; i < groupItems.length; i++){
      if(groupItems[i].getAttribute('data-nav') === currentNav) targetIndex = i;
    }

    navItems.forEach(function(el){
      el.classList.toggle('active', el.getAttribute('data-nav') === currentNav);
    });

    if(targetIndex < 0){
      indicator.style.opacity = '0';
      return;
    }
    indicator.style.opacity = '1';

    var item = groupItems[targetIndex];
    var itemRect = item.getBoundingClientRect();

    /* 指示器绝对定位的参照是 offsetParent 的 padding box（已越过 1px 玻璃边框），
       所以要用 border-box 左边界加上 borderLeftWidth 才能得到参照点，再左右各留 4px 内缩 */
    var base = indicator.offsetParent;
    var baseRect = base.getBoundingClientRect();
    var baseBorder = parseFloat(getComputedStyle(base).borderLeftWidth) || 0;
    indicator.style.left = (itemRect.left - baseRect.left - baseBorder + 4) + 'px';
    indicator.style.width = Math.max(0, itemRect.width - 8) + 'px';
  }

  /* ---------- 视图 ---------- */
  function switchView(name){
    /* 切页时收起可能残留的账户面板 */
    if(profileSheet && profileSheet.classList.contains('show')) closeProfile();
    currentNav = name;
    viewSections.forEach(function(sec){
      sec.classList.toggle('active', sec.getAttribute('data-view') === name);
    });
    /* 立即置顶，不用平滑滚动：滚动过程中背景位移会让所有玻璃层逐帧重新模糊 */
    window.scrollTo(0, 0);
    requestAnimationFrame(moveIndicator);
    if(name === 'search' && searchInput){
      setTimeout(function(){ try{ searchInput.focus(); }catch(e){} }, 80);
    }
  }

  navItems.forEach(function(el){
    el.addEventListener('click', function(){
      if(conf.haptic && navigator.vibrate){ try{ navigator.vibrate(8); }catch(e){} }
      switchView(el.getAttribute('data-nav'));
    });
  });

  /* ---------- 分段交互 ---------- */
  themeItems.forEach(function(el){
    el.addEventListener('click', function(){
      conf.theme = el.getAttribute('data-theme');
      applyConfig();
      if(conf.theme === 'auto'){
        toast('跟随系统：当前系统为' + ((mql && mql.matches) ? '浅色' : '深色'), 'info');
      }
    });
  });
  styleItems.forEach(function(el){
    el.addEventListener('click', function(){ conf.indicatorStyle = el.getAttribute('data-style'); applyConfig(); });
  });

  /* ---------- 滑块 ---------- */
  /* 材质类参数走 setMat（写入深浅两套中的当前套），其余直接写 conf */
  function bindRange(el, key){
    if(!el) return;
    el.addEventListener('input', function(){
      var v = Number(el.value);
      if(VARIANT_KEYS.indexOf(key) >= 0) setMat(key, v);
      else conf[key] = v;
      applyConfig();
    });
  }

  bindRange(rOpacity, 'opacity');
  bindRange(rBlur, 'blur');
  bindRange(rSat, 'saturation');
  bindRange(rBorder, 'borderAlpha');
  bindRange(rHighlight, 'highlight');
  bindRange(rChroma, 'chroma');
  bindRange(rGrain, 'grain');
  bindRange(rShadow, 'shadow');
  bindRange(rRadius, 'radius');
  bindRange(rCardRadius, 'cardRadius');
  bindRange(rBottom, 'bottom');
  bindRange(rGap, 'gap');
  bindRange(rIcon, 'iconScale');
  bindRange(rTabMin, 'tabMin');
  bindRange(rSpeed, 'animSpeed');
  bindRange(rFont, 'fontScale');
  bindRange(rGroupFont, 'groupFont');
  bindRange(rH1Font, 'h1Font');
  bindRange(rSoloW, 'soloW');
  bindRange(rSoloIcon, 'soloIcon');
  bindRange(rSoloRadius, 'soloRadius');
  bindRange(rWallBlur, 'wallBlur');
  bindRange(rWallDim, 'wallDim');

  cTint.addEventListener('input', function(){ setMat('tintColor', cTint.value); applyConfig(); });
  cIndicator.addEventListener('input', function(){ setMat('indicatorColor', cIndicator.value); applyConfig(); });

  /* ---------- 开关 ---------- */
  switches.forEach(function(el){
    el.addEventListener('click', function(){
      var key = el.getAttribute('data-switch');
      conf[key] = !conf[key];

      /* 通知是真实权限，不是纯装饰 */
      if(key === 'notify' && conf.notify){
        if(!('Notification' in window)){
          conf.notify = false;
          toast('当前环境不支持系统通知');
        } else if(Notification.permission === 'denied'){
          conf.notify = false;
          toast('通知权限已被系统拒绝，请在浏览器设置中开启');
        } else if(Notification.permission === 'default'){
          try {
            Notification.requestPermission().then(function(p){
              if(p !== 'granted'){
                conf.notify = false;
                applyConfig();
                toast('未授予通知权限');
              } else {
                toast('通知已开启');
              }
            });
          } catch(e){
            conf.notify = false;
            toast('通知开启失败');
          }
        } else {
          toast('通知已开启');
        }
      }

      applyConfig();
      if(conf.haptic && navigator.vibrate){ try{ navigator.vibrate(6); }catch(e){} }
    });
  });

  /* ---------- 账户信息（头像 / 名称 / 邮箱可编辑） ---------- */
  var PROFILE_KEY = 'lgProfileV1';
  var AVATAR_KEY = 'lgAvatarV1';
  var DEFAULT_PROFILE = { name: 'John Doe', email: 'john.doe@example.com' };

  var acBox = document.getElementById('account-card');
  var avBox = document.getElementById('av-box');
  var avPreview = document.getElementById('av-preview');
  var acName = document.getElementById('ac-name');
  var acMail = document.getElementById('ac-mail');
  var profileMask = document.getElementById('profile-mask');
  var profileSheet = document.getElementById('profile-sheet');
  var inName = document.getElementById('in-name');
  var inMail = document.getElementById('in-mail');
  var avatarFile = document.getElementById('avatar-file');
  var btnProfileSave = document.getElementById('btn-profile-save');

  var profile = loadProfile();
  var pendingAvatar = '';

  function loadProfile(){
    var o = { name: DEFAULT_PROFILE.name, email: DEFAULT_PROFILE.email, avatar: '' };
    try {
      var raw = localStorage.getItem(PROFILE_KEY);
      if(raw){
        var parsed = JSON.parse(raw);
        if(parsed && typeof parsed === 'object'){
          if(parsed.name) o.name = String(parsed.name).slice(0,24);
          if(parsed.email) o.email = String(parsed.email);
        }
      }
      o.avatar = localStorage.getItem(AVATAR_KEY) || '';
    } catch(e){}
    return o;
  }

  function saveProfile(){
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify({ name: profile.name, email: profile.email }));
      if(profile.avatar) localStorage.setItem(AVATAR_KEY, profile.avatar);
      else localStorage.removeItem(AVATAR_KEY);
      return true;
    } catch(e){ return false; }
  }

  /* 无头像时用首字母：中文取首字，英文取前两位/两个词首字母 */
  function initials(name){
    var s = String(name || '').trim();
    if(!s) return '?';
    if(/^[a-zA-Z]/.test(s)){
      var parts = s.split(/\s+/).filter(Boolean);
      if(parts.length >= 2) return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
      return parts[0].slice(0,2).toUpperCase();
    }
    return s.slice(0,1);
  }

  function paintAvatar(box, dataUrl, name){
    if(!box) return;
    box.innerHTML = '';
    if(dataUrl){
      box.classList.add('has-img');
      var img = document.createElement('img');
      img.src = dataUrl;
      img.alt = name || '';
      box.appendChild(img);
    } else {
      box.classList.remove('has-img');
      box.textContent = initials(name);
    }
  }

  function renderProfile(){
    if(acName) acName.textContent = profile.name || '未命名';
    if(acMail) acMail.textContent = profile.email || '未填写邮箱';
    paintAvatar(avBox, profile.avatar, profile.name);
  }

  var lastFocusEl = null;

  function openProfile(){
    /* 滑动手势刚结束时浏览器可能补发一次 click，这里直接忽略 */
    if(Date.now() < clickBlockUntil) return;
    /* 非设置页不允许弹出，避免切页/滚动后残留触发 */
    var sec = document.querySelector('.view[data-view="settings"]');
    if(!sec || !sec.classList.contains('active')) return;
    pendingAvatar = profile.avatar;
    inName.value = profile.name;
    inMail.value = profile.email;
    paintAvatar(avPreview, pendingAvatar, profile.name);
    lastFocusEl = document.activeElement;
    profileMask.classList.add('show');
    profileSheet.classList.add('show');
    body.classList.add('sheet-open');
    profileSheet.setAttribute('aria-hidden', 'false');
    setTimeout(function(){ try{ inName.focus({ preventScroll:true }); }catch(e){} }, 320);
  }

  function closeProfile(){
    profileSheet.classList.remove('show');
    profileMask.classList.remove('show');
    body.classList.remove('sheet-open');
    profileSheet.setAttribute('aria-hidden', 'true');
    profileSheet.style.transition = '';
    profileSheet.style.transform = '';
    var back = lastFocusEl;
    if(!back || back === document.body || !back.focus || !back.isConnected) back = acBox;
    try{ back.focus({ preventScroll:true }); }catch(e){}
    lastFocusEl = null;
  }

  acBox.addEventListener('click', openProfile);
  acBox.addEventListener('keydown', function(e){
    if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openProfile(); }
  });
  profileMask.addEventListener('click', closeProfile);
  document.getElementById('btn-profile-cancel').addEventListener('click', closeProfile);
  document.getElementById('btn-profile-close').addEventListener('click', closeProfile);

  /* 焦点锁在面板内（Tab / Shift+Tab 循环） */
  function sheetFocusables(){
    return profileSheet.querySelectorAll('button, input');
  }

  profileSheet.addEventListener('keydown', function(e){
    if(e.key !== 'Tab') return;
    var list = sheetFocusables();
    if(!list.length) return;
    var first = list[0], last = list[list.length - 1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); try{ last.focus(); }catch(err){} }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); try{ first.focus(); }catch(err){} }
  });

  /* 下拉关闭：面板已滚到顶部时，向下拖过 90px 收起 */
  var dragStartY = 0, dragDelta = 0, dragActive = false;

  profileSheet.addEventListener('touchstart', function(e){
    if(profileSheet.scrollTop > 0) return;
    dragStartY = e.touches[0].clientY;
    dragDelta = 0;
    dragActive = true;
    profileSheet.style.transition = 'none';
  }, { passive:true });

  profileSheet.addEventListener('touchmove', function(e){
    if(!dragActive) return;
    var dy = e.touches[0].clientY - dragStartY;
    dragDelta = dy > 0 ? dy : 0;
    profileSheet.style.transform = 'translateY(' + dragDelta + 'px)';
  }, { passive:true });

  profileSheet.addEventListener('touchcancel', function(){
    dragActive = false;
    dragDelta = 0;
    profileSheet.style.transition = '';
    profileSheet.style.transform = '';
  }, { passive:true });

  profileSheet.addEventListener('touchend', function(){
    if(!dragActive) return;
    dragActive = false;
    profileSheet.style.transition = '';
    profileSheet.style.transform = '';
    if(dragDelta > 90) closeProfile();
    dragDelta = 0;
  }, { passive:true });

  inName.addEventListener('input', function(){
    if(!pendingAvatar) paintAvatar(avPreview, '', inName.value);
  });
  inMail.addEventListener('input', function(){});

  document.getElementById('btn-av-upload').addEventListener('click', function(){ avatarFile.click(); });

  avatarFile.addEventListener('change', function(){
    var file = avatarFile.files && avatarFile.files[0];
    avatarFile.value = '';
    if(!file) return;

    var reader = new FileReader();
    reader.onload = function(){
      var img = new Image();
      img.onload = function(){
        var size = 256;
        var side = Math.min(img.width, img.height);
        var sx = Math.max(0, (img.width - side) / 2);
        var sy = Math.max(0, (img.height - side) / 2);

        var cv = document.createElement('canvas');
        cv.width = size; cv.height = size;
        var ctx = cv.getContext('2d');
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);

        pendingAvatar = cv.toDataURL('image/jpeg', 0.86);
        paintAvatar(avPreview, pendingAvatar, inName.value);
        toast('头像已选择，点保存生效');
      };
      img.onerror = function(){ toast('图片读取失败'); };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('btn-av-reset').addEventListener('click', function(){
    pendingAvatar = '';
    paintAvatar(avPreview, '', inName.value);
    toast('已改用首字母头像');
  });

  btnProfileSave.addEventListener('click', function(){
    var name = inName.value.trim().slice(0,24);
    var mail = inMail.value.trim();
    if(!name){
      toast('名称不能为空');
      try{ inName.focus(); }catch(e){}
      return;
    }
    if(mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)){
      toast('邮箱格式不正确');
      try{ inMail.focus(); }catch(e){}
      return;
    }
    profile.name = name;
    profile.email = mail;
    profile.avatar = pendingAvatar;
    if(!saveProfile()) toast('存储空间不足，头像未保存');
    renderProfile();
    closeProfile();
    toast('账户信息已更新');
  });

  document.addEventListener('keydown', function(e){
    if(!profileSheet.classList.contains('show')) return;
    if(e.key === 'Escape'){ closeProfile(); return; }
    if(e.key === 'Enter' && (e.target === inName || e.target === inMail)) btnProfileSave.click();
  });

  /* ---------- 分组折叠 ---------- */
  groupTitles.forEach(function(t){
    if(!t.querySelector('.gt-chev')){
      t.insertAdjacentHTML('beforeend', '<svg class="gt-chev" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>');
    }
    t.addEventListener('click', function(){
      var name = t.textContent.trim();
      var i = conf.collapsed.indexOf(name);
      if(i >= 0) conf.collapsed.splice(i, 1);
      else conf.collapsed.push(name);
      applyGroups();
      scheduleSave();
      if(conf.haptic && navigator.vibrate){ try{ navigator.vibrate(6); }catch(e){} }
    });
  });

  function applyGroups(){
    groupTitles.forEach(function(t){
      var name = t.textContent.trim();
      var on = conf.collapsed.indexOf(name) >= 0;
      t.classList.toggle('collapsed', on);
      var card = t.nextElementSibling;
      if(card && card.classList.contains('card')) card.classList.toggle('collapsed', on);
    });
  }

  function expandGroup(row){
    if(!row || !row.closest) return;
    var card = row.closest('.card');
    if(!card) return;
    var prev = card.previousElementSibling;
    while(prev && !(prev.classList && prev.classList.contains('group-title'))) prev = prev.previousElementSibling;
    if(!prev) return;
    var name = prev.textContent.trim();
    var i = conf.collapsed.indexOf(name);
    if(i >= 0){ conf.collapsed.splice(i, 1); applyGroups(); scheduleSave(); }
  }

  /* ---------- 字体族 ---------- */
  faceItems.forEach(function(el){
    el.addEventListener('click', function(){
      conf.fontFamily = el.getAttribute('data-face');
      applyConfig();
    });
  });

  /* ---------- 分主题重置 ---------- */
  function resetVariant(pal){
    conf.variants[pal] = JSON.parse(JSON.stringify(DEFAULT_VARIANTS[pal]));
    applyConfig();
  }
  document.getElementById('btn-reset-dark').addEventListener('click', function(){
    confirmDialog({
      title:'重置深色参数', desc:'深色主题的 9 项玻璃材质参数将恢复出厂值，其它设置不受影响。',
      okText:'重置', danger:true,
      onOk:function(){ resetVariant('dark'); toast('深色参数已恢复默认', 'ok'); }
    });
  });
  document.getElementById('btn-reset-light').addEventListener('click', function(){
    confirmDialog({
      title:'重置浅色参数', desc:'浅色主题的 9 项玻璃材质参数将恢复出厂值，其它设置不受影响。',
      okText:'重置', danger:true,
      onOk:function(){ resetVariant('light'); toast('浅色参数已恢复默认', 'ok'); }
    });
  });

  /* ---------- 导出 / 导入 ---------- */
  function doExport(note){
    var copy = {};
    for(var k in conf){ if(conf.hasOwnProperty(k) && k !== 'wallpaper') copy[k] = conf[k]; }
    if(note) copy._name = note;
    var blob = new Blob([JSON.stringify(copy, null, 2)], { type:'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = (note ? note.replace(/[\\/:*?"<>|]/g, '_') + '-' : '') + 'liquid-glass-config.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
    toast('已导出' + (note ? '「' + note + '」' : '配置') + (conf.wallpaper ? '（不含壁纸图片）' : ''), 'ok');
  }

  document.getElementById('btn-export').addEventListener('click', function(){
    confirmDialog({
      title:'导出配置',
      desc:'填一个备注，导入时会提示，方便区分多套外观。留空则导出为默认名称。',
      input:true, placeholder:'例如：简洁模式', okText:'导出',
      onOk:function(note){ doExport(note); }
    });
  });

  document.getElementById('btn-import').addEventListener('click', function(){ importFile.click(); });
  importFile.addEventListener('change', function(){
    var file = importFile.files && importFile.files[0];
    if(!file) return;
    var reader = new FileReader();
    reader.onload = function(){
      try {
        var obj = JSON.parse(String(reader.result));
        for(var k in DEFAULT_CONF){
          if(obj.hasOwnProperty(k) && k !== 'wallpaper') conf[k] = obj[k];
        }
        if(obj.variants && typeof obj.variants === 'object'){
          for(var p in obj.variants){
            if(!conf.variants[p] || !obj.variants[p]) continue;
            for(var vi = 0; vi < VARIANT_KEYS.length; vi++){
              var vk = VARIANT_KEYS[vi];
              if(obj.variants[p].hasOwnProperty(vk)) conf.variants[p][vk] = obj.variants[p][vk];
            }
          }
        }
        if(obj.wallpaper){
          conf.wallpaper = obj.wallpaper;
          saveWall(obj.wallpaper);
        }
        applyConfig();
        toast('配置导入成功' + (obj._name ? '「' + obj._name + '」' : ''), 'ok');
      } catch(err){
        toast('文件格式不正确');
      }
      importFile.value = '';
    };
    reader.readAsText(file);
  });

  /* ---------- 壁纸上传 ---------- */
  document.getElementById('btn-wall-upload').addEventListener('click', function(){ wallFile.click(); });

  wallFile.addEventListener('change', function(){
    var file = wallFile.files && wallFile.files[0];
    if(!file) return;

    var reader = new FileReader();
    reader.onload = function(){
      var img = new Image();
      img.onload = function(){
        var maxW = 1600;
        var scale = Math.min(1, maxW / img.width);
        var w = Math.max(1, Math.round(img.width * scale));
        var h = Math.max(1, Math.round(img.height * scale));

        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        var data = canvas.toDataURL('image/jpeg', 0.82);
        conf.wallpaper = data;
        conf.wallPreset = '';

        if(saveWall(data)){
          applyConfig();
          toast('壁纸已应用');
        } else {
          conf.wallpaper = '';
          saveWall('');
          applyConfig();
          toast('图片过大，存储空间不足');
        }
      };
      img.onerror = function(){ toast('图片读取失败'); };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
    wallFile.value = '';
  });

  document.getElementById('btn-wall-remove').addEventListener('click', function(){
    conf.wallpaper = '';
    conf.wallPreset = '';
    saveWall('');
    applyConfig();
    toast('壁纸已移除');
  });

  /* ---------- 预设渐变 ---------- */
  presetEls.forEach(function(el){
    el.addEventListener('click', function(){
      var key = el.getAttribute('data-preset');
      conf.wallPreset = (conf.wallPreset === key) ? '' : key;
      conf.wallpaper = '';
      saveWall('');
      applyConfig();
      toast(conf.wallPreset ? ('已应用 ' + key) : '已取消预设');
    });
  });

  /* ---------- 恢复默认 ---------- */
  document.getElementById('btn-reset').addEventListener('click', function(){
    var keepWall = conf.wallpaper;
    var keepPreset = conf.wallPreset;
    conf = cloneDefaults();
    conf.wallpaper = keepWall;
    conf.wallPreset = keepPreset;
    applyConfig();
    toast('已恢复默认外观');
  });

  /* ---------- 清除缓存 ---------- */
  var cacheSizeEl = document.getElementById('cache-size');
  function calcCacheSize(){
    try {
      var total = 0;
      for(var i = 0; i < localStorage.length; i++){
        var k = localStorage.key(i);
        total += (k.length + String(localStorage.getItem(k) || '').length);
      }
      cacheSizeEl.textContent = total > 1024 ? (total / 1024).toFixed(1) + ' KB' : total + ' B';
    } catch(e){ cacheSizeEl.textContent = '—'; }
  }

  document.getElementById('btn-clear').addEventListener('click', function(){
    try {
      var keys = [];
      for(var i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
      keys.forEach(function(k){
        if(k === STORE_KEY || k === WALL_KEY || k === PROFILE_KEY || k === AVATAR_KEY) return;
        localStorage.removeItem(k);
      });
      calcCacheSize();
      toast('缓存已清除');
    } catch(e){ toast('清除失败'); }
  });

  /* ---------- 关于 / 退出 ---------- */
  document.getElementById('btn-privacy').addEventListener('click', function(){ toast('隐私政策（示例页）'); });
  document.getElementById('btn-terms').addEventListener('click', function(){ toast('用户协议（示例页）'); });
  document.getElementById('btn-logout').addEventListener('click', function(){ toast('已退出登录（演示）'); });

  /* ---------- 壁纸预设 ---------- */
  var PRESET_STOPS = {
    aurora: ['#2b1b6b', '#5b3cc4', '#00d4ff'],
    sunset: ['#3d1b4f', '#ff6a3d', '#ffd36e'],
    ocean:  ['#04213a', '#0a6a8c', '#4fd1c5'],
    sand:   ['#3a2f26', '#b08a5a', '#ecd6b0'],
    mono:   ['#101014', '#3a3a44', '#6f6f7a']
  };
