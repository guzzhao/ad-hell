# Tailwind CSS 接入与全面重构实施规划

## 里程碑与执行清单

### 里程碑 1：Tailwind v4 基础设施接入与验证
- [x] 1.1 安装依赖：`npm i -D tailwindcss @tailwindcss/vite`
- [x] 1.2 配置 `vite.config.ts`：引入 `@tailwindcss/vite` 插件
- [x] 1.3 样式入口改造：创建/更新全局入口，注入 `@import "tailwindcss";` 与 `@theme` 定义，保留 `base.css` 的防御性规则
- [x] 1.4 验证基线：运行 `npm run build`、`npm run test:unit:run`、`npm run type-check`、`npm run lint`，确认 134 测试通过且构建成功

### 里程碑 2：外壳与系统通用组件重构
- [x] 2.1 重构桌面控制组件：`AudioControls.vue`, `EscapeHatch.vue`, `StormHud.vue`, `ShakeHint.vue`
- [x] 2.2 重构手机外壳与屏幕容器：`DeviceShell.vue`, `PhoneScreen.vue`, `StatusBar.vue`, `CleanBadge.vue`
- [x] 2.3 重构真相面板与图表：`TruthPanel.vue`, `AdviceList.vue`, `MoneyChainChart.vue`, `PenaltyCompare.vue`
- [x] 2.4 回归验证：检查手机容器比例与缩放、状态栏与控制层交互

### 里程碑 3：广告系统与弹窗陷阱重构
- [x] 3.1 重构广告骨架：`AdLayer.vue`, `TakeoverLayer.vue`, `AdPopup.vue`, `LandingOverlay.vue`
- [x] 3.2 重构陷阱关闭按键：`CloseButton.vue`（严格保证 5 类变体的点击热区与视觉差异）
- [x] 3.3 重构创意组件：`AdBanner.vue`, `AdSplash.vue`, `AdFloating.vue`, `AdFakeCall.vue`, `AdCallPage.vue`, `AdInterstitial.vue`
- [x] 3.4 回归验证：运行 `app.smoke.spec.ts` 与相关弹窗测试，确保关闭变体行为无损

### 里程碑 4：12 个内置 App 渐进重构
- [x] 4.1 桌面与基础工具类：`HomeGrid.vue`, `AppIcon.vue`, `InAppAdSlot.vue`
- [x] 4.2 基础工具 App：`CalculatorApp.vue`, `AlarmApp.vue`, `DialerApp.vue`, `MessagesApp.vue`, `SettingsApp.vue`
- [x] 4.3 复杂多媒体与业务 App：`CameraApp.vue`, `GalleryApp.vue`, `MusicApp.vue`, `ShortVideoApp.vue`, `ShopApp.vue`, `AlipayApp.vue`, `BankApp.vue`
- [x] 4.4 全量清理：删除已废弃的样式类，运行格式化与代码清理

## 质量验证命令
- 单元测试：`npm run test:unit:run`（必须全绿，134/134）
- 类型检查：`npm run type-check`
- 代码风格：`npm run lint` & `npm run format:check`
- 生产构建：`npm run build`
