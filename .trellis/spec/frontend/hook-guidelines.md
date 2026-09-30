# Composable Guidelines

> 组合式函数（composables）负责生命周期与浏览器 API，组件不碰这些。

---

## Overview

本项目没有数据请求，所以没有 React Query / SWR 那类东西。
`src/composables/` 里只有三个函数，都是"把浏览器能力接到 Pinia 状态上"，**全部建立在 VueUse 之上**：

| 文件 | 职责 | 用到的 VueUse |
|------|------|--------------|
| `useStormLoop.ts` | 驱动风暴主循环，离开 `storm` 阶段就暂停 | `useRafFn` |
| `useReducedMotion.ts` | 把 `prefers-reduced-motion` 同步进 store | `usePreferredReducedMotion` |
| `useShellScale.ts` | 算桌面样机的缩放系数 | `useElementSize` + `useMediaQuery` |

`App.vue` 里的 `Esc` 监听用 `useEventListener`，不手写 `addEventListener`。

---

## 约定：先查 VueUse，再考虑手写

> **要接浏览器 API 时，第一步是查 `@vueuse/core` 有没有现成的。**

这不是风格偏好，是防漏。手写 `matchMedia` / `ResizeObserver` / rAF 都必须自己配一套
清理逻辑，漏一次就在热更新后累积一份监听器或 observer，而且这种泄漏在开发时几乎看不出来。
VueUse 的实现内部用 `tryOnScopeDispose`，跟着 effect scope 走，不需要我们在
`onBeforeUnmount` 里手工拆。

已经装上 `@vueuse/core`（v15）。**不要**为了一个新需求再引入别的工具库 ——
先确认 VueUse 里没有。

---

## 命名约定

- 文件名与函数名都是 `useXxx`，`src/composables/useXxx.ts`。
- 在组件 `setup` 顶层调用，**不要**放进条件分支或异步回调里
  —— 那样内部的 `onMounted` / scope 注册时机就不确定了。

---

## 单帧时间必须夹紧（换库也不能删）

`useRafFn` 已经帮我们管好了帧 id、时间基准和取消。但它**盖不住一种情况**：

页面被切到后台时 rAF 停摆，而循环此刻**仍然是 active 的** —— 这不经过 `pause()`，
所以 `useRafFn` 内部那个"`resume()` 时把时间基准重置为 0"的机制不生效。
回到前台的第一帧 `delta` 就是整段隐藏时长，不夹紧的话风暴会一步跳到终局，
观感与 HUD 计数全部失真。

```ts
const MAX_FRAME_MS = 100

useRafFn(({ delta }) => {
  storm.advance(Math.min(MAX_FRAME_MS, Math.max(0, delta)))
  if (storm.phase !== 'storm') pause()
})
```

> **Warning**：删掉这个夹紧之前，先想清楚"标签页在后台待了十分钟"会怎样。
> `src/components/__tests__/app.smoke.spec.ts` 里有一条测试断言每一帧的 delta 都落在
> `[0, 100]`，就是为了防止有人重构时顺手把它拿掉。

---

## 状态机型的循环：用 watch 重新点火

`useStormLoop` 在离开 `storm` 阶段时 `pause()`。但"重新体验"会把阶段拉回 `storm`，
此时必须 `resume()`：

```ts
watch(
  () => storm.phase,
  (phase) => {
    if (phase === 'storm') resume()
  },
)
```

`resume()` 自己是幂等的（内部 `if (!isActive.value)`），所以重复调用无害。

注意 `onMounted` 里的**顺序**：先 `resume()` 点着循环，再 `storm.start()` 改阶段。
反过来的话 watch 会先跑一轮，造成一帧被安排两次。

---

## Common Mistakes

### 为了接一个浏览器 API 就手写一套生命周期

**Symptom**：热更新后动画越叠越多、observer 泄漏、控制台报
"ResizeObserver loop limit exceeded"，或者监听器随每次 HMR 增加一份。

**Cause**：直接 `onMounted` 里 new 一个 observer / 挂一个监听器，却没有对应的
`onBeforeUnmount`。漏写的原因通常是"等会儿补"。

**Fix**：先查 VueUse（见上面的约定）。确实需要手写时，**写 `onMounted` 的那一行就把
`onBeforeUnmount` 写上**，不要留到后面。

### 测试里忘了补浏览器 API 桩

**Symptom**：`mount(App)` 抛 `ResizeObserver is not defined` 或 `matchMedia is not a function`。

**Cause**：jsdom 没有实现这两个 API，而 VueUse 的 `useElementSize` / `useMediaQuery` /
`usePreferredReducedMotion` 都要用它们。

**Fix**：见 `src/components/__tests__/app.smoke.spec.ts` 顶部的 `ResizeObserverStub`
与 `matchMediaMock`，照抄即可。

### 以为 `useRafFn` 会替我们处理后台标签页

**Symptom**：从后台切回来，风暴直接跳到崩塌，HUD 上的秒数凭空多出一大截。

**Cause**：见上面「单帧时间必须夹紧」。`useRafFn` 只在 `pause → resume` 路径上重置时间基准。

**Fix**：保留 `MAX_FRAME_MS` 夹紧。
