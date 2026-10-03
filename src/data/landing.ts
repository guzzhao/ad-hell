import type { AdCreative } from '@/types/ad'

export type LandingIconType =
  | 'loan'
  | 'game'
  | 'health'
  | 'slim'
  | 'dating'
  | 'shop'
  | 'cleaner'
  | 'battery'
  | 'security'
  | 'insurance'
  | 'course'
  | 'video'
  | 'photo'
  | 'cloud'
  | 'reward'
  | 'finance'
  | 'music'

export interface LandingHeroCard {
  type:
    | 'loan'
    | 'game'
    | 'health'
    | 'slim'
    | 'dating'
    | 'cleaner'
    | 'insurance'
    | 'course'
    | 'shop'
    | 'photo'
    | 'cloud'
    | 'reward'
  badge?: string
  title: string
  highlight: string
  subtext: string
  note?: string
  buttonText: string
}

export interface LandingFeature {
  title: string
  desc: string
  gradient: string
}

export interface LandingTarget {
  id: string
  brand: string
  tagline: string
  category: string
  iconType: LandingIconType
  rating: string
  downloads: string
  size: string
  downloadSpeed: string
  theme: {
    iconBg: string
    badgeBg: string
    badgeFg: string
  }
  heroCard: LandingHeroCard
  features: [LandingFeature, LandingFeature, LandingFeature]
  targetAppId?: string
}

/**
 * 虚构广告落地页清单。
 * 覆盖所有广告类型，确保每种广告点击后跳转至与其品类、文案严格匹配的逻辑落地页，
 * 彻底消除“所有广告均跳转到拼一拼优选”的荒谬现象。
 */
