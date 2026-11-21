/**
 * 未推荐生肖 - 「查看来源」弹窗（platform 层）
 * 用于展示 ①②③ 各源推荐与合并去重数据
 * 接收纯 html 内容（由视图层拼接），弹窗本身只负责壳与显隐
 */
const UnrecSourceModal = {
  _modal: null,

  init: () => {
    if (UnrecSourceModal._modal) return;

    UnrecSourceModal._modal = document.createElement('div');
    UnrecSourceModal._modal.id = 'unrec-source-modal';
    UnrecSourceModal._modal.className = 'mg-modal-mask';
    UnrecSourceModal._modal.innerHTML = `
      <div class="mg-modal-card" role="dialog" aria-modal="true" aria-labelledby="unrec-source-title">
        <div class="mg-modal-head">
          <div id="unrec-source-title" class="mg-modal-title"></div>
          <button id="unrec-source-close" class="mg-modal-x" type="button" aria-label="关闭">
            <svg class="i sm" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-x"/></svg>
          </button>
        </div>
        <div id="unrec-source-content"></div>
        <button id="unrec-source-confirm" class="btn primary mg-modal-foot" type="button">关闭</button>
      </div>
    `;
    document.body.appendChild(UnrecSourceModal._modal);

    document.getElementById('unrec-source-close').addEventListener('click', UnrecSourceModal.hide);
    document.getElementById('unrec-source-confirm').addEventListener('click', UnrecSourceModal.hide);
    UnrecSourceModal._modal.addEventListener('click', function (e) {
      if (e.target === UnrecSourceModal._modal) UnrecSourceModal.hide();
    });
  },

  /**
   * 显示「查看来源」弹窗
   * @param {string} title - 弹窗标题
   * @param {string} html  - 已拼接好的内容 html（由视图层生成）
   */
  show: function (title, html) {
    if (!UnrecSourceModal._modal) UnrecSourceModal.init();
    document.getElementById('unrec-source-title').innerText = title || '查看来源';
    document.getElementById('unrec-source-content').innerHTML = html || '';
    UnrecSourceModal._modal.classList.add('show');
  },

  hide: () => {
    if (!UnrecSourceModal._modal) return;
    UnrecSourceModal._modal.classList.remove('show');
  }
};
