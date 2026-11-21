# DaoHang · 液态玻璃移动端 UI 模板

一套 iOS 26 Liquid Glass 风格的移动端界面基座：底部 4 项主胶囊 + 独立搜索胶囊，带完整「设置」页可实时调节外观，并已沉淀出可复用的组件层与开发规约。

- **多文件工程结构**：视图逻辑与业务逻辑分离（`view-*.js` / `business.js`），样式独立为 `styles.css`
- **PWA 可安装**：`manifest.json` + `sw.js`，添加主屏后独立窗口运行、离线可用
- **仓库**：https://github.com/babyopen/DaoHang
- **版本**：1.7.4
- **风格参考**：rdev/liquid-glass-react（本项目为纯 CSS 实现，未引入该库，无 WebGL 依赖）

---

## 目录结构

```
index.html            页面结构 + 首帧主题内联脚本（避免刘海先闪黑）
styles.css            全部样式：变量 / 玻璃容器 / 导航 / 卡片 / 按钮 / 表单控件 / 浮层
manifest.json         PWA 清单（名称、图标、独立窗口、主题色）
sw.js                 应用外壳缓存（导航网络优先、静态资源缓存优先）
icons/                192 / 512 应用图标
js/
  business.js         数据与算法层：配置 schema、默认值区间、读写存储、颜色与主色计算
  ui.js               公共 UI 层：DOM 引用、Toast、确认弹窗、复制、手势、键盘适配
  view-settings.js    设置视图：主题 / 壁纸 / 应用配置 / 滑块 / 开关 / 账户面板 / 导入导出
  view-search.js      搜索视图：设置项索引、结果渲染、双击恢复参数
  view-components.js  组件库视图：组件初始化与文档区交互
  main.js             启动：构建索引、首屏渲染、注册 Service Worker
```

加载顺序即上面的顺序，脚本为普通 `<script>`（非模块），共享顶层变量，无构建步骤。

## 快速开始

本地双击 `index.html` 也能跑（Service Worker 在 `file://` 下自动跳过）；要用 PWA / 离线缓存，需起一个 http 服务，例如 `python3 -m http.server 8080`，然后访问 `http://localhost:8080`。手机端建议「添加到主屏幕」，获得全屏、安全区与状态栏配色。

部署到 GitHub Pages：仓库 Settings → Pages → 选择 `main` 分支根目录，保存后即可通过 Pages 地址访问。

---

## 功能一览

| 模块 | 说明 |
| --- | --- |
| 底部导航 | 4 项主胶囊 + 独立搜索胶囊（尺寸/图标/圆角独立可调），选中指示器弹性滑动，负值悬浮高度，支持角标 |
| 滑轮交互 | 左右滑动切换页面（可关），滚动可收起导航 |
| 设置页 | 38 项可调配置；21 个滑块均为「±偏移」制，0 = 默认外观且滑块居中，可左右拖动调正负、双击回 0、分组折叠 |
| 深浅双套 | 着色/透明度/模糊/饱和度/边框/高光/噪点/投影/指示器色 分深浅两套独立记忆，可分别重置 |
| 玻璃质感 | CSS `backdrop-filter` + 内高光、噪点颗粒、RGB 边缘色散、投影 |
| 背景 | 内置深浅两套默认渐变（未设壁纸时生效）、本地上传壁纸（自动压缩 1600px）、5 套预设渐变、模糊/暗化、主色提取 |
| 账户 | 头像上传（居中裁切 256px）、名称/邮箱编辑校验，本地持久化 |
| 弹窗 | 底部上滑 Sheet（编辑类）+ 居中确认弹窗（二次确认/输入类），均含遮罩、Esc、焦点管理 |
| 提示 | Toast 四态（成功/警告/错误/信息），玻璃胶囊，自动消失 |
| 搜索 | 设置项关键词检索，命中后自动展开折叠分组并高亮直达 |
| 按钮体系 | primary/secondary/ghost/danger/text、尺寸、加载、禁用、图标、胶囊、悬浮按钮 |
| 基础组件 | 分割线、徽标（数字/红点）、空状态、列表项（图标+标题+副标题+箭头） |
| 字体 | 系统 / 圆润 / 衬线 三套字族切换 |
| 无障碍 | 对话框语义、焦点环（仅键盘触发）、`prefers-reduced-motion` 适配 |