export const LANDING_TARGETS: Record<string, LandingTarget> = {
  // ── 网贷 / 消费金融 ─────────────────────────────
  'loan-fast': {
    id: 'loan-fast',
    brand: '速银花',
    tagline: '极速审批 · 个人信用借款 · 32.4 MB',
    category: '网贷',
    iconType: 'loan',
    rating: '4.9',
    downloads: '8800 万次安装',
    size: '32.4 MB',
    downloadSpeed: '14.2 MB/s',
    theme: {
      iconBg: 'from-red-500 to-rose-700',
      badgeBg: 'bg-red-100',
      badgeFg: 'text-red-700',
    },
    heroCard: {
      type: 'loan',
      badge: '仅限本机预审',
      title: '最高可借额度（预审批）',
      highlight: '¥200,000',
      subtext: '年化利率单利 7.2% 起 · 凭身份证最快 1 分钟到账 · 随借随还',
      note: '合规持牌金融机构放款 | 贷款有风险，借款需谨慎',
      buttonText: '立即查看额度并提现 ›',
    },
    features: [
      { title: '极速放款', desc: '系统全自动极速审批', gradient: 'from-red-500 to-rose-600' },
      { title: '息费透明', desc: '日息低至万分之二', gradient: 'from-amber-500 to-orange-600' },
      { title: '大额免息', desc: '首期借款享30天免息', gradient: 'from-rose-500 to-pink-600' },
    ],
    targetAppId: 'bank',
  },

  'loan-quota': {
    id: 'loan-quota',
    brand: '钱多多',
    tagline: '大额分期 · 极速放款中心 · 28.6 MB',
    category: '网贷',
    iconType: 'loan',
    rating: '4.8',
    downloads: '6200 万次安装',
    size: '28.6 MB',
    downloadSpeed: '12.8 MB/s',
    theme: {
      iconBg: 'from-blue-600 to-indigo-700',
      badgeBg: 'bg-blue-100',
      badgeFg: 'text-blue-700',
    },
    heroCard: {
      type: 'loan',
      badge: '专属提现礼包',
      title: '您有一笔授信额度待激活',
      highlight: '¥168,000',
      subtext: '凭手机号直接领取 · 息费透明 · 提前还款无手续费',
      note: '合作持牌机构提供服务 | 请按需借款，理性消费',
      buttonText: '立即激活我的额度 ›',
    },
    features: [
      { title: '纯线上审', desc: '0 抵押 0 担保全线上', gradient: 'from-blue-500 to-indigo-600' },
      { title: '秒级到账', desc: '主流银行卡即刻到账', gradient: 'from-cyan-500 to-blue-600' },
      { title: '安全保障', desc: '银行级加密安全防护', gradient: 'from-indigo-500 to-purple-600' },
    ],
    targetAppId: 'bank',
  },

  'bank-lightning': {
    id: 'bank-lightning',
    brand: '闪电贷',
    tagline: '手机银行专属 · 大额信用贷 · 35.8 MB',
    category: '消费金融',
    iconType: 'finance',
    rating: '4.9',
    downloads: '9500 万次申请',
    size: '35.8 MB',
    downloadSpeed: '15.6 MB/s',
    theme: {
      iconBg: 'from-indigo-600 to-blue-800',
      badgeBg: 'bg-indigo-100',
      badgeFg: 'text-indigo-700',
    },
    heroCard: {
      type: 'loan',
      badge: '特惠利率专享',
      title: '手机银行闪电借款专享通道',
      highlight: '¥300,000',
      subtext: '年化单利低至 3.6% · 期限最长 36 期 · 手机点一点秒到账',
      note: '银行官方自营正品贷款 | 合理负债，切勿过度借贷',
      buttonText: '立即申请闪电到账 ›',
    },
    features: [
      { title: '银行自营', desc: '正规持牌银行直贷', gradient: 'from-blue-600 to-indigo-700' },
      { title: '超低利息', desc: '专享低息优质客户券', gradient: 'from-emerald-500 to-teal-600' },
      { title: '秒批秒放', desc: '系统直联公积金社保', gradient: 'from-indigo-500 to-violet-600' },
    ],
    targetAppId: 'bank',
  },

  'alipay-huabei': {
    id: 'alipay-huabei',
    brand: '花贝分期',
    tagline: '消费分期 · 限时12期免息 · 42.1 MB',
    category: '金融消费',
    iconType: 'finance',
    rating: '4.9',
    downloads: '1.2 亿次使用',
    size: '42.1 MB',
    downloadSpeed: '16.0 MB/s',
    theme: {
      iconBg: 'from-blue-500 to-cyan-700',
      badgeBg: 'bg-cyan-100',
      badgeFg: 'text-cyan-800',
    },
    heroCard: {
      type: 'loan',
      badge: '限时 12 期免息',
      title: '大额分期专享提额立减',
      highlight: '¥50,000',
      subtext: '全场大牌数码家电 0 首付 · 每月还款无压力',
      note: '合理安排消费，按时还款保持良好信用',
      buttonText: '立即领取 12 期免息券 ›',
    },
    features: [
      { title: '免息福利', desc: '大牌商品 12 期免息', gradient: 'from-cyan-500 to-blue-600' },
      { title: '快捷支付', desc: '扫码即享先享后付', gradient: 'from-blue-500 to-indigo-600' },
      { title: '账单分期', desc: '自由选择还款期数', gradient: 'from-teal-500 to-cyan-600' },
    ],
    targetAppId: 'alipay',
  },

  // ── 传奇 / 动作游戏 ─────────────────────────────
  'game-legend': {
    id: 'game-legend',
    brand: '龙渊传奇',
    tagline: '正版高爆 · 经典单职业攻沙 · 68.2 MB',
    category: '传奇游戏',
    iconType: 'game',
    rating: '4.9',
    downloads: '1.5 亿次安装',
    size: '68.2 MB',
    downloadSpeed: '18.4 MB/s',
    theme: {
      iconBg: 'from-purple-700 to-indigo-950',
      badgeBg: 'bg-purple-100',
      badgeFg: 'text-purple-800',
    },
    heroCard: {
      type: 'game',
      badge: '开服 3 分钟爆屠龙',
      title: '正版新服火爆开放',
      highlight: '一刀 9999 级 · 送 VIP12',
      subtext: '爆率提升 1000% · 满地光柱散人天堂 · 官方保底回收',
      note: '健康游戏忠告：抵制不良游戏，拒绝盗版游戏，注意自我保护',
      buttonText: '进入新服立即开打 ›',
    },
    features: [
      {
        title: '爆率全开',
        desc: '小怪也能爆出终极神装',
        gradient: 'from-purple-600 to-indigo-700',
      },
      { title: '装备回收', desc: '元宝秒到账保值换米', gradient: 'from-amber-500 to-yellow-600' },
      { title: '万人攻沙', desc: '兄弟齐聚再战沙巴克', gradient: 'from-rose-600 to-red-700' },
    ],
  },

  'game-retro': {
    id: 'game-retro',
    brand: '霸业复古',
    tagline: '原汁原味 · 1.76复古纯净版 · 54.1 MB',
    category: '传奇游戏',
    iconType: 'game',
    rating: '4.7',
    downloads: '9200 万次安装',
    size: '54.1 MB',
    downloadSpeed: '15.0 MB/s',
    theme: {
      iconBg: 'from-neutral-800 to-stone-950',
      badgeBg: 'bg-stone-200',
      badgeFg: 'text-stone-800',
    },
    heroCard: {
      type: 'game',
      badge: '老玩家重聚首',
      title: '怀旧复古专区今日公测',
      highlight: '上线送麻痹戒指',
      subtext: '三职业平衡对决 · 自由摆摊交易 · 散人挂机自动捡物',
      note: '合理安排时间，享受健康生活',
      buttonText: '极速启动云游戏 ›',
    },
    features: [
      { title: '复古经典', desc: '完美复刻端游老玩法', gradient: 'from-stone-700 to-neutral-800' },
      { title: '自由摆摊', desc: '面对面交易绝不锁仓', gradient: 'from-emerald-600 to-teal-700' },
      { title: '自动挂机', desc: '上班离线睡觉也能升级', gradient: 'from-orange-600 to-amber-700' },
    ],
  },

  'quick-cash': {
    id: 'quick-cash',
    brand: '天天消消乐免安装版',
    tagline: '休闲益智 · 闯关提现红包 · 18.2 MB',
    category: '快应用',
    iconType: 'game',
    rating: '4.8',
    downloads: '7300 万次安装',
    size: '18.2 MB',
    downloadSpeed: '11.5 MB/s',
    theme: {
      iconBg: 'from-amber-500 to-orange-600',
      badgeBg: 'bg-amber-100',
      badgeFg: 'text-amber-800',
    },
    heroCard: {
      type: 'game',
      badge: '闯第 1 关立得',
      title: '新手专属现金红包',
      highlight: '¥50.00 现金红包',
      subtext: '消除即领金币 · 0 门槛提现手机钱包零钱 · 免下载秒开玩',
      note: '红包提现规则以活动实际展示为准',
      buttonText: '立即消除提现 50 元 ›',
    },
    features: [
      { title: '秒开秒玩', desc: '免安装快应用即点即玩', gradient: 'from-amber-500 to-orange-600' },
      { title: '红包秒提', desc: '钱包零钱极速打款', gradient: 'from-emerald-500 to-teal-600' },
      { title: '爽快消解', desc: '上千趣味关卡无限畅玩', gradient: 'from-pink-500 to-rose-600' },
    ],
  },

  // ── 老人健康 / 医疗器械 ─────────────────────────
  'health-bp': {
    id: 'health-bp',
    brand: '康寿堂',
    tagline: '智能健康管家 · 中老年医疗服务 · 26.5 MB',
    category: '老人健康',
    iconType: 'health',
    rating: '4.9',
    downloads: '2800 万次申领',
    size: '26.5 MB',
    downloadSpeed: '12.0 MB/s',
    theme: {
      iconBg: 'from-emerald-600 to-teal-800',
      badgeBg: 'bg-emerald-100',
      badgeFg: 'text-emerald-800',
    },
    heroCard: {
      type: 'health',
      badge: '限 60 岁以上人群',
      title: '智能语音全自动血压仪',
      highlight: '0 元全国免费申领',
      subtext: '国家二类医疗器械认证 · 大字大屏智能语音播报 · 顺丰包邮送到家',
      note: '全国限量补贴 1000 台，凭身份证限领 1 台，送完即止',
      buttonText: '登记收货地址免费领 ›',
    },
    features: [
      { title: '语音播报', desc: '全程真人语音贴心报数', gradient: 'from-emerald-600 to-teal-700' },
      { title: '精准测量', desc: '双重核心加压高精传感', gradient: 'from-teal-600 to-cyan-700' },
      { title: '全国包邮', desc: '顺丰速递送货上门验货', gradient: 'from-blue-600 to-indigo-700' },
    ],
  },

  'call-health-agent': {
    id: 'call-health-agent',
    brand: '康寿堂顾问',
    tagline: '家庭医生 · 专属体检中心 · 29.8 MB',
    category: '老人健康',
    iconType: 'health',
    rating: '4.9',
    downloads: '3100 万次服务',
    size: '29.8 MB',
    downloadSpeed: '13.2 MB/s',
    theme: {
      iconBg: 'from-emerald-700 to-green-900',
      badgeBg: 'bg-green-100',
      badgeFg: 'text-green-800',
    },
    heroCard: {
      type: 'health',
      badge: '体检预约专属通道',
      title: '中老年全身深度体检免费号',
      highlight: '已为您排上 VIP 体验号',
      subtext: '涵盖心脑血管、血脂血糖、骨密度等 24 项深度检查 · 权威医师报告',
      note: '请于 24 小时内确认预约时间，逾期将自动释放号源',
      buttonText: '确认到店免费体检时间 ›',
    },
    features: [
      { title: '三甲设备', desc: '全套进口高端检测仪器', gradient: 'from-emerald-600 to-teal-700' },
      { title: '专家解读', desc: '资深主治医师一对一答疑', gradient: 'from-cyan-600 to-blue-700' },
      {
        title: '终身档案',
        desc: '家庭健康档案动态云追踪',
        gradient: 'from-indigo-600 to-purple-700',
      },
    ],
  },

  // ── 科学减肥 ───────────────────────────────────
  'slim-seven': {
    id: 'slim-seven',
    brand: '轻盈日记',
    tagline: '健康减重 · 专属定制方案 · 42.0 MB',
    category: '减肥',
    iconType: 'slim',
    rating: '4.8',
    downloads: '3200 万次安装',
    size: '42.0 MB',
    downloadSpeed: '13.6 MB/s',
    theme: {
      iconBg: 'from-pink-500 to-rose-600',
      badgeBg: 'bg-pink-100',
      badgeFg: 'text-pink-800',
    },
    heroCard: {
      type: 'slim',
      badge: '第 3 天见效',
      title: '7天专属科学瘦身体质定制方案',
      highlight: '预计首周减重 8 ~ 12 斤',
      subtext: '不吃药 · 不节食 · 不剧烈运动 · 资深营养师 1 对 1 膳食指导',
      note: '科学体质调理，根据个人代谢率定制，效果因人而异',
      buttonText: '免费生成我的瘦身食谱 ›',
    },
    features: [
      { title: '营养食谱', desc: '美味三餐照着吃轻松瘦', gradient: 'from-pink-500 to-rose-600' },
      { title: '专属教练', desc: '专业营养师 1对1 监督', gradient: 'from-rose-500 to-amber-600' },
      {
        title: '体质调理',
        desc: '养成易瘦体质彻底防反弹',
        gradient: 'from-purple-500 to-pink-600',
      },
    ],
  },

  // ── 同城交友 ───────────────────────────────────
  'dating-nearby': {
    id: 'dating-nearby',
    brand: '近邻缘',
    tagline: '同城偶遇 · 真人脱单速配 · 38.4 MB',
    category: '同城交友',
    iconType: 'dating',
    rating: '4.8',
    downloads: '4500 万次安装',
    size: '38.4 MB',
    downloadSpeed: '14.5 MB/s',
    theme: {
      iconBg: 'from-orange-500 to-rose-600',
      badgeBg: 'bg-rose-100',
      badgeFg: 'text-rose-800',
    },
    heroCard: {
      type: 'dating',
      badge: '附近 3 人想认识你',
      title: '您所在的城市有新用户向您发起心动招呼',
      highlight: '距离 < 500米 · 刚刚活跃',
      subtext: '实名认证真实资料 · 点击头像即可开启同城语音畅聊与视频互动',
      note: '倡导文明交友，平台已通过公安反诈核验机制',
      buttonText: '查看附近资料并开启私聊 ›',
    },
    features: [
      { title: '真人认证', desc: '人脸识别杜绝假照机器人', gradient: 'from-rose-500 to-red-600' },
      {
        title: '同城附近',
        desc: '精准定位同城身边的缘分',
        gradient: 'from-orange-500 to-pink-600',
      },
      { title: '即时互动', desc: '心动一键私聊秒回消息', gradient: 'from-pink-500 to-purple-600' },
    ],
  },

  // ── 系统清理 / 安全管家 ─────────────────────────
  'quick-clean': {
    id: 'quick-clean',
    brand: '极速清理管家',
    tagline: '深度优化 · 垃圾文件深度清除 · 16.8 MB',
    category: '系统工具',
    iconType: 'cleaner',
    rating: '4.9',
    downloads: '8900 万次安装',
    size: '16.8 MB',
    downloadSpeed: '17.2 MB/s',
    theme: {
      iconBg: 'from-slate-800 to-blue-900',
      badgeBg: 'bg-blue-100',
      badgeFg: 'text-blue-800',
    },
    heroCard: {
      type: 'cleaner',
      badge: '手机严重卡顿预警',
      title: '手机已深度扫描完成',
      highlight: '发现 14.8GB 缓存垃圾',
      subtext: '系统残留 8.2GB · 临时安装包 4.6GB · 广告冗余 2.0GB · 内存占用 92%',
      note: '立即释放内存可提升手机运行速度 80%，恢复新机般流畅',
      buttonText: '一键极速彻底释放垃圾 ›',
    },
    features: [
      { title: '深度清理', desc: '强力扫除隐藏顽固大文件', gradient: 'from-blue-600 to-cyan-600' },
      {
        title: '极速加速',
        desc: '一键关闭后台自启流氓进程',
        gradient: 'from-cyan-600 to-teal-600',
      },
      {
        title: '病毒查杀',
        desc: '实时拦截木马与恶意广告',
        gradient: 'from-indigo-600 to-blue-700',
      },
    ],
  },

  'fake-system': {
    id: 'fake-system',
    brand: '系统清理大师',
    tagline: '内存加速 · 告急清理中心 · 18.5 MB',
    category: '伪装系统提示',
    iconType: 'cleaner',
    rating: '4.8',
    downloads: '7600 万次加速',
    size: '18.5 MB',
    downloadSpeed: '16.4 MB/s',
    theme: {
      iconBg: 'from-amber-600 to-stone-900',
      badgeBg: 'bg-amber-100',
      badgeFg: 'text-amber-900',
    },
    heroCard: {
      type: 'cleaner',
      badge: '建议立即处理',
      title: '系统底层检测：存储空间已满',
      highlight: '积压 2.1GB 严重碎片',
      subtext: '手机响应速度下降 68% · 建议立即进行底层全盘深度整理',
      note: '建议每周清理一次，延长手机电池与硬件使用寿命',
      buttonText: '一键清理修复卡顿 ›',
    },
    features: [
      { title: '秒级瘦身', desc: '清理无效日志与缩略图', gradient: 'from-amber-500 to-orange-600' },
      {
        title: '社交专清',
        desc: '精准清理聊天视频表情包',
        gradient: 'from-emerald-500 to-teal-600',
      },
      {
        title: '防卡保固',
        desc: '优化调度让老手机焕新生',
        gradient: 'from-stone-600 to-neutral-800',
      },
    ],
  },

  'quick-battery': {
    id: 'quick-battery',
    brand: '极速电池医生',
    tagline: '过热预警 · 电池降温与健康维护 · 19.4 MB',
    category: '系统工具',
    iconType: 'battery',
    rating: '4.8',
    downloads: '5800 万次安装',
    size: '19.4 MB',
    downloadSpeed: '14.0 MB/s',
    theme: {
      iconBg: 'from-red-600 to-neutral-900',
      badgeBg: 'bg-red-100',
      badgeFg: 'text-red-800',
    },
    heroCard: {
      type: 'cleaner',
      badge: '高温危险预警',
      title: '当前电池温度触发警报',
      highlight: '温度 44.5℃ · 异常发烫',
      subtext: '后台 18 个应用异常耗电并持续唤醒 CPU · 电池寿命衰减风险极高',
      note: '立即降温保护电池硬件，预防电池鼓包与损耗',
      buttonText: '一键极速降温冻结耗电 ›',
    },
    features: [
      { title: '极速降温', desc: '休眠高发热流氓后台进程', gradient: 'from-red-500 to-rose-600' },
      {
        title: '电池修复',
        desc: '校准虚电延长续航 3 小时',
        gradient: 'from-orange-500 to-amber-600',
      },
      {
        title: '安全充电',
        desc: '智能涓流断电保护不过充',
        gradient: 'from-emerald-500 to-teal-600',
      },
    ],
  },

  // ── 电商购物 ───────────────────────────────────
  'shop-99': {
    id: 'shop-99',
    brand: '拼一拼优选',
    tagline: '品质生活 · 9.9 包邮特惠商城 · 48.6 MB',
    category: '电商购物',
    iconType: 'shop',
    rating: '4.8',
    downloads: '5600 万次安装',
    size: '48.6 MB',
    downloadSpeed: '15.8 MB/s',
    theme: {
      iconBg: 'from-orange-500 to-red-600',
      badgeBg: 'bg-orange-100',
      badgeFg: 'text-orange-800',
    },
    heroCard: {
      type: 'shop',
      badge: '今日 23:59 截止',
      title: '秋季生鲜食品限时拼购特惠',
      highlight: '9.9 元包邮到家',
      subtext: '坚果大礼包整整10大包 · 产地直采 · 顺丰直达 · 坏果包赔',
      note: '前 100 名下单用户享受免单返现活动',
      buttonText: '立即参与 9.9 元拼单抢购 ›',
    },
    features: [
      { title: '拼团特惠', desc: '万人拼团源头抄底好物', gradient: 'from-orange-500 to-red-600' },
      { title: '顺丰包邮', desc: '生鲜原产地冷链直达', gradient: 'from-emerald-500 to-teal-600' },
      { title: '售后无忧', desc: '破损包赔极速退款秒到', gradient: 'from-blue-500 to-indigo-600' },
    ],
    targetAppId: 'shop',
  },

  'shop-speed': {
    id: 'shop-speed',
    brand: '京选速达',
    tagline: '正品次日达 · 百亿补贴数码家电 · 62.3 MB',
    category: '百亿补贴',
    iconType: 'shop',
    rating: '4.9',
    downloads: '7800 万次安装',
    size: '62.3 MB',
    downloadSpeed: '18.2 MB/s',
    theme: {
      iconBg: 'from-red-600 to-rose-700',
      badgeBg: 'bg-red-100',
      badgeFg: 'text-red-800',
    },
    heroCard: {
      type: 'shop',
      badge: '官方正品补贴',
      title: '旗舰数码大促全场直降专区',
      highlight: '直降 1000 元 · 享 24 期免息',
      subtext: '官方自营旗舰正品 · 假一赔十 · 次日必达 · 赠 2 年延保服务',
      note: '百亿补贴正品险已生效，平台补贴差价保值 30 天',
      buttonText: '领券直降进入数码专区 ›',
    },
    features: [
      { title: '次日必达', desc: '自营物流晚发必赔到位', gradient: 'from-red-600 to-rose-600' },
      { title: '正品溯源', desc: '品牌官方授权假一赔十', gradient: 'from-blue-600 to-indigo-600' },
      { title: '分期免息', desc: '最高享24期免息无压力', gradient: 'from-amber-500 to-orange-600' },
    ],
    targetAppId: 'shop',
  },

  'shop-factory': {
    id: 'shop-factory',
    brand: '淘得乐工厂店',
    tagline: '源头直供 · 工厂平价直发 · 43.1 MB',
    category: '源头直供',
    iconType: 'shop',
    rating: '4.7',
    downloads: '6500 万次安装',
    size: '43.1 MB',
    downloadSpeed: '14.8 MB/s',
    theme: {
      iconBg: 'from-orange-600 to-amber-700',
      badgeBg: 'bg-orange-100',
      badgeFg: 'text-orange-900',
    },
    heroCard: {
      type: 'shop',
      badge: '无中间商差价',
      title: '源头产业带工厂直营大促',
      highlight: '全场 1 元起包邮抢',
      subtext: '日用百货 · 厨房纸巾 · 家居收纳 · 破损全包赔 · 7天无理由退换',
      note: '工厂直发大包邮，拼一件也是出厂批发底价',
      buttonText: '1 元包邮立即抢购 ›',
    },
    features: [
      { title: '工厂出厂', desc: '从产线直接寄送到你家', gradient: 'from-orange-500 to-amber-600' },
      { title: '1元包邮', desc: '全场海量日用品均1元起', gradient: 'from-red-500 to-pink-600' },
      {
        title: '坏单包赔',
        desc: '拍照秒赔不收任何手续费',
        gradient: 'from-emerald-500 to-teal-600',
      },
    ],
    targetAppId: 'shop',
  },

  'shop-bargain': {
    id: 'shop-bargain',
    brand: '聚省省拼购',
    tagline: '砍价免费拿 · 0 元包邮送到家 · 39.8 MB',
    category: '砍价拼购',
    iconType: 'shop',
    rating: '4.6',
    downloads: '4100 万次安装',
    size: '39.8 MB',
    downloadSpeed: '13.5 MB/s',
    theme: {
      iconBg: 'from-fuchsia-600 to-purple-800',
      badgeBg: 'bg-fuchsia-100',
      badgeFg: 'text-fuchsia-800',
    },
    heroCard: {
      type: 'shop',
      badge: '只差 0.01 颗金币',
      title: '智能多功能电饭煲免费提货',
      highlight: '已砍 99.9% · 0 元提货',
      subtext: '恭喜您成为今日天选砍价锦鲤！邀请最后 1 位好友助力即刻顺丰发货',
      note: '提货倒计时仅剩 01:58:24，超时将重新计算进度',
      buttonText: '立即提货包邮发货 ›',
    },
    features: [
      {
        title: '0元免费',
        desc: '海量大牌家电砍价全免费',
        gradient: 'from-fuchsia-600 to-purple-700',
      },
      {
        title: '顺丰包邮',
        desc: '成功提货立即安排现货发',
        gradient: 'from-blue-500 to-indigo-600',
      },
      { title: '好友助力', desc: '一键分享好友秒砍一刀', gradient: 'from-emerald-500 to-teal-600' },
    ],
    targetAppId: 'shop',
  },

  'shop-luxury': {
    id: 'shop-luxury',
    brand: '唯享名牌特卖',
    tagline: '专柜直发 · 大牌轻奢断码清仓 · 51.2 MB',
    category: '名牌特卖',
    iconType: 'shop',
    rating: '4.8',
    downloads: '5200 万次安装',
    size: '51.2 MB',
    downloadSpeed: '16.5 MB/s',
    theme: {
      iconBg: 'from-pink-600 to-fuchsia-800',
      badgeBg: 'bg-pink-100',
      badgeFg: 'text-pink-800',
    },
    heroCard: {
      type: 'shop',
      badge: '大牌轻奢 1 折起',
      title: '专柜断码正品特卖清仓专场',
      highlight: '大牌服饰直降 1 折',
      subtext: '专柜正品支持验货 · 假一赔三 · 赠退货运费险 · 今日专场免运费',
      note: '限时 24 小时清仓特卖，库存有限，售完即下架',
      buttonText: '进场抢购断码大牌 ›',
    },
    features: [
      { title: '正品验真', desc: '支持中检正品防伪溯源', gradient: 'from-pink-600 to-fuchsia-700' },
      { title: '专柜 1 折', desc: '专柜断码换季清仓特卖', gradient: 'from-rose-600 to-red-700' },
      {
        title: '顺丰退免',
        desc: '顺丰上门取退运费险保障',
        gradient: 'from-purple-600 to-indigo-700',
      },
    ],
    targetAppId: 'shop',
  },

  'splash-mall': {
    id: 'splash-mall',
    brand: '闪购商城',
    tagline: '限时秒杀 · 年中超级狂欢盛典 · 49.0 MB',
    category: '开屏特惠',
    iconType: 'shop',
    rating: '4.8',
    downloads: '6700 万次安装',
    size: '49.0 MB',
    downloadSpeed: '15.2 MB/s',
    theme: {
      iconBg: 'from-red-600 to-amber-600',
      badgeBg: 'bg-red-100',
      badgeFg: 'text-red-800',
    },
    heroCard: {
      type: 'shop',
      badge: '限时 3 小时秒杀',
      title: '狂欢购物节提前购专场',
      highlight: '全场满 199 减 100',
      subtext: '数码居家生鲜全品类跨店通用 · 领券叠享折上折 · 抢千元大额券',
      note: '摇一摇即可领取满减神券，今日有效',
      buttonText: '立即进入抢购满减 ›',
    },
    features: [
      { title: '跨店满减', desc: '满 199 减 100 上不封顶', gradient: 'from-red-500 to-amber-600' },
      { title: '限时半价', desc: '整点秒杀抢大牌半价', gradient: 'from-rose-500 to-pink-600' },
      { title: '极速发货', desc: '全场运费险次日送达', gradient: 'from-blue-500 to-indigo-600' },
    ],
    targetAppId: 'shop',
  },

  // ── 短视频引流 ─────────────────────────────────
  'splash-video': {
    id: 'splash-video',
    brand: '趣看短视频',
    tagline: '爆笑精彩 · 刷视频领红包 · 55.4 MB',
    category: '短视频',
    iconType: 'video',
    rating: '4.9',
    downloads: '1.8 亿次安装',
    size: '55.4 MB',
    downloadSpeed: '17.8 MB/s',
    theme: {
      iconBg: 'from-teal-600 to-cyan-800',
      badgeBg: 'bg-teal-100',
      badgeFg: 'text-teal-800',
    },
    heroCard: {
      type: 'reward',
      badge: '3.2 亿人都在看',
      title: '新人专属看视频提现特权',
      highlight: '登录立领 18 元红包',
      subtext: '刷搞笑段子、同城热点、生活妙招 · 金币天天自动换现金红包秒到',
      note: '免广告观看体验，海量高清无水印短视频随时刷',
      buttonText: '立即打开看视频领红包 ›',
    },
    features: [
      { title: '刷视频提', desc: '边看有趣视频边赚零花钱', gradient: 'from-teal-500 to-cyan-600' },
      { title: '海量高清', desc: '数亿条全网热门爆笑视频', gradient: 'from-cyan-500 to-blue-600' },
      { title: '同城热点', desc: '一秒发现身边新鲜事', gradient: 'from-indigo-500 to-purple-600' },
    ],
    targetAppId: 'video',
  },

  // ── 百万医疗保险 ───────────────────────────────
  'insurance-one': {
    id: 'insurance-one',
    brand: '安康保',
    tagline: '健康医疗 · 全民百万医疗保障金 · 29.5 MB',
    category: '保险保障',
    iconType: 'insurance',
    rating: '4.9',
    downloads: '4300 万次投保',
    size: '29.5 MB',
    downloadSpeed: '12.4 MB/s',
    theme: {
      iconBg: 'from-blue-600 to-indigo-800',
      badgeBg: 'bg-blue-100',
      badgeFg: 'text-blue-800',
    },
    heroCard: {
      type: 'insurance',
      badge: '首月仅需 1 元',
      title: '百万医疗综合健康保单',
      highlight: '最高赔付 ¥6,000,000',
      subtext: '0 免赔额 · 在线急速理赔 · 包含 120 种院外靶向特效药直付直赔',
      note: '银保监正规备案保险产品 | 理赔快捷，大病住院支持费用垫付',
      buttonText: '首月 1 元立即投保 ›',
    },
    features: [
      { title: '600万额度', desc: '大病住院医疗费全报销', gradient: 'from-blue-600 to-indigo-600' },
      { title: '0免赔特药', desc: '抗癌特药医院外直付垫付', gradient: 'from-cyan-500 to-blue-600' },
      {
        title: '线上快赔',
        desc: '拍照上传发票快至当天到',
        gradient: 'from-emerald-500 to-teal-600',
      },
    ],
  },

  // ── 在线学习名师课 ─────────────────────────────
  'course-free': {
    id: 'course-free',
    brand: '学霸营',
    tagline: '名师培优 · 精品提分直播训练营 · 37.1 MB',
    category: '学习课程',
    iconType: 'course',
    rating: '4.8',
    downloads: '2200 万次报名',
    size: '37.1 MB',
    downloadSpeed: '13.8 MB/s',
    theme: {
      iconBg: 'from-purple-600 to-indigo-800',
      badgeBg: 'bg-purple-100',
      badgeFg: 'text-purple-800',
    },
    heroCard: {
      type: 'course',
      badge: '仅剩 37 个名额',
      title: '清北特级名师 7 天提分精品课',
      highlight: '0 元免费领取特训名额',
      subtext: '赠送 3 本精编重难点纸质资料包全国顺丰包邮 · 独创解题大招模型',
      note: '今晚 19:30 准时开播，迟到将失去免费听课资格',
      buttonText: '0 元立即锁定名额 ›',
    },
    features: [
      {
        title: '名师直播',
        desc: '清北一线名师在线互动答疑',
        gradient: 'from-purple-600 to-indigo-600',
      },
      {
        title: '免费送书',
        desc: '包邮赠送实体名师精编讲义',
        gradient: 'from-pink-500 to-rose-600',
      },
      {
        title: '专属答疑',
        desc: '助教辅导老师 1对1 跟踪批改',
        gradient: 'from-blue-500 to-cyan-600',
      },
    ],
  },

  // ── 相机相片冲印 ───────────────────────────────
  'camera-print': {
    id: 'camera-print',
    brand: '相印宝',
    tagline: '照片冲印 · 高清富士相纸 0 元冲印 · 25.4 MB',
    category: '照片冲印',
    iconType: 'photo',
    rating: '4.9',
    downloads: '3800 万次冲印',
    size: '25.4 MB',
    downloadSpeed: '12.5 MB/s',
    theme: {
      iconBg: 'from-rose-500 to-amber-600',
      badgeBg: 'bg-rose-100',
      badgeFg: 'text-rose-800',
    },
    heroCard: {
      type: 'photo',
      badge: '限时 0 元免费冲印',
      title: '20 张高清相纸全国顺丰包邮送到家',
      highlight: '0 元包邮免费洗照片',
      subtext: '进口富士相纸 · 50 年不褪色 · AI 智能人像微光画质修复',
      note: '手机相册照片一键上传，今天冲印明天顺丰发货',
      buttonText: '立即上传照片免费冲印 ›',
    },
    features: [
      {
        title: '富士正品',
        desc: '色彩绚丽细腻持久耐磨防刮',
        gradient: 'from-rose-500 to-orange-500',
      },
      {
        title: '0元免运',
        desc: '全国顺丰包邮免费送货到家',
        gradient: 'from-amber-500 to-yellow-600',
      },
      {
        title: '智能美颜',
        desc: 'AI 自动修复暗光杂色与噪点',
        gradient: 'from-pink-500 to-rose-600',
      },
    ],
  },

  // ── 图库云盘扩容 ───────────────────────────────
  'gallery-cloud': {
    id: 'gallery-cloud',
    brand: '极速云盘',
    tagline: '云存储 · 照片视频原画备份 · 31.0 MB',
    category: '云存储空间',
    iconType: 'cloud',
    rating: '4.8',
    downloads: '5900 万次扩容',
    size: '31.0 MB',
    downloadSpeed: '16.0 MB/s',
    theme: {
      iconBg: 'from-blue-500 to-cyan-700',
      badgeBg: 'bg-blue-100',
      badgeFg: 'text-blue-800',
    },
    heroCard: {
      type: 'cloud',
      badge: '特惠 1 元专享',
      title: '手机云存储空间不足紧急扩容',
      highlight: '1 元立享 2TB 超大空间',
      subtext: '照片视频原图无损云端备份 · 换手机一键迁移 · 极速下载不限速',
      note: '特惠活动仅限本设备前 1000 位用户，到期可自由续费',
      buttonText: '1 元立即领取 2TB 空间 ›',
    },
    features: [
      {
        title: '2TB海量',
        desc: '可存储超 50 万张高清照片',
        gradient: 'from-blue-500 to-indigo-600',
      },
      {
        title: '原画备份',
        desc: '杜绝压缩清晰保留每一细节',
        gradient: 'from-cyan-500 to-blue-600',
      },
      { title: '极速不限', desc: '千兆光纤高速通道不限速', gradient: 'from-teal-500 to-cyan-600' },
    ],
  },

  // ── 早起打卡打赏 ───────────────────────────────
  'alarm-reward': {
    id: 'alarm-reward',
    brand: '天天早起赚',
    tagline: '健康习惯 · 早起打卡瓜分现金 · 23.6 MB',
    category: '早起打卡',
    iconType: 'reward',
    rating: '4.7',
    downloads: '2900 万次打卡',
    size: '23.6 MB',
    downloadSpeed: '11.8 MB/s',
    theme: {
      iconBg: 'from-amber-500 to-red-600',
      badgeBg: 'bg-amber-100',
      badgeFg: 'text-amber-800',
    },
    heroCard: {
      type: 'reward',
      badge: '瓜分 50,000 元奖池',
      title: '今日早起打卡奖金池已开启',
      highlight: '瓜分 ¥50,000 现金红包',
      subtext: '每天早起打卡一次 · 现金秒提钱包零钱 · 连续 7 天送额外翻倍锦鲤大奖',
      note: '早起健康习惯养成计划，已有 86 万人今日成功分得现金',
      buttonText: '立即打卡领取现金红包 ›',
    },
    features: [
      {
        title: '每天分钱',
        desc: '只要起得早天天都能领现金',
        gradient: 'from-amber-500 to-orange-600',
      },
      {
        title: '秒级提现',
        desc: '手机钱包零钱直接到账',
        gradient: 'from-emerald-500 to-teal-600',
      },
      { title: '健康早起', desc: '助你告别赖床规律作息', gradient: 'from-red-500 to-pink-600' },
    ],
  },

  // ── 电话理财财富 ───────────────────────────────
  'dialer-finance': {
    id: 'dialer-finance',
    brand: '银盛财富',
    tagline: '稳健增值 · 低门槛定期理财 · 34.2 MB',
    category: '理财投资',
    iconType: 'finance',
    rating: '4.8',
    downloads: '3600 万次投顾',
    size: '34.2 MB',
    downloadSpeed: '14.0 MB/s',
    theme: {
      iconBg: 'from-amber-600 to-stone-800',
      badgeBg: 'bg-amber-100',
      badgeFg: 'text-amber-800',
    },
    heroCard: {
      type: 'loan',
      badge: '新客专属专享',
      title: '稳健定期资产配置精选',
      highlight: '预期年化收益率 4.8%',
      subtext: '1000 元起购 · 期限灵活 30/90/180天 · 银行级风控机构提供',
      note: '理财非存款，产品有风险，投资需谨慎',
      buttonText: '立即查看稳健理财产品 ›',
    },
    features: [
      { title: '稳健增值', desc: '严选低波稳健底层资产', gradient: 'from-amber-500 to-yellow-600' },
      { title: '低门槛投', desc: '1000 元起投门槛极低', gradient: 'from-blue-600 to-indigo-700' },
      {
        title: '合规托管',
        desc: '国有大行资金独立存管',
        gradient: 'from-stone-600 to-neutral-800',
      },
    ],
    targetAppId: 'bank',
  },

  // ── 音乐 VIP ───────────────────────────────────
  'music-vip': {
    id: 'music-vip',
    brand: '极光音乐VIP',
    tagline: '无损音质 · Hi-Fi 黑胶会员 · 45.0 MB',
    category: '音乐娱乐',
    iconType: 'music',
    rating: '4.9',
    downloads: '8200 万次开通',
    size: '45.0 MB',
    downloadSpeed: '16.8 MB/s',
    theme: {
      iconBg: 'from-fuchsia-600 to-indigo-800',
      badgeBg: 'bg-fuchsia-100',
      badgeFg: 'text-fuchsia-800',
    },
    heroCard: {
      type: 'shop',
      badge: '首月仅需 1 分钱',
      title: '极光 Hi-Fi 无损黑胶畅听会员',
      highlight: '首月 0.01 元畅听千万曲库',
      subtext: '千万超清母带音质 · 专属沉浸环绕声场 · 免广告切歌无上限',
      note: '首月 0.01 元，次月起按 15 元/月自动续费，随时可在设置中取消',
      buttonText: '0.01 元立即开通 VIP ›',
    },
    features: [
      {
        title: '母带无损',
        desc: '192kHz/24bit 超高清音质',
        gradient: 'from-fuchsia-600 to-purple-700',
      },
      {
        title: '环绕音效',
        desc: '杜比全景声声临其境体验',
        gradient: 'from-indigo-600 to-blue-700',
      },
      {
        title: '免打扰听',
        desc: '纯净音乐流杜绝一切插播广告',
        gradient: 'from-pink-500 to-rose-600',
      },
    ],
    targetAppId: 'music',
  },

  // ── 桌面/悬浮金币红包 ───────────────────────────
  'home-redpacket': {
    id: 'home-redpacket',
    brand: '天天领现金',
    tagline: '天天福利 · 幸运天降现金红包 · 28.0 MB',
    category: '福利红包',
    iconType: 'reward',
    rating: '4.9',
    downloads: '1.1 亿次领取',
    size: '28.0 MB',
    downloadSpeed: '13.0 MB/s',
    theme: {
      iconBg: 'from-red-500 to-amber-600',
      badgeBg: 'bg-red-100',
      badgeFg: 'text-red-800',
    },
    heroCard: {
      type: 'reward',
      badge: '天降惊喜大奖',
      title: '恭喜摇出专属锦鲤现金大红包',
      highlight: '¥88.88 现金红包',
      subtext: '秒提现至手机钱包零钱 · 点击即领 · 每天可摇 3 次',
      note: '红包随机派发，仅限今日有效，超时将重新归入公共奖池',
      buttonText: '立即开箱领取 88.88 元 ›',
    },
    features: [
      { title: '大额现金', desc: '最高可摇出 188 元大红包', gradient: 'from-red-500 to-amber-600' },
      {
        title: '秒提到账',
        desc: '钱包零钱打款无需任何手续费',
        gradient: 'from-emerald-500 to-teal-600',
      },
      {
        title: '天天可领',
        desc: '每天登陆即送 3 次摇奖机会',
        gradient: 'from-purple-500 to-pink-600',
      },
    ],
    targetAppId: 'shop',
  },
}

