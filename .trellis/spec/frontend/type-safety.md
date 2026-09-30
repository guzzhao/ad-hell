# Type Safety

> TypeScript 严格模式，且开了 `noUncheckedIndexedAccess`。这会影响你写数组访问的方式。

---

## Overview

- `typescript ~6.0.0`，配置继承 `@vue/tsconfig/tsconfig.dom.json`（`tsconfig.app.json`）。
- 类型检查用 `vue-tsc --build`（`npm run type-check`）。**不是 `tsc`** —— `tsc` 看不懂 `.vue`。
- 没有运行时校验库（Zod / Yup 都没有）。数据是代码内联的静态常量，
  由 TypeScript 在编译期保证；需要运行时兜底的地方用显式判空，不用断言。

---

## 类型放哪

| 范围 | 位置 |
|------|------|
| 跨层共享（engine / store / 组件都用） | `src/types/ad.ts` |
| 只在单个文件内用 | 就写在那个文件里 |

`src/types/ad.ts` 是**唯一**的共享类型文件，只放类型，不放运行时逻辑。
新增跨层概念时加到这里。

---

## `noUncheckedIndexedAccess` 的影响（最容易踩）

`tsconfig.app.json` 里显式打开了这个选项：

```json
"noUncheckedIndexedAccess": true
```

于是**所有下标访问都可能是 `undefined`**：

```ts
const ad = store.ads[0]
// ad 的类型是 AdInstance | undefined，不是 AdInstance
```

### Wrong

```ts
const ad = store.ads[0]
emit('close', ad.id)          // ✗ 编译不过：对象可能为 undefined
```

### Correct

```ts
const ad = store.ads[0]
if (!ad) return                // 显式处理
emit('close', ad.id)
```

返回 `T | undefined` 的辅助函数就是这个原因：

```ts
// 池子可能为空，所以返回 undefined，由调用方决定跳过还是兜底
export function pickCreative(
  creatives: readonly AdCreative[],
  progress: number,
  rng: () => number,
): AdCreative | undefined {
  const pool = eligibleCreatives(creatives, progress)
  if (pool.length === 0) return undefined
  return pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))]
}
```

**不要用 `!` 绕过它。** 全项目零非空断言（`grep '\w+!'` 无结果），请保持。
需要兜底值时用 `??`：

```ts
const variant = findCreative(ad.creativeId)?.closeVariant ?? 'honest'
```

---

## 用可辨识联合表达结果，不要返回裸布尔

关闭尝试的结果有三种，不是"成功/失败"：

```ts
export type CloseOutcome =
  | { kind: 'closed' }
  | { kind: 'dodged' }
  | { kind: 'misclick'; extraAds: number }
```

调用方 `switch (outcome.kind)` 时，TypeScript 会自动收窄类型，
`extraAds` 只在 `misclick` 分支可见。新增结果种类时编译器会把所有分支指出来。

---

## 纯函数的输入要容忍越界值

`engine/` 的函数是全域的：调用方传什么都不能抛错、不能返回 `NaN`。

```ts
// engine/close.ts
export function misclickPenalty(roll: number): number {
  const span = MISCLICK_EXTRA_ADS_MAX - MISCLICK_EXTRA_ADS_MIN + 1
  // Number.isFinite 挡住 NaN / Infinity；夹到 [0, 1) 挡住负数和 ≥1
  const safeRoll = Number.isFinite(roll) ? Math.min(1 - Number.EPSILON, Math.max(0, roll)) : 0
  return MISCLICK_EXTRA_ADS_MIN + Math.min(span - 1, Math.floor(safeRoll * span))
}
```

这条约定是**被测试逼出来的**：最初没夹紧时 `roll = -1` 会算出
`extraAds = -1`，`NaN` 会算出 `NaN`，直接污染弹窗计数。
`engine/__tests__/close.spec.ts` 里保留了这两条回归用例。

---

## Forbidden Patterns

| 禁止 | 原因 |
|------|------|
| `as any` | 关掉类型检查，等于没写类型。全项目零使用 |
| `@ts-ignore` / `@ts-expect-error` | 同上。真有问题就修类型 |
| `!` 非空断言 | 掩盖 `noUncheckedIndexedAccess` 想提醒你的真实分支。用 `if (!x) return` 或 `??` |
| `oxlint-disable` | 全项目零使用。规则不合理就改规则，不要就地静音 |
| `console.log` | 全项目零使用。调试完必须删掉 |

这几条都有 grep 级别的自查方式：

```bash
grep -rn "as any\|@ts-ignore\|@ts-expect-error\|oxlint-disable\|console\." src/
```

---

## 组件 props 与 emits

用类型式声明，不用运行时对象：

```ts
const props = defineProps<{ ad: AdInstance }>()
const emit = defineEmits<{ close: [id: number]; tap: [] }>()
```

事件用元组式签名，`tap` 这种无参数的写成 `[]`。

需要把动态 key 塞进 `:style` 时，用 Vue 导出的 `CSSProperties`
（它对 `--custom-prop` 有索引签名）：

```ts
import type { CSSProperties } from 'vue'

const boxStyle = computed<CSSProperties>(() => ({
  left: `${props.ad.x}%`,
  '--ad-bg': current.palette.bg,
}))
```

---

## 类型导入必须带 `type`

跨文件只引类型时用 `import type`，避免把类型当成运行时导入：

```ts
import type { AdCreative, AdInstance } from '@/types/ad'
import { findCreative } from '@/data/creatives'   // 这是运行时值
```
