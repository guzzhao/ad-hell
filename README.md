# 关不掉的弹窗

用一部虚拟手机，演示手机弹窗广告如何占满你的屏幕 —— 以及它为什么屡禁不止。

打开页面，你会进入一部"手机"：弹窗广告不断冒出来，你必须亲手去点关闭键，但怎么点都追不上它新增的速度。屏幕被占满之后，页面会转入"真相"环节，用公开报道里的数据讲清这件事的来龙去脉。

## 快速开始

```bash
npm install
npm run dev        # http://localhost:5173
```

| 命令                    | 作用                                      |
| ----------------------- | ----------------------------------------- |
| `npm run dev`           | 启动开发服务器                            |
| `npm run build`         | 类型检查 + 生产构建，产物在 `dist/`       |
| `npm run preview`       | 预览构建产物                              |
| `npm run test:unit`     | 单元测试（watch 模式）                    |
| `npm run test:unit:run` | 单元测试跑一遍就退出（CI / 自动化用这个） |
| `npm run type-check`    | `vue-tsc` 类型检查                        |
| `npm run check`         | `vp check` 统一代码格式与静态分析检查     |
| `npm run lint`          | `oxlint` (via `vp`) 检查并自动修复        |
| `npm run format`        | `oxfmt` (via `vp`) 格式化 `src/`          |
| `npm run format:check`  | 只检查格式，不改文件                      |

要求 Node `^22.18.0 || >=24.12.0`（见 `package.json` 的 `engines`）。

## 这个演示在讲什么

### 反转现实

主屏故意把现实倒过来：

- **「本来就该干干净净的」** —— 相机、闹钟、计算器、信息、电话、设置。这些在现实里本不该有广告，演示里全被广告攻陷。
- **「平时广告最多的」** —— 短视频、购物。这些在现实里广告最凶，演示里反而一个广告都没有。

反差本身就是论点：广告已经不满足于待在靠广告赚钱的 App 里了。

### 五类关闭陷阱

弹窗的关闭键按报道里点名的几种花招实现（见 `src/components/ads/CloseButton.vue`）：

| 变体        | 表现                                         |
| ----------- | -------------------------------------------- |
| `honest`    | 正常关闭键，看得见也点得到                   |
| `tiny`      | 浅灰色小字，命中区只有 14px                  |
| `corner`    | 塞在左上角，命中区 16px、低对比              |
| `deceptive` | 外观与正常关闭键**完全一致**，但点了是"跳转" |
| `none`      | 根本没有关闭键，只能等它被后来的弹窗盖住     |

点假关闭键会进入一个**页内**假落地页（不会跳转到任何真实网站），返回后屏幕上会多出 2~4 个新弹窗。

### "关不完"是结构性保证，不是调参碰出来的

`src/engine/storm.ts` 里两条单调曲线保证了用户必然失败：

- `spawnInterval` 单调不增 —— 生成越来越快，终局超过人类极限点击速度；
- `targetConcurrent` 单调不减 —— 屏幕上要求同时存在的弹窗越来越多，而这个目标只随时间增长，不受用户操作影响。

再加上 `none` 变体的弹窗永远关不掉，以及到点收场的兜底，崩塌是必然的。这些性质都有单元测试守着，不是靠手感。

### 广告还会伸手：摇一摇与来电广告

弹窗只是最表面的一层。这个演示还复现了另外两种：

**摇一摇跳转**（`src/engine/shake.ts`）。开屏广告一旦挂上"摇一摇"能力，你只是想拿稳手机，页面就跳走了。它是**素材的能力位**而不是全局开关 —— 屏幕上没有这类广告时，晃手机毫无反应。判定建立在统一的能量量纲上（一次甩动节拍记 0.5，阈值就是"1 秒内凑够几拍"）：真机传感器数加速度的上升沿，桌面数指针的横向反转次数，两条路径折算到同一个量纲，于是阈值、防抖、冷却这些最容易出错的规则全都脱离了真机、可以直接单测。

