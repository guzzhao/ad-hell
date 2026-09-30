# Frontend Development Guidelines

> 本项目的实际前端约定。写代码前先读这里。

---

## Overview

单页 Vue 3 应用（`ad-all`）：一部虚拟手机，演示手机弹窗广告乱象。
技术栈 Vite + Vue 3 + TypeScript + Pinia + GSAP，**无路由、无 UI 组件库**。

本目录记录的是**这个代码库真实存在的约定**，不是理想化的最佳实践。
每条约定都指向真实文件，可以直接照着写。

> **语言说明**：本目录用中文书写，与 `src/` 内的代码注释保持一致。
> 代码标识符、类型签名、命令保持英文。

---

## Guidelines Index

| Guide | Description | Status |
|-------|-------------|--------|
| [Directory Structure](./directory-structure.md) | 分层：engine / stores / composables / components | Filled |
| [Component Guidelines](./component-guidelines.md) | 组件职责、布局约束、动画分工、可访问性红线 | Filled |
| [Composable Guidelines](./hook-guidelines.md) | 组合式函数的生命周期与清理约定 | Filled |
| [State Management](./state-management.md) | Pinia setup store、纯函数引擎、确定性随机 | Filled |
| [Quality Guidelines](./quality-guidelines.md) | 五项检查、测试约定、lint 陷阱 | Filled |
| [Type Safety](./type-safety.md) | 严格模式下的类型约定（含 noUncheckedIndexedAccess） | Filled |

---

## Pre-Development Checklist

动手写代码前逐条确认：

- [ ] 这一段逻辑属于哪一层？**纯逻辑进 `src/engine/`，不要写进组件**（见 directory-structure.md）
- [ ] 要不要碰布局常量？`src/constants.ts` 与 `src/styles/*.css` 里有一份**必须手工同步**的镜像（见 component-guidelines.md）
- [ ] 会不会同时用到 CSS `transform` 和 GSAP？**必须落在不同元素上**（见 component-guidelines.md 的"动画分工"）
- [ ] 新加的是不是数组下标访问？`noUncheckedIndexedAccess` 已开启，返回值是 `T | undefined`（见 type-safety.md）
- [ ] 新加的纯函数有单测吗？测试里有没有条件式 `expect`？（见 quality-guidelines.md）
- [ ] 有没有引入真实企业名/商标？`src/data/__tests__/creatives.spec.ts` 有黑名单测试守着
- [ ] 这个交互会不会让用户**无法退出**？任何沉浸式/骚扰式交互都必须留逃生通道

---

## Quality Check

提交前必须五项全绿：

```bash
npm run lint          # oxlint . --fix（correctness + suspicious，177 条规则）
npm run format:check  # oxfmt --check src/
npm run type-check    # vue-tsc --build
npm run test:unit:run # vitest run（注意不是 test:unit，那个是 watch 模式会挂住）
npm run build         # 类型检查 + 生产构建
```

自动化覆盖不到的部分（视觉与体感），照任务目录里 `implement.md` 的人工核对清单走一遍。
本项目不写 E2E 与视觉回归测试 —— 这是刻意的取舍：测试预算集中在易错的纯逻辑上。

---

## 本项目最容易被踩的三个坑

1. **`npm run test:unit` 是 watch 模式**，在脚本或 CI 里会永久挂住。用 `test:unit:run`。
2. **GSAP 会覆盖 CSS 的 `transform`**。同一个元素上既写 `transform: scale(var(--shell-scale))`
   又让 GSAP 动 `scale`，CSS 那份会消失。已经用 `.device-frame__motion` 这一层隔开。
3. **组件测试里 `onMounted` 改的状态不在首帧 DOM 里**，`mount()` 之后要 `await nextTick()`
   才能断言依赖该状态的元素。
