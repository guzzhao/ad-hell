# Tailwind CSS 接入与全面重构技术设计

## 1. 架构目标与技术选型

- **Tailwind CSS v4 (`@tailwindcss/vite`)**：
  - 充分利用 Vite 8 的高效编译，采用 Tailwind v4 纯 CSS 驱动的设计（无需繁琐的 `tailwind.config.js` 与 PostCSS 配置文件）。
  - 使用原生 CSS `@import "tailwindcss";` 与 `@theme` 块扩展设计系统。

## 2. 样式架构设计

### 2.1 CSS 分层结构
```
src/styles/
├── main.css          # 全局样式总入口：@import "tailwindcss"; + @theme 声明
├── base.css          # 核心 reset、页面锁滚、button 无最小点击区重置
├── phone.css         # 手机物理视口基准尺寸与外壳几何规范（与 Tailwind 变量协同）
└── creative.css      # 广告通用类规范（可渐进原子化或收敛为 @utility）
```

### 2.2 设计标记与 `@theme` 映射
在全局样式入口中，将项目原有的 CSS 变量接入 Tailwind v4 的 `@theme`：
```css
@import "tailwindcss";

@theme {
  --color-page-bg: #0b0d11;
  --color-page-bg-2: #151a24;
  --color-ink: #e8eaef;
  --color-ink-dim: #98a0b0;
  --color-ink-faint: #5d6675;
  --color-accent: #ff4d3d;

  --width-phone: var(--phone-w-px);
  --height-phone: var(--phone-h-px);

  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
  --font-mono: 'SF Mono', 'Cascadia Mono', Consolas, monospace;
}
```

### 2.3 关键风险点与防范机制
1. **Preflight 覆盖防范**：
   - Tailwind 的 preflight 会对 `button` 施加基础重置。
   - 解决：保留 `base.css` 中对关闭键陷阱的特定保护（如允许小于 44px 的恶意命中区），将其放置在 `@import "tailwindcss";` 之后生效。
2. **拟态与微交互精度**：
   - 各仿真 App 包含独特的拟态阴影（`box-shadow: 0 12px 30px -8px rgba(0, 0, 0, 0.45)`）与背景模糊（`backdrop-filter: blur(24px)`）。
   - 解决：优先映射到 Tailwind 官方原子类（如 `backdrop-blur-xl bg-white/15 shadow-2xl`），复杂多层渐变抽取到专有类或 `@utility`。
3. **动画与 GSAP 冲突防范**：
   - GSAP 直接操作元素内联样式（`transform`, `opacity`），Tailwind 工具类不与内联样式冲突，但需避免在类名中滥用同名 CSS transition 引起打架。

## 3. 分阶段重构策略

- **Phase 1: 环境与基础设施**（零业务代码破坏，跑通构建与测试）
- **Phase 2: 外壳与通用框架**（`DeviceShell`, `StatusBar`, `AudioControls`, `TruthPanel` 等）
- **Phase 3: 广告与弹窗系统**（`AdPopup`, `CloseButton`, `LandingOverlay`, 各广告创意）
- **Phase 4: 12 个手机仿真 App**（按简单到复杂的梯度分批迁移）