---

## 参数模型：一切滑块都是「偏移量」

所有数值参数存的是**相对默认外观的偏移**，不是绝对值：

- **0 = 默认外观**（滑块停在中间，界面与出厂状态一致）
- **负值 = 减弱**（向左拖），**正值 = 增强**（向右拖）
- 双击参数名回到 0；深浅两套材质的偏移各自独立记忆

渲染时统一走 `eff(key)`：基准值 + 偏移，再按合法区间夹紧。基准与区间：

| 参数 | key | 基准（深 / 浅） | 偏移范围 | 生效区间 |
| --- | --- | --- | --- | --- |
| 基底透明度 | opacity | 0.35 / 0.55 | -0.32 ~ +0.32 | 0.03 ~ 0.90 |
| 模糊强度 | blur | 28 / 26 px | -28 ~ +28 | 0 ~ 60 |
| 饱和度 | saturation | 120 / 135 % | -110 ~ +110 | 0 ~ 250 |
| 边框强度 | borderAlpha | 0.10 / 0.18 | -0.18 ~ +0.20 | 0 ~ 0.5 |
| 内高光 | highlight | 0.55 / 0.78 | -0.55 ~ +0.45 | 0 ~ 1 |
| 噪点颗粒 | grain | 0.12 / 0.07 | -0.12 ~ +0.30 | 0 ~ 0.45 |
| 投影强度 | shadow | 0.32 / 0.18 | -0.32 ~ +0.50 | 0 ~ 0.9 |
| 模糊色散 | chroma | 0 | -6 ~ +6 | 0 ~ 8 |
| 胶囊圆角 | radius | 999 px | -999 ~ +120 | 0 ~ 999 |
| 卡片圆角 | cardRadius | 20 px | -20 ~ +20 | 0 ~ 40 |
| 悬浮高度 | bottom | 16 px | -76 ~ +60 | -60 ~ 90 |
| 胶囊间距 | gap | 12 px | -12 ~ +18 | 0 ~ 32 |
| 图标尺寸 | iconScale | 1.0 × | -0.60 ~ +0.80 | 0.4 ~ 1.9 |
| 导航最小宽度 | tabMin | 72 px | -32 ~ +48 | 40 ~ 130 |
| 动画速度 | animSpeed | 1.0 × | -0.8 ~ +1.5 | 0.2 ~ 2.5 |
| 界面字号 | fontScale | 1.0 × | -0.14 ~ +0.30 | 0.85 ~ 1.35 |
| 壁纸模糊 | wallBlur | 0 px | -44 ~ +44 | 0 ~ 44 |
| 壁纸暗化 | wallDim | 0.35 | -0.55 ~ +0.55 | 0 ~ 0.9 |
| 分组标题字号 | groupFont | 12 px | -8 ~ +8 | 9 ~ 20 |
| 页面大标题字号 | h1Font | 30 px | -14 ~ +14 | 22 ~ 44 |
| 搜索按钮宽度 | soloW | 44 px | -30 ~ +30 | 28 ~ 92 |
| 搜索图标尺寸 | soloIcon | 26 px | -14 ~ +14 | 14 ~ 44 |
| 搜索胶囊圆角 | soloRadius | 999 px | -999 ~ +999 | 0 ~ 999 |

### 设置页分组（按种类）

