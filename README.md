# RM2027 人员名单海报 · 灵晔战队

上海电力大学「灵晔」RoboMaster 战队 2027 赛季人员名单海报，**固定 1920×1080**，两页 **PPT 式自动播放**：

| 页面 | 内容 | 入口 |
| --- | --- | --- |
| 技术组名单 | 机械组 / 嵌入式组（电控组·电路组）/ 算法组（自瞄组·导航组）/ 综合组（运营·管理），4 张大卡 | 默认页 |
| 车组名单 | 12 台机器人（步兵 5 构型 / 哨兵 2 构型 / 重装 / 超级电容 / 无人机 / 飞镖 / 裁判系统）× 2 个年级 × 4 个方向 + 负责人行 | `?page=cars` |

技术栈：**Vite 8 + React 19 + TypeScript 6 + Tailwind CSS 4**。

## 预览

| 技术组名单 | 车组名单 |
| --- | --- |
| ![技术组名单](shots/tech-1920x1080.png) | ![车组名单](shots/cars-1920x1080.png) |

（图片由 `scripts/verify.ps1` 生成，即 `pnpm dev` 下 `?page=tech` / `?page=cars` 的 1:1 截图）

## 自动播放（默认开启）

打开即循环播放，**默认每 12 秒换页**，淡入过渡 700ms，没有可见控件。

- **不会把屏幕切黑**：新页在最上层淡入，旧页延迟一个过渡时长再熄灭，过渡期间始终有一页是不透明的。
- **页面不可见自动暂停**（切标签 / 锁屏 / 屏幕被盖），可见后重新计时——数字标牌的标准做法。
- 自动播放时会申请 **Screen Wake Lock**，防止展示时显示器休眠（浏览器不支持或被策略拒绝则静默跳过）。
- 换页时 URL 同步 `?page=`，刷新后停在同一页。

**手动切换**（与自动播放并存，全程无可见控件）：

- **鼠标滚轮 / 触控板**上下（或左右）滑动翻页。一次手势只翻一页：累积位移过 40px 才翻，翻页后 900ms 冷却、冷却期内的残余事件全部丢弃，220ms 无新事件视为手势结束；方向反转会清空累积；`Ctrl+滚轮`（掰合缩放）不拦。
- 键盘：`←` `→` `↑` `↓` 翻页（按页序前进/后退，两页时互为切换）· `1` / `2` 直接跳页 · `空格` 暂停/继续自动播放 · `F` 全屏。
- 任何手动操作都会把自动播放的停留计时**重置为完整间隔**。

## 快速开始

```bash
pnpm install
pnpm dev            # http://localhost:5173
pnpm build          # 产物在 dist/
pnpm preview        # 预览构建产物 :4173
pnpm lint           # oxlint
```

### URL 参数

| 参数 | 作用 |
| --- | --- |
| `?page=tech` \| `?page=cars` | 指定初始页 |
| `?auto=0` | 关掉自动播放（配截图/调版用） |
| `?every=6000` | 换页间隔，单位毫秒，默认 `12000` |
| `?bare=1` | 强制 1:1（截图 / 导出口径） |
| `?scale=1` | 同上，但不影响其它行为 |
| `?diag=1` | 页面左上角输出布局量测（溢出元素、图片加载、卡内留白、当前页…） |
| `?wheel=1` | 仅调试：自动播一次滚轮手势并回报结果（供 `verify.ps1` 断言） |

## 出图 / 自检脚本

```bash
# 起 dev server → 两页各截一张 1920x1080 PNG 到 shots/ → 打印 DIAG 量测 → 自检自动播放与滚轮翻页
pwsh -File scripts/verify.ps1

# 与任意同尺寸海报做像素级比对（输出差异比例、差异包围盒、差异高亮图）
python scripts/pixel-diff.py shots/tech-1920x1080.png 参考图.png 输出差异图.png

# 量某张海报的「布局指纹」：卡片页眉色带、每行胶囊的 y 区间与左右端
python scripts/layout-probe.py shots/tech-1920x1080.png

# 逐卡逐行比较两张海报的胶囊行位置（Δy / Δx）
python scripts/row-compare.py 参考图.png shots/cars-1920x1080.png
```

`verify.ps1` 里用的是 Windows 上的 Chrome：
`--headless=old --window-size=1920,1080 --force-device-scale-factor=1 --screenshot=...`。
注意 `--headless=new` 会带上窗口边框，截出来是 1936×1175，必须用 `old`。

## 目录

```text
src/
  App.tsx                 页序 / 键盘 / 自动播放装配
  components/
    Stage.tsx             固定 1920x1080 舞台 + 多页叠层淡入（StageStack）
    PosterHeader.tsx      页眉：战队 logo + 标题 + 副标题 + 口号 + 右上统计
    PosterFooter.tsx      页脚：上海电力大学校徽 + 校名（两页共用）
    TechRoster.tsx        技术组名单页（4 张大卡）
    CarMatrix.tsx         车组名单页（14 列矩阵）
    Diag.tsx              ?diag=1 时的量测叠加层
  data/
    tech.ts               技术组名单数据 + 统计
    cars.ts               车组矩阵数据 + 统计
  hooks/
    useChipBalance.ts     胶囊折行平衡（避免末行孤儿）
    useAutoPlay.ts        自动播放计时（含页面不可见暂停）
    useWheelNavigate.ts   滚轮 / 触控板手势翻页（阈值 + 冷却，一次手势一页）
    useScreenWakeLock.ts  展示时防止屏幕休眠
  lib/util.ts             舞台尺寸、页面清单、素材路径
  index.css               Tailwind 入口 + 设计令牌 + 海报画布
public/assets/            logo / 校徽等位图素材
scripts/                  出图与自检脚本（PowerShell + Python）
```

