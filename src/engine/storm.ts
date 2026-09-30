import type { AdCreative, AdInstance, StormBeat } from '@/types/ad'

/**
 * 广告风暴的全部可调参数。调参只改这里，不要把数字散落到组件中。
 *
 * 设计意图（见 design.md §4.2）：风暴的"关不完"不是靠随机调参碰出来的，
 * 而是由两条单调曲线保证的：
 *   1. `spawnInterval` 单调不增 → 生成越来越快；
 *   2. `targetConcurrent` 单调不减 → 屏幕上要求同时存在的弹窗越来越多。
 * 用户关掉一个，生成器只是把数量补回目标值；而目标值本身不受用户影响。
 */
export const STORM = {
  /** 预计崩塌时长（ms）。到点必然收场，属于兜底保证。 */
  durationMs: 55_000,

  /** 生成间隔：开场 → 终局（ms）。单调不增。 */
  spawnIntervalStart: 2400,
  spawnIntervalEnd: 150,

  /** 目标并发弹窗数：开场 → 终局。单调不减。 */
  concurrentStart: 2,
  concurrentEnd: 45,

  /** 崩塌判定：覆盖面积比例阈值。 */
  collapseCoverage: 0.9,
  /** 崩塌判定：最少弹窗数，避免一个全屏广告就宣告崩塌。 */
  collapseMinAds: 14,
  /** 进入 collapsed 后停留多久再切到 truth（ms），留给崩塌演出。 */
  collapseSettleMs: 2600,

  /**
   * 全屏接管广告的硬性时长上限（ms）。
   *
   * 这是**用户保护**，不是演出参数：`closeVariant: 'none'` 的来电广告没有任何关闭键，
   * 没有这一条，用户就会被一个挂不掉的电话永久困住——那这页面本身就成了它要批判的东西。
   * 到点自动"对方挂断"。
   */
  takeoverMaxMs: 12_000,

  /** 覆盖面积估算的网格分辨率。 */
  gridCols: 12,
  gridRows: 24,
} as const

/**
 * 单测假定的人类极限点击速度（次/秒）。
 * 终局生成速度必须超过它，否则手速极快的人理论上能一直清空屏幕。
 */
export const HUMAN_CLOSE_CLICKS_PER_SEC = 6

const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v)
const clamp01 = (v: number): number => clamp(v, 0, 1)
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3)
const easeInCubic = (t: number): number => t * t * t

/** 0 → 1 的风暴进度。 */
export function stormProgress(elapsedMs: number): number {
  return clamp01(elapsedMs / STORM.durationMs)
}

/** 当前生成间隔（ms）。单调不增。 */
export function spawnInterval(elapsedMs: number): number {
  const t = easeOutCubic(stormProgress(elapsedMs))
  return lerp(STORM.spawnIntervalStart, STORM.spawnIntervalEnd, t)
}

/** 当前每秒生成数。 */
export function spawnRatePerSec(elapsedMs: number): number {
  return 1000 / spawnInterval(elapsedMs)
}

/** 当前目标并发弹窗数。单调不减。 */
export function targetConcurrent(elapsedMs: number): number {
  const t = easeInCubic(stormProgress(elapsedMs))
  return Math.round(lerp(STORM.concurrentStart, STORM.concurrentEnd, t))
}

/**
 * 覆盖面积估算：把手机视口切成网格，统计被至少一个弹窗覆盖的格子比例。
 *
 * 用网格而不是"面积求和"，是因为面积求和会把重叠区域重复计算，
 * 导致几个全屏广告就报出数倍于 100% 的覆盖率。
 */
export function coverageEstimate(ads: readonly AdInstance[]): number {
  const cols = STORM.gridCols
  const rows = STORM.gridRows
  const cells: number[] = Array.from({ length: cols * rows }, () => 0)

  for (const ad of ads) {
    // 只有弹窗参与覆盖率统计。
    //
    // 接管广告是一次**剧本演出**，不是洪水的一部分：它占满整屏会贡献 100% 覆盖率，
    // 若此时屏上已有 collapseMinAds 个弹窗，崩塌就会被这一个剧本实例提前触发，
    // 崩塌时机于是取决于节拍表而不是风暴本身。
    // 理由详见 .trellis/tasks/09-30-ad-v2-extension/design.md §5.3
    if (ad.surface !== 'popup') continue

    const c0 = clamp(Math.floor((ad.x / 100) * cols), 0, cols - 1)
    const c1 = clamp(Math.ceil(((ad.x + ad.w) / 100) * cols) - 1, 0, cols - 1)
    const r0 = clamp(Math.floor((ad.y / 100) * rows), 0, rows - 1)
    const r1 = clamp(Math.ceil(((ad.y + ad.h) / 100) * rows) - 1, 0, rows - 1)
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        cells[r * cols + c] = 1
      }
    }
  }

  return cells.reduce((sum, v) => sum + v, 0) / cells.length
}

