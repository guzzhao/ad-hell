# 技术设计：手机弹窗广告乱象演示页

对应需求见 `prd.md`。本文件只讲技术设计，不重复需求。

## 1. 总体架构

单页应用，无路由。页面有**两个顶层阶段**，由 Pinia 状态驱动：

| 阶段 | 内容 |
|---|---|
| `simulation` | 一部虚拟手机：主屏 + 各 App 视图 + 弹窗风暴 |
| `truth` | 崩塌后的真相长页：数据、法规、建议、来源 |

技术选型：Vite + Vue 3（`<script setup>`）+ TypeScript + Pinia + GSAP（仅核心包）。
不使用 vue-router、不引入 UI 组件库——假广告的视觉风格必须手写 CSS 才能逼真。

## 2. 目录结构

```
D:\code\ad-all\
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig*.json
├── .oxlintrc.json / .oxfmtrc.json   # lint 与格式化（原为 eslint.config.ts / .prettierrc.json，
│                                     # 见 research/tech-stack-and-scaffold.md 的变更记录）
├── src/
│   ├── main.ts
│   ├── App.vue                     # 顶层阶段切换（simulation ⇄ truth）
│   ├── env.d.ts
│   ├── types/
│   │   └── ad.ts                   # AdCreative / AdInstance / 枚举与联合类型
│   ├── data/
│   │   ├── creatives.ts            # 虚构广告素材库（文案 + 配色 + 版式）
│   │   └── apps.ts                 # App 元数据：分类（A 类/B 类）、图标、标题
│   ├── engine/
│   │   ├── storm.ts                # 纯函数：升级曲线、生成节奏、位置采样
│   │   ├── close.ts                # 纯函数：关闭判定（真关闭 / 微型 / 虚假 / 无）
│   │   └── __tests__/              # Vitest 单测（只测纯函数）
│   ├── stores/
│   │   └── storm.ts                # Pinia：阶段、计时、计数、广告实例列表
│   ├── composables/
│   │   ├── useStormLoop.ts         # requestAnimationFrame 主循环，驱动引擎
│   │   ├── useShellScale.ts        # 桌面样机等比缩放（ResizeObserver）
│   │   └── useReducedMotion.ts     # 监听 prefers-reduced-motion
│   ├── components/
│   │   ├── shell/
│   │   │   ├── DeviceShell.vue     # 全屏手机 / 桌面样机 二选一的外壳
│   │   │   └── PhoneScreen.vue     # 固定逻辑坐标系 390×844 的手机视口
│   │   ├── phone/
│   │   │   ├── StatusBar.vue
│   │   │   ├── HomeGrid.vue        # 主屏：A 类 / B 类 两个分区
│   │   │   ├── AppHost.vue         # 按当前 appId 动态渲染 App 视图
│   │   │   └── apps/               # 各 App 的轻量"玩具"界面
│   │   │       ├── CameraApp.vue      AlarmApp.vue      CalculatorApp.vue
│   │   │       ├── MessagesApp.vue    DialerApp.vue     SettingsApp.vue
│   │   │       ├── ShortVideoApp.vue  ShopApp.vue
│   │   ├── ads/
│   │   │   ├── AdLayer.vue         # 弹窗层容器
│   │   │   ├── AdPopup.vue         # 单个弹窗外壳（定位、层级、关闭键）
│   │   │   ├── CloseButton.vue     # 四种关闭键变体
│   │   │   └── creatives/          # 按 layout 分派的素材渲染
│   │   │       ├── AdBanner.vue  AdInterstitial.vue  AdSplash.vue
│   │   │       └── AdFloating.vue  AdFakeCall.vue
│   │   ├── chrome/
│   │   │   ├── EscapeHatch.vue     # 常驻"结束体验 / 看真相"出口
│   │   │   └── StormHud.vue        # 克制显示的计时与计数
│   │   └── truth/
│   │       ├── TruthPanel.vue      # 真相长页容器
│   │       ├── MoneyChainChart.vue # 变现链条数字动画
│   │       ├── PenaltyCompare.vue  # 违法成本 vs 收益 对比条
│   │       └── AdviceList.vue      # 实用建议
│   └── styles/
│       ├── base.css                # 重置 + 设计变量
│       └── phone.css               # 手机视口与样机样式
```

## 3. 坐标系与布局（关键设计）

**单一逻辑坐标系**：手机视口固定为 `390 × 844` CSS px（iPhone 14 逻辑分辨率近似值）。
所有弹窗位置、尺寸以**该坐标系内的百分比**表达（`x: 0..100`, `y: 0..100`），
因此同一份广告数据在"移动端全屏"与"桌面样机"两种形态下都成立。