/** 别名映射：根据广告创意 id 或品牌名称解析出最匹配的落地页 */
const ALIAS_MAP: Record<string, string> = {
  'loan-fast': 'loan-fast',
  'call-loan-service': 'loan-fast',
  速银花: 'loan-fast',
  速银花客服: 'loan-fast',

  'loan-quota': 'loan-quota',
  钱多多: 'loan-quota',

  'bank-lightning': 'bank-lightning',
  闪电贷: 'bank-lightning',
  'bank-draw': 'dialer-finance',

  'alipay-huabei': 'alipay-huabei',
  花呗分期: 'alipay-huabei',

  'game-legend': 'game-legend',
  龙渊传奇: 'game-legend',

  'game-retro': 'game-retro',
  霸业复古: 'game-retro',

  'quick-cash': 'quick-cash',
  天天消消乐: 'quick-cash',
  天天消消乐免安装版: 'quick-cash',

  'health-bp': 'health-bp',
  'call-health-agent': 'call-health-agent',
  康寿堂: 'health-bp',
  康寿堂顾问: 'call-health-agent',

  'slim-seven': 'slim-seven',
  轻盈日记: 'slim-seven',

  'dating-nearby': 'dating-nearby',
  近邻缘: 'dating-nearby',

  'quick-clean': 'quick-clean',
  极速清理管家: 'quick-clean',

  'fake-system': 'fake-system',
  系统提示: 'fake-system',

  'quick-battery': 'quick-battery',
  极速电池医生: 'quick-battery',

  'shop-99': 'shop-99',
  拼一拼优选: 'shop-99',
  拼一拼: 'shop-99',

  'shop-speed': 'shop-speed',
  京选速达: 'shop-speed',
  京选自营: 'shop-speed',

  'shop-factory': 'shop-factory',
  淘得乐工厂店: 'shop-factory',
  淘得乐工厂: 'shop-factory',
  淘得乐: 'shop-factory',

  'shop-bargain': 'shop-bargain',
  聚省省拼购: 'shop-bargain',
  聚省省: 'shop-bargain',

  'shop-luxury': 'shop-luxury',
  唯享名牌特卖: 'shop-luxury',
  唯享特卖会: 'shop-luxury',
  唯享: 'shop-luxury',

  'splash-mall': 'splash-mall',
  闪购商城: 'splash-mall',

  'splash-video': 'splash-video',
  趣看: 'splash-video',
  趣看短视频: 'splash-video',

  'insurance-one': 'insurance-one',
  安康保: 'insurance-one',

  'course-free': 'course-free',
  学霸营: 'course-free',

  'camera-print': 'camera-print',
  相印宝: 'camera-print',
  快印美客: 'camera-print',

  'gallery-cloud': 'gallery-cloud',
  极速云盘: 'gallery-cloud',

  'alarm-reward': 'alarm-reward',
  天天早起赚: 'alarm-reward',

  'dialer-finance': 'dialer-finance',
  银盛财富: 'dialer-finance',

  'music-vip': 'music-vip',
  极光音乐VIP: 'music-vip',
  'music-audiobook': 'course-free',

  'home-redpacket': 'home-redpacket',
  天天领现金: 'home-redpacket',
}

