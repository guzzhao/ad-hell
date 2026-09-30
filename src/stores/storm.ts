import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AdInstance, CloseOutcome, StormPhase } from '@/types/ad'
import { CREATIVES, findCreative } from '@/data/creatives'
import { BEATS } from '@/data/beats'
import { misclickPenalty, resolveClose } from '@/engine/close'
import { mulberry32 } from '@/engine/rng'
import {
  STORM,
  coverageEstimate,
  dueBeats,
  isCollapsed,
  isTakeoverExpired,
  pickCreative,
  samplePosition,
  spawnInterval,
  stormProgress,
  targetConcurrent,
} from '@/engine/storm'

/**
 * 首轮风暴的固定种子。
 * 固定种子让第一遍体验完全可复现，便于验收与调试；
 * 点"重新体验"时会换成时间种子，避免每次看到一模一样的弹窗序列。
 */
export const DEFAULT_SEED = 20260928

export const useStormStore = defineStore('storm', () => {
  // ── 状态 ────────────────────────────────────────────────
  const phase = ref<StormPhase>('boot')
  const elapsedMs = ref(0)
  const ads = ref<AdInstance[]>([])
  const closedCount = ref(0)
  const spawnedCount = ref(0)
  const misclickCount = ref(0)
  const reducedMotion = ref(false)
  const landingOpen = ref(false)

  // ── 非响应式的内部记账 ───────────────────────────────────
  let rng: () => number = mulberry32(DEFAULT_SEED)
  let nextId = 1
  let zCounter = 10
  let spawnAccumulator = 0
  let collapseElapsed = 0
  /** 已经上演过的节拍条数。用条数而不是时刻，跨帧的节拍才一条都不会漏。 */
  let firedBeats = 0

  // ── 派生状态 ────────────────────────────────────────────
  const coverage = computed(() => coverageEstimate(ads.value))
  /** 弹窗数量。接管广告不在洪水里，不该占用"同时存在多少个弹窗"这个名额。 */
  const popupCount = computed(() => ads.value.filter((ad) => ad.surface === 'popup').length)
  const progress = computed(() => stormProgress(elapsedMs.value))
  const target = computed(() => targetConcurrent(elapsedMs.value))
  const interval = computed(() => spawnInterval(elapsedMs.value))
  const elapsedSeconds = computed(() => Math.floor(elapsedMs.value / 1000))
  const running = computed(() => phase.value === 'storm')

  // ── 动作 ────────────────────────────────────────────────
  function reset(seed: number): void {
    rng = mulberry32(seed)
    nextId = 1
    zCounter = 10
    spawnAccumulator = 0
    collapseElapsed = 0
    firedBeats = 0
    phase.value = 'boot'
    elapsedMs.value = 0
    ads.value = []
    closedCount.value = 0
    spawnedCount.value = 0
    misclickCount.value = 0
    landingOpen.value = false
  }

  function start(seed: number = DEFAULT_SEED): void {
    reset(seed)
    phase.value = 'storm'
  }

  /** 「重新体验」：换一个种子，让第二遍不至于完全一样。 */
  function restart(): void {
    start(Date.now() >>> 0)
  }

  function spawnOne(): void {
    const creative = pickCreative(CREATIVES, progress.value, rng)
    if (!creative) return
    const { x, y } = samplePosition(progress.value, creative.size, rng)
    ads.value.push({
      id: nextId++,
      creativeId: creative.id,
      surface: creative.surface,
      x,
      y,
      w: creative.size.w,
      h: creative.size.h,
      z: zCounter++,
      bornAt: elapsedMs.value,
    })
    spawnedCount.value += 1
  }

  /** 误触惩罚：追加若干弹窗。 */
  function applyPenalty(count: number): void {
    for (let i = 0; i < count; i++) spawnOne()
  }

  /**
   * 上演一条剧本节拍——目前只有全屏接管广告走这条路。
   *
   * 与 `spawnOne` 分开而不是复用，是因为两者的"位置"语义完全不同：
   * 弹窗要采样百分比坐标，接管永远是从 (0,0) 铺满整屏。
   */
  function spawnTakeover(creativeId: string): void {
    // 同一时刻只允许一个全屏接管：两块来电页互相盖住毫无意义。
    // 当前节拍表不会产生重叠（间隔 18s > 上限 12s），这条守卫是为了将来改表时不静默出错。
    if (ads.value.some((ad) => ad.surface === 'takeover')) return

    const creative = findCreative(creativeId)
    if (!creative) return

    ads.value.push({
      id: nextId++,
      creativeId: creative.id,
      surface: creative.surface,
      x: 0,
      y: 0,
      w: creative.size.w,
      h: creative.size.h,
      z: zCounter++,
      bornAt: elapsedMs.value,
    })
    spawnedCount.value += 1
  }

  /** 上演所有到点的节拍。 */
  function runBeats(): void {
    const due = dueBeats(BEATS, firedBeats, elapsedMs.value)
    if (due.length === 0) return
    // 先推进游标再上演：spawnTakeover 若因为已有接管而跳过，这一拍也不该重来。
    firedBeats += due.length
    for (const beat of due) spawnTakeover(beat.creativeId)
  }

  /**
   * 让超龄的接管广告自动"挂断"。
   *
   * 这是**用户保护**：`closeVariant: 'none'` 的来电广告没有任何关闭键，
   * 没有这一步，用户会被一个挂不掉的电话永久困住——那这页面本身就成了它要批判的东西。
   *
   * 不计入 `closedCount`：那个数字是"用户亲手关掉了多少"，自动挂断不算。
   */
  function expireTakeovers(): void {
    const survivors = ads.value.filter((ad) => !isTakeoverExpired(ad, elapsedMs.value))
    if (survivors.length !== ads.value.length) ads.value = survivors
  }

  /**
   * 推进一帧。由 `useStormLoop` 调用，dt 已由调用方夹紧。
   */
  function advance(dt: number): void {
    if (phase.value === 'collapsed') {
      collapseElapsed += dt
      if (collapseElapsed >= STORM.collapseSettleMs) phase.value = 'truth'
      return
    }
    if (phase.value !== 'storm') return

    elapsedMs.value += dt
    spawnAccumulator += dt

    runBeats()
    expireTakeovers()

    if (spawnAccumulator >= interval.value) {
      // 只补一个，并且不累积"欠账"：否则从后台切回来会瞬间爆发几十个弹窗。
      spawnAccumulator = 0
      // 数量未达当前目标才补，这就是"打地鼠"机制——关掉一个，过一会儿又补回来。
      // 目标值本身只随时间增长，不受用户操作影响，这是"关不完"的结构性保证。
      // 只数弹窗：接管广告不在洪水里，让它占掉一个名额会稀释洪水的密度。
      if (popupCount.value < target.value) spawnOne()
    }

    // 兜底：到点必然收场。即使有人手速超神，风暴也不会无限拖延。
    if (isCollapsed(ads.value) || elapsedMs.value >= STORM.durationMs) {
      collapseElapsed = 0
      phase.value = 'collapsed'
    }
  }

  /**
   * 用户点击某个弹窗的关闭键。
   *
   * @param adId 弹窗实例 id
   * @param hit  点击是否落在有效关闭区内（由组件按实际渲染尺寸判断）
   */
  function attemptClose(adId: number, hit: boolean): CloseOutcome {
    const index = ads.value.findIndex((a) => a.id === adId)
    if (index === -1) return { kind: 'dodged' }
    const ad = ads.value[index]
    if (!ad) return { kind: 'dodged' }

    const variant = findCreative(ad.creativeId)?.closeVariant ?? 'honest'
    const outcome = resolveClose(variant, hit, rng())

    if (outcome.kind === 'closed') {
      ads.value.splice(index, 1)
      closedCount.value += 1
    } else if (outcome.kind === 'misclick') {
      misclickCount.value += 1
      landingOpen.value = true
      applyPenalty(outcome.extraAds)
    }
    return outcome
  }

  /**
   * 点击弹窗**主体**（不是关闭键）。
   * 真实广告里这同样是"误触跳转"，因此与假关闭键等价。
   */
  function tapAdBody(): void {
    misclickCount.value += 1
    landingOpen.value = true
    applyPenalty(misclickPenalty(rng()))
  }

  /** 从页内假落地页返回。 */
  function closeLanding(): void {
    landingOpen.value = false
  }

  /** 主动结束体验，直接进入真相环节。 */
  function enterTruth(): void {
    phase.value = 'truth'
  }

  function setReducedMotion(value: boolean): void {
    reducedMotion.value = value
  }

  return {
    // 状态
    phase,
    elapsedMs,
    ads,
    closedCount,
    spawnedCount,
    misclickCount,
    reducedMotion,
    landingOpen,
    // 派生
    coverage,
    popupCount,
    progress,
    target,
    interval,
    elapsedSeconds,
    running,
    // 动作
    start,
    restart,
    advance,
    attemptClose,
    tapAdBody,
    closeLanding,
    enterTruth,
    setReducedMotion,
  }
})
