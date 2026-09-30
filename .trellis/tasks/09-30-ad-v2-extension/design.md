# 技术设计：广告演示 v2（可扩展架构 · 真实感素材 · 摇一摇 · 来电广告）

对应需求见 `prd.md`，执行清单见 `implement.md`。本文件只讲技术设计。
v1 的设计见 `../09-30-phone-ad-chaos/design.md`，本文件是它的演进，不重复 v1 已定的内容。

---

## 0. 本设计必须守住的三条不变量

| # | 不变量 | 为什么 |
|---|---|---|
| I1 | **引擎保持纯函数**：`src/engine/` 不 import `vue` / `pinia`，不碰 DOM | v1 最大的资产就是"风暴节奏与判定能用单测钉死"。v2 引入传感器与音频，最容易把框架依赖漏进内核 |
| I2 | **确定性**：风暴由种子 + 固定剧本决定，同一输入必得同一结果 | 验收要可复现；随机指派关闭陷阱在 v1 已被否决 |
| I3 | **逃生通道永远可用** | 页面级控件（z-index 1000）恒在接管广告（700）之上；接管广告另有硬性时长上限兜底 |

新增的音频与传感器只能作为**边缘适配器**存在（`composables/` 与 `audio/`），
它们把外部世界归一化成纯数据，再交给引擎判定。

---

## 1. 四条扩展缝 + 一个能力层

这是本次架构改造的主体。用户诉求"后面会增加多个功能，每次只加一样东西"，
对应的可验收形态就是：**加一种形态/呈现面时只新增文件 + 在注册表加一行，不改既有实现文件。**

| 缝 | 扩展的是 | 注册位置 | 保证方式 |
|---|---|---|---|
| **形态** | `AdLayout` → 渲染组件 | `src/components/ads/layouts.ts` | `Record<AdLayout, Component>`，漏注册 → `type-check` 报错 |
| **呈现面** | `AdSurface` → 层组件 | `src/components/ads/surfaces.ts` | 同上 |
| **触发** | `AdTrigger['kind']` → 每种触发的差异化处理 | `src/engine/shake.ts` 的 `TriggerCooldown` 映射类型 | 漏一个键 → `type-check` 报错（**注意：这不是单点注册**，见 §4.3） |
| **媒体** | `mediaId` → 媒体描述符 | `src/data/media.ts` | 运行期由 `registry.spec.ts` 校验（string 键无法编译期穷尽） |
| **能力层** | 浏览器能力探测 | `src/capabilities.ts` | 注入假 env 直接单测各分支 |

**为什么用 `Record<Union, T>` 而不是可变的 `Map` + `register()` 函数**：
`Record` 的穷尽性由编译器检查，**漏注册是编译错误而不是运行期惊喜**，
而且不需要任何初始化顺序约定。可插拔注册函数只在"运行期才知道有哪些实现"时才值得，
我们这里是静态已知的，用不上。

`layouts.ts` 的内容就是把 `AdPopup.vue:15-21` 现在写死的常量表**搬出来**——
这不是新抽象，只是把已有的注册表从组件内部挪到缝上。

---

## 2. 数据模型演进（`src/types/ad.ts`）

```ts
/** 广告的呈现面。决定它被哪一层渲染，以及是否参与覆盖率统计。 */
export type AdSurface =
  | 'popup'      // 漂浮弹窗（v1 现状，按百分比坐标定位）
  | 'takeover'   // 全屏接管（v2 来电广告）

// 注：v1 的 `InAppAdSlot` 是**由 App 视图以 props 静态渲染**的广告位，不是 AdInstance，
// 所以不进这个联合类型——给它注册一个永不使用的 surface 组件是死代码。
// 将来若要让风暴把广告注入 App 内容流，再加 'inline' 并在 SURFACES 里注册即可，
// 漏注册会被编译器挡下。这正是这条缝要展示的用法。

/** 广告的触发方式。当前只有摇一摇；将来可加 'tilt' | 'flip' 等。 */
export type AdTrigger = {
  kind: 'shake'
  /** 触发所需的归一化能量阈值。 */
  threshold: number
  /** 触发后的冷却时间（ms），保证一次摇动只算一次。 */
  cooldownMs: number
}

/** 媒体描述符。v2 全部是程序生成的，真素材将来只需换这里的 kind/src。 */
export type AdMedia =
  | { kind: 'synth'; preset: SynthPreset }          // 程序生成（v2 全部走这条）
  | { kind: 'image'; src: string; alt: string }     // 预留给真实素材
  | { kind: 'video'; src: string; poster?: string } // 预留给真实素材

interface AdCreative {
  // …v1 全部字段不变…
  /** 新增，默认 'popup'。 */
  surface: AdSurface
  /** 新增。带此字段的素材才会响应摇一摇（D3）。 */
  trigger?: AdTrigger
  /** 新增。指向 MEDIA 清单的键，渲染层据此取媒体。 */
  mediaId?: string
}

interface AdInstance {
  // …v1 全部字段不变…
  /** 新增。生成时从 creative 复制，供渲染分流与引擎过滤。 */
  surface: AdSurface
}
```

