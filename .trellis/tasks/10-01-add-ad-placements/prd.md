# 全场景广告位扩充与原生深度融合

## Goal

将虚拟手机的广告体验全面升级为**全场景广告无死角覆盖**：推翻原本“商业 App 留白反衬”的设定，对全部 12 款内置应用（7 款系统工具 + 5 款商业应用）以及手机桌面外壳全面植入**原生场景化深度融合广告**，极致复现真实手机被各类开屏、弹窗、信息流插播、悬浮挂件、诱导操作无死角攻陷的烦躁与荒诞感。

## Background & Confirmed Facts

1. **核心立意转变**：经需求对齐，不再保留“商业应用留白、系统工具遭攻陷”的反差设定，统一变更为“全手机每一个角落、每款应用均有深度定制广告”。
2. **呈现风格决策**：采用**原生场景化深度融合（In-App Native & Action-Triggered）**，让广告自然融入各应用的具体功能流（如拍照后、计算后、刷视频、看相册等）。
3. **技术栈与约束**：
   - Vue 3 + TypeScript + Tailwind CSS v4 + Pinia；
   - 零二进制资源限制：所有广告元素继续采用纯 CSS / SVG / Emoji / 代码生成，禁止引入外部图片/音频文件；
   - 合规红线：所有新增广告品牌、商品、标语全部自创虚构（如“速银花”、“近邻缘”、“拼一拼”、“霸业复古”等），严格遵守 [`src/data/__tests__/creatives.spec.ts`](file:///D:/code/ad-all/src/data/__tests__/creatives.spec.ts) 黑名单测试；
   - 逃生通道与安全性：右上角“结束体验”与 Esc 键始终有效；所有广告点击只打开页内虚假落地页（`landingOpen`）或触发页内惩罚，绝不产生真实外链跳转；
   - 质量门标准：`npm run type-check`、`npm run lint`、`npm run test:unit:run` 全绿。

## Requirements

### R1. 桌面与全局外壳 (Desktop & Shell)
- **R1.1 桌面分组重塑**：更新 [`src/data/apps.ts`](file:///D:/code/ad-all/src/data/apps.ts) 与 [`src/components/phone/HomeGrid.vue`](file:///D:/code/ad-all/src/components/phone/HomeGrid.vue) 中的分组描述，废弃“本来就该干干净净 vs 平时广告最多”，改为体现全面沦陷的视觉分组。
- **R1.2 桌面常驻悬浮挂件**：在桌面屏幕右侧提供一个持续轻微晃动/闪烁的“天降金币红包”可点击悬浮挂件，点击拉起全屏借贷或拼购落地页。

### R2. 7 款系统工具应用场景化广告 (System Tools Native Invasions)
- **R2.1 相机 ([`src/components/phone/apps/CameraApp.vue`](file:///D:/code/ad-all/src/components/phone/apps/CameraApp.vue))**：
  - 点击拍照快门后，界面下方即时弹出半透明浮层：“免费照片冲印 0 元包邮，限时领取”；
  - 顶部/切换栏旁边保留美颜滤镜 App 推广角标。
- **R2.2 图库 ([`src/components/phone/apps/GalleryApp.vue`](file:///D:/code/ad-all/src/components/phone/apps/GalleryApp.vue))**：
  - 照片网格流中穿插 1~2 张高仿伪装广告卡片（如“同城交友·附近3人想认识你”、“9.9定制高清相框”）；
  - 顶部常驻提示黄色条：“云存储空间已用 98%，立即 1 元特惠扩容”。
- **R2.3 闹钟 ([`src/components/phone/apps/AlarmApp.vue`](file:///D:/code/ad-all/src/components/phone/apps/AlarmApp.vue))**：
  - 闹钟列表中段/底部内嵌原生横幅广告（“康寿堂老人免费领血压仪”）；
  - 点击“停止闹钟”关闭响铃后，弹出全屏“早起打卡瓜分 500 万现金红包”诱导弹窗。
- **R2.4 计算器 ([`src/components/phone/apps/CalculatorApp.vue`](file:///D:/code/ad-all/src/components/phone/apps/CalculatorApp.vue))**：
  - 用户按下等号 `=` 得出计算结果时，自动在结果显示区下方展开“测测你的财运与最高可借 20 万额度”插屏浮层；
  - 底部常驻极速放款小条。
- **R2.5 信息 ([`src/components/phone/apps/MessagesApp.vue`](file:///D:/code/ad-all/src/components/phone/apps/MessagesApp.vue))**：
  - 会话列表首行置顶高亮 1~2 条带红点伪装营销短信（如“【银行通知】您的 20 万信用额度已到账，点击查看”）；
  - 点击进入会话详情页后，展示诱导链接与“回复 TD 退订（实为下载 APP）”陷阱。
- **R2.6 电话 ([`src/components/phone/apps/DialerApp.vue`](file:///D:/code/ad-all/src/components/phone/apps/DialerApp.vue))**：
  - 拨号面板上方常驻“低门槛 4.8% 定期理财”黄页卡片；
  - 拨打电话并挂断后，弹出“通话满意度评价”伴随保险推广接管页。
- **R2.7 设置 ([`src/components/phone/apps/SettingsApp.vue`](file:///D:/code/ad-all/src/components/phone/apps/SettingsApp.vue))**：
  - 列表首项置顶醒目红色危险提示：“系统检测到 3.8GB 缓存与高危漏洞，建议立即深度清理”；
  - 页面底部保留健康/器械类广告位。

### R3. 5 款商业应用原生广告深度植入 (Commercial Apps Native Ads)
- **R3.1 短视频 ([`src/components/phone/apps/ShortVideoApp.vue`](file:///D:/code/ad-all/src/components/phone/apps/ShortVideoApp.vue))**：
  - 移除原有的“这里一个广告都没有”空白说明；
  - 上下滑动视频列表中植入带有黄色“立即抢购”小黄车带货的商业广告视频（如神兵传奇、9.9 包邮零食），界面包含闪烁打折角标与假订单滚屏。
- **R3.2 购物 ([`src/components/phone/apps/ShopApp.vue`](file:///D:/code/ad-all/src/components/phone/apps/ShopApp.vue))**：
  - 移除空白说明；
  - 首次进入页面即弹出巨幅“新人专享 888 元拼团大礼包”弹窗，配备极其微小隐蔽的关闭按钮；
  - 首页轮播图首焦展示“限时 3 小时秒杀”，商品瀑布流穿插“赞助商热推”卡片。
- **R3.3 支付宝 ([`src/components/phone/apps/AlipayApp.vue`](file:///D:/code/ad-all/src/components/phone/apps/AlipayApp.vue))**：
  - 移除空白说明；
  - 九宫格功能区下方植入“花呗限时 12 期免息分期”大图 Banner；
  - 屏幕右下角悬浮晃动的“天天领现金·开箱有礼”红包浮动球。
- **R3.4 音乐 ([`src/components/phone/apps/MusicApp.vue`](file:///D:/code/ad-all/src/components/phone/apps/MusicApp.vue))**：
  - 移除空白说明；
  - 底部迷你播放器上方常驻浮条：“开通 VIP 畅享 Hi-Fi 无损音质，首月仅 1 分钱”；
  - 推荐歌单第一行插入“有声书/相声精选·点击试听”推广位。
- **R3.5 手机银行 ([`src/components/phone/apps/BankApp.vue`](file:///D:/code/ad-all/src/components/phone/apps/BankApp.vue))**：
  - 移除空白说明；
  - 账户总资产卡片下方植入醒目的“闪电贷·最高额度 300,000 元极速到账”大卡片；
  - 底部轮播“定期存款抽奖·送 5L 压榨花生油”。

### R4. 全局广告受控与交互联动
- 当用户点击任何原生内嵌广告（或误触假关闭键）时，统一触发 [`src/stores/storm.ts`](file:///D:/code/ad-all/src/stores/storm.ts) 打开全屏假落地页（`landingOpen`）或触发 `misclick` 惩罚；
- 确保在应用内浏览与探索时，原生深度定制广告均能正常交互和展现。

## Acceptance Criteria

| # | 对应需求 | 验收标准（可观察结果） |
|---|---|---|
| AC1 | R1 | 桌面右侧显示晃动的金币/红包挂件，点击打开假落地页；桌面分类标题不再包含“本来就该干干净净 vs 平时广告最多” |
| AC2 | R2.1 | 相机拍照快门点击后，下方出现照片冲印广告条 |
| AC3 | R2.2 | 图库瀑布流中混入交友/相框广告卡片，顶部出现云空间告警 |
| AC4 | R2.3 | 闹钟列表内嵌横幅，停止响铃时触发打卡瓜分金币弹窗 |
| AC5 | R2.4 | 计算器点击等号 `=` 运算完成后弹出借贷财运插屏 |
| AC6 | R2.5 | 短信列表顶部置顶伪装营销短信，点击进入营销详情 |
| AC7 | R2.6 | 电话拨号盘上方展示理财黄页，挂断电话后出现推广提示 |
| AC8 | R2.7 | 设置顶部显示红色高危清理卡片，底部有广告位 |
| AC9 | R3.1 | 短视频列表中能刷到带小黄车与立即抢购的带货广告视频 |
| AC10 | R3.2 | 购物 App 进入弹出 888 元新人大礼包弹窗，商品流中有赞助商推广 |
| AC11 | R3.3 | 支付宝首页显示花呗免息 Banner 与天天领现金悬浮红包 |
| AC12 | R3.4 | 音乐 App 播放条上方显示 VIP 升级条，歌单有推广卡片 |
| AC13 | R3.5 | 手机银行首页显示 30 万额度闪电贷大卡片与存款抽奖 |
| AC14 | R4 | 点击任意原生广告条或按钮能正确拉起假落地页；无真实外链跳转 |
| AC15 | 通用 | `npm run type-check`、`npm run lint`、`npm run test:unit:run` 全绿通过 |

## Out of Scope

- 真实网络请求与真实外链跳转；
- 真实音视频流媒体加载（全部由纯 CSS/SVG/Canvas/Web Audio 代码模拟）；
- 引入外部广告 SDK 或第三方商业库。