let fallbackCursor = 0
const FALLBACK_KEYS = [
  'loan-fast',
  'game-legend',
  'shop-speed',
  'health-bp',
  'quick-clean',
  'dating-nearby',
  'insurance-one',
  'slim-seven',
  'shop-factory',
]

/**
 * 根据传入的 target、creativeId 或 creative 对象，解析出对应的 LandingTarget。
 * 若无匹配，轮询提供不同类型落地页，绝不单一写死“拼一拼优选”。
 */
export function resolveLandingTarget(
  target?: string | AdCreative | LandingTarget | null,
): LandingTarget {
  if (!target) {
    const key = FALLBACK_KEYS[fallbackCursor % FALLBACK_KEYS.length]!
    fallbackCursor++
    return LANDING_TARGETS[key] ?? LANDING_TARGETS['loan-fast']!
  }

  if (typeof target === 'object') {
    // 已经是 LandingTarget 结构
    if ('heroCard' in target && 'features' in target) {
      return target as LandingTarget
    }
    // 是 AdCreative 结构
    if ('id' in target && typeof target.id === 'string') {
      const mappedKey = ALIAS_MAP[target.id] ?? ALIAS_MAP[target.brand]
      if (mappedKey && LANDING_TARGETS[mappedKey]) {
        return LANDING_TARGETS[mappedKey]!
      }
      // 根据品类动态生成
      return generateDynamicLanding(target as AdCreative)
    }
  }

  if (typeof target === 'string') {
    const key = ALIAS_MAP[target] ?? target
    if (LANDING_TARGETS[key]) {
      return LANDING_TARGETS[key]!
    }
    // 字符串匹配关键词
    for (const [k, v] of Object.entries(ALIAS_MAP)) {
      if (target.includes(k) && LANDING_TARGETS[v]) {
        return LANDING_TARGETS[v]!
      }
    }
  }

  // 兜底逻辑
  const key = FALLBACK_KEYS[fallbackCursor % FALLBACK_KEYS.length]!
  fallbackCursor++
  return LANDING_TARGETS[key] ?? LANDING_TARGETS['loan-fast']!
}