设计要点：

- `surface` 放在**实例**上而不是每次现查 creative：引擎是纯函数，只拿到 `AdInstance[]`，
  它必须能自己判断"谁参与覆盖率"。否则过滤逻辑会在渲染层和引擎里各写一份。
- `trigger` / `mediaId` 放在**素材**上：它们是素材固有的能力，不是某次出现的属性。
- 摇一摇的**冷却记账不进实例**，留在 store 的非响应式内部记账里（与 `zCounter` 同级），
  避免因为冷却时间推进而触发无谓的响应式更新。

---

## 3. 呈现面（surface）

### 3.1 z-index 预算（现有 + 新增）

| 层 | z-index | 说明 |
|---|---|---|
| App 内容 / 状态栏 | 40 | 既有 |
| 弹窗层 `AdLayer` | 100 | 既有 |
| **接管层 `TakeoverLayer`** | **700** | 新增，盖住所有弹窗 |
| 页内假落地页 `LandingOverlay` | 900 | 既有，仍高于接管层 |
| 页面级控件（逃生、静音） | 1000 | 既有，**必须永远最高**（I3） |

### 3.2 为什么保留 `AdLayer` 这个名字，而不是统一成一个 `AdSurfaceHost`

`AdLayer` 已经就是"弹窗面"的实现，把它改名只是换个字符串，却会让 `git log` 断掉、
让 v1 的 AC 核对清单失去锚点。**新增 `TakeoverLayer.vue`，再让 `surfaces.ts` 把两者注册起来**
即可拿到同样的扩展性，代价更小。

### 3.3 为什么不把 `LandingOverlay` 也改造成"覆盖层栈"

按第一性原理问一句："拿掉这个抽象会坏什么？"——**什么都不会坏**。
假落地页全局只有一个实例、与接管广告互斥、由单一布尔量驱动；
把它泛化成栈属于为不存在的需求付费。

**触发改造的条件**（写进注释，供后来者判断）：当出现第二个需要与假落地页**并存或互相叠加**
的全屏覆盖层时，再把 `landingOpen: boolean` 提升为 `overlays: OverlayInstance[]`。

---

## 4. 摇一摇

### 4.1 触发范围：绑定素材（决策 D3）

摇一摇**不是**全局劫持，而是**素材的一个能力位**：
只有屏幕上正存在带 `trigger: { kind: 'shake' }` 的广告时，摇动才有效。

因此数据流是"全局采集 → 按屏路由"，而不是"全局采集 → 直接发作"。

### 4.2 事件归一化管线

```
devicemotion (真机)  ─┐
pointermove  (桌面)  ─┼─→ useShakeSource ─→ 归一化样本 { atMs, energy } ─→ store.handleShake
显式按钮 / 键位      ─┘        （边缘适配器）        （纯数据）              （组合）
                                                                              │
                                                              engine/shake.ts 纯函数判定
                                                                              │
                                                      命中 → 复用既有 misclick 通路
```

关键：**适配器只产出能量标量，不产出布尔判定**。
判定全部在 `engine/shake.ts` 里，于是"阈值、防抖、冷却"这些最容易出错的边界可以单测，
而不是靠真机甩手机。

### 4.3 纯函数接口（`src/engine/shake.ts`）