两种形态由 CSS 媒体查询 + 一个缩放变量切换：

| 形态 | 触发条件 | 实现 |
|---|---|---|
| 全屏手机 | 窄视口（`max-width: 767px`） | 手机视口 `width:100vw; height:100dvh`，无外框；广告仍按百分比定位 |
| 桌面样机 | 宽视口（`min-width: 768px`） | 固定 `390×844` 内层，外框（边框/圆角/刘海/阴影），整体 `transform: scale(var(--shell-scale))` |

**缩放变量必须由 JS 计算**：CSS 的 `calc()` 无法把长度除以长度得到无单位数，
`transform: scale()` 需要无单位数，`zoom` 兼容性不足。因此
`useShellScale.ts` 用 `ResizeObserver` 监听可用空间，输出
`s = min(1, (availH - margin) / 844, (availW - margin) / 390)`。

**为什么坚持固定逻辑尺寸而不是响应式重排**：广告位置是数据。若手机尺寸随视口变化，
百分比定位在极端比例下（如超宽矮窗口）会把弹窗挤到不可交互的区域，且"风暴填满屏幕"
这一核心观感无法稳定复现。固定坐标系 + 整体缩放保证了观感的一致与可控。

移动端使用 `100dvh`（带 `100vh` 回退）以应对移动浏览器地址栏的动态高度。

## 4. 广告引擎

### 4.1 数据结构

```ts
type CloseVariant =
  | 'honest'      // 正常关闭键：点击即关闭
  | 'tiny'        // 微型浅灰小字，尺寸远小于 44px 可点区
  | 'corner'      // 置于左上/右上角不易点击处
  | 'deceptive'   // 虚假关闭键：点击触发"跳转"
  | 'none'        // 无关闭键（对应报道中"无法关闭"）

interface AdInstance {
  id: number
  creativeId: string
  appId: string | null      // 限定只在某 App 内出现；null = 全屏层
  x: number; y: number      // 百分比坐标（左上角）
  w: number; h: number      // 百分比尺寸
  z: number
  closeVariant: CloseVariant
  bornAt: number            // ms，用于计算生命周期
}
```

### 4.2 升级曲线（纯函数，可单测）

目标观感：**关闭速度永远追不上新增速度**，这是需求 D2 的核心，不是随机调参的结果，
而是由曲线保证的数学结论。

```
spawnInterval(t) = lerp(2200ms, 320ms, easeOut(t / T_collapse))
maxConcurrent(t) = round(lerp(2, 45, easeIn(t / T_collapse)))
```

- `t` = 进入 storm 后的毫秒数；`T_collapse` = 预计崩塌时长（约 75 秒，可调）。
- 关键性质：`maxConcurrent` 单调不减，`spawnInterval` 单调不增。
  因此即便用户以人类极限速度点击真关闭键，单位时间新增数也终将超过关闭数。
- 位置采样：早期从屏幕边缘偏置采样（像真实弹窗），随 `t` 增大逐步过渡到
  全屏均匀采样，并降低与已有弹窗的重叠惩罚，最终覆盖整屏。

崩塌判定：当"未被关闭的弹窗覆盖面积估算值" ≥ 阈值（约 92% 屏占比）或
`ads.length ≥ maxConcurrent` 上限持续 2 秒，则 phase → `collapsed`。

### 4.3 关闭判定（纯函数，可单测）

```ts
type CloseOutcome =
  | { kind: 'closed' }
  | { kind: 'misclick'; reason: 'deceptive' }   // 触发"跳转"
  | { kind: 'dodged' }                          // 点空：微型/角落变体判定为未命中
```

- `honest` → `closed`
- `tiny` / `corner` → 命中判定按**实际渲染尺寸**做；若命中区小于可访问性下限，
  点击落在弹窗外沿时返回 `dodged`，制造"明明点了却没关掉"的挫败感
- `deceptive` → `misclick`：屏幕上出现一次明确的"跳转"覆盖层（假装进了落地页），
  需要用户点"返回"才能退出，并**追加 2~4 个新弹窗**作为惩罚
- `none` → 无法关闭，只能等它被后来的弹窗覆盖

三种关闭陷阱都**必然会被用户遇到**：`creatives.ts` 中为每个素材固定指派关闭变体，
不使用随机数，保证体验可复现（便于验收与调试）。

### 4.4 主循环

`useStormLoop.ts` 用 `requestAnimationFrame` 驱动，但**只做状态推进**，不做逐帧渲染：
- 每帧累计时间，达到 `spawnInterval` 阈值就 dispatch 一次生成
- 生成/关闭都是离散事件，交给 Pinia 变更，Vue 响应式负责渲染
- 组件卸载与 `phase === 'truth'` 时取消 rAF，避免后台空转

