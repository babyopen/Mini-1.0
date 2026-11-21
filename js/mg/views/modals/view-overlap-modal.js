/**
 * 视图层：重叠号码弹窗（拆分自 view-filter.js，2026-06-05）
 * @namespace ViewOverlapModal
 * 包含：showOverlapModal
 * 依赖：Business.calcOverlapNumbers / Toast
 */
const ViewOverlapModal = {
  showOverlapModal: () => {
    const overlapData = Business.calcOverlapNumbers();

    if (overlapData.totalSchemes === 0) {
      Toast.show('暂无保存的方案');
      return;
    }

    if (overlapData.overlapNums.length === 0) {
      Toast.show('没有重叠的号码');
      return;
    }

    const groupedNums = {};
    overlapData.overlapNums.forEach(item => {
      const count = item.count;
      if (!groupedNums[count]) groupedNums[count] = [];
      groupedNums[count].push(item);
    });

    const sortedCounts = Object.keys(groupedNums).map(Number).sort((a, b) => b - a);

    const modal = document.createElement('div');
    modal.id = 'overlapModal';
    modal.className = 'mg-modal-mask';
    modal.innerHTML = `
      <div class="mg-modal-card" role="dialog" aria-modal="true" aria-labelledby="overlap-title">
        <div class="mg-modal-head">
          <div class="mg-modal-title" id="overlap-title">重叠号码
            <span class="mg-modal-sub">共${overlapData.overlapNums.length}个</span>
          </div>
          <button id="overlapCloseX" class="mg-modal-x" type="button" aria-label="关闭">
            <svg class="i sm" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-x"/></svg>
          </button>
        </div>
        <div class="mg-modal-sub mg-modal-center">基于${overlapData.totalSchemes}个方案计算</div>
        <div id="overlapContent" class="mg-overlap-scroll"></div>
        <button id="overlapCloseBtn" class="btn primary mg-modal-foot" type="button">关闭</button>
      </div>
    `;
    document.body.appendChild(modal);

    const content = modal.querySelector('#overlapContent');
    let html = '';

    sortedCounts.forEach(count => {
      const nums = groupedNums[count];
      const numStr = nums.map(item => item.s).join(' ');
      html += '<div class="mg-overlap-group">';
      html += '<div class="mg-overlap-head">';
      html += '<div class="mg-overlap-count">' + count + '次 (' + nums.length + '个号码)</div>';
      html += '<button class="btn sm secondary copy-nums-btn" data-nums="' + numStr + '">复制</button>';
      html += '</div>';
      html += '<div class="mg-overlap-nums">';

      nums.forEach(item => {
        const color = item.color === '红' ? '红色' : item.color === '蓝' ? '蓝色' : '绿色';
        html += '<div class="mg-overlap-num">' +
          '<div class="num-ball ' + color + '">' + item.s + '</div>' +
          '<div class="mg-overlap-zodiac">' + item.zodiac + '</div>' +
          '</div>';
      });

      html += '</div></div>';
    });

    content.innerHTML = html;
    requestAnimationFrame(() => modal.classList.add('show'));

    const closeModal = () => {
      modal.classList.remove('show');
      setTimeout(() => {
        if (modal.parentNode) modal.parentNode.removeChild(modal);
      }, 300);
    };

    modal.querySelector('#overlapCloseX').addEventListener('click', closeModal);
    modal.querySelector('#overlapCloseBtn').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    modal.querySelectorAll('.copy-nums-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const nums = btn.dataset.nums;
        Utils.copyToClipboard(nums, { successMsg: `已复制: ${nums}` });
      });
    });
  }
};

// 兼容路径：挂载到 ViewFilter，使 event.js 中 ViewFilter.showOverlapModal() 调用不变
if (typeof ViewFilter !== 'undefined' && ViewFilter) {
  Object.assign(ViewFilter, ViewOverlapModal);
}