### 为什么没引第三方轮播库

调研过的开源方案与不采用的原因：

- **reveal.js**（[auto-slide 文档](https://revealjs.com/auto-slide/)）：能力最贴近，`autoSlide: 5000` + `loop: true` 就能自动播，`autoSlideStoppable: false` 可关掉「一交互就暂停」。但它是**整站演示框架**：接管 DOM 结构、主题、排版与 `Reveal.initialize()` 生命周期，默认还会渲染一个播放/暂停控件；与「固定 1920×1080 海报 + 像素级对齐 + 无可见控件」都冲突。另外它的文档里没有「页面不可见时暂停」的行为，而这是标牌场景的刚需。
- **embla-carousel / Swiper / keen-slider / react-slick** 这类轮播库：擅长拖拽、无限列表、几十张幻灯片；本场景只有 2 张固定画布，引入后仍要自己解决固定舞台缩放、1:1 截图、无 UI 等问题，收益为负（Swiper 还要额外引 CSS）。
- **自己写**：`useAutoPlay` 约 40 行，换来完全可控的行为——「新页盖旧页」淡入（过渡期间不变暗）、`visibilitychange` 暂停、`Screen Wake Lock` 防休眠，以及 `?auto=0` 让截图流程确定。

## 数据口径

数据源：`rm2027人员分配.xlsx`（`车组人员名单`、`技术组人员名单` 两张表）。

- **技术组**：表内 60 个人次 = **52 人**（大三 14 / 大二 38）。跨组兼任导致重复：程一夫 ×3，朱建诚 / 蒋烨阳 / 杨政达 / 徐志成 / 潘俊成 / 杨诗堃 各 ×2。
  卡片角标写「**编制 x + y**」（= 名额数，含重复），页眉写「**52 人 / 大三 14 · 大二 38（去重）**」——两套口径都是真实值，不做文字解释。
- **车组**：表内 90 个人次 = **55 人**（同一人负责多台车会重复）。原表的合并单元格用 `span` 表达（如 2025 级算法的步兵人员横跨 5 个步兵构型、负责人程一夫横跨 5 个步兵构型）。
- **姓名不一致**：`车组人员名单` 某格写作「潘艺心」，`技术组人员名单` 写作「潘亦心」，两处统一按技术组表的 **潘亦心**。代码里有注释标注（`src/data/cars.ts`）。

## 设计说明

- **配色**沿用技术流程图取色：机械组 `#46546F`、嵌入式组 `#3E5A4B`、算法组 `#5F4046`、综合组 `#4E4363`（车组页另加电控 `#5FA0B8`、负责人 `#8B7CAE`）。底色 `#14161F`，主文字 `#E9EDF8`。
- 令牌集中在 `src/index.css` 的 `@theme` 里（`--color-stage` / `--color-ink` / `--color-dim` / `--color-gold` …），改配色只改这一处。
- ⚠️ **`.poster-canvas` 上的 `line-height: normal` 不能删**：Tailwind Preflight 会把默认行高改成 `1.5`，而这张海报的排版是按浏览器默认行高定的，删掉会让卡内文字整体偏移（已用像素比对验证）。
- 校徽按《上海电力大学 VI 手册》使用：标准红 **`#CC0000`（R204 G0 B0 / C26 M100 Y100 K0）**、官方制图原样不改内部要素；`public/assets/school-seal-clean.png` 是修好缺口与邻近残字后的正圆白盘版（四角 alpha=0、主红实测 `#CC0000`）。VI 未规定深色底的用法，故不采用自制的「白墨版」。

## 已知差异

与上一版静态 HTML 海报（`rm2027-tech-roster.html` + headless Chrome）逐像素比对：**页眉、页脚、四张卡的位置尺寸、每行胶囊的 x 位置与行距完全一致**；卡内内容整体高 5–7px（旧版 `space-evenly` 分配与实际盒高略有出入）。属视觉无感差异，未继续追平。

## 踩过的坑

- 删掉/改名模块（如把 `Switcher.tsx` 删掉、`Stage` 改名 `StageStack`）之后，**已经在跑的 dev server 会处于陈旧状态，页面直接白屏**——重启 `pnpm dev` 即可。`verify.ps1` 里截图只有几 KB 基本就是这个原因。
- Tailwind Preflight 会改默认行高，见上方设计说明。
- Chrome 的启动器是异步返回的：脚本里必须 `Start-Process -Wait` + 等文件落盘，否则截图读不到。

## 待办

- [ ] 车组页矩阵的单元格在 60px 行高下，4 人以上的格子接近贴边，可考虑行高自适应或字号自适应。
- [ ] 若要在展示机上长期跑，可考虑：隐藏鼠标光标（闲置 3 秒后 `cursor: none`）、加一条极细的播放进度线。
