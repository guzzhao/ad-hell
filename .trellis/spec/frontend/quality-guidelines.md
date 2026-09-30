# Quality Guidelines

> 五项检查必须全绿才算完成。测试预算花在纯逻辑上，不追求视觉自动化。

---

## Overview

命令（注意 `test:unit` 与 `test:unit:run` 的区别）：

```bash
npm run lint            # oxlint . --fix
npm run format:check    # oxfmt --check src/
npm run type-check      # vue-tsc --build
npm run test:unit:run   # vitest run（跑一遍就退出）
npm run build           # run-p type-check + vite build
```

> **Warning**：`npm run test:unit` 是 **watch 模式**，在脚本、CI 或 agent 里会永久挂住。
> 需要"跑一遍就退出"时一律用 `test:unit:run`。

### 工具链现状：只有 oxc

本项目**不依赖 eslint，也不依赖 prettier**。lint 与格式化都由 oxc 工具链承担：

| 职责 | 工具 | 配置 |
|------|------|------|
| Lint | `oxlint` | `.oxlintrc.json` |
| 格式化 | `oxfmt` | `.oxfmtrc.json` |

- `.oxlintrc.json` 启用了 6 个插件（`eslint` / `typescript` / `unicorn` / `oxc` / `vue` / `vitest`），
  类别开了 `correctness` + `suspicious`，共 177 条规则。
  **不要退回只开 `correctness`** —— `suspicious` 只多 33 条规则却抓到过真问题（`unicorn/no-array-sort`）。
- `pedantic` **不要开**：会多出 109 条规则，其中 `max-lines-per-function`、`no-conditional-in-test`
  这类风格观点会跟现有代码结构打架，噪音大于价值。
- `.oxfmtrc.json` 是从旧的 Prettier 配置迁移来的（`--migrate=prettier`），保留了
  `semi: false` / `singleQuote: true` / `printWidth: 100` 三项。
- **格式化器的行为与 Prettier 不完全一致**：oxfmt 没有 Prettier 的数组 "fill" 行为，
  装不下的数组会排成一行一项（见 `src/data/__tests__/creatives.spec.ts` 的 `REAL_BRANDS`）。
  这是已知代价，不要去跟格式化器较劲，也不要用技巧绕开它。

---

## 自动化覆盖什么，不覆盖什么

| 层次 | 方式 | 现状 |
|------|------|------|
| 纯逻辑（`engine/`） | Vitest 单测，断言**性质**而不只是例子 | 28 条 |
| 状态机（`stores/`） | Vitest 单测，直接推进 `advance()` | 18 条 |
| 渲染（`App` 级） | `@vue/test-utils` + jsdom 冒烟测试（含主循环集成） | 8 条 |
| 数据合规（`data/`） | 黑名单与结构断言 | 9 条 |
| 视觉 / 体感 | **不做自动化**，照人工核对清单走 | — |
| E2E / 视觉回归 | **不做**（刻意的取舍） | — |

人工核对清单写在任务目录的 `implement.md` 里（两形态布局、反转对照、
五类关闭陷阱、出口可用、真相环节齐全、无真实商标等）。

---

## 测试文件位置（硬约束）

必须在 `src/**/__tests__/*.spec.ts`。
`tsconfig.vitest.json` 的 `include` 就是 `["src/**/__tests__/*", "env.d.ts"]`，
放到别处不会被类型检查覆盖。

---

## 测试约定

### 断言性质，不要只断言例子

风暴的核心承诺是"关不完"。与其断言"第 7 秒应该有 3 个弹窗"，
不如断言曲线本身的性质：

```ts
it('生成间隔单调不增', () => {
  let prev = Number.POSITIVE_INFINITY
  for (let t = 0; t <= STORM.durationMs; t += 250) {
    const current = spawnInterval(t)
    expect(current).toBeLessThanOrEqual(prev)
    prev = current
  }
})

it('终局生成速度超过人类极限点击速度', () => {
  expect(spawnRatePerSec(STORM.durationMs)).toBeGreaterThan(HUMAN_CLOSE_CLICKS_PER_SEC)
})
```