动画分工：
- **每个弹窗的进出场**：Vue `<TransitionGroup>` + CSS（轻量、声明式）
- **风暴升级、屏幕抖动、崩塌吞没序列**：GSAP 时间轴（需要精确编排与一次性 kill）
- GSAP 上下文在 `DeviceShell` 挂载时用 `gsap.context()` 创建，卸载时 `ctx.revert()`

## 5. 内容与素材

### 5.1 反转对照（需求 D4）

主屏分两个分区，标题即论点：

- **「本来就该干干净净的」**（A 类，模拟中被广告攻陷）：相机、闹钟、计算器、
  信息、电话（含紧急呼叫）、设置
- **「平时广告最多的」**（B 类，模拟里一个广告都没有）：短视频、购物
  每个 B 类 App 视图内附一句克制的说明，点出反差。

### 5.2 已解决的设计冲突

报道中最有力的细节之一是"报警短信里的链接点开后弹出**浏览器开屏广告**"，
但按 D4 的反转规则，浏览器属于"现实中广告泛滥"→ 模拟里应当干净。两者冲突。

**解决**：浏览器仍归 B 类保持干净；把"紧急场景被广告拦截"改用 **电话 App 的
紧急呼叫页**来承载——拨号过程中被全屏开屏广告盖住。这样既保住了反转规则的一致性，
又保留了报道中"要命时刻被广告挡住"的冲击力。真相环节以文字复述浏览器开屏广告那一幕。

### 5.3 素材合规

`creatives.ts` 中所有品牌名、Logo、文案**全部自创**，仅使用真实**广告品类**
（网贷、传奇游戏、减肥、同城交友、9.9 包邮、老人健康）。不得出现任何真实企业名称、
商标或近似变体。素材以代码内联的文案 + CSS 图形实现，不引入外部图片资源，
既避免版权问题也保证离线可跑。

## 6. 可访问性与安全（Key Decision）

这类"故意骚扰用户"的页面必须自带逃生通道，否则本身就是它所要批判的东西。

| 措施 | 说明 |
|---|---|
| 常驻退出 | 右上角常驻"结束体验"控件，触控区 ≥44px；`Esc` 键等效。它是浏览器 UI 的一部分，不属于手机界面，因此不破坏"无力感"设定 |
| 降低动效 | `prefers-reduced-motion: reduce` 时禁用屏幕抖动与大幅位移，生成间隔整体放慢 |
| 闪烁安全 | 不实现任何高频亮度闪烁；亮度变化频率严格低于 3 Hz |
| 不做伤害性伪装 | "虚假关闭键"只跳到**本页内的**假落地页覆盖层，不触发真实外链跳转 |
| 不分级恐吓 | 不使用真实的恐吓性内容（如伪造的扣款/公安通知） |

## 7. 数据准确性

真相环节的所有数字来自公开报道，并在页面上标注来源链接与"数据引自报道"字样。
不使用任何自行推算或夸大的数字。报道原文：
[https://www.ithome.com/1/008/059.htm](https://www.ithome.com/1/008/059.htm)

## 8. 验证方式

| 层次 | 方式 |
|---|---|
| 纯逻辑 | Vitest 单测：升级曲线单调性、关闭判定分支、崩塌判定、位置采样边界 |
| 类型 | `npm run type-check`（vue-tsc） |
| 风格 | `npm run lint` |
| 构建 | `npm run build` 产出 `dist/` |
| 人工 | 桌面宽窄两种视口各跑一遍，确认两种形态、反转对照、三类关闭陷阱、退出通道、真相环节 |

自动化不覆盖视觉观感——这是刻意的取舍：把测试预算放在易错的纯逻辑上，
视觉部分靠结构化的人工核对清单（见 `implement.md`）。

## 9. 已知风险

| 风险 | 缓解 |
|---|---|
| 弹窗风暴对焦虑/光敏用户不适 | 第 6 节全部措施；退出通道始终可用 |
| 议题涉及监管与厂商，公开发布敏感 | 不指名任何企业；仅引用公开报道并标注来源；所有品牌虚构 |
| TypeScript 7 / Vite 8 较新，工具链可能有兼容摩擦 | 以 create-vue 3.24.0 生成的固定版本组合为准，不手动升级 |
| 桌面缩放依赖 `ResizeObserver` | 现代浏览器均支持；`s` 有最小值兜底，异常时不至于缩到不可见 |
| 手机视口 `dvh` 兼容性 | 提供 `100vh` 回退声明 |
