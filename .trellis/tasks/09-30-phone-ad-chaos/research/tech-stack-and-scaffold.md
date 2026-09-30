# 技术选型核实记录

调查时间：本任务规划阶段。所有版本号来自 `npm view` 实时查询，非记忆值。

## 本地环境（已实测）

| 项 | 结果 | 命令 |
|---|---|---|
| Node.js | `v24.19.0` | `node -v` |
| npm | `11.17.0` | `npm -v` |
| pnpm | **不可用**（`术语 'pnpm' 不会被识别`） | `pnpm -v` |
| Python | `3.14.6`（Trellis 脚本用） | `python --version` |

结论：**包管理器使用 npm**，不要写 `pnpm` 命令。

## npm registry 实时版本

| 包 | 版本 |
|---|---|
| `vue` | 3.5.43 |
| `vite` | 8.3.1 |
| `typescript` | 7.0.2 |
| `pinia` | 4.0.3 |
| `gsap` | 3.15.0 |
| `@vitejs/plugin-vue` | 6.0.9 |
| `vue-tsc` | 3.3.11 |
| `@vueuse/motion` | 3.0.3 |
| `animate.css` | 4.1.1 |
| `@gsap/vue` | **NOT FOUND** |

### 关键结论：不要依赖 `@gsap/vue`

`@gsap/vue` 在 npm registry 中**不存在**。因此 GSAP 与 Vue 3 的集成必须使用核心包
`gsap` 自带的 `gsap.context()` 模式：

```ts
import { onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'

let ctx: gsap.Context
onMounted(() => {
  ctx = gsap.context(() => {
    // 作用域内的选择器只匹配本组件子树；便于封装与清理
    gsap.timeline().from('.ad-popup', { scale: 0.6, opacity: 0, stagger: 0.08 })
  }, rootEl.value)
})
onBeforeUnmount(() => ctx.revert()) // 一次性回滚全部动画与内联样式
```

`gsap.context()` + `ctx.revert()` 是版本稳定的官方清理模式，无需额外依赖。

### 许可证

GSAP 自 3.13 起**完全免费，含商业用途**（含此前收费的插件）。
参考：[GSAP 3.13 发布说明](https://gsap.com/blog/3-13/)、
[CSS-Tricks: GSAP is Now Completely Free](https://css-tricks.com/gsap-is-now-completely-free-even-for-commercial-use/)。
本项目仅用核心 `gsap`（时间轴 / `from` / `to` / `stagger`），不涉及插件。

## 脚手架：create-vue 3.24.0

`npm create vue@latest -- --help` 实测输出确认支持以下 flag：

| Flag | 用途 |
|---|---|
| `--ts`, `--typescript` | TypeScript 支持 |
| `--pinia` | 引入 Pinia |
| `--eslint` | ESLint（会自动带上 Oxlint） |
| `--prettier` | Prettier 格式化 |
| `--vitest` | 单元测试 |
| `--bare` | 只生成骨架，不含示例组件（HelloWorld 等） |
| `--force` | 目录非空时仍然创建 |
| `--router` / `--jsx` / `--cypress` / `--playwright` / `--oxfmt` / `--tsgo` | 其他可选特性 |

- **不加 `--router`** → 不生成 vue-router。本任务不需要路由（手机内部视图切换由 Pinia 状态驱动）。
- `--tsgo` 是实验性的 `typescript-native-bridge`，**不使用**，走 create-vue 默认的稳定 TS 组合。

### 落盘策略：先落地到临时目录再拷入仓库根

**不使用 `--force` 直接在当前目录生成。** 仓库根目录已存在 `.trellis/`、`.agents/`、
`.codex/`、`.dsh/`、`AGENTS.md`、`.gitattributes`；`--force` 在非空目录中的覆盖行为
未经实测，存在误删/误覆盖 Trellis 脚手架的风险。

采用：在仓库外的临时目录生成模板 → 只拷贝模板产物到仓库根 → 删除临时目录 → 在仓库根
执行 `npm install`。这样每一步都是可控的、可核对的。

## 未能完成的调查

`web_fetch` 在本环境不可用：多个域名（`raw.githubusercontent.com`、`github.com`、
`gsap.com`、`css-tricks.com`）均返回
`URL hostname resolves to a non-public IP address`。因此 GSAP 的 Vue 集成细节
来自检索结果标题 + 核心包自带 API 的稳定约定，未能逐字核对官方文档正文。
这不影响设计：`gsap.context()` 属于 GSAP 核心 API，且已用「不依赖 `@gsap/vue`」规避
了包不存在的风险。

## 对实现的约束

1. 全部脚本命令使用 **npm**。
2. 动画库用 **`gsap` 核心包**，集成方式为 `gsap.context()` + `ctx.revert()`，不得 `import from '@gsap/vue'`。
3. 不引入 vue-router。
4. 脚手架版本组合以 create-vue 3.24.0 生成的 `package.json` 为准；若 `typescript`
   被固定为 5.x/6.x 而非最新 7.x，**以脚手架结果为准**，不手动升级到 7.x。