/** 针对未收录的自定义创意，生成保真度极高且品类一致的落地页 */
function generateDynamicLanding(creative: AdCreative): LandingTarget {
  const isGame = creative.category.includes('游戏') || creative.category.includes('传奇')
  const isLoan = creative.category.includes('贷') || creative.category.includes('金融')
  const isHealth = creative.category.includes('健康') || creative.category.includes('医')
  const isClean = creative.category.includes('清理') || creative.category.includes('系统')

  const iconType: LandingIconType = isGame
    ? 'game'
    : isLoan
      ? 'loan'
      : isHealth
        ? 'health'
        : isClean
          ? 'cleaner'
          : 'shop'

  return {
    id: creative.id,
    brand: creative.brand,
    tagline: `${creative.category} · 专属特惠体验 · 38.6 MB`,
    category: creative.category,
    iconType,
    rating: '4.8',
    downloads: '5000 万次安装',
    size: '38.6 MB',
    downloadSpeed: '14.5 MB/s',
    theme: {
      iconBg: 'from-blue-600 to-indigo-700',
      badgeBg: 'bg-blue-100',
      badgeFg: 'text-blue-800',
    },
    heroCard: {
      type: iconType === 'loan' ? 'loan' : iconType === 'game' ? 'game' : 'shop',
      badge: creative.badge ?? '限时专享',
      title: creative.headline,
      highlight: creative.subline,
      subtext: '点击即可享受官方正品特惠权益 · 已通过安全扫描',
      buttonText: `${creative.cta} ›`,
    },
    features: [
      { title: '正品官方', desc: '官方自营真实保障', gradient: 'from-blue-500 to-indigo-600' },
      { title: '极速体验', desc: '即点即用无需等待', gradient: 'from-amber-500 to-orange-600' },
      { title: '安全无忧', desc: '银行级加密安全认证', gradient: 'from-emerald-500 to-teal-600' },
    ],
  }
}