1. **显示与字体**：显示模式、字体（系统/圆润/衬线）、界面字号、分组标题字号、页面大标题字号
2. **玻璃材质**：着色、基底透明度、模糊强度、饱和度、边框强度、内高光、模糊色散、噪点颗粒、投影强度、卡片圆角
3. **导航栏**：胶囊圆角、悬浮高度、胶囊间距、图标尺寸、导航项最小宽度、选中项放大、显示文字标签、滚动收起导航
4. **搜索按钮**：按钮宽度、图标尺寸、胶囊圆角
5. **背景壁纸**：选择壁纸、壁纸模糊、壁纸暗化、预设渐变、主色提取
6. **选中指示器**：颜色、样式、动画
7. **交互与反馈**：通知、触感反馈、滑动动效、左右滑动切页、版本复制
8. **动效与性能**：动画速度、性能模式
9. **存储与配置**：导出（可备注）、导入、恢复默认、分主题重置、清除缓存
10. **组件预览**：按钮/尺寸/状态/提示/徽标/列表/空态
11. **关于**：版本、配置项数、隐私政策、用户协议

新增数值参数时：在 `DEFAULT_CONF` 登记 `0`、在 `BASE_CONF` 写基准、在 `LIMIT` 写区间，滑块 `min/max/step` 用对称偏移，`applyConfig` 里用 `eff(key)` 取值即可。

## 组件调用示例

### 提示 Toast

```js
toast('保存成功');          // 普通
toast('保存成功', 'ok');     // 成功（✓）
toast('空间不足', 'warn');   // 警告（!）
toast('上传失败', 'err');    // 错误（✕）
toast('显示模式：浅色', 'info'); // 信息（i）
```

### 居中确认弹窗

```js
// 二次确认
confirmDialog({
  title: '删除这条记录？',
  desc: '删除后无法恢复，请确认。',
  okText: '删除',
  danger: true,               // 确认按钮变红
  onOk: function(){ toast('已删除', 'ok'); }
});

// 带输入框
confirmDialog({
  title: '新建模块',
  desc: '给新模块起个名字。',
  input: true,
  placeholder: '例如：每日复盘',
  okText: '创建',
  onOk: function(name){ toast('已创建「' + name + '」', 'ok'); }
});
```

### 底部 Sheet（编辑类）

复用 `#profile-sheet` 的结构与 `openProfile / closeProfile`；新增 Sheet 时只需换内容区，遮罩、手势下拉、焦点锁定、滚动锁定都已内置。

### 按钮

```html
<button class="btn primary">主要</button>
<button class="btn secondary">次要</button>
<button class="btn ghost">取消</button>
<button class="btn danger">删除</button>
<button class="btn text">文字</button>
<button class="btn icon ghost">＋</button>

<button class="btn primary sm">小号</button>
<button class="btn primary lg">大号</button>
<button class="btn primary block">整宽</button>

<button class="btn secondary is-disabled">禁用</button>
<button class="btn secondary is-loading">加载中</button>
<button class="pill-btn">胶囊标签</button>
```

### 卡片 / 列表行

```html
<div class="liquid-glass card">
  <div class="row"><span class="row-label">标题</span><span class="row-val">值</span></div>
  <div class="row tap"><span class="row-label">可点击行</span></div>
  <div class="row tap danger"><span class="row-label">危险操作</span></div>
</div>
```

### 列表项

```html
<div class="list-item">
  <div class="li-icon">📄</div>
  <div class="li-body">
    <div class="li-title">标题</div>
    <div class="li-sub">副标题，过长自动省略</div>
  </div>
  <svg class="chev" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
</div>
```

### 空状态

```html
<div class="empty">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
    <rect x="3" y="5" width="18" height="14" rx="3"/><path d="M8 11h8M8 15h5"/>
  </svg>
  <h3>还没有自定义模块</h3>
  <p>创建第一个模块，把常用操作收进同一个入口。</p>
  <button class="btn sm primary">新建模块</button>
</div>
```

### 徽标 / 分割线

```html
<span class="badge">3</span>      <!-- 数字徽标 -->
<span class="badge dot"></span>   <!-- 红点 -->
<div class="divider"></div>       <!-- 分割线 -->

<!-- 导航角标：放在 .tab-item 内 -->
<div class="tab-item" data-nav="app">…<div class="badge dot"></div></div>
```

