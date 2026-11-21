/* mg-shell.js · 迁移层：按源项目业务枚举生成本地化筛选页 DOM（仅本文件新增结构，不复用源 index.html） */
'use strict';

(function () {
  var ICONS = {
    lock: 'i-lock',
    mark: 'i-mark',
    select: 'i-check-all',
    invert: 'i-invert',
    batch: 'i-list',
    clear: 'i-x'
  };

  var CARD_BTNS = {
    zodiac: ['lock', 'mark', 'select', 'invert', 'batch', 'clear'],
    color: ['lock', 'mark', 'select', 'invert', 'clear'],
    type: ['lock', 'mark', 'select', 'invert', 'clear'],
    element: ['lock', 'mark', 'select', 'invert', 'batch', 'clear'],
    head: ['lock', 'mark', 'select', 'invert', 'clear'],
    tail: ['lock', 'mark', 'select', 'invert', 'batch', 'clear'],
    sum: ['lock', 'mark', 'select', 'invert', 'batch', 'clear'],
    bs: ['lock', 'mark', 'select', 'invert', 'clear'],
    num: ['lock', 'mark', 'select', 'invert', 'batch', 'clear']
  };

  var ACTION = {
    lock: 'lockGroup',
    mark: 'markGroup',
    select: 'selectGroup',
    invert: 'invertGroup',
    batch: 'batchSelectGroup',
    clear: 'clearGroup'
  };

  var TITLE = {
    lock: '锁定',
    mark: '标记',
    select: '全选',
    invert: '反选',
    batch: '批量选择',
    clear: '清除'
  };

  function btn(kind, group, danger) {
    return '<button type="button" class="btn icon sm ghost btn-mini' + (danger ? ' btn-mini-red' : '') + '"' +
      ' data-action="' + ACTION[kind] + '"' +
      (group ? ' data-group="' + group + '"' : '') +
      ' title="' + TITLE[kind] + '" aria-label="' + TITLE[kind] + '">' +
      '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><use href="#' + ICONS[kind] + '"/></svg>' +
      '</button>';
  }

  function head(title, group, kinds, ariaLabel) {
    var html = '<div class="mg-card-head card-header">' +
      '<h2>' + title + '</h2>' +
      '<div class="mg-head-btns" role="group" aria-label="' + ariaLabel + '">';
    kinds.forEach(function (k) {
      html += btn(k, group, k === 'clear');
    });
    return html + '</div></div>';
  }

  function card(id, title, group, kinds, ariaLabel, bodyHtml) {
    return '<div class="liquid-glass card mg-card" id="' + id + '">' +
      head(title, group, kinds, ariaLabel) +
      '<div class="mg-card-body card-body">' + bodyHtml + '</div>' +
      '</div>';
  }

  function tags(group, items, extraClass) {
    var html = '<div class="tags' + (extraClass ? ' ' + extraClass : '') + '" data-group="' + group + '" role="group">';
    items.forEach(function (it) {
      html += '<div class="tag" data-value="' + it[0] + '" data-group="' + it[1] + '" role="checkbox" tabindex="0">' + it[2] + '</div>';
    });
    return html + '</div>';
  }

  function savedCard() {
    return '<div class="liquid-glass card mg-card" id="mod-saved">' +
      '<div class="mg-card-head card-header">' +
        '<h2>我的筛选方案</h2>' +
        '<div class="mg-head-btns" role="group" aria-label="方案操作">' +
          '<button type="button" class="btn sm secondary btn-mini" data-action="saveZodiacFilterPrompt">保存生肖</button>' +
          '<button type="button" class="btn sm secondary btn-mini" data-action="showOverlap">重叠</button>' +
          '<button type="button" class="btn sm secondary btn-mini btn-mini-red" data-action="clearAllSavedFilters">清空全部</button>' +
        '</div>' +
      '</div>' +
      '<div class="mg-card-body card-body"><div id="filterList" class="filter-save-list" role="list"></div></div>' +
    '</div>';
  }

  function excludeCard() {
    return '<div class="liquid-glass card mg-card" id="mod-exclude">' +
      '<div class="mg-card-head card-header collapsible collapsed" data-target="excludeBody">' +
        '<h2>号码排除</h2>' +
        '<div class="mg-head-btns" role="group" aria-label="号码排除操作">' +
          '<button type="button" class="btn icon sm ghost btn-mini btn-toggle" data-action="toggleCollapse" title="折叠" aria-label="折叠">' +
            '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-chev-up"/></svg></button>' +
          '<button type="button" class="btn icon sm ghost btn-mini" data-action="invertExclude" title="反选" aria-label="反选">' +
            '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-invert"/></svg></button>' +
          '<button type="button" class="btn icon sm ghost btn-mini" data-action="batchSelectGroup" data-group="exclude" title="批量选择" aria-label="批量选择">' +
            '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-list"/></svg></button>' +
          '<button type="button" class="btn icon sm ghost btn-mini btn-mini-red" data-action="clearExclude" title="清空" aria-label="清空">' +
            '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-x"/></svg></button>' +
        '</div>' +
      '</div>' +
      '<div class="mg-card-body card-body collapsed" id="excludeBody">' +
        '<div class="mg-exclude-head">' +
          '<div>已排除：<b id="excludeCount" aria-live="polite">0</b> 个</div>' +
          '<label class="checkbox"><input type="checkbox" id="lockExclude" data-action="toggleExcludeLock" aria-label="锁定排除"><span class="box"></span><span class="cb-text">锁定排除</span></label>' +
        '</div>' +
        '<div id="excludeGrid" class="exclude-grid" role="group" aria-label="号码排除选项"></div>' +
      '</div>' +
    '</div>';
  }

  function buildFilterPage() {
    var page = document.getElementById('filterPage');
    if (!page || page.dataset.built === '1') return;

    var colorItems = [
      ['红单', 'colorsx', '红单'], ['红双', 'colorsx', '红双'],
      ['蓝单', 'colorsx', '蓝单'], ['蓝双', 'colorsx', '蓝双'],
      ['绿单', 'colorsx', '绿单'], ['绿双', 'colorsx', '绿双'],
      ['红', 'color', '红'], ['蓝', 'color', '蓝'], ['绿', 'color', '绿']
    ];
    var typeItems = [['家禽', 'type', '家禽'], ['野兽', 'type', '野兽']];
    var elementItems = ['金', '木', '水', '火', '土'].map(function (v) { return [v, 'element', v]; });
    var headItems = [0, 1, 2, 3, 4].map(function (v) { return [String(v), 'head', v + '头']; });
    var tailItems = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (v) { return [String(v), 'tail', '尾' + v]; });
    var sumItems = [];
    for (var s = 1; s <= 13; s++) sumItems.push([String(s), 'sum', (s < 10 ? '0' + s : s) + '合']);
    var bsItems = [
      ['大单', 'bs', '大单'], ['小单', 'bs', '小单'], ['大双', 'bs', '大双'], ['小双', 'bs', '小双'],
      ['合单', 'sumOdd', '合单'], ['合双', 'sumOdd', '合双'],
      ['合大', 'sumSize', '合大'], ['合小', 'sumSize', '合小'],
      ['尾大', 'tailSize', '尾大'], ['尾小', 'tailSize', '尾小']
    ];

    page.innerHTML =
      '<div class="mg-actions" role="group" aria-label="全局操作">' +
        '<button type="button" class="btn sm secondary" data-action="selectAllFilters">一键全选</button>' +
        '<button type="button" class="btn sm secondary" data-action="clearAllFilters">一键清除</button>' +
        '<button type="button" class="btn sm primary" data-action="saveFilterPrompt">保存方案</button>' +
      '</div>' +
      savedCard() +
      card('mod-zodiac', '生肖', 'zodiac', CARD_BTNS.zodiac, '生肖操作',
        '<div class="tags" data-group="zodiac" id="zodiacTags" role="group" aria-label="生肖选项"></div>') +
      card('mod-color', '波色', 'color,colorsx', CARD_BTNS.color, '波色操作', tags('colorsx', colorItems)) +
      card('mod-type', '属性', 'type', CARD_BTNS.type, '属性操作', tags('type', typeItems)) +
      card('mod-element', '五行', 'element', CARD_BTNS.element, '五行操作', tags('element', elementItems)) +
      card('mod-head', '头数', 'head', CARD_BTNS.head, '头数操作', tags('head', headItems)) +
      card('mod-tail', '尾数', 'tail', CARD_BTNS.tail, '尾数操作', tags('tail', tailItems)) +
      card('mod-sum', '尾合', 'sum', CARD_BTNS.sum, '尾合操作', tags('sum', sumItems)) +
      card('mod-bs', '大小', 'bs,sumOdd,sumSize,tailSize', CARD_BTNS.bs, '大小操作', tags('bs', bsItems)) +
      card('mod-num', '号码选择', 'num', CARD_BTNS.num, '号码选择操作',
        '<div id="numTags" class="tags num-tags" data-group="num" role="group" aria-label="号码选择选项"></div>') +
      excludeCard() +
      '<div class="mg-disclaimer">仅供娱乐，非投注建议</div>';

    page.dataset.built = '1';
  }

  window.MGShell = { buildFilterPage: buildFilterPage };
})();
