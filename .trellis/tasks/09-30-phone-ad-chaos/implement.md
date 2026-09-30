# 执行计划：手机弹窗广告乱象演示页

设计见 `design.md`，需求见 `prd.md`。本文件是 Phase 2 的逐步执行清单。

平台为 DeepSeek Harness（Trellis inline 模式）：实现与检查都在主会话内完成，
通过 `trellis-before-dev` 加载规范，不配置 `implement.jsonl` / `check.jsonl`।

---

## 步骤

### 1. 脚手架落地

> ⚠️ 本步骤记录的是**当时实际执行**的命令。此后工具链已改为只依赖 oxc
> （去掉 eslint 与 prettier，改用 oxfmt）。**重新落地时不要把 `--eslint --prettier`
> 加回来** —— 详见 `research/tech-stack-and-scaffold.md` 末尾的「变更记录」。

1. 在仓库**外**的临时目录生成模板（见 `research/tech-stack-and-scaffold.md`，不用 `--force`）：
   ```powershell
   $tmp = Join-Path $env:TEMP 'ad-all-scaffold'
   New-Item -ItemType Directory -Force -Path $tmp | Out-Null
   Push-Location $tmp
   npm create vue@latest ad-all-app -- --ts --pinia --eslint --prettier --vitest --bare
   Pop-Location
   ```
