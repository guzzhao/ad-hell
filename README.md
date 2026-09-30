# 关不掉的弹窗

用一部虚拟手机，演示手机弹窗广告如何占满你的屏幕 —— 以及它为什么屡禁不止。

打开页面，你会进入一部"手机"：弹窗广告不断冒出来，你必须亲手去点关闭键，但怎么点都追不上它新增的速度。屏幕被占满之后，页面会转入"真相"环节，用公开报道里的数据讲清这件事的来龙去脉。

## 快速开始

```bash
npm install
npm run dev        # http://localhost:5173
```

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 类型检查 + 生产构建，产物在 `dist/` |
| `npm run preview` | 预览构建产物 |
| `npm run test:unit` | 单元测试（watch 模式） |
| `npm run test:unit:run` | 单元测试跑一遍就退出（CI / 自动化用这个） |
| `npm run type-check` | `vue-tsc` 类型检查 |
| `npm run lint` | oxlint + eslint（带自动修复） |
| `npm run format` | Prettier 格式化 `src/` |

要求 Node `^22.18.0 || >=24.12.0`（见 `package.json` 的 `engines`）。

## 这个演示在讲什么

### 反转现实

主屏故意把现实倒过来：

- **「本来就该干干净净的」** —— 相机、闹钟、计算器、信息、电话、设置。这些在现实里本不该有广告，演示里全被广告攻陷。
- **「平时广告最多的」** —— 短视频、购物。这些在现实里广告最凶，演示里反而一个广告都没有。

反差本身就是论点：广告已经不满足于待在靠广告赚钱的 App 里了。

### 五类关闭陷阱

弹窗的关闭键按报道里点名的几种花招实现（见 `src/components/ads/CloseButton.vue`）：

| 变体 | 表现 |
| --- | --- |
| `honest` | 正常关闭键，看得见也点得到 |
| `tiny` | 浅灰色小字，命中区只有 14px |
| `corner` | 塞在左上角，命中区 16px、低对比 |
| `deceptive` | 外观与正常关闭键**完全一致**，但点了是"跳转" |
| `none` | 根本没有关闭键，只能等它被后来的弹窗盖住 |

点假关闭键会进入一个**页内**假落地页（不会跳转到任何真实网站），返回后屏幕上会多出 2~4 个新弹窗。

### "关不完"是结构性保证，不是调参碰出来的

`src/engine/storm.ts` 里两条单调曲线保证了用户必然失败：

- `spawnInterval` 单调不增 —— 生成越来越快，终局超过人类极限点击速度；
- `targetConcurrent` 单调不减 —— 屏幕上要求同时存在的弹窗越来越多，而这个目标只随时间增长，不受用户操作影响。

再加上 `none` 变体的弹窗永远关不掉，以及到点收场的兜底，崩塌是必然的。这些性质都有单元测试守着，不是靠手感。

## 可访问性与安全

这个页面是**故意**让人烦躁的，所以它必须自带逃生通道 —— 一个把用户困住的"反广告"页面，本身就成了它要批判的那种东西。

- 右上角常驻「结束体验」，`Esc` 键等效，随时可退出
- 尊重系统的"减少动态效果"：屏幕抖动与大幅位移会被关掉
- 无高频闪烁，亮度变化严格低于 3 Hz
- 「虚假关闭键」只跳到**页内**覆盖层，全程不发生任何真实外链跳转

## 数据来源与合规

页面上"真相"环节的所有数字都来自公开报道，并在页脚标注来源：

> 央视新闻《起底手机弹窗广告乱象："快应用"被滥用，违法成本远低于收益》
> IT之家转载：<https://www.ithome.com/1/008/059.htm>

**所有广告品牌、Logo、文案均为虚构**，只借用真实存在的广告**品类**（网贷、传奇游戏、减肥、同城交友、9.9 包邮等），不指向任何真实企业。`src/data/__tests__/creatives.spec.ts` 里有一条黑名单测试守着这条红线。

## 技术栈

Vite · Vue 3（`<script setup>`）· TypeScript · Pinia · GSAP

- **无路由**：手机内部的视图切换由 Pinia 状态驱动，不需要 vue-router。
- **无 UI 组件库**：假广告的视觉风格必须手写 CSS 才像。
- **GSAP 只用于编排**：风暴升级的屏幕抖动与崩塌吞没序列用 GSAP 时间轴；单个弹窗的进出场交给 Vue `<TransitionGroup>` + CSS。集成方式为 `gsap.context()` + `ctx.revert()`（npm 上没有 `@gsap/vue` 这个包）。

## 代码结构

```
src/
├── types/ad.ts              # 核心类型：关闭变体、素材、实例、阶段
├── data/
│   ├── creatives.ts         # 虚构广告素材库（品牌全部自创）
│   └── apps.ts              # 主屏 App 及其分类（system / commercial）
├── engine/                  # 纯函数，不含 Vue 依赖，全部有单测
│   ├── storm.ts             # 升级曲线、覆盖面积估算、崩塌判定、位置采样
│   ├── close.ts             # 关闭判定与误触惩罚
│   └── rng.ts               # 确定性随机数（固定种子 = 可复现的风暴）
├── stores/storm.ts          # Pinia：阶段、计时、计数、弹窗实例
├── composables/             # useStormLoop / useShellScale / useReducedMotion
├── components/
│   ├── shell/               # DeviceShell（全屏 or 样机）、PhoneScreen
│   ├── phone/               # 状态栏、主屏分区、AppHost、8 个 App 视图
│   ├── ads/                 # 弹窗层、弹窗、关闭键、5 种素材版式、假落地页
│   ├── chrome/              # EscapeHatch（出口）、StormHud（战况）
│   └── truth/               # 真相环节
├── styles/                  # base.css（设计变量）、phone.css（手机视口与样机）
└── constants.ts             # 手机逻辑尺寸、断点、缩放参数
```

### 两个值得留意的实现约束

1. **手机视口恒为 390 × 844 逻辑像素**，弹窗位置用相对它的百分比表达。因此"移动端全屏"与"桌面样机"两种形态共用同一份广告数据。边框由伪元素画在外部，绝不能占用内空间。

2. **桌面样机的缩放系数必须由 JS 算**。`transform: scale()` 需要一个无单位数，而 CSS `calc()` 无法把长度除以长度得到无单位数，所以用 `ResizeObserver` 计算（`useShellScale.ts`）。另外 `.device-frame` 上的 CSS 缩放与 GSAP 动画必须落在**不同元素**上，否则 GSAP 写内联 transform 会直接覆盖掉 CSS 缩放 —— 这就是 `.device-frame__motion` 这一层存在的原因。

## 许可与致谢

本项目为议题演示，所有广告素材均为虚构。页内 App 图标的图形为手写几何图形，未使用任何第三方图标库或真实产品 Logo。
