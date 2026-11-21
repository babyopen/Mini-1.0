/* view-search.js · 搜索视图：设置项索引、结果渲染、双击恢复参数。 */
'use strict';

  /* ---------- 设置项索引：搜索直达 + 双击恢复 ------------------ */
  var settingsView = document.querySelector('.view[data-view="settings"]');
  var searchInput = document.getElementById('search-input');
  var searchResults = document.getElementById('search-results');

  var CTRL_KEY = {
    'r-opacity':'opacity','r-blur':'blur','r-sat':'saturation','r-border':'borderAlpha',
    'r-highlight':'highlight','r-chroma':'chroma','r-grain':'grain','r-shadow':'shadow',
    'r-radius':'radius','r-card-radius':'cardRadius','r-bottom':'bottom','r-gap':'gap',
    'r-icon':'iconScale','r-tabmin':'tabMin','r-speed':'animSpeed','r-font':'fontScale',
    'r-group-font':'groupFont','r-h1-font':'h1Font',
    'r-wall-blur':'wallBlur','r-wall-dim':'wallDim',
    'r-solo-w':'soloW','r-solo-icon':'soloIcon','r-solo-radius':'soloRadius',
    'c-tint':'tintColor','c-indicator':'indicatorColor'
  };

  var itemIndex = [];

  function rowLabel(row){
    var l = row.querySelector('.row-label');
    if(l) return l.textContent.trim();
    var h = row.querySelector('.row-head span');
    return h ? h.textContent.trim() : '';
  }

  function rowGroup(row){
    var card = row.closest ? row.closest('.card') : null;
    var prev = card ? card.previousElementSibling : null;
    while(prev && !(prev.classList && prev.classList.contains('group-title'))) prev = prev.previousElementSibling;
    return prev ? prev.textContent.trim() : '其他';
  }

  function tagRows(){
    Object.keys(CTRL_KEY).forEach(function(id){
      var el = document.getElementById(id);
      if(!el || !el.closest) return;
      var row = el.closest('.row');
      if(row) row.setAttribute('data-key', CTRL_KEY[id]);
    });
    switches.forEach(function(sw){
      if(!sw.closest) return;
      var row = sw.closest('.row');
      if(row) row.setAttribute('data-key', sw.getAttribute('data-switch'));
    });
  }

  function buildIndex(){
    itemIndex = [];
    var rows = settingsView.querySelectorAll('.row');
    for(var i = 0; i < rows.length; i++){
      var row = rows[i];
      var label = rowLabel(row);
      if(!label) continue;
      itemIndex.push({ label: label, group: rowGroup(row), row: row, key: row.getAttribute('data-key') || '' });
    }
  }

  function jumpTo(row){
    expandGroup(row);
    switchView('settings');
    setTimeout(function(){
      try { row.scrollIntoView({ block:'center', behavior:'smooth' }); } catch(e){}
      row.classList.add('flash');
      setTimeout(function(){ row.classList.remove('flash'); }, 1200);
    }, 70);
  }

  function renderSearch(q){
    if(!searchResults) return;
    searchResults.innerHTML = '';
    q = String(q || '').trim().toLowerCase();

    if(!q){
      searchResults.innerHTML = '<div class="liquid-glass plain-card"><h3>试试搜索</h3><p>模糊 · 圆角 · 壁纸 · 色散 · 指示器 · 动效</p></div>';
      return;
    }

    var hits = [];
    for(var i = 0; i < itemIndex.length; i++){
      var it = itemIndex[i];
      if((it.label + ' ' + it.group).toLowerCase().indexOf(q) >= 0) hits.push(it);
    }

    if(!hits.length){
      searchResults.innerHTML = '<div class="liquid-glass plain-card" id="search-empty"><h3>没有匹配的设置项</h3><p class="hint">换个关键词试试，例如「模糊」「圆角」「壁纸」</p></div>';
      return;
    }

    var card = document.createElement('div');
    card.className = 'liquid-glass card';
    hits.forEach(function(it){
      var row = document.createElement('div');
      row.className = 'row tap';
      var nameEl = document.createElement('span');
      nameEl.className = 'row-label';
      nameEl.textContent = it.label;
      var tagEl = document.createElement('span');
      tagEl.className = 'row-val';
      tagEl.textContent = it.group;
      row.appendChild(nameEl);
      row.appendChild(tagEl);
      row.addEventListener('click', function(){ jumpTo(it.row); });
      card.appendChild(row);
    });
    searchResults.appendChild(card);
  }

  if(searchInput){
    searchInput.addEventListener('input', function(){ renderSearch(searchInput.value); });
  }

  /* 双击参数名恢复该项默认值 */
  function resetOne(row){
    var key = row.getAttribute('data-key');
    if(!key) return false;
    var pal = effectiveTheme();
    var def;
    if(VARIANT_KEYS.indexOf(key) >= 0 && DEFAULT_VARIANTS[pal]) def = DEFAULT_VARIANTS[pal][key];
    else def = DEFAULT_CONF[key];
    if(def === undefined) return false;
    if(VARIANT_KEYS.indexOf(key) >= 0) setMat(key, def);
    else conf[key] = def;
    applyConfig();
    toast('已恢复默认：' + (rowLabel(row) || key));
    return true;
  }

  /* 双击检测用 click 时间差实现：iOS Safari 不派发 dblclick，触摸端也能用 */
  var lastTap = { row:null, time:0 };
  settingsView.querySelectorAll('.row').forEach(function(row){
    row.addEventListener('click', function(e){
      if(!row.hasAttribute('data-key')) return;          /* 纯跳转/操作行不参与 */
      var t = e.target;
      if(t && t.closest && t.closest('input, .switch, .segmented, .swatches, .cfield, input[type="range"]')) return;
      var now = Date.now();
      if(lastTap.row === row && now - lastTap.time < 340){
        lastTap.row = null; lastTap.time = 0;
        if(!resetOne(row)) toast('该项暂不支持单独重置');
        return;
      }
      lastTap.row = row; lastTap.time = now;
    });
  });
