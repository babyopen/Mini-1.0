/**
 * 视图层：通用渲染工具（2026-06-08 重构提取）
 * 职责：抽取多个视图层文件中重复的 tab 切换/面板切换逻辑
 * 依赖方向：被各 view-*.js 调用
 * 红线：只做 DOM 操作、不做业务计算、不绑定事件
 */
const ViewCommon = {

  /**
   * 区域名 → CSS class 映射表（4 处共用，2026-06-09 重构合并；2026-06-10 新增 6 期短期窗口映射）
   */
  ZONE_CLASS_MAP: Object.freeze({
    '封顶区': 'zone-peak',
    '降权区': 'zone-high',
    '过热区': 'zone-ovht',
    '热号区': 'zone-mid',
    '活跃区': 'zone-active',
    '穿插区': 'zone-low',
    '冷号区': 'zone-wait',
    // V1.1 新增：6 期短期窗口区域（与中长期窗口视觉等级对齐）
    '短期过热': 'zone-peak',   // ≥3次，P<0.2%（极罕见）
    '短期热号': 'zone-mid',    // 2次，P≈8%（短期热）
    '短期穿插': 'zone-low',    // 1次，P≈34%（偶尔穿插）
    '短期冷号': 'zone-wait',   // 0次，P≈59%（完全冷）
    // V1.5.3 修复：getZone6 实际返回的是"短X"（非"短期X"），
    // 原映射表只匹配"短期X"导致 6 期窗口全部回退到 zone-wait。
    // 补齐"短X"映射，颜色与"短期X"保持一致
    '短过热': 'zone-peak',     // ≥3次，P<0.2%（极罕见）
    '短热号': 'zone-mid',      // 2次，P≈8%（短期热）
    '短穿插': 'zone-low',      // 1次，P≈34%（偶尔穿插）
    '短冷号': 'zone-wait'      // 0次，P≈59%（完全冷）
  }),

  /**
   * 获取区域对应的 CSS class
   * @param {string} zone - 区域名（如 '封顶区'）
   * @param {string} [fallback='zone-wait'] - 未匹配时的兜底 class
   * @returns {string}
   */
  getZoneClass: function(zone, fallback) {
    return ViewCommon.ZONE_CLASS_MAP[zone] || fallback || 'zone-wait';
  },

  /**
   * 命中率 → CSS class 映射（3 处共用，2026-06-09 重构合并）
   * @param {number} rate - 命中率（0-100）
   * @param {number} [high=70] - 高分阈值
   * @param {number} [mid=40] - 中分阈值
   * @returns {string} 'backtest-rate-high' / 'backtest-rate-mid' / 'backtest-rate-low'
   */
  getRateClass: function(rate, high, mid) {
    if (high === undefined) high = 70;
    if (mid === undefined) mid = 40;
    if (rate >= high) return 'backtest-rate-high';
    if (rate >= mid) return 'backtest-rate-mid';
    return 'backtest-rate-low';
  },

  /**
   * 渲染生肖静态卡片 HTML（4 处共用，2026-06-09 重构提取，原 ViewZodiacPrediction._renderZodiacCardHtml）
   * @param {string} zodiac 生肖名
   * @param {number} rank 排名
   * @param {string} cardClass 卡片 class（如 card-rank-1 / card-rank-other）
   * @param {string} emoji emoji
   * @param {string} [extraHtml] 可选的额外子元素 HTML（如评分）
   * @returns {string} 卡片 HTML
   */
  renderZodiacCardHtml: function(zodiac, rank, cardClass, emoji, extraHtml) {
    var html = '<div class="zodiac-static-card ' + cardClass + '">';
    html += '<div class="zodiac-static-rank">' + rank + '</div>';
    html += '<div class="zodiac-static-emoji">' + emoji + '</div>';
    html += '<div class="zodiac-static-name">' + zodiac + '</div>';
    if (extraHtml) html += extraHtml;
    html += '</div>';
    return html;
  },

  /**
   * 切换 4 个顶级 panel（main / predict / giong / ultimate）
   * 2026-06-09 从 view-zodiac-prediction.js 提取
   */
  switchZodiacPanel: function(tab) {
    ViewCommon.switchTabUI({
      tabSelector: '.zodiac-tab-btn',
      tabDataAttr: 'zodiacTab',
      panelMap: {
        main: 'zodiacMainPanel',
        predict: 'zodiacPredictPanel',
        giong: 'zodiacGiongPanel',
        ultimate: 'zodiacUltimatePanel'
      }
    }, tab);
  },

  /**
   * 通用 tab 切换（仅 DOM 操作）
   * @param {Object} config
   * @param {string} config.tabSelector - tab 按钮的选择器（如 '.analysis-tab-btn'）
   * @param {string} config.tabDataAttr - tab 按钮的 data 属性名驼峰形式（如 'analysisTab'）
   * @param {Object} config.panelMap - tab 名 → 面板 ID 映射（如 {history:'historyPanel'}）
   * @param {string} [config.navBtnSelector] - 快捷导航里同源子 tab 的选择器（可选）
   * @param {string} tab - 要切换的 tab 名
   */
  switchTabUI: function(config, tab) {
    var panelMap = config.panelMap || {};
    var tabs = Object.keys(panelMap);
    // 非法值兜底：使用第一个合法 tab
    if (tabs.indexOf(tab) < 0) tab = tabs[0];

    // 顶部 tab 按钮
    if (config.tabSelector && config.tabDataAttr) {
      document.querySelectorAll(config.tabSelector).forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset[config.tabDataAttr] === tab);
      });
    }

    // 快捷导航里同源子 tab 按钮（如有）
    if (config.navBtnSelector) {
      document.querySelectorAll(config.navBtnSelector).forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.tabName === tab);
      });
    }

    // 面板切换（通过 ID 精确控制）
    Object.keys(panelMap).forEach(function(key) {
      var panel = document.getElementById(panelMap[key]);
      if (panel) panel.classList.toggle('active', key === tab);
    });
  },

  /**
   * 滑动卡片初始化（touch/mouse 通用）
   * 共用：ViewZodiacPredict.initPredSwiper / ViewZodiacGiong.initFreqSwiper
   * 2026-06-09 从 view-zodiac-predict.js 提取
   */
  _createSwiper: function(config) {
    var w = document.getElementById(config.wrapperId);
    if (!w) return;
    if (w.dataset.swiperInit) return;
    w.dataset.swiperInit = '1';
    var cards = w.querySelectorAll(config.cardSelector);
    if (!cards || !cards.length) return;
    var idx = config.initialIndex || 0;
    var total = cards.length;
    var sx = 0, cx = 0, dragging = false, lastT = 0, lastX = 0, lastY = 0;
    var animating = false;
    var animTimer = null;
    var baseX = 0; // 手势起点：屏幕上的实际像素偏移（负值=向左）

    function getWidth() {
      return w.offsetWidth || 0;
    }

    /**
     * 读取元素当前渲染位置（px），用于动画中途被抓住时从呈现值续接
     */
    function getCurrentX() {
      var m = window.getComputedStyle(w).transform;
      if (!m || m === 'none') return -idx * getWidth();
      var mt = m.match(/matrix3d\(([^)]+)\)/);
      if (mt) {
        var v3 = mt[1].split(',');
        return parseFloat(v3[12]) || 0;
      }
      mt = m.match(/matrix\(([^)]+)\)/);
      if (mt) {
        var v2 = mt[1].split(',');
        return parseFloat(v2[4]) || 0;
      }
      return -idx * getWidth();
    }

    function setTransform(offsetPercent, animate) {
      if (animate) {
        w.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      } else {
        w.style.transition = 'none';
      }
      w.style.transform = 'translate3d(' + offsetPercent + '%, 0, 0)';
    }

    function updateDots() {
      var dc = document.getElementById(config.dotsId);
      if (dc) {
        var dots = dc.querySelectorAll('.' + config.dotClass);
        dots.forEach(function(d, di) { d.classList.toggle('active', di === idx); });
      }
    }

    function slide(i, animate) {
      if (i < 0) i = 0;
      if (i >= total) i = total - 1;
      idx = i;
      animating = true;
      if (animTimer) clearTimeout(animTimer);
      setTransform(-i * 100, animate !== false);
      updateDots();
      animTimer = setTimeout(function() { animating = false; }, 320);
    }

    function start(e) {
      if (e.type === 'mousedown' && e.pointerType === 'touch') return;
      var touch = e.type === 'mousedown' ? null : (e.touches && e.touches[0]);
      if (!touch && e.type !== 'mousedown') return;
      var ww = getWidth();
      if (!ww) return;
      // 可中断：先读屏幕实际位置，再无过渡地钉在该位置，避免从目标值重新起算造成跳变
      baseX = getCurrentX();
      dragging = true;
      w.style.transition = 'none';
      w.style.transform = 'translate3d(' + baseX + 'px, 0, 0)';
      if (animTimer) clearTimeout(animTimer);
      animating = false;
      sx = touch ? touch.clientX : e.clientX;
      cx = sx;
      lastX = sx;
      lastY = touch ? touch.clientY : 0;
      lastT = Date.now();
    }

    var moveHandler = function(e) {
      if (!dragging) return;
      var touch = e.type === 'mousemove' ? null : (e.touches && e.touches[0]);
      if (!touch && e.type !== 'mousemove') return;
      var nowX = touch ? touch.clientX : e.clientX;
      var nowY = touch ? touch.clientY : lastY;

      var dx = Math.abs(nowX - lastX);
      var dy = Math.abs(nowY - lastY);

      if (e.type === 'touchmove' && e.cancelable !== false && dx > 2 && dx > dy) {
        e.preventDefault();
      }

      cx = nowX;
      lastX = nowX;
      lastY = nowY;
      lastT = Date.now();
      // 1:1 跟手：基于手势起点位置 + 指针位移，不再用 idx 重算
      w.style.transform = 'translate3d(' + (baseX + (nowX - sx)) + 'px, 0, 0)';
    };

    function end(e) {
      if (!dragging) return;
      dragging = false;
      if (e.type === 'touchend' && e.changedTouches && e.changedTouches.length) {
        cx = e.changedTouches[0].clientX;
      }
      var d = sx - cx;
      var ad = Math.abs(d);
      var now = Date.now();
      var elapsed = Math.max(now - lastT, 16);
      var vel = ad / elapsed;
      var ww = getWidth();
      if (!ww) { slide(idx, true); return; }
      var cardW = ww / total;
      var swipeThreshold = cardW * 0.04;
      var velThreshold = 0.12;

      if (ad > swipeThreshold || (ad > cardW * 0.02 && vel > velThreshold)) {
        if (d > 0 && idx < total - 1) {
          idx++;
        } else if (d < 0 && idx > 0) {
          idx--;
        }
      } else {
        // 中断后轻触（几乎无位移）：吸附到当前显示位置最近的卡片，而不是弹回旧卡
        var visualX = baseX + (cx - sx);
        idx = Math.min(Math.max(Math.round(-visualX / ww), 0), total - 1);
      }

      slide(idx, true);
    }

    w.addEventListener('touchstart', start, { passive: true });
    w.addEventListener('touchmove', moveHandler, { passive: false });
    w.addEventListener('touchend', end, { passive: true });
    w.addEventListener('touchcancel', end, { passive: true });
    w.addEventListener('mousedown', start);
    w.addEventListener('mousemove', moveHandler);
    w.addEventListener('mouseup', end);
    w.addEventListener('mouseleave', end);

    // 性能优化：提供清理方法，避免内存泄漏
    var cleanup = function() {
      w.removeEventListener('touchstart', start);
      w.removeEventListener('touchmove', moveHandler);
      w.removeEventListener('touchend', end);
      w.removeEventListener('touchcancel', end);
      w.removeEventListener('mousedown', start);
      w.removeEventListener('mousemove', moveHandler);
      w.removeEventListener('mouseup', end);
      w.removeEventListener('mouseleave', end);
      if (animTimer) clearTimeout(animTimer);
      delete w.dataset.swiperInit;
    };
    w._cleanupSwiper = cleanup;

    if (config.dataAttr) w.setAttribute(config.dataAttr[0], config.dataAttr[1]);
    var updateRef = config.updateRef;
    if (updateRef) {
      if (updateRef.indexOf('.') !== -1) {
        var parts = updateRef.split('.');
        var target = window;
        for (var i = 0; i < parts.length - 1; i++) target = target[parts[i]];
        target[parts[parts.length - 1]] = slide;
      } else {
        window[updateRef] = slide;
      }
    }
    setTimeout(function() { slide(idx, false); }, 50);
  },

  // ============================================================
  // 通用回测弹窗模板（2026-06-09 提取，消除 4 个子标签页重复）
  // ============================================================

  /**
   * 显示回测弹窗（通用模板，大小/单双/五行/波色共用）
   * @param {Object} config
   * @param {string} config.modalId - 弹窗 ID
   * @param {string} config.title - 弹窗标题
   * @param {string} config.closeBtnId - 关闭按钮 ID
   * @param {string} [config.highlightColor] - 主题色（如 '#30D158', '#BF5AF2'）
   * @param {Object} config.backtestData - 回测数据
   *   - totalTests: 总期数
   *   - totalHits: 命中数
   *   - totalHitRate: 命中率
   *   - currentStreak: 当前连中
   *   - recentTests: 最近测试期数
   *   - recentHits: 最近命中数
   *   - recentHitRate: 最近命中率
   *   - details: 明细数组 [{ expect, isHit, predicted, actual, actualNumber }]
   * @param {Object} [config.labels] - 标签配置
   *   - predicted: '预测'
   *   - actual: '实际'
   * @param {Function} [config.formatValue] - 值格式化函数
   * @param {string} [config.footerNote] - 底部说明文案
   */
  showBacktestModal: function(config) {
    var existingModal = document.getElementById(config.modalId);
    if (existingModal) existingModal.remove();

    var bd = config.backtestData;
    var hl = config.highlightColor || 'var(--text-active)';
    var labels = config.labels || { predicted: '预测', actual: '实际' };

    var overlay = document.createElement('div');
    overlay.id = config.modalId;
    overlay.className = 'mg-modal-mask';

    var html = '';
    html += '<div class="mg-modal-card" role="dialog" aria-modal="true">';

    // 标题
    html += '<div class="mg-modal-head">';
    html += '<div class="mg-modal-title">' + config.title + '</div>';
    html += '<button id="' + config.closeBtnId + '" class="mg-modal-x" type="button" aria-label="关闭">' +
      '<svg class="i sm" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-x"/></svg></button>';
    html += '</div>';

    // 统计概览
    html += '<div class="ms-grid ms-grid-3">';
    html += '<div class="ms-box"><div class="ms-k">总测试</div><div class="ms-v">' + bd.totalTests + '</div></div>';
    html += '<div class="ms-box"><div class="ms-k">命中</div><div class="ms-v" style="color:' + hl + ';">' + bd.totalHits + '</div></div>';
    html += '<div class="ms-box"><div class="ms-k">命中率</div><div class="ms-v" style="color:' + hl + ';">' + bd.totalHitRate + '%</div></div>';
    html += '</div>';

    // 连中
    if (bd.currentStreak > 0) {
      html += '<div class="ms-box" style="margin-top:8px;border-left:3px solid ' + hl + ';">';
      html += '<div class="ms-k">当前连中</div>';
      html += '<div class="ms-v" style="color:' + hl + ';">' + bd.currentStreak + ' 期 🔥</div>';
      html += '</div>';
    }

    // 详情列表
    html += '<div class="ms-section" style="margin-top:14px;">';
    html += '<div class="ms-sec-title">最近 ' + bd.recentTests + ' 期详情</div>';

    (bd.details || []).forEach(function(item) {
      var hitIcon = item.isHit ? '✓' : '✗';
      var fmtVal = config.formatValue ? config.formatValue(item) : { pred: item.predicted, actual: item.actual };

      html += '<div class="mg-bt-row ' + (item.isHit ? 'hit' : 'miss') + '">';
      html += '<span class="mg-bt-period">' + item.expect + '期</span>';
      html += '<span class="mg-bt-v">' + (item.actualNumber !== undefined ? item.actualNumber : '-') + '</span>';
      html += '<span class="mg-bt-v">' + labels.predicted + ':' + fmtVal.pred + '</span>';
      html += '<span class="mg-bt-v">' + labels.actual + ':' + fmtVal.actual + '</span>';
      html += '<span class="mg-bt-icon">' + hitIcon + '</span>';
      html += '</div>';
    });

    html += '</div>';

    // 底部说明
    var note = config.footerNote ||
      '• 最近 ' + bd.recentTests + ' 期命中 <strong>' + bd.recentHits + '</strong> 次 (' + bd.recentHitRate + '%)<br>' +
      '• 数据仅供参考，不构成投资建议';

    html += '<div class="mg-bt-note">' + note + '</div>';
    html += '</div>';

    overlay.innerHTML = html;
    document.body.appendChild(overlay);
    overlay.classList.add('show');

    // 关闭逻辑
    var closeHandler = function() {
      var innerSwiper = overlay.querySelector('[data-swiper-init]');
      if (innerSwiper && typeof innerSwiper._cleanupSwiper === 'function') {
        innerSwiper._cleanupSwiper();
      }
      overlay.classList.remove('show');
      setTimeout(function() { overlay.remove(); }, 220);
    };
    var closeBtn = document.getElementById(config.closeBtnId);
    if (closeBtn) closeBtn.addEventListener('click', closeHandler);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) closeHandler(); });
  },

  // ============================================================
  // 通用综合分析渲染模板（2026-06-09 提取，消除 4 个子标签页重复）
  // ============================================================

  /**
   * 渲染综合分析内容（大小/单双/五行/波色共用）
   * @param {Object} config
   * @param {Array} config.sequence - 序列数据 [{ value, type }] 或 [{ wuxing/color/size/type }]
   * @param {Object} [config.stats] - 统计数据对象 { '金': count, '木': count } 或数组
   * @param {number} [config.total] - 总期数，用于计算百分比
   * @param {Array} [config.patterns] - 规律特征 [{ type, count }]
   * @param {Object} [config.trend] - 趋势预测 { prediction, confidence, reason }
   * @param {string} config.trendAction - 趋势点击 action
   * @param {string} [config.typePrefix] - CSS class 前缀（如 'size-', 'oddeven-'）
   * @param {string} [config.valueKey] - 序列数据项中取值的 key（如 'wuxing', 'color'）
   * @param {Object} [config.colors] - 值到颜色的映射 { '金': '#FFD700', '木': '#22C55E' }
   * @returns {string} HTML
   */
  renderCombinedAnalysisContent: function(config) {
    if (!config || !config.sequence || config.sequence.length === 0) {
      return '<div style="padding:20px;text-align:center;color:var(--sub-text);">暂无数据</div>';
    }

    var prefix = config.typePrefix || '';
    var valueKey = config.valueKey || 'value';
    var colors = config.colors || {};
    var html = '';

    // 序列
    html += '<div class="combined-sequence-row">';
    var reversedSeq = config.sequence.slice().reverse();
    reversedSeq.forEach(function(item) {
      var val = item[valueKey] || item.value || '';
      var color = colors[val] || 'var(--sub-text)';
      html += '<span class="combined-seq-item ' + prefix + '-item" style="background:' + color + ';color:var(--mg-on-color);">' + val + '</span>';
    });
    html += '</div>';

    // 统计（支持对象格式）
    if (config.stats && typeof config.stats === 'object') {
      var statKeys = Object.keys(config.stats);
      if (statKeys.length > 0) {
        html += '<div class="combined-stats-grid">';
        statKeys.forEach(function(key) {
          var count = config.stats[key] || 0;
          var total = config.total || 1;
          var percent = total > 0 ? Math.round((count / total) * 100) : 0;
          var color = colors[key] || 'var(--sub-text)';
          html += '<div class="' + prefix + '-stat"><span class="' + prefix + '-name" style="color:' + color + '">' + key + '</span><span class="' + prefix + '-count">' + count + '</span><span class="' + prefix + '-bar-bg"><span class="' + prefix + '-bar-fill" style="width:' + percent + '%;background:' + color + ';"></span></span><span class="' + prefix + '-pct">' + percent + '%</span></div>';
        });
        html += '</div>';
      }
    }

    // 规律
    if (config.patterns && config.patterns.length > 0) {
      html += '<div class="combined-patterns">';
      config.patterns.forEach(function(p) {
        var pColor = colors[p.type.charAt(0)] || 'var(--sub-text)';
        html += '<span class="pattern-tag" style="background:' + pColor + ';color:var(--mg-on-color);">' + p.type + p.count + '</span>';
      });
      html += '</div>';
    }

    // 趋势
    if (config.trend && config.trend.prediction !== '-') {
      var predColor = colors[config.trend.prediction] || 'var(--sub-text)';
      html += '<div class="combined-trend" data-action="' + config.trendAction + '" style="cursor:pointer;">';
      html += '<span class="trend-predict ' + prefix + '-predict" style="background:' + predColor + ';color:var(--mg-on-color);">' + config.trend.prediction + '</span>';
      html += '<span class="trend-conf">' + config.trend.confidence + '%</span>';
      if (config.trend.reason) html += '<span class="trend-reason">' + config.trend.reason + '</span>';
      html += '</div>';
    }

    return html;
  }
};