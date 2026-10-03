/**
 * 广告风暴的核心类型。
 *
 * 术语约定：
 * - creative（素材）：一条虚构广告的文案与样式，静态数据。
 * - instance（实例）：某个素材在屏幕上的一次具体出现，带位置与层级。
 */

/**
 * 关闭键形态。对应报道中描述的三类关闭陷阱。
 */
export type CloseVariant =
  /** 正常关闭键：点击即关闭。 */
  | 'honest'
  /** 微型浅灰小字，命中区远小于可访问性标准。 */
  | 'tiny'
  /** 置于左上/右上角不易点击处。 */
  | 'corner'
  /** 虚假关闭键：点击不是关闭，而是"跳转"。 */
  | 'deceptive'
  /** 完全没有关闭键，只能被后续弹窗覆盖。 */
  | 'none'

/** 广告素材的版式。 */
export type AdLayout =
  | 'banner'
  | 'interstitial'
  | 'splash'
  | 'floating'
  | 'fakeCall'
  | 'callPage'
  | 'quickApp'

/**
 * 广告的呈现面：它由哪一层渲染。
 *
 * 这不只是样式问题——`coverageEstimate` 要靠它把"洪水"和"剧本演出"分开：
 * 只有 `popup` 参与覆盖率统计，否则一个全屏接管实例会让崩塌时机取决于剧本而非风暴。
 */
export type AdSurface =
  /** 漂浮弹窗，按百分比坐标定位。 */
  | 'popup'
  /** 全屏接管，独占手机视口并盖住所有弹窗。 */
  | 'takeover'

// 注：`InAppAdSlot` 是**由 App 视图以 props 静态渲染**的广告位，不是 AdInstance，
// 所以不进这个联合类型——给它注册一个永不使用的 surface 组件是死代码。
// 将来若要让风暴把广告注入 App 内容流，再加 'inline' 并在 SURFACES 里注册即可，
// 漏注册会被编译器挡下。

/**
 * 摇一摇触发。这是**素材的能力位**，不是全局开关：
 * 只有屏幕上正存在带该能力的广告时，摇动才会被响应。
 */
export interface ShakeTrigger {
  kind: 'shake'
  /** 触发所需的归一化能量阈值。 */
  threshold: number
  /** 触发后的冷却时长（ms），保证一次摇动只算一次。 */
  cooldownMs: number
}

/** 广告的触发方式。加新触发类型就是往这个联合里加一个分支。 */
export type AdTrigger = ShakeTrigger

/** 程序合成音的预设名。加一种声音就是往这个联合里加一个分支。 */
export type SynthPreset = 'callSession'

/**
 * 媒体描述符。
 *
 * v2 只有程序合成一种。真实素材（图片 / 视频）将来作为**新的联合分支**加进来，
 * 届时渲染层必须补上对应分支——这是刻意的：渲染真实图片是真正的新行为，
 * 不该用一个"预留但从未执行"的分支假装已经支持。
 */
export type AdMedia = { kind: 'synth'; preset: SynthPreset }

/**
 * App 分类。
 * - `system`：现实中本不该有广告，演示里被广告攻陷。
 * - `commercial`：现实中广告泛滥，演示里反而干净。
 */
export type AppCategory = 'system' | 'commercial'

export interface Palette {
  bg: string
  fg: string
  accent: string
}

export interface AdCreative {
  id: string
  /** 真实存在的广告品类。仅描述品类，不指向任何真实企业。 */
  category: string
  /** 虚构品牌名，全部自创。 */
  brand: string
  headline: string
  subline: string
  cta: string
  /**
   * 催单角标，如「限时免息」「仅剩 37 个名额」。
   * 真实广告几乎都挂着这么一枚，是"真实感"里最廉价也最有效的一笔。
   */
  badge?: string
  layout: AdLayout
  /**
   * 呈现面。**必填**：它参与崩塌判定，不能有一个沉默的默认值——
   * 漏填必须是编译错误，而不是让某个实例悄悄进了覆盖率统计。
   */
  surface: AdSurface
  /** 带此字段的素材才会响应摇一摇。 */
  trigger?: AdTrigger
  /** 指向 `data/media.ts` 里媒体清单的键。 */
  mediaId?: string
  closeVariant: CloseVariant
  palette: Palette
  /** 相对手机视口的百分比尺寸。 */
  size: { w: number; h: number }
  /**
   * 风暴进度达到该值后此素材才可能出现（0~1）。
   * 用于把全屏素材压到风暴后段，避免开场就遮死整个屏幕。
   */
  minProgress?: number
}

export interface AdInstance {
  id: number
  creativeId: string
  /** 生成时从素材复制。引擎据此判断它是否参与覆盖率统计。 */
  surface: AdSurface
  /** 百分比坐标与尺寸，原点为手机视口左上角。 */
  x: number
  y: number
  w: number
  h: number
  z: number
  /** 出现时刻（storm 内累计毫秒），用于演出节奏。 */
  bornAt: number
}

/** 一次关闭尝试的结果。 */
export type CloseOutcome =
  /** 关掉了。 */
  | { kind: 'closed' }
  /** 点空 / 这个弹窗根本没有关闭键，什么也没发生。 */
  | { kind: 'dodged' }
  /** 点到虚假关闭键，被"跳转"，并追加若干新弹窗。 */
  | { kind: 'misclick'; extraAds: number }

export type StormPhase = 'boot' | 'storm' | 'collapsed' | 'truth'

/**
 * 风暴剧本的一条节拍：在第 `atMs` 毫秒上演 `creativeId` 这条素材。
 *
 * 用来安排那些**不能交给随机生成**的演出（例如全屏来电广告）：
 * 随机上演意味着"这一遍可能看不到"，验收就无从谈起。
 *
 * ⚠️ 表必须按 `atMs` 升序。`dueBeats()` 用"已上演条数"作游标，乱序会让后面的节拍永不上演。
 */
export interface StormBeat {
  atMs: number
  creativeId: string
}

export interface AppMeta {
  id: string
  name: string
  category: AppCategory
  /** B 类 App 的点题说明：它在这个演示里一个广告都没有。 */
  note?: string
}