```ts
export const SHAKE = {
  windowMs: 1000,        // 能量累积窗口
  maxSamples: 64,        // 窗口内最多保留的样本数
  energyThreshold: 1,    // 触发阈值（归一化能量）
} as const

export interface ShakeSample { atMs: number; energy: number }

/** 压入一个样本并丢弃窗口外的旧样本。纯函数，返回新数组。 */
export function pushShakeSample(
  samples: readonly ShakeSample[],
  sample: ShakeSample,
): ShakeSample[]

/** 窗口内能量总和是否越过阈值。 */
export function shakeEnergy(samples: readonly ShakeSample[]): number
export function isShakeTriggered(samples: readonly ShakeSample[], threshold: number): boolean

/**
 * 从屏上的广告里挑出该响应这次摇动的那一个。
 * 只在带 shake 触发器的广告之间选择；冷却未过则返回 null；能量不够也返回 null。
 */
export function resolveShake(
  ads: readonly AdInstance[],
  resolveTrigger: (creativeId: string) => AdTrigger | undefined,
  samples: readonly ShakeSample[],
  nextAllowedAt: ReadonlyMap<number, number>,
  nowMs: number,
): number | null
```

#### 4.3.1 关于"触发缝的编译期保证"——实测修正

设计初稿写的是"用穷尽 `switch (trigger.kind)` + `assertNever`，漏分支编译报错"。
**实现时发现这条不成立**：`assertNever` 的穷尽性依赖被判断的值是一个**多成员联合**，
而 `AdTrigger` 当前只有一个成员（`ShakeTrigger`），在 `default` 分支里它不会被收窄成
`never`，于是编译器报的是"`ShakeTrigger` 不能赋给 `never`"——一个假阳性错误。

改用映射类型 `TriggerCooldown`（`{[K in AdTrigger['kind']]: (t: Extract<AdTrigger,{kind:K}>) => number}`），
并用"往 `AdTrigger` 加一个 `tilt` 分支"实测验证过：`type-check` 报
`Property 'tilt' is missing in type ... but required in type 'TriggerCooldown'`。

但要如实说明一条与另外三条缝不同的性质：**触发缝不是单点注册。**
那次实测同时暴露了 `resolveShake` 里直接访问 `trigger.threshold` 的地方也会报错。
也就是说，加一种触发方式需要补**若干处**，编译器会把它们全部指出来——
这比"静默出错"好得多，但确实不是"加一行"。

形态缝与呈现面缝是真正的单点注册（数据只引用 `layout` / `surface` 两个字符串），
这一点没有变。

### 4.4 防抖与冷却（两层，缺一不可）

| 层 | 作用 | 参数 |
|---|---|---|
| 窗口累积 | 把一串零散样本当作**一次**摇动 | `windowMs = 1000` |
| 每实例冷却 | 同一次摇动抖动多次时只跳转一次 | `trigger.cooldownMs = 1500` |

只有窗口累积会导致"摇两下跳两次"；只有冷却会让第一下之后的连续摇动全部失效。
两者叠加后行为是：**一次摇动 = 一次跳转**，可被单测钉死。

### 4.5 三平台降级矩阵（决策 D2）

| 环境 | 采集源 | 是否需要授权 | 暴露给用户的控件 |
|---|---|---|---|
| Android / 桌面 Chrome + 真传感器 | `devicemotion` | 否（需安全上下文） | 屏上有 shake 广告时显示"摇一摇"提示 |
| iOS 13+ Safari | `devicemotion` | **是**，必须在用户手势内调用 `DeviceMotionEvent.requestPermission()` | 屏上有 shake 广告时显示「允许访问运动与方向」按钮 |
| 桌面（无加速度计） | `pointermove` 快速左右甩动 | 否 | 同上，提示文案改为"快速左右晃动手机区域" |
| 任意环境（兜底） | 显式按钮 / 键位 | 否 | 一个 ≥44px 的真按钮，直接产生一次合成样本 |

- 授权被拒绝**不是错误路径**：降级到桌面同款指针采集，`capabilities` 里如实记录，
  页面不报错、不卡死（AC17）。
- 提示控件只在"屏上确有 shake 广告"时出现，与 D3 的绑定语义一致。
- 提示控件属于**页面级控件**（z-index 1000），不随接管广告消失，也不能被广告遮挡。

### 4.6 为什么不把摇一摇塞进 `advance(dt)`

`advance(dt)` 的语义是"**时间**推进了 dt"，它的输出只依赖 `dt` 与既有状态，
这是 v1 全部节奏单测成立的前提。摇一摇是**外部事件**，塞进去会让
"相同输入 → 相同输出"（I2）失效，并且会把传感器耦合进风暴内核。

正确做法：`handleShake` 是与 `advance` 平行的**另一个入口**，
两者都只调用引擎的纯函数，互不感知。

