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
export type AdLayout = 'banner' | 'interstitial' | 'splash' | 'floating' | 'fakeCall'

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
  layout: AdLayout
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

export interface AppMeta {
  id: string
  name: string
  category: AppCategory
  /** B 类 App 的点题说明：它在这个演示里一个广告都没有。 */
  note?: string
}