**全屏来电广告**（`src/components/ads/creatives/AdCallPage.vue`）。广告伪装成系统来电，盖住手机上的一切，还带着声音：振铃是 440+480 双音，接通后是按音节开合的人声。声音全部由 Web Audio **程序合成**，不加载任何音频文件。

这两段演出由 `src/data/beats.ts` 的**剧本节拍**安排 —— 全屏接管不能交给随机生成，否则"这一遍可能看不到"，验收也无从谈起。

## 可访问性与安全

这个页面是**故意**让人烦躁的，所以它必须自带逃生通道 —— 一个把用户困住的"反广告"页面，本身就成了它要批判的那种东西。

- 右上角常驻「结束体验」，`Esc` 键等效，随时可退出
- 左上角常驻静音键，一键按停
- **接管广告有 12 秒硬性上限**：即使是没有关闭键的那种，也必然自动结束
- 声音绝不在用户交互之前播放。浏览器不放行时会如实显示「点击页面任意处开启声音」，而不是静悄悄地不出声让人以为页面坏了
- 摇一摇绑定在素材上：屏幕上没有对应广告时完全不响应；一次摇动只跳转一次
- 尊重系统的"减少动态效果"：屏幕抖动、大幅位移与素材扫光都会被关掉。声音偏好与动效偏好互不推导
- 无高频闪烁，亮度变化严格低于 3 Hz
- 「虚假关闭键」只跳到**页内**覆盖层，全程不发生任何真实外链跳转

## 数据来源与合规

页面上"真相"环节的所有数字都来自公开报道，并在页脚标注来源：

> 央视新闻《起底手机弹窗广告乱象："快应用"被滥用，违法成本远低于收益》
> IT之家转载：<https://www.ithome.com/1/008/059.htm>

**所有广告品牌、Logo、文案均为虚构**，只借用真实存在的广告**品类**（网贷、传奇游戏、减肥、同城交友、9.9 包邮等），不指向任何真实企业。`src/data/__tests__/creatives.spec.ts` 里有一条黑名单测试守着这条红线。

## 技术栈

Vite · Vue 3（`<script setup>`）· TypeScript · Pinia · GSAP · VueUse

- **无路由**：手机内部的视图切换由 Pinia 状态驱动，不需要 vue-router。
- **无 UI 组件库**：假广告的视觉风格必须手写 CSS 才像。
- **工具链只有 oxc**：lint 用 `oxlint`，格式化用 `oxfmt`，不依赖 eslint / prettier
  —— 依赖树因此少掉 110 个包。
- **浏览器 API 交给 VueUse**：`useRafFn` / `useElementSize` / `useMediaQuery` /
  `usePreferredReducedMotion` / `useEventListener` 替掉了手写的 rAF 记账、
  ResizeObserver 与 matchMedia 监听（净省 60~80 行，产物 +4 kB / gzip +1.5 kB）。
- **GSAP 只用于编排**：风暴升级的屏幕抖动与崩塌吞没序列用 GSAP 时间轴；单个弹窗的进出场交给 Vue `<TransitionGroup>` + CSS。集成方式为 `gsap.context()` + `ctx.revert()`（npm 上没有 `@gsap/vue` 这个包）。
- **音频是程序合成的**：用原生 Web Audio，不引入 Howler / tone.js 之类的库，也不加载音频文件。参数计算（`audio/synth.ts`）与实际发声（`audio/AudioBus.ts`）分开 —— 前者是纯函数，声音的形状可以被单测钉死，而不用去开声卡。
- **零二进制资源**：整个 `dist/` 里除了构建产物与 favicon，没有任何图片或音频文件。广告画面靠 CSS 渐变与几何图形，声音靠合成。

## 代码结构

