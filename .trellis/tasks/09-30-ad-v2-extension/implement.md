# 执行计划：广告演示 v2

对应需求 `prd.md`，技术设计 `design.md`。按阶段推进，**每个阶段结束都要五项检查全绿再进下一阶段**。

---

## 执行结果（已完成）

六个阶段全部落地，8 个提交，工作区干净。每个阶段都单独跑过五项检查。

| 提交 | 内容 |
|---|---|
| `fe585a7` | 规划产物 |
| `69b355a` | 阶段 A：抽出形态与呈现面注册表（行为零变化） |
| `e401a74` | 阶段 B：覆盖率排除 takeover |
| `667a0f2` | 阶段 B 补：崩塌的**数量**条件也要排除 takeover |
| `965d382` | 阶段 C：剧本节拍 + 来电接听页 + 素材质感 |
| `f0218c9` | 阶段 D：合成通话音 + 静音键 |
| `9cfd6b6` | 阶段 E：摇一摇 |
| `1e0a2cf` | 阶段 F：README 与前端规范同步 |

**测试：63 → 134 个，全部通过。** 产物 191.83 kB → 205.14 kB（gzip 74.99 → 78.77 kB），零新增依赖、零新增二进制资源。

### 执行中发现并修正的设计错误

1. **`coverageEstimate` 只改了一半。** `isCollapsed` 的**数量**条件仍在数 `ads.length`，
   而 `collapseMinAds` 存在的意义正是"不让单个全屏广告宣告崩塌"——接管广告恰好就是
   这样一个全屏广告。两个条件现在都只看弹窗。
2. **新素材落进了随机抽签池。** 带 `surface: 'takeover'` 的素材被 `spawnOne` 当成普通弹窗
   撒在屏幕上，还顶掉了真正的节拍。既有的「开场不会抽到全屏素材」单测把它抓了出来。
3. **`assertNever` 的穷尽检查对单成员联合不成立。** 设计初稿写的"穷尽 switch 漏分支报错"
   实现时发现是假阳性；改用映射类型，并用"加一个 tilt 分支"实测验证。
   同时如实记下：**触发缝不是单点注册**（详见 `design.md` §4.3.1）。
4. **两处我自己的测试是空跑的**，都在做变异验证时才发现（详见下方人工核对清单前的说明）。

### 尚未完成的验证

自动化覆盖不到的部分仍未验证，**需要人眼与人耳**：

- v1 的 AC1（两种形态的视觉）从上一个任务起就没被看过
- 新功能的听感、真机甩动、iOS 授权弹窗
- 「点击开启声音」之后，待播的音频是否真的补上（jsdom 里没有 AudioContext，
  这条路径只能实测）

五项检查（`.trellis/spec/frontend/index.md`）：

```bash
npm run lint          # oxlint . --fix
npm run format:check  # oxfmt --check src/
npm run type-check    # vue-tsc --build
npm run test:unit:run # vitest run —— 注意不是 test:unit（watch 模式会挂住）
npm run build
```

---

## 阶段 A · 扩展缝（纯重构，行为必须一个字不变）

- [ ] A1 `src/types/ad.ts`：新增 `AdSurface`、`AdTrigger`、`AdMedia`、`SynthPreset`；
      给 `AdCreative` 加 `surface` / `trigger?` / `mediaId?`，给 `AdInstance` 加 `surface`
- [ ] A2 `src/data/creatives.ts`：14 条素材全部补 `surface: 'popup'`，**不动其他任何字段**
- [ ] A3 新建 `src/components/ads/layouts.ts`（`LAYOUTS: Record<AdLayout, Component>`）与
      `src/components/ads/surfaces.ts`（`SURFACES: Record<AdSurface, Component>`）；
      `AdPopup.vue` 改为从 `layouts.ts` 引入，删掉组件内的常量表
- [ ] A4 新建 `src/components/ads/TakeoverLayer.vue`（先只渲染空容器 + 注释说明 z-index 预算），
      `src/components/shell/PhoneScreen.vue` 挂载它，`surfaces.ts` 完成注册
- [ ] A5 新建 `src/components/ads/__tests__/registry.spec.ts`：
      `LAYOUTS` 覆盖全部 `AdLayout`、`SURFACES` 覆盖全部 `AdSurface`、
      每条 creative 的 `mediaId`（若有）在 `MEDIA` 中有定义、`trigger.kind` 有实现
- [ ] A6 在 `src/stores/storm.ts` 的 `spawnOne` 里把 `creative.surface` 复制进实例

