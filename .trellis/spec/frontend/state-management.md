# State Management

> 状态用 Pinia；**判定逻辑不用 Pinia**，放 `engine/` 做纯函数。

---

## Overview

全项目只有一个 store：`src/stores/storm.ts`（Pinia setup store，id `'storm'`）。
没有服务端状态，没有数据请求。

---

## 状态分类：什么放哪里

| 状态 | 放哪 | 例子 |
|------|------|------|
| 影响多个组件、跨阶段存活 | Pinia store | 阶段机、计时、计数、弹窗实例列表 |
| 纯展示、只有一棵子树用 | 组件内 `ref` | `PhoneScreen.vue` 的 `openAppId` |
| 可由其他状态推导 | `computed` | `coverage`、`progress`、`elapsedSeconds` |
| 不该重渲染的记账 | 闭包变量（**非** `ref`） | `nextId`、`zCounter`、`spawnAccumulator` |

**最后一行是本项目的一个要点**：`nextId` / `zCounter` 这类只在动作内部用的计数器
如果写成 `ref`，会让整个弹窗列表在每次自增时多一轮响应式开销，而且它们的变化
不该触发渲染。用普通变量。

---

## store 的写法

统一用 setup 形式（`defineStore('id', () => {...})`），末尾显式 `return` 出全部对外接口：

```ts
export const useStormStore = defineStore('storm', () => {
  const phase = ref<StormPhase>('boot')
  // ... 状态、派生、动作
  return { phase, /* ... */ start, advance, attemptClose }
})
```

- 动作放在 `return` 之前，用普通函数声明，**不要**用箭头函数包裹整个 store。
- 派生状态一律 `computed`，不要在模板里算。

---

## 纯函数引擎：本项目最重要的结构决策

### Design Decision: 判定逻辑放 `engine/`，不放 store

**Context**：弹窗风暴的核心是"什么时候生成、点击算不算关掉、什么时候算崩塌"。
这些逻辑如果散在 store 的动作和组件的事件处理里，就只能靠肉眼看动画来验证。

**Options Considered**：
1. 全部写在 store 的动作里 —— 简单直接，但没法单独测
2. 抽成 `engine/` 的纯函数，store 只负责组合 —— 多一层间接

**Decision**：选 2。`engine/` 不 import `vue` / `pinia`，输入相同必然输出相同，
于是"必然关不完""五种关闭陷阱都成立"这些性质可以写成断言。

**Example**：

```ts
// engine/storm.ts —— 纯的，可单测
export function spawnInterval(elapsedMs: number): number { /* ... */ }
export function isCollapsed(ads: readonly AdInstance[]): boolean { /* ... */ }

// stores/storm.ts —— 只负责把纯函数串成过程
const interval = computed(() => spawnInterval(elapsedMs.value))
if (spawnAccumulator >= interval.value) { /* ... */ }
```

**Extensibility**：新增风暴规则时，先在 `engine/` 写纯函数 + 单测，再接进 store。

---

## "关不完"是结构性保证

这是需求的核心，实现方式必须保持：

```ts
const interval = computed(() => spawnInterval(elapsedMs.value))  // 单调不增
const target = computed(() => targetConcurrent(elapsedMs.value)) // 单调不减

if (spawnAccumulator >= interval.value) {
  spawnAccumulator = 0                              // 不累积欠账
  if (ads.value.length < target.value) spawnOne()   // 没到目标才补
}
```

- `target` **只随时间增长，不受用户操作影响** —— 用户关掉一个，生成器只是补回来。
- `spawnAccumulator = 0` 而不是 `-= interval`：否则切后台回来会瞬间爆发。
- 兜底：`elapsedMs >= STORM.durationMs` 时无条件进入崩塌。
  手速再快也不会让风暴无限拖延。

改这段之前先看 `src/stores/__tests__/storm.spec.ts` 里的性质断言，改完必须全绿。

---

## 确定性随机：用种子，不用 Math.random()

`engine/rng.ts` 的 `mulberry32` + 固定种子（`DEFAULT_SEED`）让第一遍体验完全可复现。

```ts
let rng: () => number = mulberry32(DEFAULT_SEED)
```

- **不要**在 store 或 engine 里直接调 `Math.random()`：那会让风暴不可复现，
  单测没法断言，验收时"我这边没出现这个问题"也无从对证。
- 「重新体验」用 `Date.now() >>> 0` 换种子，避免第二遍看到一模一样的序列。

---

## Common Mistakes

### 把阈值当状态存起来，再在动作里读旧值

**Symptom**：关闭弹窗后立刻判定崩塌，或者目标并发数慢一拍。

**Cause**：`advance()` 里先改了 `elapsedMs`，又去读一个在别处缓存的旧阈值。

**Fix**：阈值一律用 `computed` 从当前 `elapsedMs` 现算（`interval.value` / `target.value`），
不要缓存到独立 `ref` 里。

### 用 `ref` 存只在动作内部用的计数器

见上文"状态分类"表格最后一行。