```
src/
├── types/ad.ts              # 核心类型：关闭变体、素材、实例、呈现面、触发、阶段
├── capabilities.ts          # 浏览器能力探测（传感器 / 音频 / 安全上下文）
├── data/
│   ├── creatives.ts         # 虚构广告素材库（品牌全部自创）
│   ├── media.ts             # 媒体清单：素材通过 mediaId 引用它
│   ├── beats.ts             # 风暴剧本：第几毫秒上演哪条素材
│   └── apps.ts              # 主屏 App 及其分类（system / commercial）
├── engine/                  # 纯函数，不含 Vue 依赖，全部有单测
│   ├── storm.ts             # 升级曲线、覆盖面积估算、崩塌判定、节拍调度
│   ├── shake.ts             # 能量窗口、阈值、响应者与冷却判定
│   ├── close.ts             # 关闭判定与误触惩罚
│   └── rng.ts               # 确定性随机数（固定种子 = 可复现的风暴）
├── audio/                   # 程序合成音频，零音频文件
│   ├── synth.ts             # 纯函数：算出"要发什么声"（频率 / 包络 / 滤波）
│   └── AudioBus.ts          # Web Audio 节点与解锁状态机（不 import vue）
├── stores/storm.ts          # Pinia：阶段、计时、计数、弹窗实例、静音
├── composables/             # useStormLoop / useShellScale / useReducedMotion
│                            # useCallAudio（音频桥接）/ useShakeSource（摇一摇采集）
├── components/
│   ├── shell/               # DeviceShell（全屏 or 样机）、PhoneScreen
│   ├── phone/               # 状态栏、主屏分区、AppHost、8 个 App 视图
│   ├── ads/                 # 扩展缝：layouts.ts 与 surfaces.ts 两个注册表
│   │   ├── AdLayer.vue      # 弹窗层（surface: popup）
│   │   ├── TakeoverLayer.vue # 全屏接管层（surface: takeover）
│   │   └── creatives/       # 6 种素材版式
│   ├── chrome/              # EscapeHatch、StormHud、AudioControls、ShakeHint
│   └── truth/               # 真相环节
├── styles/                  # base.css、phone.css、creative.css（素材质感层）
└── constants.ts             # 手机逻辑尺寸、断点、缩放参数
```

### 想加一种广告？四条扩展缝

| 缝                     | 要动哪里                                                 | 漏了会怎样                                          |
| ---------------------- | -------------------------------------------------------- | --------------------------------------------------- |
| **形态** `AdLayout`    | 新增 `creatives/AdXxx.vue`，在 `ads/layouts.ts` 注册一行 | `type-check` 直接报错                               |
| **呈现面** `AdSurface` | 新增层组件，在 `ads/surfaces.ts` 注册一行                | `type-check` 直接报错                               |
| **媒体** `mediaId`     | 在 `data/media.ts` 加一条                                | `registry.spec.ts` 失败                             |
| **触发** `AdTrigger`   | 补上编译器指出的所有位置                                 | `type-check` 报错，但**这是多点改动**，不是单点注册 |

前三条是真正的单点注册；触发缝因为要访问各触发方式自己的字段，加一种类型会牵动若干处 —— 编译器会把它们全指出来，这比静默出错好得多，但不该说成"加一行"。

详细取舍见 `.trellis/tasks/09-30-ad-v2-extension/design.md`。

### 两个值得留意的实现约束

1. **手机视口恒为 390 × 844 逻辑像素**，弹窗位置用相对它的百分比表达。因此"移动端全屏"与"桌面样机"两种形态共用同一份广告数据。边框由伪元素画在外部，绝不能占用内空间。

2. **桌面样机的缩放系数必须由 JS 算**。`transform: scale()` 需要一个无单位数，而 CSS `calc()` 无法把长度除以长度得到无单位数，所以用 `ResizeObserver` 计算（`useShellScale.ts`）。另外 `.device-frame` 上的 CSS 缩放与 GSAP 动画必须落在**不同元素**上，否则 GSAP 写内联 transform 会直接覆盖掉 CSS 缩放 —— 这就是 `.device-frame__motion` 这一层存在的原因。

## 许可与致谢

本项目为议题演示，所有广告素材均为虚构。页内 App 图标的图形为手写几何图形，未使用任何第三方图标库或真实产品 Logo。
