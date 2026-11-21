/* view-components.js · 组件库视图：组件初始化与文档区交互。 */
'use strict';

  /* ---------- 表单控件：下拉 / 步进 / 标签 / 提示 / 加载遮罩 ---------- */
  var selectSeq = 0;
  function initSelect(el){
    var trigger = el.querySelector('.select-trigger');
    var valEl = el.querySelector('.select-value');
    var uid = 'sel-' + (++selectSeq);
    var panel = document.createElement('div');
    panel.className = 'select-panel';
    panel.id = uid + '-panel';
    panel.tabIndex = -1;
    panel.setAttribute('role', 'listbox');
    panel.innerHTML = '<div class="select-search"><input type="text" placeholder="搜索选项" aria-label="搜索选项" role="combobox" aria-autocomplete="list" aria-expanded="true"></div><div class="select-list"></div>';
    trigger.setAttribute('aria-controls', panel.id);
    trigger.setAttribute('aria-haspopup', 'listbox');
    document.body.appendChild(panel);
    var input = panel.querySelector('input');
    var list = panel.querySelector('.select-list');
    var value = el.getAttribute('data-value') || '';
    var options = [];

    function readOptions(){
      options = [];
      var src = el.querySelectorAll('.select-option');
      for(var i=0;i<src.length;i++){
        options.push({ value:src[i].getAttribute('data-value'), label:src[i].getAttribute('data-label') || src[i].textContent.trim(), disabled:src[i].classList.contains('is-disabled') });
      }
      /* 源节点只作数据声明，读完即移除，避免与面板项重复显示 */
      for(var k=src.length-1;k>=0;k--){ src[k].parentNode.removeChild(src[k]); }
      if(!options.length){
        list.innerHTML = '<div class="select-empty">暂无选项</div>';
        return;
      }
      render('');
    }
    function render(kw){
      var html = '';
      var count = 0;
      for(var i=0;i<options.length;i++){
        var o = options[i];
        if(kw && o.label.toLowerCase().indexOf(kw.toLowerCase()) === -1) continue;
        count++;
        html += '<div class="select-option' + (o.value === value ? ' is-selected is-checked' : '') + (o.disabled ? ' is-disabled' : '') + '"'
              + ' id="' + uid + '-opt-' + i + '" role="option" aria-selected="' + (o.value === value ? 'true' : 'false') + '"'
              + ' data-value="' + o.value + '">' + o.label + '</div>';
      }
      list.innerHTML = html || '<div class="select-empty">没有匹配项</div>';
    }
    function place(){
      var r = trigger.getBoundingClientRect();
      var vh = window.innerHeight;
      var ph = Math.min(panel.offsetHeight || 0, 300) || 240;
      var below = vh - r.bottom - 12;
      var above = r.top - 12;
      /* 下方放得下就向下，否则向上；两边都不够时选空间大的一侧 */
      var top = (below >= ph || below >= above) ? r.bottom + 6 : r.top - ph - 6;
      top = Math.max(8, Math.min(vh - ph - 8, top));
      panel.style.left = r.left + 'px';
      panel.style.width = r.width + 'px';
      panel.style.top = top + 'px';
    }
    function open(){
      if(!el.classList.contains('select-panel-open')){
        el.classList.add('select-panel-open');
      }
      panel.classList.add('show');
      trigger.setAttribute('aria-expanded','true');
      if(!options.length) readOptions(); else render('');
      kbIndex = -1;
      var cur = list.querySelector('.select-option.is-selected');
      if(cur){ var all = Array.prototype.indexOf.call(list.querySelectorAll('.select-option:not(.is-disabled)'), cur); highlight(all); }
      place();
      input.value = '';
      /* 键盘用户把焦点送进面板；触屏只聚焦容器，避免立刻弹起键盘 */
      setTimeout(function(){
        try{
          if('ontouchstart' in window){ panel.focus({ preventScroll:true }); }
          else { input.focus({ preventScroll:true }); }
        }catch(err){}
      }, 30);
    }
    function close(){
      var inside = panel.contains(document.activeElement);
      panel.classList.remove('show');
      if(inside){ try{ trigger.focus({ preventScroll:true }); }catch(err){} }
      kbIndex = -1;
      list.querySelectorAll('.kb-active').forEach(function(x){ x.classList.remove('kb-active'); });
      trigger.setAttribute('aria-expanded','false');
      el.classList.remove('select-panel-open');
    }
    function pick(v){
      value = v;
      var label = v;
      for(var i=0;i<options.length;i++){ if(options[i].value === v) label = options[i].label; }
      valEl.textContent = label;
      valEl.classList.toggle('is-placeholder', !v);
      close();
      if(typeof el.__onChange === 'function') el.__onChange(v, label);
    }
    trigger.addEventListener('click', function(e){
      e.stopPropagation();
      if(panel.classList.contains('show')) close(); else open();
    });
    list.addEventListener('click', function(e){
      var o = e.target.closest('.select-option');
      if(o) pick(o.getAttribute('data-value'));
    });
    input.addEventListener('input', function(){ render(input.value.trim()); });
    document.addEventListener('click', function(e){
      if(panel.classList.contains('show') && !panel.contains(e.target) && !el.contains(e.target)) close();
    });
    window.addEventListener('resize', function(){ if(panel.classList.contains('show')) place(); });
    window.addEventListener('scroll', function(){ if(panel.classList.contains('show')) place(); }, true);
    var kbIndex = -1;
    function highlight(idx){
      var items = list.querySelectorAll('.select-option:not(.is-disabled)');
      if(!items.length) return;
      kbIndex = Math.max(0, Math.min(items.length - 1, idx));
      for(var i=0;i<items.length;i++) items[i].classList.toggle('kb-active', i === kbIndex);
      input.setAttribute('aria-activedescendant', items[kbIndex].id || '');
      items[kbIndex].scrollIntoView({ block:'nearest' });
    }
    panel.addEventListener('keydown', function(e){
      if(e.key !== 'Tab') return;
      /* 面板里只有搜索框可聚焦：Tab 就地循环，不让焦点跑到抽屉后面 */
      e.preventDefault();
      try{ input.focus({ preventScroll:true }); }catch(err){}
    });
    document.addEventListener('keydown', function(e){
      if(!panel.classList.contains('show')) return;
      if(e.key === 'Escape'){ close(); return; }
      if(e.key === 'ArrowDown' || e.key === 'ArrowUp'){
        e.preventDefault();
        highlight(kbIndex + (e.key === 'ArrowDown' ? 1 : -1));
      }
      if(e.key === 'Enter' && kbIndex >= 0){
        var items = list.querySelectorAll('.select-option:not(.is-disabled)');
        if(items[kbIndex]){ e.preventDefault(); pick(items[kbIndex].getAttribute('data-value')); trigger.focus(); }
      }
    });

    var api = {
      get value(){ return value; },
      set: function(v){ pick(v); },
      onChange: function(fn){ el.__onChange = fn; }
    };
    readOptions();
    el.__select = api;
    return api;
  }

  function initStepper(el){
    var min = Number(el.getAttribute('data-min') || 0);
    var max = Number(el.getAttribute('data-max') || 99);
    var input = el.querySelector('.step-val');
    var minus = el.querySelector('[data-act="minus"]');
    var plus = el.querySelector('[data-act="plus"]');
    var timer = null;
    function clamp(n){ return Math.max(min, Math.min(max, n)); }
    function sync(){
      var v = clamp(Math.round(Number(input.value) || min));
      input.value = v;
      minus.disabled = v <= min;
      plus.disabled = v >= max;
    }
    function step(d){
      input.value = clamp((Number(input.value) || 0) + d);
      sync();
    }
    function startHold(d){
      step(d);
      timer = setTimeout(function repeat(){ step(d); timer = setTimeout(repeat, 90); }, 420);
    }
    function stopHold(){ clearTimeout(timer); }
    minus.addEventListener('click', function(){ step(-1); });
    plus.addEventListener('click', function(){ step(1); });
    ['mousedown','touchstart'].forEach(function(ev){
      minus.addEventListener(ev, function(){ startHold(-1); });
      plus.addEventListener(ev, function(){ startHold(1); });
    });
    ['mouseup','mouseleave','touchend','touchcancel'].forEach(function(ev){
      minus.addEventListener(ev, stopHold);
      plus.addEventListener(ev, stopHold);
    });
    input.addEventListener('input', sync);
    input.addEventListener('blur', sync);
    sync();
  }

  function initNoticeClose(){
    document.querySelectorAll('.notice-close').forEach(function(btn){
      btn.addEventListener('click', function(){
        var n = btn.closest('.notice');
        n.style.transition = 'opacity .18s, transform .18s';
        n.style.opacity = '0';
        n.style.transform = 'scale(.97)';
        setTimeout(function(){ n.remove(); }, 190);
      });
    });
  }

  function initTagClose(){
    document.querySelectorAll('.tag .tag-x').forEach(function(btn){
      btn.addEventListener('click', function(){
        var t = btn.closest('.tag');
        t.classList.add('closing');
        setTimeout(function(){ t.remove(); }, 190);
      });
    });
  }

  function setProgress(el, pct){
    var v = Math.max(0, Math.min(100, pct));
    el.setAttribute('data-value', v);
    el.querySelector('.progress-fill').style.width = v + '%';
    return v;
  }

  function showLoader(text){
    var l = document.getElementById('loader');
    document.getElementById('loader-text').textContent = text || '加载中…';
    l.classList.add('show');
  }
  function hideLoader(){ document.getElementById('loader').classList.remove('show'); }
  window.showLoader = showLoader; window.hideLoader = hideLoader;

  /* ---------- 组件库交互 ---------- */
  document.getElementById('pv-toast-ok').addEventListener('click', function(){ toast('保存成功', 'ok'); });
  document.getElementById('pv-toast-err').addEventListener('click', function(){ toast('操作失败，请重试', 'err'); });
  document.querySelectorAll('.pv-doc').forEach(function(doc){
    var toggle = doc.querySelector('.pv-doc-toggle');
    var body = doc.querySelector('.pv-doc-body');
    var copy = doc.querySelector('.pv-doc-copy');
    var code = doc.querySelector('.pv-code');
    toggle.addEventListener('click', function(){
      var open = body.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    copy.addEventListener('click', function(){ copyText(code.textContent.trim(), '代码片段'); });
  });

  var pvSelect = document.getElementById('pv-select');
  if(pvSelect){
    var tmp = document.createElement('div');
    tmp.innerHTML = '<div class="select-option" data-value="ios">iOS 风格</div>'
      + '<div class="select-option" data-value="md">Material 风格</div>'
      + '<div class="select-option" data-value="minimal">极简风格</div>'
      + '<div class="select-option is-disabled" data-value="win">Windows 风格（暂不支持）</div>';
    pvSelect.appendChild(tmp);
    var sel = initSelect(pvSelect);
    sel.onChange(function(v, label){ toast('已选择「' + label + '」', 'ok'); });
  }
  document.querySelectorAll('.stepper').forEach(initStepper);
  initNoticeClose();
  initTagClose();
  var pvLoader = document.getElementById('pv-loader');
  if(pvLoader) pvLoader.addEventListener('click', function(){
    showLoader('正在处理…');
    setTimeout(function(){ hideLoader(); toast('处理完成', 'ok'); }, 1400);
  });
  var pvProg = document.getElementById('pv-prog');
  if(pvProg){
    var pct = 0;
    setInterval(function(){
      pct = pct >= 100 ? 0 : pct + 4;
      var v = setProgress(pvProg, pct);
      document.getElementById('pv-prog-val').textContent = v + '%';
    }, 700);
  }

  document.getElementById('pv-dialog').addEventListener('click', function(){
    confirmDialog({
      title:'删除这条记录？', desc:'删除后无法恢复，请确认。', okText:'删除', danger:true,
      onOk:function(){ toast('已删除', 'ok'); }
    });
  });

  var btnComponents = document.getElementById('btn-components');
  if(btnComponents) btnComponents.addEventListener('click', function(){ switchView('components'); });
  var btnBackSettings = document.getElementById('btn-back-settings');
  if(btnBackSettings) btnBackSettings.addEventListener('click', function(){ switchView('settings'); });

  var btnNewModule = document.getElementById('btn-new-module');
  if(btnNewModule) btnNewModule.addEventListener('click', function(){
    confirmDialog({
      title:'新建模块', desc:'给新模块起个名字，之后可随时修改。', input:true,
      placeholder:'例如：每日复盘', okText:'创建',
      onOk:function(name){ toast('已创建「' + name + '」', 'ok'); }
    });
  });