这类断言在调参之后依然有效，而"第 7 秒有 3 个"会立刻变成维护负担。

### 不要写条件式 `expect`

`oxlint` 的 `vitest(no-conditional-expect)` 会拦下来，**理由是对的**：

```ts
// ✗ 分支不成立时整段断言被静默跳过，测试永远通过
if (outcome.kind === 'misclick') {
  expect(outcome.extraAds).toBeGreaterThanOrEqual(2)
}
```

正确做法是写一个会抛错的收窄辅助函数，让类型不符直接失败：

```ts
function extraAdsOf(outcome: CloseOutcome): number {
  if (outcome.kind !== 'misclick') {
    throw new Error(`预期 misclick，实际是 ${outcome.kind}`)
  }
  return outcome.extraAds
}

const extras = [0, 0.5, 0.999999].map((roll) => extraAdsOf(resolveClose('deceptive', true, roll)))
for (const extra of extras) {
  expect(extra).toBeGreaterThanOrEqual(MISCLICK_EXTRA_ADS_MIN)
}
```

### 需要确定性的用例，直接注入夹具

不要依赖"种子恰好抽到了某条素材"。`stores/__tests__/storm.spec.ts` 里用
`seedAd(store, creativeId)` 把指定素材的弹窗推进 store：

```ts
const ad = seedAd(store, DECEPTIVE)   // slim-seven，closeVariant 是 deceptive
expect(store.attemptClose(ad.id, true).kind).toBe('misclick')
```

同时有一条"夹具与预期表一致"的测试防止素材漂移。

### jsdom 缺的浏览器 API 要补桩

`ResizeObserver` 与 `matchMedia` 在 jsdom 里都不存在。
照 `src/components/__tests__/app.smoke.spec.ts` 顶部的桩抄：

```ts
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.stubGlobal('ResizeObserver', ResizeObserverStub)
  vi.stubGlobal('matchMedia', matchMediaMock)
})
```

`vi.fn()` 在需要 mock 时**必须带类型参数**（oxlint 的 `require-mock-type-parameters`）：

```ts
const matchMediaMock = vi.fn<(query: string) => MediaQueryList>(matchMediaStub)
```

### `mount()` 之后常要 `await nextTick()`

`onMounted` 里改的状态不在首帧 DOM 里。见 hook-guidelines.md 的 Common Mistakes。

---

## 新增纯函数 → 必须带单测

`engine/` 下的每个导出函数都要有对应断言。新加一条规则（新的关闭变体、
新的崩塌条件）时，同时补：

1. 正常路径
2. 边界（空数组、全屏尺寸、越界输入）
3. 与需求对应的性质（单调性、"关不完"）

---

## 数据合规断言

`src/data/__tests__/creatives.spec.ts` 里有一条真实品牌黑名单测试。
新增广告素材时它会自动覆盖到：

```ts
const hits = REAL_BRANDS.filter((brand) => haystack.includes(brand))
expect(hits).toEqual([])
```

素材尺寸、`minProgress` 取值范围、id 唯一性也都有断言。
**不要为了让素材"更真实"而放宽这些断言。**

---

## Code Review Checklist

- [ ] 五项检查（lint / format:check / type-check / test:unit:run / build）全绿？
- [ ] 新纯函数有单测？断言的是性质还是脆弱的例子？
- [ ] 测试里有没有条件式 `expect`？
- [ ] 有没有引入 `as any` / `@ts-ignore` / `!` / `oxlint-disable` / `console.*`？
- [ ] `engine/` 有没有偷偷 import `vue` 或 `pinia`？
- [ ] 布局常量（手机尺寸、断点）改动时，CSS 里的镜像同步了吗？
- [ ] 有没有在同一个元素上既写 CSS `transform` 又用 GSAP？
- [ ] 新交互会不会让用户无法退出？逃生通道还可用吗？
- [ ] 有没有引入真实企业名 / 商标？
- [ ] 有没有顺手改了本任务范围外的文件？