**验证**：五项检查全绿 + **既有 63 个单测全部通过**（这一步不该有任何行为变化）。
**提交**：这一步单独提交，作为后续所有改动的回退点。

---

## 阶段 B · 覆盖率修正（高风险，必须隔离提交）

- [ ] B1 `src/engine/storm.ts`：`coverageEstimate` 只统计 `surface === 'popup'` 的实例，
      并写明理由注释（满屏接管会一次击穿崩塌判定）
- [ ] B2 `src/engine/__tests__/storm.spec.ts` 新增护栏测试：
      给一个 `{ w: 100, h: 100, surface: 'takeover' }` 的实例，断言 `coverageEstimate` 为 `0`
      且 `isCollapsed` 为 `false`
- [ ] B3 跑既有崩塌判定单测，确认**判定时机没变**

**验证**：五项检查全绿。若既有崩塌单测出现任何数值变化，说明过滤写错了，回退重做。
**回退点**：阶段 A 的提交。

---

## 阶段 C · 来电广告

- [ ] C1 `src/data/beats.ts`：`StormBeat` + `BEATS` 节拍表（14 s / 32 s 两拍）
- [ ] C2 `src/engine/storm.ts`：新增 `STORM.takeoverMaxMs = 12_000`、`dueBeats()`、
      `isTakeoverExpired(instance, elapsedMs)`（均为纯函数）
- [ ] C3 `src/engine/__tests__/storm.spec.ts`：补 `dueBeats` 到点且只演一次、
      `isTakeoverExpired` 边界的测试
- [ ] C4 新建 `src/components/ads/creatives/AdCallPage.vue`：
      全屏来电接听页（复用 `AdFakeCall` 的视觉语言，但按 100×100 全屏重排）
- [ ] C5 `src/data/creatives.ts`：新增 `call-spam-a`（`closeVariant: 'corner'`）与
      `call-spam-b`（`closeVariant: 'none'`）两条 `layout: 'callPage'`、`surface: 'takeover'` 的素材
- [ ] C6 `layouts.ts` 注册 `callPage`
- [ ] C7 `src/stores/storm.ts`：`advance` 里调度节拍、生成接管实例；
      接管实例到 `takeoverMaxMs` 自动移除；`spawnedCount` 计入、`ads` 计入
- [ ] C8 `src/stores/__tests__/storm.spec.ts`：接管实例不参与崩塌判定、
      到点自动移除、`corner` / `none` 变体的关闭行为沿用既有分支

**验证**：五项检查全绿 + 人工看一眼来电广告是否**真的盖住所有弹窗**且逃生通道仍可点。

---

## 阶段 D · 音频

- [ ] D1 新建 `src/audio/synth.ts`：`SynthPreset` 与 `buildPlan(preset, t)`，
      **不 import 任何 Web Audio 类型**，只输出参数计划（振荡器频率、增益包络、滤波截止、噪声门）
- [ ] D2 `src/audio/__tests__/synth.spec.ts`：频率与包络数值、包络单调性、preset 完整性
- [ ] D3 新建 `src/audio/AudioBus.ts`：`unlock()` / `play(preset)` / `stopAll()` / `setMuted()`，
      状态机 `idle → locked → ready`；**不 import vue**；`AudioContext` 不存在时全程 no-op
- [ ] D4 `src/stores/storm.ts`：加 `muted` 状态与 `toggleMuted()`
- [ ] D5 新建 `src/composables/useCallAudio.ts`：把 store 状态桥接到 `AudioBus`；
      用 `useEventListener` 挂首次手势解锁；`tryOnScopeDispose` 清理
- [ ] D6 新建 `src/components/chrome/AudioToggle.vue`：≥44px、`aria-pressed`、z-index 1000
- [ ] D7 `App.vue` 挂载 `AudioToggle` 并启用 `useCallAudio`
- [ ] D8 组件测试：`AudioContext` 缺失（jsdom 天然如此）时不抛错；
      静音按钮 `aria-pressed` 随状态翻转

**验证**：五项检查全绿 + 人工确认真机/桌面出声、静音键立即生效、首次交互前不出声。

---

## 阶段 E · 摇一摇

- [ ] E1 新建 `src/engine/shake.ts`：`SHAKE` 常量、`pushShakeSample`、`shakeEnergy`、
      `isShakeTriggered`、`pickShakeResponder`（穷尽 `switch` + `never` 检查）