### 点击复制

给行加 `data-copy` 即可，点击后自动 Toast 提示（不支持剪贴板 API 时回退 `execCommand`）：

```html
<div class="row tap" data-copy="v1.4.0">
  <span class="row-label">当前版本号</span><span class="row-val">点击复制</span>
</div>
```

### 图标

文件顶部内置一套 `<symbol>` 图标集，按 id 引用，不再混用字符与零散 SVG：

```html
<svg class="i" viewBox="0 0 24 24"><use href="#i-chev"/></svg>
```

| id | 用途 |
|---|---|
| `i-chev` | 右箭头 / 列表进入 |
| `i-x` | 关闭、移除 |
| `i-check` | 对勾、选中 |
| `i-plus` / `i-minus` | 新增、加减 |
| `i-alert` / `i-info` | 警示、说明 |
| `i-search` / `i-left` | 搜索、返回 |

尺寸用 `.i`（16px）/ `.i.sm`（13px）/ `.i.lg`（20px），颜色继承 `currentColor`，改主题自动跟随。

### 复选框 / 单选框

```html
<label class="checkbox"><input type="checkbox" checked><span class="box"></span><span class="cb-text">已选</span></label>
<label class="radio"><input type="radio" name="g"><span class="box"></span><span class="cb-text">选项 A</span></label>
<label class="checkbox is-disabled"><input type="checkbox" disabled><span class="box"></span><span class="cb-text">禁用</span></label>
```

原生 input 只在视觉层隐藏，`checked / disabled` 照常工作，可直接接表单。

### 下拉选择

```html
<div class="select" data-value="">
  <button class="select-trigger" type="button" aria-expanded="false">
    <span class="select-value">请选择</span>
    <svg class="select-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
  </button>
  <!-- 仅作数据声明，初始化后自动移除 -->
  <div class="select-option" data-value="a">选项 A</div>
  <div class="select-option is-disabled" data-value="b">禁用项</div>
</div>
```

```js
var sel = initSelect(document.querySelector('.select'));
sel.onChange(function(value, label){ /* 业务回调 */ });
sel.set('a'); sel.value; // 读当前值
```

面板自动挂到 body、自动改上/下方向避让、支持搜索过滤、Esc / 点外部关闭。打开后焦点进入面板（触屏只聚焦容器不弹键盘），Tab 在面板内循环，关闭或选中后焦点归还触发按钮；`role=listbox` + `aria-activedescendant` 同步键盘高亮项。

### 进度条

```html
<div class="progress"><div class="progress-fill" style="width:60%"></div></div>
<div class="progress is-indeterminate"><div class="progress-fill"></div></div>
```
`setProgress(el, 62)` 返回夹紧后的值。

### 页面内提示

```html
<div class="notice notice-warn"><div class="notice-icon">!</div>
  <div class="notice-body"><div class="notice-title">注意</div><div class="notice-text">说明文案</div></div>
  <button class="notice-close" type="button">✕</button></div>
```
类型：`notice-success / notice-warn / notice-danger / notice-info`。

### 标签

```html
<span class="tag">默认</span>
<span class="tag primary">主色</span>
<span class="tag">可关闭<button class="tag-x" type="button">✕</button></span>
```

### 步进器

```html
<div class="stepper" data-min="1" data-max="99" data-value="3">
  <button class="step-btn" data-act="minus">−</button>
  <input class="step-val" type="number" value="3">
  <button class="step-btn" data-act="plus">+</button>
</div>
```
`initStepper(el)`：自动夹紧、首尾态禁用按钮、长按连续增减。

### 全屏加载遮罩