2. 将 `$tmp\ad-all-app` 下的**全部**产物（含 `.gitignore`、`.vscode` 等点文件）
   拷贝到 `D:\code\ad-all\`。已存在的 `.gitattributes` 不覆盖。
3. 删除临时目录。
4. 在仓库根 `npm install`，然后 `npm install gsap`。
5. 核对：`package.json` 存在且含 `vue` / `pinia` / `gsap` / `vite`；
   `src/main.ts` 已 `use(createPinia())`；**不含** `vue-router`。

> 风险点：拷贝步骤可能覆盖仓库根已有文件。执行前先列出模板产物清单，
> 逐个比对仓库根现有文件，只拷贝不冲突的项；`AGENTS.md`、`.trellis/`、
> `.agents/`、`.codex/`、`.dsh/` 一律不动。

### 2. 类型与数据层

6. `src/types/ad.ts`：按 `design.md` §4.1 定义 `CloseVariant`、`AdInstance`、
   `AdCreative`、`AppMeta`、`StormPhase`。
7. `src/data/creatives.ts`：12~16 条虚构广告素材，覆盖真实品类；
   **每个素材固定指派关闭变体**（不用随机数），并保证 `honest` / `tiny` /
   `corner` / `deceptive` / `none` 五种变体都至少出现两次。
   ⚠️ 合规红线：品牌名全部自创，不得出现任何真实企业名称或近似变体。
8. `src/data/apps.ts`：9 个 App 的元数据与 `category: 'system' | 'commercial'`。

### 3. 引擎（纯函数优先）

9. `src/engine/storm.ts`：`spawnInterval(t)`、`maxConcurrent(t)`、
   `samplePosition(t, existing)`、`isCollapsed(ads, t)`。全部为纯函数，不依赖 Vue。
10. `src/engine/close.ts`：`resolveClose(variant, hitDetail)` 返回 `CloseOutcome`。
11. `src/engine/__tests__/storm.spec.ts` + `close.spec.ts`：
    - 曲线单调性：`spawnInterval` 非增、`maxConcurrent` 非减
    - "追不上"性质：在任意 `t`，单位时间新增数 > 人类极限点击速度（如 6 次/秒）
    - `resolveClose` 五个分支各一例
    - {@link isCollapsed} 的边界：未达阈值 / 达阈值但未持续 2 秒 / 持续 2 秒
    - 位置采样始终落在 `0..100` 闭区间内
    先让这些测试通过，再往上搭 UI。

### 4. 状态与循环

12. `src/stores/storm.ts`：Pinia store——`phase`、`elapsedMs`、`ads`、
    `closedCount` / `spawnedCount` / `misclickCount`；actions：`start()`、
    `spawn()`、`close(id)`、`collapse()`、`enterTruth()`、`reset()`。
13. `src/composables/useStormLoop.ts`：rAF 主循环，只推进状态；
    在 `phase !== 'storm'` 或卸载时取消。
14. `src/composables/useReducedMotion.ts`：监听 `prefers-reduced-motion`，
    结果写入 store，供引擎与动画分支使用。

### 5. 外壳与手机视口

15. `src/components/shell/PhoneScreen.vue`：390×844 逻辑坐标系容器。
16. `src/components/shell/DeviceShell.vue`：媒体查询切换全屏/样机两形态。
17. `src/composables/useShellScale.ts`：`ResizeObserver` 计算 `--shell-scale`。
    移动端形态下恒为 1。
18. `src/styles/base.css` + `phone.css`：设计变量、重置、样机外框。
19. `src/components/phone/StatusBar.vue`、`HomeGrid.vue`（A/B 两分区标题）、
    `AppHost.vue`（动态视图切换）。

### 6. App 视图（轻量"玩具"界面，不做真实功能）

20. A 类 6 个：`CameraApp`、`AlarmApp`、`CalculatorApp`、`MessagesApp`、
    `DialerApp`（含紧急呼叫页）、`SettingsApp`。
    每个只需可辨识 + 能承载弹窗，不实现真实逻辑。
21. B 类 2 个：`ShortVideoApp`、`ShopApp`，保持干净并附一句点题说明。
22. 其余 App 视图：功能正确性不在范围内，视觉可辨识即可。

### 7. 弹窗层

23. `src/components/ads/CloseButton.vue`：四种关闭变体的渲染与命中区。
24. `src/components/ads/creatives/*`：按 `layout` 分派的 5 种素材版式。
25. `src/components/ads/AdPopup.vue` + `AdLayer.vue`：百分比定位、
    `z-index` 管理、`<TransitionGroup>` 进出场。
26. 误触"跳转"覆盖层：假装落地页 + "返回"按钮，返回时追加 2~4 个新弹窗。
    必须是**页内**覆盖层，不触发真实跳转。

### 8. 出口与 HUD

27. `src/components/chrome/EscapeHatch.vue`：常驻、触控区 ≥44px、`Esc` 等效。
28. `src/components/chrome/StormHud.vue`：克制的计时与计数显示。

### 9. 动画编排（GSAP）

29. 在 `DeviceShell.vue` 用 `gsap.context()` 建立作用域，卸载时 `ctx.revert()`。
30. 编排：风暴升级的屏幕抖动、崩塌吞没序列。
    ⚠️ 不得 `import from '@gsap/vue'`（该包不存在，见 research 记录）。
31. `prefers-reduced-motion` 时跳过抖动与大幅位移。

### 10. 真相环节

32. `TruthPanel.vue` + `MoneyChainChart.vue` + `PenaltyCompare.vue` + `AdviceList.vue`。
33. 内容严格取自报道：千次展示约 30 元、单次点击约 2.5 元、日活百万月入 150 万+、
    罚款 5000–3 万元、快应用滥用、上架前不触发/按机型地域时段定向、
    法规依据（广告法、互联网广告管理办法、工信部 2021 适老化规范、2026-06 工信部文件）、
    实用建议（连按侧边键 5 次、识别假关闭键、投诉举报）。
34. 页脚标注"数据引自报道"并链接原文。

---

## 验证命令

```powershell
npm run lint
npm run type-check
npm run test:unit
npm run build
```

全部必须通过。`npm run dev` 供人工核对。

---

## 人工核对清单（自动化覆盖不到的视觉与体验）

- [ ] 窄视口（<768px）：页面铺满视口，无样机外框，无横向滚动
- [ ] 宽视口（≥768px）：居中手机样机，纵横比正确、无变形、不溢出视口高度
- [ ] 主屏可见 A 类「本来就该干干净净的」与 B 类「平时广告最多的」两个分区
- [ ] A 类 App 内确实出现广告；B 类 App 内确实一个广告都没有，且有说明文字
- [ ] 弹窗数量随时间明显增多，且**手动狂点也关不完**
- [ ] 五种关闭变体都能遇到：正常关闭、微型浅灰、角落、虚假关闭键、无关闭键
- [ ] 点假关闭键出现页内"跳转"覆盖层，返回后广告变多（未发生任何真实外链跳转）
- [ ] "结束体验"始终可见可点；`Esc` 同样生效
- [ ] 崩塌后进入真相环节，四类内容齐全，来源链接可点
- [ ] 系统设置开启"减少动态效果"后，剧烈位移与抖动消失
- [ ] 全页无任何真实企业名/商标
- [ ] 无高频闪烁（亮度变化 < 3 Hz）

---

## 回滚点

| 回滚点 | 恢复方式 |
|---|---|
| 脚手架拷贝步骤（步骤 1）破坏仓库根文件 | 拷贝前逐项比对，冲突项跳过；`git status` 核对后再继续 |
| 引擎曲线调不出"追不上"的观感（步骤 3/9） | 参数集中在 `storm.ts` 顶部常量，调整后重跑单测；不改需求 |
| GSAP 集成失败（步骤 9） | 降级为纯 CSS 动画（`<TransitionGroup>` + keyframes），保留 storm 引擎不变 |
| 桌面缩放方案失效（步骤 5） | 降级为固定尺寸不做缩放，样机在窄高窗口下允许出现滚动 |

---

## 提交前检查（对应 Phase 3.4）

实现与检查全部绿灯后再进入提交环节；`.trellis/` 的脚手架改动与业务代码分开提交。
