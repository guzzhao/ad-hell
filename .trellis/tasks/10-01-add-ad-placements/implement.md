# 全场景广告位扩充与原生深度融合 · 执行计划

## 实施步骤清单

### 阶段 1: 数据层与桌面全局组件
- [x] 1.1 更新 `src/data/apps.ts`：调整 `HOME_GROUP_TITLES` 和商业应用的描述 `note`，移除留白设定
- [x] 1.2 在 `src/components/phone/HomeGrid.vue` 中加入桌面常驻动态红包/金币挂件，并支持点击触发落地页
- [x] 1.3 校验 `src/stores/storm.ts` 状态，确保在探索与风暴模式下均能正常触发落地页和原生广告展示

### 阶段 2: 7 款系统工具应用场景化植入
- [x] 2.1 **相机** (`CameraApp.vue`)：拍照快门触发“照片冲印/相册扩容”浮层横幅
- [x] 2.2 **图库** (`GalleryApp.vue`)：照片流穿插伪装广告卡片、顶部增加云空间告警条
- [x] 2.3 **闹钟** (`AlarmApp.vue`)：列表底部横幅广告、关闭响铃后弹出瓜分红包弹窗
- [x] 2.4 **计算器** (`CalculatorApp.vue`)：按下等号 `=` 得出结果后展开“测算可借额度”借贷卡片
- [x] 2.5 **信息** (`MessagesApp.vue`)：列表顶部置顶高危借贷与中奖营销短信及会话交互
- [x] 2.6 **电话** (`DialerApp.vue`)：拨号盘上方常驻理财黄页、挂断通话后弹出服务推广
- [x] 2.7 **设置** (`SettingsApp.vue`)：列表首项插入红色系统清理告警

### 阶段 3: 5 款商业应用原生深度广告植入
- [x] 3.1 **短视频** (`ShortVideoApp.vue`)：视频列表中混入带“立即抢购”小黄车带货的广告视频
- [x] 3.2 **购物** (`ShopApp.vue`)：进入页面首屏弹出“新人 888 元拼团大礼包”弹窗（带微小假关闭键）
- [x] 3.3 **支付宝** (`AlipayApp.vue`)：九宫格下方植入花呗免息分期 Banner、右下角天天领现金动态挂件
- [x] 3.4 **音乐** (`MusicApp.vue`)：底部播放条上方常驻 VIP 试听浮条、歌单内插入有声书推广
- [x] 3.5 **手机银行** (`BankApp.vue`)：资产概览下方植入 30 万闪电贷大卡片与存款抽奖卡片

### 阶段 4: 质量验证与回归
- [x] 4.1 运行 `npm run type-check` 验证全量 TypeScript 类型
- [x] 4.2 运行 `npm run lint` 和 `npm run format:check` 验证代码风格
- [x] 4.3 运行 `npm run test:unit:run` 验证所有单测保持 100% 通过（135 个测试全部通过）
- [x] 4.4 检查无真实外链跳转、无二进制文件引入、品牌全虚构红线

## 验证命令

```bash
npm run type-check
npm run lint
npm run test:unit:run
```
