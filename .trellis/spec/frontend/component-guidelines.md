# Component Guidelines

> 组件只负责渲染。判定逻辑属于 `engine/`，状态属于 `stores/`。

---

## 组件结构

统一用 `<script setup lang="ts">` + `<template>` + `<style scoped>`，顺序固定：

```vue
<script setup lang="ts">
import { computed } from 'vue'
import type { AdCreative } from '@/types/ad'

const props = defineProps<{ creative: AdCreative }>()
const emit = defineEmits<{ close: [id: number] }>()
</script>

<template>
  <!-- 单根元素 -->
</template>

<style scoped>
/* 组件私有样式 */
</style>
```

- 用 `defineProps<{...}>()` 类型式声明，**不用**运行时对象式声明。
- `defineEmits<{ close: [id: number] }>()` 用元组式签名，事件名用 kebab-case 调用（`@close`）。
- 需要改 props 时不要 mutate，向父级 emit。

---

## 样式约定

- 组件样式一律 `scoped`。
- **例外**：`AdLayer.vue` 用非 scoped 的全局样式块，因为 `<TransitionGroup>` 的过渡类名
  落在**子组件根元素**上，全局样式最稳妥。文件里有注释说明原因。
- 颜色、字体从 `src/styles/base.css` 的 CSS 变量取（`--ink`、`--ink-dim`、`--accent`、`--font-num`…），
  不要就地写死新色值。
- 广告素材的配色**不**走全局变量：`AdPopup.vue` 把素材自己的调色板通过
  `--ad-bg` / `--ad-fg` / `--ad-accent` 三个 CSS 自定义属性下传，
  版式组件（`ads/creatives/*`）直接 `var(--ad-bg)` 使用。
  新增版式时照这个约定走，不要再各自接一套 props。

---

## 动画分工（重要）

| 场景 | 用什么 |
|------|--------|
| 单个弹窗的进出场 | Vue `<TransitionGroup>` + CSS `@keyframes` |
| 风暴升级的屏幕抖动、崩塌吞没序列 | GSAP 时间轴 |

**GSAP 集成方式固定为 `gsap.context()` + `ctx.revert()`**：

```ts
import gsap from 'gsap'

let ctx: gsap.Context | null = null

onMounted(() => {
  ctx = gsap.context(() => {
    // 作用域限定在 motion 元素内
  }, motion.value ?? undefined)
})

onBeforeUnmount(() => {
  ctx?.revert()
  ctx = null
})
```

> **Warning**：不要在同一个元素上既有 CSS `transform` 又有 GSAP 动画。
> GSAP 会写内联 `transform`，直接覆盖掉 CSS 那份。
> `.device-frame` 用 CSS `transform: scale(var(--shell-scale))` 做样机缩放，
> 所以 GSAP 只能动里面那层 `.device-frame__motion`。这一层就是为此存在的。

> **Warning**：**不要 `import from '@gsap/vue'`** —— npm 上没有这个包。
> GSAP 官方只有 React 的 `@gsap/react`。Vue 用核心包的 `gsap.context()`。

---

## 布局约束

手机视口的逻辑尺寸恒为 **390 × 844**，定义在 `src/constants.ts`：

```ts
export const PHONE_W = 390
export const PHONE_H = 844
```

- 弹窗位置与尺寸一律用**相对手机视口的百分比**（`AdInstance.x/y/w/h` 都是 0~100）。
  这样"移动端全屏"和"桌面样机"两种形态共用同一份广告数据。
- **边框绝不能占用 `.phone-screen` 的内空间**：`.device-frame::before` 用 `inset: -14px`
  把边框画在外部。用 `padding` 或 `border-box` 做边框会把坐标系压小，弹窗位置全体偏移。

### 常量镜像必须手工同步

CSS 读不到 TS 常量。这三处是同一个事实的镜像，改动时必须一起改：

| 值 | TS | CSS / 其他 |
|----|----|-----------|
| 手机宽高 390 × 844 | `constants.ts` 的 `PHONE_W` / `PHONE_H` | `styles/base.css` 的 `--phone-w-px` / `--phone-h-px` |
| 桌面断点 768 | `constants.ts` 的 `DESKTOP_BREAKPOINT_PX` | `styles/phone.css` 的 `@media (max-width: 767px)` |

两处都留了指向对方的注释。

---

## 可访问性

**本项目的通用要求**：

- 页面自己的控件（逃生出口、返回、重新体验）触控区 ≥ 44px。
- `prefers-reduced-motion: reduce` 下必须去掉抖动与大幅位移（`base.css` 压 CSS 动画，
  GSAP 部分靠 `store.reducedMotion` 跳过）。
- 不实现任何高频闪烁，亮度变化频率严格低于 3 Hz。

**本项目的特殊情形**：

> **Warning**：`components/ads/CloseButton.vue` **故意**违反 44px 触控下限
> —— `tiny` 变体只有 14px，`corner` 只有 16px。这是演示主题本身的一部分
> （报道里点名"关闭键尺寸小于设计标准"）。

因此有一条硬红线：

> **任何故意骚扰用户的交互，都必须配一条可达的逃生通道。**
> 现在的实现是常驻的 `components/chrome/EscapeHatch.vue`（≥44px）+ `Esc` 键，
> 在 `App.vue` 里全局绑定。新增这类"陷阱"交互时，必须确认出口仍然可用。

同理，「虚假关闭键」只跳**页内**假落地页（`ads/LandingOverlay.vue`），
不触发任何真实外链跳转。

---

## Common Mistakes

### 在 `onMounted` 里改状态，然后立刻断言 DOM

**Symptom**：`wrapper.find('.escape__btn').exists()` 返回 `false`，但状态明明已经改了。

**Cause**：`mount()` 返回时只完成了首次渲染，`onMounted` 里改的状态要等下一个 tick 才进 DOM。

**Fix**：

```ts
const wrapper = mount(App)
await nextTick()          // ← 补这一行
expect(wrapper.find('.escape__btn').exists()).toBe(true)
```

### 只点着 rAF 循环，忘了启动状态机

**Symptom**：页面渲染正常，但一个广告都不弹。

**Cause**：`useStormLoop` 里如果只 `requestAnimationFrame(...)` 而不调用 `store.start()`，
`phase` 会永远停在 `boot`，`advance()` 每次都提前 return，循环还会自己停掉。

**Prevention**：`src/components/__tests__/app.smoke.spec.ts` 里有一条断言
"挂载后自动进入风暴，而不是停在开场"，专门守这个坑。
