# Composable Guidelines

> 组合式函数（composables）负责生命周期与浏览器 API，组件不碰这些。

---

## Overview

本项目没有数据请求，所以没有 React Query / SWR 那类东西。
`src/composables/` 里只有三个函数，都是"把浏览器能力接到 Pinia 状态上"：

| 文件 | 职责 |
|------|------|
| `useStormLoop.ts` | 驱动风暴主循环（rAF），挂载时启动、卸载时停 |
| `useReducedMotion.ts` | 把 `prefers-reduced-motion` 同步进 store |
| `useShellScale.ts` | 用 `ResizeObserver` 算桌面样机的缩放系数 |

---

## 命名约定

- 文件名与函数名都是 `useXxx`，`src/composables/useXxx.ts`。
- 在组件 `setup` 顶层调用，**不要**放进条件分支或异步回调里
  —— 那样 `onMounted` / `onBeforeUnmount` 的注册时机就不确定了。

---

## 必须成对清理

任何在 `onMounted` 里建立的资源，都要在 `onBeforeUnmount` 里拆掉：

```ts
// useShellScale.ts
onMounted(() => {
  observer = new ResizeObserver(measure)
  if (target.value) observer.observe(target.value)
  measure()
  window.addEventListener('resize', measure)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
  window.removeEventListener('resize', measure)
})
```

`useStormLoop` 里的 `stop()` 同时负责 `cancelAnimationFrame` 与复位时间戳：

```ts
function stop(): void {
  if (raf) cancelAnimationFrame(raf)
  raf = 0
  last = 0          // ← 不重置的话，重新启动时第一帧的 delta 会是几秒甚至几分钟
}
```

---

## 状态机型的循环：用 watch 重新点火

`useStormLoop` 在离开 `storm` 阶段时会自己停下。但"重新体验"会把阶段拉回 `storm`，
此时必须重新启动循环：

```ts
watch(
  () => storm.phase,
  (phase) => {
    if (phase === 'storm' && !raf) start()
  },
)
```

注意 `onMounted` 里的**顺序**：先 `start()` 点着循环，再 `storm.start()` 改阶段。
反过来的话，watch 会因为 `raf` 还是 0 而重复安排一帧。

---

## 单帧时间必须夹紧

标签页切到后台时 rAF 会暂停，切回来那一帧的 `delta` 可能是几十秒。
不夹紧的话风暴会一步跳到终局：

```ts
const MAX_FRAME_MS = 100
const dt = Math.min(MAX_FRAME_MS, Math.max(0, timestamp - last))
```

---

## Common Mistakes

### 在 composable 里直接操作 DOM 而不清理

**Symptom**：热更新后动画越叠越多、`ResizeObserver` 泄漏、控制台报
"ResizeObserver loop limit exceeded"。

**Cause**：`onMounted` 里建了 observer / 监听器 / rAF，却没有对应的 `onBeforeUnmount`。

**Prevention**：写 `onMounted` 的同时就把 `onBeforeUnmount` 写上，不要"等会儿补"。

### 测试里忘了补浏览器 API 桩

**Symptom**：`mount(App)` 抛 `ResizeObserver is not defined` 或 `matchMedia is not a function`。

**Cause**：jsdom 没有实现这两个 API。

**Fix**：见 `src/components/__tests__/app.smoke.spec.ts` 顶部的 `ResizeObserverStub`
与 `matchMediaMock`，照抄即可。