---

## 5. 来电广告

### 5.1 用"剧本节拍"而不是随机生成

接管广告**不能**由 `spawnOne()` 随机生成，理由有两条：

1. 一个全屏实例会被 `coverageEstimate` 判成接近 100% 覆盖，**一次就终结风暴**；
2. 随机生成意味着"这次没看到来电广告"，AC15/AC16 将无法稳定验收。

因此引入**剧本节拍**：一张固定的小数据表，只决定"在第几毫秒上演哪个素材"。

```ts
// src/data/beats.ts
export interface StormBeat { atMs: number; creativeId: string }
export const BEATS: readonly StormBeat[] = [
  { atMs: 14_000, creativeId: 'call-spam-a' },
  { atMs: 32_000, creativeId: 'call-spam-b' },
]
```

调度判定仍是纯函数，放 `engine/storm.ts`：

```ts
/** 返回本次推进中应当上演的节拍（可能为空）。已演过的下标由 store 记账。 */
export function dueBeats(
  beats: readonly StormBeat[],
  firedCount: number,
  elapsedMs: number,
): StormBeat[]
```

到点必然上演，因此验收可复现（I2）。节拍表是数据，将来加"全屏视频广告"只需加一行。

### 5.2 接管期间的语义

| 事项 | 行为 | 理由 |
|---|---|---|
| 风暴是否继续 | **继续**。`elapsedMs` 照常推进，弹窗照常在接管层背后生成 | 接管不是暂停，而是"又多了一层"。关掉后弹窗仍在，压迫感不中断 |
| 是否计入 `spawnedCount` / 覆盖率 | 计入总数；**不计入覆盖率** | 见 5.3 |
| 逃生通道 | 始终可点（z 1000） | I3 |
| 硬性时长上限 | `STORM.takeoverMaxMs = 12_000`，到点自动"对方挂断" | 对应 `closeVariant: 'none'` 的来电广告，保证用户**不可能被永久困住**，同时保住"挂不掉"的观感 |

### 5.3 覆盖率估算必须排除 `takeover`

`coverageEstimate` 把每个实例按矩形涂格子，一个 100×100 的接管广告会占满整个网格
（覆盖率贡献 100%）。`isCollapsed` 要求"覆盖率 ≥0.9 **且** 弹窗数 ≥14"，
所以单看一个全屏实例并不会立刻击穿判定（有 `collapseMinAds` 兜着）。

真正的危害是另一件事：节拍上演的那一刻如果屏上已经有 ≥14 个弹窗，
崩塌就会被这一个**剧本实例提前触发**——崩塌时机于是取决于节拍表，而不是取决于风暴本身。
而 AC3 判定的是**洪水**的性质（"用户关不完、最终必然覆盖整屏"），
接管广告不是洪水的一部分，它是一次剧本演出。

改法：`coverageEstimate` 只统计 `surface === 'popup'` 的实例。
**这一条必须有单测**：给一个满屏 takeover 实例，断言覆盖率仍为 0。

### 5.4 素材

新增两条 `callPage` 版式的素材（沿用 v1 的虚构品牌与配色规范）：

| id | closeVariant | 意图 |
|---|---|---|
| `call-spam-a` | `corner` | 有拒绝键，但放在角落难以命中（对应报道里"关闭键置于不易点击处"） |
| `call-spam-b` | `none` | 完全没有拒绝键，只能等 `takeoverMaxMs` 到点自动挂断（对应"无法关闭"） |

不新造关闭语义——`CloseVariant` 与 `resolveClose` 原样复用。

---

## 6. 音频

### 6.1 为什么程序合成而不是音频文件（决策 D1）

- 零二进制资源 → 保持离线可跑、包体积不变、无授权问题，并与 v1 R6 的合规立场一致；
- `prefers-reduced-motion` 之外没有"prefers-muted"这类媒体查询，合成让我们能精确控制
  音量包络与时长，不必为素材文件再做剪辑；
- 合成参数是**纯数据**，可以单测；音频文件不能。

### 6.2 参数与节点分离（可测性的关键）

