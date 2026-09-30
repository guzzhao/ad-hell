# Directory Structure

> 按"逻辑是否依赖 Vue"分层，而不是按技术栈分层。

---

## 分层

```
src/
├── types/ad.ts           # 跨层共享的类型。只有类型，没有运行时逻辑。
├── constants.ts          # 布局常量（手机逻辑尺寸、断点、缩放）
├── capabilities.ts       # 浏览器能力探测：纯函数 + 注入 env，可单测
├── data/                 # 静态数据：广告素材、媒体清单、风暴剧本、App 元数据
├── engine/               # 纯函数：不 import vue，不 import pinia
│   └── __tests__/
├── audio/                # 程序合成音频：synth.ts 纯函数，AudioBus.ts 碰 Web Audio
│   └── __tests__/
├── stores/               # Pinia：把 engine 的纯函数组合成有状态的过程
│   └── __tests__/
├── composables/          # 组合式函数：生命周期、浏览器 API 桥接
├── components/
│   ├── shell/            # 设备外壳与手机视口（布局层）
│   ├── phone/            # 手机内部 UI；apps/ 下是各 App 视图
│   ├── ads/              # 广告系统。layouts.ts / surfaces.ts 是**扩展缝**
│   │   └── creatives/    # 按版式分的素材渲染
│   ├── chrome/           # 页面级控件：逃生出口、音频、摇一摇提示、战况 HUD
│   └── truth/            # 崩塌后的真相长页
├── styles/               # base.css、phone.css、creative.css（素材质感层）
└── __tests__/            # 只放根级纯函数（capabilities）的测试
```

---

## 分层的判定标准

### `engine/` —— 纯函数，可单测

**判据**：不 import `vue`，不 import `pinia`，不碰 DOM。输入相同 → 输出必然相同。

现有文件：
- `storm.ts` —— 升级曲线、覆盖面积估算、崩塌判定、位置采样
- `close.ts` —— 关闭判定、误触惩罚
- `rng.ts` —— `mulberry32` 确定性随机

**为什么**：这个项目最容易出错的地方是"风暴的节奏与判定"，不是画面。
把这块做成纯函数，就能用单测把"必然关不完""五种关闭陷阱都成立"这些性质钉死，
而不是靠肉眼看动画。

**新增风暴相关的可调参数，一律加到 `STORM` 常量对象里**，不要把数字散落进组件。

### `stores/` —— 组合纯函数，持有状态

Pinia setup store 负责：阶段机、计时、计数、弹窗实例列表。
它**可以**调用 `engine/`，但 `engine/` 绝不能反过来调用它。

### `composables/` —— 生命周期与浏览器 API

凡是需要 `onMounted` / `onBeforeUnmount` / `requestAnimationFrame` / `matchMedia` /
`ResizeObserver` 的，都放这里，不要塞进组件。

**实现时先查 `@vueuse/core`**：目前三个组合式函数全部建立在 VueUse 之上
（`useRafFn` / `usePreferredReducedMotion` / `useElementSize` + `useMediaQuery`），
清理逻辑跟着 effect scope 走，不需要手写 `onBeforeUnmount`。
详见 [hook-guidelines.md](./hook-guidelines.md)。

### `components/` —— 只负责渲染

组件里不做判定逻辑。要判断"这个点击算不算关掉"，调用 store 或 engine。

### `audio/` —— 参数与发声分开

**判据**：`synth.ts` 是纯函数，不 import 任何 Web Audio 运行时，只算频率 / 包络 / 滤波参数；
`AudioBus.ts` 是命令式对象，碰 Web Audio 但**不 import vue**，生命周期由 `useCallAudio` 驱动。

**为什么**：真正建节点、开声卡的那一层在 jsdom 里根本跑不起来。把"要发什么声"抽成纯数据，
声音的形状才可能被单测钉死——否则音频这块只能靠人耳，回归时无从防守。

### `components/ads/layouts.ts` 与 `surfaces.ts` —— 扩展缝，不是普通模块

它们是**注册表**：`Record<AdLayout, Component>` 与 `Record<AdSurface, Component>` 的穷尽性
由编译器保证。加一种版式 / 呈现面而忘了注册，`type-check` 会直接报错。

所以这两个文件**允许**被频繁修改。判断一处改动是否违反扩展缝的约定，标准是
"有没有动既有的形态 / 呈现面**实现**"，而不是"有没有动这个文件"。

⚠️ 触发缝（`src/engine/shake.ts`）不一样：加一种 `AdTrigger` 会牵动**若干处**，
因为各处要访问不同触发方式自己的字段。编译器会把它们全指出来，但那不是单点注册。

---

## 命名与导入

- 组件文件用 `PascalCase.vue`，组合式函数用 `useXxx.ts`，其余用 `kebab-case.ts`。
- 跨目录一律用 `@/` 别名（`@` → `src`，配置在 `vite.config.ts` 与 `tsconfig.app.json`）。
  **同一目录内**才用相对路径。

```ts
import { STORM } from '@/engine/storm'      // 好
import { STORM } from '../../engine/storm'  // 不好
import AppIcon from './AppIcon.vue'         // 同目录，好
```

---

## 测试文件位置

测试放在被测代码旁边的 `__tests__/` 目录，文件名 `*.spec.ts`。

**这是硬约束**，不是偏好：`tsconfig.vitest.json` 的 `include` 是
`["src/**/__tests__/*", "env.d.ts"]`。放到别处就不会被类型检查覆盖。

```
src/engine/__tests__/storm.spec.ts
src/stores/__tests__/storm.spec.ts
src/components/__tests__/app.smoke.spec.ts
src/data/__tests__/creatives.spec.ts
```
