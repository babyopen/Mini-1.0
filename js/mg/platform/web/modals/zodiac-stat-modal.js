const ZodiacStatModal = {
  _modal: null,
  _currentData: null,

  init: () => {
    if (ZodiacStatModal._modal) return;

    ZodiacStatModal._modal = document.createElement('div');
    ZodiacStatModal._modal.id = 'zodiac-stat-modal';
    ZodiacStatModal._modal.className = 'mg-modal-mask';
    ZodiacStatModal._modal.innerHTML = `
      <div class="mg-modal-card" role="dialog" aria-modal="true" aria-labelledby="zodiac-stat-title">
        <div class="mg-modal-head">
          <div id="zodiac-stat-title" class="mg-modal-title"></div>
          <button id="zodiac-stat-close" class="mg-modal-x" type="button" aria-label="关闭">
            <svg class="i sm" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-x"/></svg>
          </button>
        </div>
        <div id="zodiac-stat-content"></div>
        <button id="zodiac-stat-confirm" class="btn primary mg-modal-foot" type="button">关闭</button>
      </div>
    `;

    document.body.appendChild(ZodiacStatModal._modal);

    document.getElementById('zodiac-stat-close').addEventListener('click', function () {
      ZodiacStatModal.hide();
    });
    document.getElementById('zodiac-stat-confirm').addEventListener('click', function () {
      ZodiacStatModal.hide();
    });
    ZodiacStatModal._modal.addEventListener('click', function (e) {
      if (e.target === ZodiacStatModal._modal) ZodiacStatModal.hide();
    });
  },

  show: (zodiac, data, freqResult, missHistory, followStats) => {
    if (!ZodiacStatModal._modal) ZodiacStatModal.init();

    ZodiacStatModal._currentData = { zodiac, data, freqResult, missHistory, followStats };

    const titleEl = document.getElementById('zodiac-stat-title');
    const contentEl = document.getElementById('zodiac-stat-content');

    titleEl.innerText = zodiac + ' - 遗漏值统计';

    let html = '';

    const zoneLabels = {
      '封顶区': '🔥 封顶区',
      '降权区': '🔶 降权区',
      '过热区': '🟠 过热区',
      '热号区': '🟡 热号区',
      '活跃区': '🟢 活跃区',
      '穿插区': '🔵 穿插区',
      '冷号区': '⚪ 冷号区'
    };

    html += '<div class="ms-section">';
    html += '<div class="ms-sec-title">当前状态</div>';
    html += '<div class="ms-grid">';
    html += '<div class="ms-box"><div class="ms-k">所属区域</div><div class="ms-v">' + (zoneLabels[data.zone] || data.zone) + '</div></div>';
    html += '<div class="ms-box"><div class="ms-k">当前遗漏</div><div class="ms-v">' + data.miss + '期</div></div>';
    html += '<div class="ms-box"><div class="ms-k">窗口出现次数</div><div class="ms-v">' + data.count + '次</div></div>';
    html += '<div class="ms-box"><div class="ms-k">降级预警</div><div class="ms-v">' + (data.willDrop ? '⚠️ 会降级' : '✅ 稳定') + '</div></div>';
    html += '</div></div>';

    if (freqResult) {
      html += '<div class="ms-section">';
      html += '<div class="ms-sec-title">各窗口统计</div>';

      const periods = [
        { key: 'p12', label: '12期窗口' },
        { key: 'p24', label: '24期窗口' },
        { key: 'p36', label: '36期窗口' }
      ];

      periods.forEach(function (period) {
        var periodData = freqResult[period.key];
        var item = null;

        if (periodData) {
          periodData.forEach(function (d) {
            if (d.zodiac === zodiac) {
              item = d;
              return false;
            }
          });
        }

        html += '<div class="ms-box ms-box-gap">';
        html += '<div class="ms-box-title">' + period.label + '</div>';

        if (item) {
          html += '<div class="ms-grid">';
          html += '<div class="ms-kv"><span class="ms-k">出现</span><span>' + item.count + '次</span></div>';
          html += '<div class="ms-kv"><span class="ms-k">区域</span><span>' + (zoneLabels[item.zone] || item.zone) + '</span></div>';
          html += '<div class="ms-kv"><span class="ms-k">遗漏</span><span>' + item.miss + '期</span></div>';
          html += '<div class="ms-kv"><span class="ms-k">状态</span><span>' + (item.willDrop ? '将降级' : '稳定') + '</span></div>';
          html += '</div>';
        } else {
          html += '<div class="ms-empty">数据不足</div>';
        }

        html += '</div>';
      });

      html += '</div>';
    }

    if (missHistory) {
      html += '<div class="ms-section">';
      html += '<div class="ms-sec-title">往期遗漏统计</div>';
      html += '<div class="ms-grid ms-box-gap">';
      html += '<div class="ms-box"><div class="ms-k">历史出现</div><div class="ms-v">' + missHistory.totalAppearances + '次</div></div>';
      html += '<div class="ms-box"><div class="ms-k">平均间隔</div><div class="ms-v">' + missHistory.avgInterval + '期</div></div>';
      html += '<div class="ms-box"><div class="ms-k">最大间隔</div><div class="ms-v">' + missHistory.maxInterval + '期</div></div>';
      html += '<div class="ms-box"><div class="ms-k">最小间隔</div><div class="ms-v">' + missHistory.minInterval + '期</div></div>';
      html += '</div>';

      if (missHistory.lastAppear && missHistory.firstAppear) {
        html += '<div class="ms-box ms-box-gap">';
        html += '<div class="ms-box-title">出现期号</div>';
        html += '<div class="ms-grid">';
        html += '<div class="ms-kv"><span class="ms-k">首次出现</span><span>第' + missHistory.firstAppear + '期</span></div>';
        html += '<div class="ms-kv"><span class="ms-k">最近出现</span><span>第' + missHistory.lastAppear + '期</span></div>';
        html += '</div></div>';
      }

      html += '<div class="ms-box ms-box-gap">';
      html += '<div class="ms-box-title">间隔分布</div>';
      html += '<div class="ms-grid">';

      var distLabels = {
        '0-5期': '🔵 0-5期',
        '6-10期': '🟡 6-10期',
        '11-20期': '🟠 11-20期',
        '21-30期': '🟠 21-30期',
        '31期以上': '🔴 31期以上'
      };

      for (var key in missHistory.intervalDistribution) {
        var count = missHistory.intervalDistribution[key];
        html += '<div class="ms-kv"><span>' + distLabels[key] + '</span><span class="ms-v">' + count + '次</span></div>';
      }

      html += '</div></div>';

      if (missHistory.recentAppearances && missHistory.recentAppearances.length > 1) {
        html += '<div class="ms-box">';
        html += '<div class="ms-box-title">近期出现间隔</div>';
        html += '<div class="ms-grid ms-grid-5">';

        var maxDisplay = Math.min(missHistory.recentAppearances.length - 1, 10);

        for (var row = 0; row < Math.ceil(maxDisplay / 5); row++) {
          for (var i = 0; i < 5; i++) {
            var idx = row * 5 + i;
            if (idx >= maxDisplay) break;

            var interval = missHistory.intervals[idx];
            var appear = missHistory.recentAppearances[idx + 1];

            if (interval !== undefined && appear) {
              html += '<div class="ms-chip">';
              html += '<div class="ms-chip-strong">' + interval + '期</div>';
              html += '<div class="ms-chip-sub">第' + appear.expect + '期</div>';
              html += '</div>';
            }
          }
        }

        html += '</div></div>';
      }

      html += '</div>';
    }

    if (followStats) {
      html += '<div class="ms-section">';
      html += '<div class="ms-sec-title">跟随统计（追踪最近' + followStats.targetAppearCount + '次出现）</div>';
      html += '<div class="ms-box ms-box-gap">';
      html += '<div class="ms-box-title">🐾 跟随排行榜（前12名）</div>';
      html += '<div class="ms-grid ms-grid-3">';

      var rankEmojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '①', '⑫'];

      followStats.topFollowers.forEach(function (item, idx) {
        if (item.count > 0) {
          html += '<div class="ms-chip">';
          html += '<div class="ms-chip-sub">' + rankEmojis[idx] + '</div>';
          html += '<div class="ms-v">' + item.zodiac + '</div>';
          html += '<div class="ms-chip-strong">' + item.count + '次</div>';
          html += '<div class="ms-chip-sub">' + item.percentage + '%</div>';
          html += '</div>';
        }
      });

      html += '</div></div>';

      if (followStats.followRecords && followStats.followRecords.length > 0) {
        html += '<div class="ms-box">';
        html += '<div class="ms-box-title">📋 最近10次出现后的走势</div>';

        followStats.followRecords.forEach(function (record) {
          html += '<div class="ms-record">';
          html += '<div class="ms-k">第' + record.expect + '期</div>';

          if (record.chain && record.chain.length > 0) {
            html += '<div class="ms-chain">';
            record.chain.forEach(function (item) {
              html += '<span class="ms-chain-chip">' + item.zodiac + '</span>';
              if (item.interval < record.chain.length) {
                html += '<span class="ms-arrow">→</span>';
              }
            });
            html += '</div>';
          } else {
            html += '<div class="ms-empty">无后续数据</div>';
          }

          html += '</div>';
        });

        html += '</div>';
      }

      html += '</div>';
    }

    contentEl.innerHTML = html;

    ZodiacStatModal._modal.classList.add('show');
  },

  hide: () => {
    if (!ZodiacStatModal._modal) return;
    ZodiacStatModal._modal.classList.remove('show');
    ZodiacStatModal._currentData = null;
  }
};
