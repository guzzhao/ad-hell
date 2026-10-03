import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AdCreative, AdInstance, AdTrigger, CloseOutcome, StormPhase } from '@/types/ad'
import type { LandingTarget } from '@/data/landing'
import { resolveLandingTarget } from '@/data/landing'
import { CREATIVES, findCreative } from '@/data/creatives'
import { BEATS } from '@/data/beats'
import { misclickPenalty, resolveClose } from '@/engine/close'
import { mulberry32 } from '@/engine/rng'
import { pushShakeSample, resolveShake, triggerCooldownMs, type ShakeSample } from '@/engine/shake'
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

/**
 * 按素材 id 取摇一摇配置。
 *
 * 摇一摇是**素材的能力位**而不是全局开关，所以这个查找就是那条分界线：
 * 找不到 `trigger` 的素材完全不参与摇一摇。
 */
function triggerOf(creativeId: string): AdTrigger | undefined {
  return findCreative(creativeId)?.trigger
}

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
  const currentLanding = ref<LandingTarget>(resolveLandingTarget('loan-fast'))
  const activeAppId = ref<string | null>(null)
  /** 静音偏好。与"减少动态效果"无关——动效偏好不蕴含声音偏好。 */
  const muted = ref(false)
  /**
   * 有音频要放、但浏览器还没拿到用户手势因而放不出来。
   * 界面据此显示「点击任意处开启声音」，而不是让用户以为页面坏了。
   */
  const audioBlocked = ref(false)
  /**
   * 探索模式：'manual'（纯手动探索，平时完全不自动弹广告，由操作触发）
   *           'auto'（自动风暴模式，广告随时间涌现）
   */
  const explorationMode = ref<'manual' | 'auto'>('manual')
  /**
   * 全局广告展示开关：
   * 开启后展示各 App 内的原生场景化广告与交互触发广告。
   */
  const adsEnabled = ref(true)

  // ── 非响应式的内部记账 ───────────────────────────────────
  let rng: () => number = mulberry32(DEFAULT_SEED)
  let nextId = 1
  let zCounter = 10
  let spawnAccumulator = 0
  let collapseElapsed = 0
  /** 已经上演过的节拍条数。用条数而不是时刻，跨帧的节拍才一条都不会漏。 */
  let firedBeats = 0
  /**
   * 摇一摇的能量窗口。
   *
   * 非响应式：它每次采样都会变，但界面不关心窗口里有多少能量；
   * 放进响应式只会白白触发重渲染。与 `zCounter` 属于同一类记账。
   */
  let shakeSamples: ShakeSample[] = []
  /** 每个实例的下次允许触发时刻。同样是非响应式记账。 */
  const shakeCooldowns = new Map<number, number>()

  // ── 派生状态 ────────────────────────────────────────────
  const coverage = computed(() => coverageEstimate(ads.value))
  /** 弹窗数量。接管广告不在洪水里，不该占用"同时存在多少个弹窗"这个名额。 */
  const popupCount = computed(() => ads.value.filter((ad) => ad.surface === 'popup').length)
  /** 屏上是否存在响应摇一摇的广告。控制层据此决定要不要提示用户。 */
  const shakeArmed = computed(() =>
    ads.value.some((ad) => findCreative(ad.creativeId)?.trigger !== undefined),
  )
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
    shakeSamples = []
    shakeCooldowns.clear()
    phase.value = 'boot'
    elapsedMs.value = 0
    ads.value = []
    closedCount.value = 0
    spawnedCount.value = 0
    misclickCount.value = 0
    landingOpen.value = false
    activeAppId.value = null
    audioBlocked.value = false
  }

  function start(
    seed: number = DEFAULT_SEED,
    mode: 'manual' | 'auto' = 'auto',
    enableAds: boolean = true,
  ): void {
    reset(seed)
    explorationMode.value = mode
    adsEnabled.value = enableAds
    phase.value = 'storm'
  }

  /** 「重新体验」：换一个种子，让第二遍不至于完全一样。 */
  function restart(): void {
    start(Date.now() >>> 0, explorationMode.value, adsEnabled.value)
  }

  function setAdsEnabled(enabled: boolean): void {
    adsEnabled.value = enabled
    if (!enabled) {
      ads.value = []
      landingOpen.value = false
    }
  }

  function setExplorationMode(mode: 'manual' | 'auto'): void {
    explorationMode.value = mode
    if (mode === 'manual' && ads.value.length > 1) {
      // 切换到手动探索时，清除过多堆叠弹窗，最多保留最新 1 个
      ads.value = ads.value.slice(-1)
    }
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

  /** 定位生成指定广告，用于操作触发模式 */
  function spawnTargeted(creativeId: string): void {
    const creative = findCreative(creativeId)
    if (!creative) return

    if (creative.surface === 'takeover') {
      spawnTakeover(creativeId)
      return
    }

    let x = 9
    let y = 26
    if (creative.layout === 'splash' || creative.layout === 'fakeCall') {
      x = 0
      y = 0
    } else if (creative.layout === 'banner') {
      x = 4
      y = 3
    } else if (creative.layout === 'floating') {
      x = 20
      y = 76
    }

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

  /** 点击特定 App 或触发特定操作时，弹出单个对应广告 */
  function triggerAppAd(appId: string): void {
    if (!adsEnabled.value) return

    // 若已有全屏接管或开屏广告，不打扰
    if (
      ads.value.some(
        (ad) => ad.surface === 'takeover' || findCreative(ad.creativeId)?.layout === 'splash',
      )
    ) {
      return
    }

    // 手动探索模式下，保证屏幕克制，每次仅展示 1 个广告
    if (explorationMode.value === 'manual' && ads.value.length >= 1) {
      ads.value = []
    }

    switch (appId) {
      case 'shop': {
        const shopAds = ['splash-mall', 'shop-speed', 'shop-bargain']
        const pick = shopAds[Math.floor(rng() * shopAds.length)] ?? 'splash-mall'
        spawnTargeted(pick)
        break
      }
      case 'video':
        spawnTargeted('splash-video')
        break
      case 'dialer':
        spawnTakeover('call-loan-service')
        break
      case 'camera':
        spawnTargeted('loan-fast')
        break
      case 'calculator':
        spawnTargeted('game-legend')
        break
      case 'alarm':
        spawnTargeted('health-bp')
        break
      case 'settings':
        spawnTargeted('fake-system')
        break
      case 'messages': {
        const msgAds = ['shop-99', 'shop-factory', 'shop-luxury']
        const pick = msgAds[Math.floor(rng() * msgAds.length)] ?? 'shop-99'
        spawnTargeted(pick)
        break
      }
    }
  }

  /** 误触惩罚：追加弹窗。手动模式下只追加 1 个，避免泛滥 */
  function applyPenalty(count: number): void {
    const penalty = explorationMode.value === 'manual' ? 1 : count
    for (let i = 0; i < penalty; i++) spawnOne()
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

    if (explorationMode.value === 'auto') {
      runBeats()
    }
    expireTakeovers()

    if (explorationMode.value === 'auto' && spawnAccumulator >= interval.value) {
      // 只补一个，并且不累积"欠账"：否则从后台切回来会瞬间爆发几十个弹窗。
      spawnAccumulator = 0
      // 数量未达当前目标才补，这就是"打地鼠"机制——关掉一个，过一会儿又补回来。
      // 目标值本身只随时间增长，不受用户操作影响，这是"关不完"的结构性保证。
      // 只数弹窗：接管广告不在洪水里，让它占掉一个名额会稀释洪水的密度。
      if (popupCount.value < target.value) spawnOne()
    }

    // 只有自动风暴模式下才会自动判定崩塌
    if (explorationMode.value === 'auto') {
      if (isCollapsed(ads.value) || elapsedMs.value >= STORM.durationMs) {
        collapseElapsed = 0
        phase.value = 'collapsed'
      }
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
      currentLanding.value = resolveLandingTarget(ad.creativeId)
      landingOpen.value = true
      applyPenalty(outcome.extraAds)
    }
    return outcome
  }

  /**
   * 打开指定应用。
   */
  function openApp(appId: string): void {
    activeAppId.value = appId
    if (adsEnabled.value) {
      triggerAppAd(appId)
    }
  }

  /**
   * 关闭当前打开的应用，返回主屏。
   */
  function closeApp(): void {
    activeAppId.value = null
    if (explorationMode.value === 'manual') {
      ads.value = []
    }
  }

  /**
   * 打开落地页，并精准定位目标广告品类。
   */
  function openLanding(landingTarget?: string | AdCreative | LandingTarget): void {
    currentLanding.value = resolveLandingTarget(
      landingTarget ?? ads.value[ads.value.length - 1]?.creativeId,
    )
    landingOpen.value = true
  }

  /**
   * 点击弹窗**主体**或应用内广告（不是关闭键）。
   * 真实广告里这同样是"误触跳转"，因此与假关闭键等价。
   * 支持传入具体 landingTarget / creativeId / creative，让跳转目标严格符合广告品类。
   */
  function tapAdBody(landingTarget?: string | AdCreative | LandingTarget): void {
    misclickCount.value += 1
    currentLanding.value = resolveLandingTarget(
      landingTarget ?? ads.value[ads.value.length - 1]?.creativeId,
    )
    landingOpen.value = true
    applyPenalty(misclickPenalty(rng()))
  }

  /** 从页内假落地页返回。 */
  function closeLanding(): void {
    landingOpen.value = false
    if (explorationMode.value === 'manual') {
      ads.value = []
    }
  }

  /** 关闭/清空所有弹窗广告 */
  function closeAllAds(): void {
    ads.value = []
  }

  /**
   * 收到一次摇动的能量。
   *
   * 由 `useShakeSource` 调用，与 `advance(dt)` 是**平行**的两个入口：
   * `advance` 只依赖时间，`handleShake` 只依赖外部事件，两者互不感知。
   * 这正是"摇一摇是外部事件"这一事实在架构上的落点——它没有被塞进时间推进里，
   * 所以 `advance` 的"相同输入必得相同输出"（风暴全部单测的前提）依然成立。
   */
  function handleShake(energy: number): void {
    if (phase.value !== 'storm') return

    shakeSamples = pushShakeSample(shakeSamples, { atMs: elapsedMs.value, energy })

    const id = resolveShake(ads.value, triggerOf, shakeSamples, shakeCooldowns, elapsedMs.value)
    if (id === null) return

    const ad = ads.value.find((a) => a.id === id)
    const trigger = ad ? triggerOf(ad.creativeId) : undefined
    if (!ad || !trigger) return

    shakeCooldowns.set(id, elapsedMs.value + triggerCooldownMs(trigger))
    // 窗口清零：一次摇动只算一次。残余能量不该在冷却刚过时又补一次跳转。
    shakeSamples = []

    // 与点假关闭键、点广告主体同罪：屏幕上多出 2~4 个弹窗
    misclickCount.value += 1
    currentLanding.value = resolveLandingTarget(ad.creativeId)
    landingOpen.value = true
    applyPenalty(misclickPenalty(rng()))
  }

  /** 主动结束体验，直接进入真相环节。 */
  function enterTruth(): void {
    phase.value = 'truth'
  }

  function setReducedMotion(value: boolean): void {
    reducedMotion.value = value
  }

  function toggleMuted(): void {
    muted.value = !muted.value
  }

  function setAudioBlocked(value: boolean): void {
    audioBlocked.value = value
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
    currentLanding,
    activeAppId,
    muted,
    audioBlocked,
    explorationMode,
    adsEnabled,
    // 派生
    coverage,
    popupCount,
    shakeArmed,
    progress,
    target,
    interval,
    elapsedSeconds,
    running,
    // 动作
    start,
    restart,
    openApp,
    closeApp,
    openLanding,
    setExplorationMode,
    setAdsEnabled,
    spawnTargeted,
    triggerAppAd,
    advance,
    attemptClose,
    tapAdBody,
    handleShake,
    closeLanding,
    closeAllAds,
    enterTruth,
    setReducedMotion,
    toggleMuted,
    setAudioBlocked,
  }
})