| 文件 | 是否碰 Web Audio | 职责 |
|---|---|---|
| `src/audio/synth.ts` | **否**（纯函数） | 给定 `preset` 与时间 → 输出**节点参数计划**：振荡器频率、增益包络关键点、滤波器截止频率、噪声门开合序列 |
| `src/audio/AudioBus.ts` | 是（纯 TS，无 Vue） | 按计划搭建 `AudioContext` / `OscillatorNode` / `BiquadFilterNode` / `GainNode`；管理解锁、静音、停止 |
| `src/composables/useCallAudio.ts` | 否（桥接） | 把 store 的状态（当前有无带电音的接管广告、是否静音）翻译成 `AudioBus` 调用 |

`AudioBus` 内部**不得 import vue**——它是命令式对象，由组合式函数驱动生命周期。
这样 `synth.ts` 的"振铃是两声 440/480 Hz、通话底噪是带通滤波的白噪声、
音量包络在 0.4 s 内升起"这类性质可以直接断言。

### 6.3 自动播放策略状态机

```
AudioBus.state: 'idle' → 'locked' → 'ready'
                     ↘ (首次用户手势) ↗
```

| 状态 | 含义 | 页面表现 |
|---|---|---|
| `idle` | 还没有 `AudioContext`（或环境不支持） | 静音图标置灰，不显示任何提示 |
| `locked` | 有 `AudioContext` 但处于 suspended（用户尚未交互） | 来电广告出现时**不出声**，改显示一个「点击开启声音」的 chip |
| `ready` | 已解锁，可出声 | 正常播放 |

- **首次用户手势**（页面内任意 `pointerdown` / `keydown`）触发 `unlock()`。
  用 VueUse 的 `useEventListener` 挂在 `window` 上。
- 绝不为了"保证能出声"而在用户交互前强行播放（R16）。
- 环境没有 `AudioContext`（jsdom、老浏览器）→ 停在 `idle`，**静默降级**（AC17）。
  这也意味着单元测试天然覆盖了降级路径。

### 6.4 静音控件

- 位置：与"结束体验"同属页面级控件区（`src/components/chrome/AudioToggle.vue`，z-index 1000）。
- 形态：一个 ≥44px 的真 `<button>`，`aria-pressed` 表达静音状态。
- 状态存在 store 里（`muted: boolean`），`useCallAudio` 监听它。
- 与 `prefers-reduced-motion` **无关**：动效偏好不蕴含声音偏好，不互相推导（这是常见错误）。

---

## 7. 能力探测（`src/capabilities.ts`）

写成**接受注入 env 的纯函数**，这样每个分支都能单测，不必伪造全局对象：

```ts
export interface CapabilityEnv {
  hasDeviceMotion: boolean
  needsMotionPermission: boolean
  hasAudioContext: boolean
  isSecureContext: boolean
}
export interface Capabilities extends CapabilityEnv {
  /** 摇一摇是否有可用的采集源（真实或指针降级）。 */
  canShake: boolean
  /** 是否应当显示"允许访问运动与方向"按钮。 */
  shouldRequestMotionPermission: boolean
}

export function detectCapabilities(env: CapabilityEnv): Capabilities
/** 从真实浏览器环境读一份 env。这是唯一碰全局对象的地方。 */
export function readCapabilityEnv(): CapabilityEnv
```

`needsMotionPermission` 的判据是
`typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function'`。

---

## 8. 逐层影响清单

### 新增

| 文件 | 层 |
|---|---|
| `src/components/ads/layouts.ts`、`surfaces.ts` | 组件（注册表） |
| `src/components/ads/TakeoverLayer.vue` | 组件 |
| `src/components/ads/creatives/AdCallPage.vue` | 组件 |
| `src/components/chrome/AudioToggle.vue`、`ShakeHint.vue` | 组件 |
| `src/engine/shake.ts` + `src/engine/__tests__/shake.spec.ts` | 引擎 |
| `src/data/media.ts`、`src/data/beats.ts` | 数据 |
| `src/data/__tests__/media.spec.ts` | 数据测试 |
| `src/audio/synth.ts`、`AudioBus.ts` + `src/audio/__tests__/synth.spec.ts` | 音频 |
| `src/composables/useShakeSource.ts`、`useCallAudio.ts` | 组合式 |
| `src/capabilities.ts` + `src/capabilities.spec.ts` | 根 |
| `src/components/ads/__tests__/registry.spec.ts` | 契约测试 |

### 修改

