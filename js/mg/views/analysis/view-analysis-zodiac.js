/**
 * 视图层：分析页 - 生肖关联分析标签页
 * 职责：渲染生肖关联分析、精选特码回测弹窗
 * 依赖方向：被 business/ 调用，仅做 DOM 渲染
 * 拆分记录：2026-06-09 从 view-analysis.js 拆分
 */
const ViewAnalysisZodiac = {

  /**
   * 渲染生肖关联分析（接收预处理的渲染数据）
   */
  renderZodiacAnalysis: function(renderData) {
    var zodiacEmptyTip = document.getElementById('zodiacEmptyTip');
    var zodiacContent = document.getElementById('zodiacContent');
    
    if(!renderData) {
      if(zodiacEmptyTip) zodiacEmptyTip.style.display = 'block';
      if(zodiacContent) zodiacContent.style.display = 'none';
      return;
    }
    
    if(zodiacEmptyTip) zodiacEmptyTip.style.display = 'none';
    if(zodiacContent) zodiacContent.style.display = 'block';

    var combo1 = document.getElementById('combo1');
    var combo2 = document.getElementById('combo2');
    var combo3 = document.getElementById('combo3');
    if(combo1) combo1.innerText = renderData.combo1 || '';
    if(combo2) combo2.innerText = renderData.combo2 || '';
    if(combo3) combo3.innerText = renderData.combo3 || '';

    var tailZodiacGrid = document.getElementById('tailZodiacGrid');
    if(tailZodiacGrid) tailZodiacGrid.innerHTML = renderData.tailZodiacHtml || '';

    var zodiacFollowTable = document.getElementById('zodiacFollowTable');
    if(zodiacFollowTable) zodiacFollowTable.innerHTML = renderData.followTableHtml || '';

    var zodiacTotalGrid = document.getElementById('zodiacTotalGrid');
    if(zodiacTotalGrid) zodiacTotalGrid.innerHTML = renderData.zodiacTotalHtml || '';

    var zodiacMissGrid = document.getElementById('zodiacMissGrid');
    if(zodiacMissGrid) zodiacMissGrid.innerHTML = renderData.zodiacMissHtml || '';

    var zodiacFinalNum = document.getElementById('zodiacFinalNum');
    if(zodiacFinalNum) zodiacFinalNum.innerText = renderData.finalNums || '';
  },

  /**
   * 显示精选推荐号码 5 维算法回测弹窗（图片式排版）
   */
  showFinalBacktestModal: function(backtestData) {
    if (!backtestData || !backtestData.details) return;

    // 移除已存在的弹窗，避免重复
    var existing = document.getElementById('finalBacktestModal');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.id = 'finalBacktestModal';
    overlay.className = 'mg-modal-mask';

    var html = '';
    html += '<div class="mg-modal-card" role="dialog" aria-modal="true">';

    // 标题
    html += '<div class="mg-modal-head">';
    html += '<div class="mg-modal-title">📜 精选特码回测记录</div>';
    html += '<button id="closeFinalBacktestBtn" class="mg-modal-x" type="button" aria-label="关闭">' +
      '<svg class="i sm" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-x"/></svg></button>';
    html += '</div>';

    // 统计概览
    html += '<div class="ms-grid ms-grid-3">';
    html += '<div class="ms-box"><div class="ms-k">回测期数</div><div class="ms-v">' + backtestData.totalTests + '</div></div>';
    html += '<div class="ms-box"><div class="ms-k">号码命中</div><div class="ms-v" style="color:var(--mg-ok);">' + backtestData.totalHits + '</div></div>';
    html += '<div class="ms-box"><div class="ms-k">命中率</div><div class="ms-v" style="color:var(--mg-info);">' + backtestData.totalHitRate + '%</div></div>';
    html += '</div>';

    if (backtestData.currentStreak > 0) {
      html += '<div class="ms-box" style="margin-top:8px;border-left:3px solid var(--mg-warn);">';
      html += '<div class="ms-k">当前号码连中</div>';
      html += '<div class="ms-v" style="color:var(--mg-warn);">' + backtestData.currentStreak + ' 期 🔥</div>';
      html += '</div>';
    }

    // 回测明细
    html += '<div class="ms-section" style="margin-top:14px;">';
    html += '<div class="ms-sec-title">📋 近期 ' + backtestData.recentTests + ' 期回测明细（5 维算法：头/尾/色/五行 + 跟随生肖）</div>';
    html += '<div class="mg-bt-scroll">';

    backtestData.details.forEach(function(item) {
      var hitTag = item.isHit
        ? '<span class="mg-bt-tag hit">准</span>'
        : '<span class="mg-bt-tag miss">错</span>';
      var actualNumStr = Utils.formatNum(item.actualNumber || 0);
      // 推荐号码：默认红色；若为实际号码则高亮
      var numsHtml = (item.recommendedNums || []).map(function(n) {
        var ns = Utils.formatNum(n);
        if (n === item.actualNumber) {
          return '<span class="mg-bt-num is-hit">' + ns + '</span>';
        }
        return '<span class="mg-bt-num">' + ns + '</span>';
      }).join(' ');

      html += '<div class="mg-bt-row ' + (item.isHit ? 'hit' : 'miss') + '">';
      html += '<span class="mg-bt-period">' + item.expect + '期</span>';
      html += '<span class="mg-bt-v">【' + numsHtml + '】</span>';
      html += '<span class="mg-bt-v">开:</span>';
      html += '<span class="mg-bt-num is-hit">' + actualNumStr + '</span>';
      html += hitTag;
      html += '</div>';
    });

    html += '</div>';
    html += '</div>';

    // 底部说明
    html += '<div class="mg-bt-note">';
    html += '• 算法：每期用其前 12 期窗口跑 5 维加权打分（头/尾/色/五行 + 跟随生肖）<br>';
    html += '• 推荐 Top10 号码 vs 实际特码对比判定命中<br>';
    html += '• 最近 ' + backtestData.recentTests + ' 期命中 <strong style="color:var(--mg-ok);">' + backtestData.recentHits + '</strong> 次 (' + backtestData.recentHitRate + '%)<br>';
    html += '• 数据仅供参考，不构成投资建议';
    html += '</div>';

    html += '</div>';
    overlay.innerHTML = html;
    document.body.appendChild(overlay);
    overlay.classList.add('show');

    // 关闭逻辑
    var closeHandler = function() {
      overlay.classList.remove('show');
      setTimeout(function() { overlay.remove(); }, 220);
    };
    var closeBtn = document.getElementById('closeFinalBacktestBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeHandler);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeHandler();
    });
  }

};

// 挂载到 ViewAnalysis 以保持外部 API 兼容
if (typeof ViewAnalysis !== 'undefined') {
  ViewAnalysis.renderZodiacAnalysis = ViewAnalysisZodiac.renderZodiacAnalysis;
  ViewAnalysis.showFinalBacktestModal = ViewAnalysisZodiac.showFinalBacktestModal;
}