```js
showLoader('正在处理…'); hideLoader();
```
`

### 新增一个页面

1. 在 `main` 内追加 `<section class="view" data-view="xxx">…</section>`
2. 底部导航追加 `<div class="tab-item" data-nav="xxx">…</div>`（主胶囊内）
3. 内容直接用 `.liquid-glass.card` / `.row` / `.list-item` / `.btn` 组合，风格自动继承
4. 若需新弹窗，编辑类复用 Sheet，确认类用 `confirmDialog`
5. 若加设置项，只需在设置页按现有结构加 `.row`，`applyConfig` 里补一行同步即可自动接入搜索索引与双击重置

---

## 移动端适配（键盘 / 缩放）

- **键盘高度**：监听 `visualViewport` 得到键盘高度写入 `--kb`，并切换 `body.kb-open`。居中弹窗上移 `kb/2`，底部 Sheet 的 `bottom` 直接抬到键盘顶部，输入区永不被遮。
- **输入框字号**：所有 text/email/search 输入框字号取 `max(16px, --fs-row)`，避免 iOS 聚焦时自动放大页面。
- **禁止缩放**：`maximum-scale=1` + `body{touch-action:manipulation}`，双击/双指不再放大，同时去掉点击 300ms 延迟。
- **聚焦定位**：输入框聚焦后自动 `scrollIntoView({block:'center'})`，弹窗与 Sheet 内部滚动均生效。
- **导航避让**：Sheet 或键盘打开时底部导航自动收起。

## 本地存储键

| Key | 内容 |
| --- | --- |
| `lgSettingsV3` | 外观配置（含深浅两套变体、折叠状态、字体、滑动开关，不含壁纸） |
| `lgWallpaperV1` | 壁纸图片 dataURL（单独存放，避免拖动滑块时重复序列化） |
| `lgProfileV1` | 账户名称、邮箱 |
| `lgAvatarV1` | 头像图片 dataURL |

「清除缓存」只清业务临时数据，以上四项均保留。

---

## 开发规约（硬性）

1. **视图与数据分离**：渲染、事件、DOM 操作留在视图区块；存储、计算、校验集中在数据区块，数据区块内不出现 `innerHTML` / `classList` / 样式操作。
2. **样式只走变量**：新组件复用 `--lg-*` 变量与既有 class，不新增独立的 `backdrop-filter` 组合。
3. **切换不加淡入**：`.view` 容器不做 opacity 过渡，避免玻璃层逐帧重绘造成闪动；过渡只给标题等无玻璃元素。
4. **弹窗二选一**：编辑内容用底部 Sheet，二次确认/输入用 `confirmDialog`，不自造第三种弹窗动画。
5. **焦点不留在容器上**：程序化聚焦弹窗容器时须 `outline:none`（否则浏览器默认 focus ring 会在玻璃边缘画出一圈白线）。
6. **性能**：滑块输入只渲染，落盘走 200ms 防抖；提供性能模式关闭实时模糊。
7. **提交**：每次改动完成即提交并推送，提交信息用 `feat: / fix: / chore:` 前缀说明改了什么。

---

## 版本记录

| 版本 | 内容 |
| --- | --- |
| 1.7.4 | 工程拆分：`styles.css` + 6 个 JS 文件（business / ui / view-settings / view-search / view-components / main）；新增 PWA（manifest + sw + 图标），支持安装到主屏与离线打开 |
| 1.7.3 | 下拉焦点管理（进入面板 / Tab 循环 / 归还焦点 + listbox 语义）；修复面板高度为 0 时向下溢出屏幕的定位 bug；性能模式下弹层与遮罩不再叠第二层模糊 |
| 1.7.2 | 组件库每个组件下挂可折叠「代码 / 参数」区（12 组），代码块自动换行、一键复制，参数说明就近显示 |
| 1.7.1 | 统一图标：文件顶部 `<symbol>` 图标集（9 个），替换 6 处字符 ✕、对勾、加号、步进加减与散落 SVG，尺寸/颜色统一由 `.i` 与 currentColor 控制 |
| 1.7.0 | 组件预览拆成独立「组件库」视图（设置页只留入口，滚动长度大幅缩短）；新增填充/描边/浮层/间距四组设计变量，新组件全部改为变量驱动，浅色不再靠单点补丁；下拉支持 ↑↓ 键移动、回车选中、已选项自动高亮 |
| 1.6.9 | 新增复选/单选、自定义下拉（含搜索）、进度条、页面内提示块、标签、数字步进器、全屏加载遮罩，全部进组件预览区 |
| 1.6.8 | 账户面板只在设置页可打开（非设置页触发直接忽略），切换视图自动收起，杜绝切页/滚动后残留显示 |
| 1.6.7 | 修复键盘弹起时未打开的账户面板被顶到键盘上方露出（kb-open 抬升仅对 `.show` 生效 + 未打开时 visibility:hidden）；刘海安全区：加 apple 状态栏 translucent、首帧前按主题预置 html 底色与 theme-color |
| 1.6.6 | 「显示模式」行显示当前实际模式（固定 · 深色 / 系统 · 浅色），选择跟随系统与系统切换时给出 Toast 提示，便于确认是否生效 |
| 1.6.5 | 修复滑动到底部误弹「编辑账户信息」：加滑动手势—点击隔离（位移>14px 后 350ms 内忽略合成 click），账户卡打开前判断刚落滚动 300ms 内不响应 |
| 1.6.4 | 顶部不再留黑块：`theme-color` 与 html 底色跟随主题渐变基色动态更新、背景层与视口对齐、标题区加刘海安全内边距 |
| 1.6.3 | 双击恢复默认改为 click 时间差检测（iOS Safari 不派发 dblclick，触摸端也能双击恢复）；设置页副标题补充操作提示 |
| 1.6.2 | 背景改为内置默认渐变（深色蓝紫、浅色淡蓝粉），未设壁纸时不再是纯黑，玻璃有了可透的背景层次 |
| 1.6.1 | 移除「双层玻璃背板」功能与开关（含 `::before` 内嵌薄壳环样式） |
| 1.6.0 | 移动端适配：键盘高度重排（弹窗上移 / Sheet 抬到键盘顶）、输入框 16px 防聚焦缩放、禁双击与双指缩放、聚焦自动滚动、键盘或 Sheet 打开时收起导航 |
| 1.5.5 | 移除「边缘折射（WebGL）」功能与开关，删除 WebGL 采样层，玻璃改为纯 CSS 实现（更省电、无兼容风险） |
| 1.5.4 | 新增「分组标题字号」「页面大标题字号」两项可调参数（标题间距随字号自动补偿） |
| 1.5.3 | 「交互与反馈」卡移除版本号行（版本信息统一收在「关于」） |
| 1.5.2 | 颜色控件改为自绘外壳 + 隐形原生 input（保证各平台高度一致、与文字垂直居中）；修正版本号显示 |
| 1.5.1 | 移除账户卡的主题快切按钮；导航参数独立成「导航栏」卡片；新增「搜索按钮」卡片（宽度/图标/圆角独立可调）；设置项按种类重排为 11 组；全部滑块范围为对称区间，0 时正好居中 |
| 1.5.0 | 参数模型改为「偏移制」：全部 19 个滑块默认 0，可左右拖动调正负，实际值 = 基准 + 偏移并夹紧；深浅两套偏移独立；滑块轨道加中点标记；文案与 README 同步 |
| 1.4.0 | 基础组件补齐：Toast 四态、居中确认弹窗（支持输入）、空状态、列表项、徽标、分割线、点击复制；设置页分组折叠、显示模式快切、字体三选、分主题重置、滑动切页开关、导出备注；组件预览区同步展示 |
| 1.3.2 | 7 项优化（搜索直达、深浅双套、壁纸独立存储、写入防抖、单项重置、通知权限、减弱动效）、切换闪动修复、账户可编辑、负悬浮高度、完整弹窗交互、按钮体系、组件预览 |
| 1.3.1 | 设置页独立视图、壁纸与预设、性能模式 |
| 1.3.0 | 玻璃参数面板 → 独立设置页 |