| 文件 | 改动 | 风险 |
|---|---|---|
| `src/types/ad.ts` | 加 4 个类型与 3 个字段 | 低（纯增量） |
| `src/engine/storm.ts` | `coverageEstimate` 过滤 popup；加 `dueBeats`、`takeoverMaxMs` | **高**：过滤写错会改掉崩塌时机，必须跑既有的崩塌单测 |
| `src/components/ads/AdPopup.vue` | `LAYOUTS` 改为从 `layouts.ts` 引入 | 低 |
| `src/data/creatives.ts` | 每条补 `surface`；新增 2 条来电素材 | 低 |
| `src/stores/storm.ts` | `spawnOne` 复制 `surface`；加 `handleShake`、节拍调度、接管生命周期、`muted` | **高**：核心状态机，改动须逐条对照既有单测 |
| `src/components/shell/PhoneScreen.vue` | 挂载 `TakeoverLayer` | 低 |
| `src/App.vue` | 挂载 `AudioToggle`、`ShakeHint`，初始化采集与音频桥接 | 中 |
| `.trellis/spec/frontend/directory-structure.md` | 记录 `audio/`、`capabilities.ts`、注册表的新分层 | 低 |

**既有 63 个单测必须全部保持通过**，它们是这次重构唯一的安全网（I1 的回报）。

---

## 9. 测试策略

| 层次 | 覆盖什么 |
|---|---|
| 纯逻辑（新增） | 摇一摇阈值/窗口/冷却边界；`pickShakeResponder` 在无匹配广告时返回 null；`dueBeats` 到点且只演一次；`takeoverMaxMs` 到期自动结束 |
| 纯逻辑（回归） | **满屏 takeover 实例的覆盖率必须为 0**；既有崩塌判定、升级曲线单调性全部不变 |
| 契约（新增） | `registry.spec.ts`：`LAYOUTS` 覆盖全部 `AdLayout`；`SURFACES` 覆盖全部 `AdSurface`；每条 creative 的 `mediaId` 在 `MEDIA` 里有定义；带 `trigger` 的素材其 `kind` 有实现 |
| 能力（新增） | `detectCapabilities` 的四个 env 分支，包括"无 AudioContext"与"需授权但被拒" |
| 音频（新增） | `synth.ts` 的参数计划：频率、包络单调性、preset 完整性；**不测真实发声** |
| 组件（新增） | 来电广告能渲染；静音按钮存在且 `aria-pressed` 正确；`AudioContext` 缺失时不抛错 |
| 组件（回归） | 既有 smoke 测试保持通过 |

**刻意的空白**：真实发声与真机甩动的体感不做自动化，交给 `implement.md` 的人工核对清单。

---

## 10. 兼容与迁移

- 数据是**纯增量**：`surface` 在既有 14 条素材上补 `'popup'`，`trigger` / `mediaId` 留空，
  因此 v1 的行为一个字都不变。
- 不新增运行时依赖：音频用原生 Web Audio，传感器用原生 `devicemotion` + VueUse 的
  `useEventListener` / `usePointer`。**不引入 Howler、tone.js 等库**（与 v1 拒绝 `motion-v`
  的理由一致：为一个用不到 10% 的库付整包体积）。
- 不新增构建配置：v2 无二进制资源，`vite.config.ts` 不动。
- 无路由、无迁移脚本、无存储格式变更，因此**不需要回滚策略**，只需保证提交粒度可回退。

---

## 11. 风险

| 风险 | 缓解 |
|---|---|
| **突然响起的电话铃声让访问者不适** | 首次交互前不出声（6.3）；页面级常驻静音键（6.4）；接管广告有 12 s 硬上限（5.2）；逃生通道 z 最高（I3） |
| 摇一摇在真机上过于灵敏，页面失控 | 双层防抖（4.4）+ 绑定素材（4.1，屏上没有对应广告时完全不响应） |
| 真机传感器行为无法在开发机上验证 | 三级降级矩阵（4.5）+ 显式兜底按钮；纯判定逻辑全部单测覆盖，剩下只有"采集"这一层需要真机核对 |
| 覆盖率过滤改动悄悄改变崩塌时机 | 见 §8 的风险标注；新增"满屏 takeover 覆盖率为 0"的单测作为护栏 |
| 音频合成听起来"电子味"，达不到"真实通话音" | `synth.ts` 的参数可独立调，preset 是数据；人工核对清单里单列一条听感确认 |
| 桌面无传感器导致这个功能在样机形态下完全看不到 | 决策 D2 的指针降级 + 可见提示，保证桌面上也能验收 AC14 |
