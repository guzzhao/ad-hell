# Directory Structure

> 按"逻辑是否依赖 Vue"分层，而不是按技术栈分层。

---

## 分层

```
src/
├── types/ad.ts           # 跨层共享的类型。只有类型，没有运行时逻辑。
├── data/                 # 静态数据：广告素材、App 元数据
├── engine/               # 纯函数：不 import vue，不 import pinia
│   └── __tests__/
├── stores/               # Pinia：把 engine 的纯函数组合成有状态的过程
│   └── __tests__/
├── composables/          # 组合式函数：生命周期、浏览器 API 桥接
├── components/
│   ├── shell/            # 设备外壳与手机视口（布局层）
│   ├── phone/            # 手机内部 UI；apps/ 下是各 App 视图
│   ├── ads/              # 弹窗系统；creatives/ 下是按版式分的素材渲染
│   ├── chrome/           # 页面级控件：逃生出口、战况 HUD
│   └── truth/            # 崩塌后的真相长页
├── styles/               # base.css（全局变量与重置）、phone.css（视口与样机）
└── constants.ts          # 布局常量（手机逻辑尺寸、断点、缩放）
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

### `components/` —— 只负责渲染

组件里不做判定逻辑。要判断"这个点击算不算关掉"，调用 store 或 engine。

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