/**
 * 是否达到崩塌条件。
 *
 * 两个条件都要满足：覆盖面积够大，且弹窗数量够多。
 * 只判覆盖会被单个全屏广告直接击穿——`collapseMinAds` 就是为这件事存在的。
 *
 * 因此**两个条件都必须只看弹窗**：接管广告正是一个"单个全屏广告"，
 * 若把它算进数量，就等于把这个守卫又绕开了。
 */
export function isCollapsed(ads: readonly AdInstance[]): boolean {
  const popups = ads.filter((ad) => ad.surface === 'popup')
  if (popups.length < STORM.collapseMinAds) return false
  return coverageEstimate(popups) >= STORM.collapseCoverage
}

/**
 * 采样一个弹窗位置，保证弹窗完全落在视口内。
 * 早期偏贴边（像真实弹窗），随进度推进过渡为均匀分布。
 */
export function samplePosition(
  progress: number,
  size: { w: number; h: number },
  rng: () => number,
): { x: number; y: number } {
  const maxX = Math.max(0, 100 - size.w)
  const maxY = Math.max(0, 100 - size.h)

  // 1 → 0：开场总是贴边
  const edgeBias = 1 - clamp01(progress)

  let x: number
  let y: number

  if (rng() < edgeBias) {
    const side = Math.floor(rng() * 4) % 4
    const along = rng()
    if (side === 0) {
      x = along * maxX
      y = 0
    } else if (side === 1) {
      x = maxX
      y = along * maxY
    } else if (side === 2) {
      x = along * maxX
      y = maxY
    } else {
      x = 0
      y = along * maxY
    }
  } else {
    x = rng() * maxX
    y = rng() * maxY
  }

  return { x: clamp(x, 0, maxX), y: clamp(y, 0, maxY) }
}

/**
 * 在当前进度下**允许被随机生成**的素材。
 *
 * 只返回弹窗素材。接管广告由 `data/beats.ts` 的剧本节拍上演，绝不能混进抽签池：
 * 随机生成器会把它当成普通弹窗撒在屏幕上（位置还是采样出来的，
 * 但它本该铺满整屏），而且会顶掉真正的节拍——`spawnTakeover` 见到已有接管就会让位。
 * 这个 bug 真的发生过一次，是 `开场不会抽到全屏素材` 那条单测把它抓出来的。
 *
 * 全屏的弹窗素材则被 `minProgress` 压到风暴后段，避免开场就遮死整个屏幕。
 */
export function eligibleCreatives(
  creatives: readonly AdCreative[],
  progress: number,
): AdCreative[] {
  return creatives.filter((c) => c.surface === 'popup' && progress >= (c.minProgress ?? 0))
}

/** 从可用素材中抽一条。池子为空时返回 undefined，由调用方决定是否跳过本次生成。 */
export function pickCreative(
  creatives: readonly AdCreative[],
  progress: number,
  rng: () => number,
): AdCreative | undefined {
  const pool = eligibleCreatives(creatives, progress)
  if (pool.length === 0) return undefined
  const index = Math.min(pool.length - 1, Math.floor(rng() * pool.length))
  return pool[index]
}

/**
 * 本次推进中应当上演的节拍。
 *
 * @param firedCount 已经上演过的**条数**（不是时间）。调用方把它当游标持久化。
 *
 * 用"已上演条数"而不是"上次的时刻"，是因为落下的节拍必须**一条都不漏**：
 * 用时刻比较会在帧跨过多个节拍时丢掉中间那些。
 *
 * 前提：`beats` 按 `atMs` 升序（`beats.spec.ts` 守着这条不变量），
 * 因此遇到第一条未到点的节拍就可以停。
 */
export function dueBeats(
  beats: readonly StormBeat[],
  firedCount: number,
  elapsedMs: number,
): StormBeat[] {
  const due: StormBeat[] = []
  for (let i = firedCount; i < beats.length; i++) {
    const beat = beats[i]
    if (!beat || elapsedMs < beat.atMs) break
    due.push(beat)
  }
  return due
}

/**
 * 接管实例是否已经超龄（到点自动挂断）。
 *
 * 只对接管实例有意义：弹窗本来就该一直待在屏幕上等人来关，
 * 而全屏接管必须有硬性终点，否则无关闭键的那种会把人永久困住。
 */
export function isTakeoverExpired(ad: AdInstance, elapsedMs: number): boolean {
  if (ad.surface !== 'takeover') return false
  return elapsedMs - ad.bornAt >= STORM.takeoverMaxMs
}