- [ ] E2 `src/engine/__tests__/shake.spec.ts`：窗口裁剪、阈值边界、冷却期内不重复触发、
      无匹配广告时返回 `null`、**一次摇动只产生一次跳转**
- [ ] E3 新建 `src/capabilities.ts`：`detectCapabilities(env)` + `readCapabilityEnv()`，
      并配 `src/capabilities.spec.ts` 覆盖四个 env 分支
- [ ] E4 新建 `src/composables/useShakeSource.ts`：按能力选择采集源
      （`devicemotion` / `pointermove` / 显式按钮），只产出归一化样本 `{ atMs, energy }`；
      iOS 的 `requestPermission()` 必须在用户手势内调用
- [ ] E5 `src/stores/storm.ts`：加 `handleShake(sample)` 与每实例冷却记账
      （非响应式 `Map`，与 `zCounter` 同级），命中后**复用既有 misclick 通路**
- [ ] E6 `src/stores/__tests__/storm.spec.ts`：屏上无 shake 素材时摇动无任何后果；
      有则触发一次页内跳转并追加 2~4 个弹窗
- [ ] E7 新建 `src/components/chrome/ShakeHint.vue`：**仅在屏上存在 shake 素材时出现**，
      ≥44px 真按钮，兼作桌面指针提示与 iOS 授权入口
- [ ] E8 `layouts.ts` 注册一条带 `trigger: { kind: 'shake', … }` 的既有弹窗素材
      （不新造版式，让摇一摇附着在已有形态上，证明这条缝与形态缝正交）

**验证**：五项检查全绿 + 人工核对（见下）。

---

## 阶段 F · 收尾

- [ ] F1 `.trellis/spec/frontend/directory-structure.md`：补 `audio/`、`capabilities.ts`、
      `components/ads/*.ts` 注册表的分层说明
- [ ] F2 `.trellis/spec/frontend/index.md`：Pre-Development Checklist 增加两条——
      "新增形态/呈现面时有没有在注册表里登记"、"碰音频/传感器前先看能力探测"
- [ ] F3 `README.md`：补 v2 的功能与新目录
- [ ] F4 五项检查 + 完整人工核对清单（下）走一遍
- [ ] F5 提交（中文提交信息用 `git commit -F <utf8 文件>`，见 v1 的教训）

---

## 人工核对清单（自动化覆盖不到的部分）

自动化只覆盖纯逻辑。以下必须用眼睛和耳朵过一遍。

> 做变异验证（临时改坏实现、确认护栏真的会失败）时踩了两次坑，都记在这里，
> 因为它们正是"自动化看起来覆盖了、其实没有"的典型：
>
> - `isCollapsed` 的护栏测试第一版用 13 个 4×4 小弹窗凑数量。但那样覆盖率根本到不了
>   阈值，`coverageEstimate` 自己的过滤会把结果救回来 —— 把实现改坏，测试照样通过。
>   换成 13 个全屏弹窗后才有牙齿。
> - 用 PowerShell 正则还原变异时，`$` 在无多行标志下不匹配行尾，还原**静默失败**，
>   而那一轮测试恰好仍然通过，于是失败被当成了成功。教训已写进
>   `.trellis/spec/frontend/index.md` 的踩坑清单。

**布局回归（v1 AC1，至今未视觉验证过）**
- [ ] 窄视口：铺满、无外框、无横向滚动
- [ ] 宽视口：居中样机、纵横比正确、不溢出；**拖拽窗口缩放时样机平滑跟随、不闪**

**新功能**
- [ ] 来电广告：全屏盖住所有弹窗；逃生通道与静音键仍可点
- [ ] 来电广告：能听到振铃 + 通话中的人声质感（判断"是否够真实"）
- [ ] 静音键：点击后**立刻**静音；再点恢复
- [ ] 首次进入页面后**不主动出声**；来电广告在未交互时显示「点击开启声音」
- [ ] 桌面：快速左右甩动手机区域可触发摇一摇跳转；提示文案正确
- [ ] 屏上没有摇一摇素材时，甩动**完全没有反应**
- [ ] 真机（若可得）：摇动一次只跳转一次；连续摇动不会叠加
- [ ] iOS（若可得）：出现授权按钮；**拒绝授权后页面照常可用、不报错**

**既有行为未退化**
- [ ] 五种关闭陷阱仍能实际遇到
- [ ] 风暴仍必然覆盖整屏并进入真相环节
- [ ] 真相环节六项内容齐全、来源可点
- [ ] 开启"减少动态效果"后屏幕抖动与大幅位移消失
