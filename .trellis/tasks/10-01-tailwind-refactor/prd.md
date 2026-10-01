# 引入 Tailwind CSS 并分阶段全面重构样式

## Goal

接入 Tailwind CSS v4 工具链，并全面重构项目中现有的全局基础样式、外壳布局、广告弹窗及内置应用组件，将分散的手写 Scoped/Global CSS 统一迁移至 Tailwind 原子化工具类，同时确保现有仿真视觉质感、GSAP 动画与 134 项单元测试 100% 保持无损。

## Confirmed Facts (From Codebase)

1. **技术栈与构建环境**：
   - Vue 3.5.42 + Vite 8.2.2 + TypeScript ~6.0.0。
   - 代码检查与格式化采用 Oxlint (177 规则) + Oxfmt。
   - 动画采用 GSAP 3.15.0，响应式工具采用 VueUse 15.0.0。
   - 测试套件采用 Vitest 4.1.11，当前 10 个测试文件（共 134 个用例）全部通过。
2. **样式现状**：
   - 核心全局样式分布在 `src/styles/`：
     - `base.css`（全局 reset、CSS 变量 `--phone-w-px: 390px`, `--phone-h-px: 844px`, 按钮无最小尺寸重置、prefers-reduced-motion）
     - `phone.css`（手机模型容器、视口尺寸、圆角边框、安全区）
     - `creative.css`（广告徽标、标题、CTA 等复用样式）
   - 组件级样式分布：
     - 4 个外壳与控制组件（`DeviceShell.vue`, `PhoneScreen.vue`, `StatusBar.vue`, `AudioControls.vue`, `EscapeHatch.vue`, `ShakeHint.vue`, `StormHud.vue`）
     - 7 个广告与陷阱组件（`AdLayer.vue`, `AdPopup.vue`, `CloseButton.vue`, `LandingOverlay.vue`, `TakeoverLayer.vue` 及 6 个创意素材组件）
     - 12 个手机仿真 App（`AlarmApp`, `AlipayApp`, `BankApp`, `CalculatorApp`, `CameraApp`, `DialerApp`, `GalleryApp`, `MessagesApp`, `MusicApp`, `SettingsApp`, `ShopApp`, `ShortVideoApp`）
     - 4 个真相长图文与图表组件（`TruthPanel.vue`, `AdviceList.vue`, `MoneyChainChart.vue`, `PenaltyCompare.vue`）
3. **约束与风险**：
   - **Preflight 兼容性**：Tailwind 默认的 reset 不能破坏手机视口滚动锁定（`overflow: hidden; overscroll-behavior: none`）与恶意弹窗小按钮命中区。
   - **拟真拟态色彩**：各 App 含有大量定制的渐变（如支付宝蓝、网易红、相机黑灰）与毛玻璃（`backdrop-filter: blur(24px)`），迁移时需保持视觉无损。

## Requirements (Draft)

1. **工具链集成**：
   - 安装最新稳定版 `tailwindcss` 与 `@tailwindcss/vite`。
   - 在 `vite.config.ts` 中配置 Tailwind 插件。
   - 在全局 CSS（`src/styles/base.css` 或新建 `main.css`）中引入 `@import "tailwindcss";`。
   - 将原 `--phone-w-px`、`--accent` 等核心变量与 Tailwind 主题打通（利用 CSS `@theme` 扩展）。
2. **重构实施范围**：
   - 分阶段、可验证地将 30+ 个组件及全局 CSS 迁移为 Tailwind 类名。
   - 移除无用的冗余 CSS 代码与类名。
3. **质量保证**：
   - 所有 Vitest 单元测试（134/134）持续通过。
   - Oxlint 检查 0 错误 0 警告，Oxfmt 格式化无冲突。
   - 页面 UI 仿真视觉质感无降级、交互逻辑（弹窗关闭变体、动画、手势）无损坏。

## Acceptance Criteria

- [x] Tailwind CSS v4 与 `@tailwindcss/vite` 成功配置并在 Vite 8 下正常工作。
- [x] 项目构建 `npm run build`、类型检查 `npm run type-check`、lint `npm run lint` 均 100% 成功。
- [x] 现存所有单元测试 `npm run test:unit:run` 全部通过（无回归，134/134）。
- [x] 视觉与交互回归测试通过（手机尺寸比例、广告弹窗点击区域、应用拟真界面无走样）。

## Open Decisions

1. **全面重构的执行节奏**：
   - 是否同意拆分为四个可独立验证的里程碑（1: 环境接入与全局基础设施 -> 2: 外壳与系统控制组件 -> 3: 广告系统与弹窗陷阱 -> 4: 12 个仿真 App 分批迁移）？
